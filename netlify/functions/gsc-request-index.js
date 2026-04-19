// GSC Request Index Function
// Submits URLs to Google Indexing API for crawling
// Build62: Real Google API integration with retry logic

import { getStore } from "@netlify/blobs";

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
  
  // Import crypto for signing
  const crypto = await import('crypto');
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(signatureInput);
  const signature = sign.sign(credentials.private_key, 'base64url');
  
  const jwt = `${signatureInput}.${signature}`;
  
  // Exchange JWT for access token
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
  });
  
  const data = await response.json();
  return data.access_token;
}

// Helper: Call Google Indexing API with retry logic
async function callGoogleIndexingAPI(url, accessToken, attempt = 1) {
  const maxAttempts = 3;
  const delays = [0, 5000, 15000]; // 0s, 5s, 15s
  
  try {
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
    
    const data = await response.json();
    
    if (!response.ok) {
      // Handle specific errors
      if (response.status === 429) {
        throw new Error('Quota exceeded');
      } else if (response.status === 403) {
        throw new Error('Invalid credentials');
      } else if (response.status === 404) {
        throw new Error('Page not found (404)');
      } else if (data.error?.message?.includes('already')) {
        // Already in queue - not actually an error
        return {
          success: true,
          status: 'already_queued',
          message: data.error.message
        };
      } else {
        throw new Error(data.error?.message || `HTTP ${response.status}`);
      }
    }
    
    return {
      success: true,
      status: 'submitted',
      notifyTime: data.urlNotificationMetadata?.latestUpdate?.notifyTime || new Date().toISOString()
    };
    
  } catch (error) {
    console.error(`[GSC] Attempt ${attempt} failed:`, error.message);
    
    // Retry logic
    if (attempt < maxAttempts && error.message !== 'Quota exceeded' && error.message !== 'Invalid credentials') {
      console.log(`[GSC] Retrying in ${delays[attempt] / 1000}s...`);
      await new Promise(resolve => setTimeout(resolve, delays[attempt]));
      return callGoogleIndexingAPI(url, accessToken, attempt + 1);
    }
    
    // All attempts failed
    throw error;
  }
}

export default async (req, context) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { url } = await req.json();

    if (!url) {
      return new Response(JSON.stringify({ error: 'URL parameter required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get credentials from split environment variables
    const projectId = Netlify.env.get('GSC_PROJECT_ID');
    const privateKeyId = Netlify.env.get('GSC_PRIVATE_KEY_ID');
    const privateKey = Netlify.env.get('GSC_PRIVATE_KEY').replace(/\\n/g, '\n');
    const clientEmail = Netlify.env.get('GSC_CLIENT_EMAIL');
    
    if (!projectId || !privateKeyId || !privateKey || !clientEmail) {
      return new Response(JSON.stringify({
        error: 'Google credentials not configured in Netlify environment variables. Required: GSC_PROJECT_ID, GSC_PRIVATE_KEY_ID, GSC_PRIVATE_KEY, GSC_CLIENT_EMAIL'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
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
    
    console.log('[GSC] Starting index request for:', url);
    
    // Get access token
    const accessToken = await getAccessToken(credentials);
    
    // Call Google Indexing API with retry logic
    const result = await callGoogleIndexingAPI(url, accessToken);
    
    // Save request timestamp to Netlify Blobs
    const store = getStore('gsc-requests');
    const urlKey = Buffer.from(url).toString('base64').replace(/[^a-zA-Z0-9]/g, '');
    const timestamp = new Date().toISOString();
    
    await store.set(urlKey, JSON.stringify({
      url: url,
      requestedAt: timestamp,
      status: result.status,
      googleResponse: result.message || 'Success',
      attempts: 1 // Future: track retry attempts
    }));
    
    console.log(`[GSC] ✅ Request successful: ${result.status}`);

    return new Response(JSON.stringify({
      success: true,
      message: `Index request submitted for ${url}`,
      status: result.status,
      requestedAt: timestamp
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('[GSC] Request Index Error:', error);
    
    // Save error to Blobs for display
    try {
      const { url } = await req.json();
      const store = getStore('gsc-requests');
      const urlKey = Buffer.from(url).toString('base64').replace(/[^a-zA-Z0-9]/g, '');
      
      await store.set(urlKey, JSON.stringify({
        url: url,
        requestedAt: new Date().toISOString(),
        status: 'failed',
        error: error.message,
        attempts: 3
      }));
    } catch (saveError) {
      console.error('[GSC] Could not save error:', saveError);
    }
    
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Failed after 3 attempts'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
