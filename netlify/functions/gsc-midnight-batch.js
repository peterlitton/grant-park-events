// GSC Midnight Batch Function
// Runs daily at midnight CST to request indexing for past events (7+ days old)
// This forces Google to crawl and see the noindex tag
// Build62: Netlify Scheduled Function

import { getStore } from "@netlify/blobs";
import { schedule } from "@netlify/functions";

// Helper: Get Google API access token
async function getAccessToken(credentials) {
  const jwtHeader = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  
  const now = Math.floor(Date.now() / 1000);
  const jwtClaim = {
    iss: credentials.client_email,
    scope: 'https://www.googleapis.com/auth/indexing',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  };
  
  const jwtClaimBase64 = Buffer.from(JSON.stringify(jwtClaim)).toString('base64url');
  const signatureInput = `${jwtHeader}.${jwtClaimBase64}`;
  
  const crypto = await import('crypto');
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(signatureInput);
  const signature = sign.sign(credentials.private_key, 'base64url');
  
  const jwt = `${signatureInput}.${signature}`;
  
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
  });
  
  const data = await response.json();
  return data.access_token;
}

// Helper: Submit URL to Google Indexing API
async function submitToGoogle(url, accessToken) {
  const response = await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      url: url,
      type: 'URL_UPDATED'
    })
  });
  
  return response.ok;
}

// Main handler
const handler = async (event, context) => {
  console.log('[BATCH] Starting midnight batch job at:', new Date().toISOString());
  
  try {
    // Get credentials from split environment variables
    const projectId = Netlify.env.get('GSC_PROJECT_ID');
    const privateKeyId = Netlify.env.get('GSC_PRIVATE_KEY_ID');
    const privateKey = Netlify.env.get('GSC_PRIVATE_KEY').replace(/\\n/g, '\n');
    const clientEmail = Netlify.env.get('GSC_CLIENT_EMAIL');
    
    if (!projectId || !privateKeyId || !privateKey || !clientEmail) {
      console.error('[BATCH] Google credentials not configured');
      return { statusCode: 500 };
    }
    
    // Reconstruct credentials object
    const credentials = {
      type: 'service_account',
      project_id: projectId,
      private_key_id: privateKeyId,
      private_key: privateKey,
      client_email: clientEmail,
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(clientEmail)}`,
      universe_domain: 'googleapis.com'
    };
    
    // Get events from Netlify Blobs
    const eventsStore = getStore('events');
    const eventsData = await eventsStore.get('grantParkEvents');
    const events = eventsData ? JSON.parse(eventsData) : [];
    
    console.log('[BATCH] Loaded', events.length, 'total events');
    
    // Get existing request data
    const requestStore = getStore('gsc-requests');
    const { blobs } = await requestStore.list();
    const alreadyRequested = new Set();
    
    for (const blob of blobs) {
      const data = await requestStore.get(blob.key);
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed.url && parsed.status === 'noindex_requested') {
          alreadyRequested.add(parsed.url);
        }
      }
    }
    
    console.log('[BATCH] Already requested:', alreadyRequested.size, 'past events');
    
    // Find past events (7+ days old) that haven't been auto-requested
    const today = new Date();
    const pastEvents = [];
    
    for (const evt of events) {
      if (!evt.date || !evt.id || !evt.published) continue;
      
      const eventDate = new Date(evt.date);
      const daysPast = Math.floor((today - eventDate) / (1000 * 60 * 60 * 24));
      
      if (daysPast >= 7) {
        const titleSlug = evt.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
        const eventUrl = `https://www.grantparkevents.com/events/${evt.date}-${titleSlug}-${evt.id}`;
        
        if (!alreadyRequested.has(eventUrl)) {
          pastEvents.push({ url: eventUrl, date: evt.date, daysPast });
        }
      }
    }
    
    console.log('[BATCH] Found', pastEvents.length, 'past events needing noindex request');
    
    if (pastEvents.length === 0) {
      console.log('[BATCH] No work to do');
      return { statusCode: 200, body: 'No past events to process' };
    }
    
    // Get access token
    const accessToken = await getAccessToken(credentials);
    
    // Submit each past event to Google
    let successCount = 0;
    let errorCount = 0;
    
    for (const event of pastEvents) {
      try {
        const success = await submitToGoogle(event.url, accessToken);
        
        if (success) {
          // Save to Blobs
          const urlKey = Buffer.from(event.url).toString('base64').replace(/[^a-zA-Z0-9]/g, '');
          await requestStore.set(urlKey, JSON.stringify({
            url: event.url,
            requestedAt: new Date().toISOString(),
            status: 'noindex_requested',
            googleResponse: 'Auto-requested by midnight batch',
            daysPast: event.daysPast,
            batchJob: true
          }));
          
          successCount++;
          console.log('[BATCH] ✅ Submitted:', event.url);
        } else {
          errorCount++;
          console.log('[BATCH] ❌ Failed:', event.url);
        }
        
        // Rate limiting: wait 100ms between requests
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        errorCount++;
        console.error('[BATCH] Error submitting:', event.url, error.message);
      }
    }
    
    console.log('[BATCH] Complete. Success:', successCount, 'Errors:', errorCount);
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        processed: pastEvents.length,
        success: successCount,
        errors: errorCount
      })
    };
    
  } catch (error) {
    console.error('[BATCH] Fatal error:', error);
    return { statusCode: 500, body: error.message };
  }
};

// Schedule to run daily at midnight CST (6am UTC, 5am UTC during DST)
// Note: Netlify cron uses UTC, so we use 6am UTC for CST midnight
export default schedule("0 6 * * *", handler);
