// GSC Index Status Function - Build10.14.11
// Queries Google Search Console URL Inspection API for real-time index status
// Build10.14.11: Added forceRefresh param, comprehensive status mapping, .trim() slug fix

import { getStore } from "@netlify/blobs";

// Helper: Get Google API access token
async function getAccessToken() {
  const credentials = {
    client_email: Netlify.env.get('GSC_CLIENT_EMAIL'),
    private_key: Netlify.env.get('GSC_PRIVATE_KEY').replace(/\\n/g, '\n')
  };
  
  const jwtHeader = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  
  const now = Math.floor(Date.now() / 1000);
  const jwtClaim = {
    iss: credentials.client_email,
    scope: 'https://www.googleapis.com/auth/webmasters.readonly',
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
  if (data.error) {
    throw new Error(`OAuth2 error: ${data.error_description || data.error}`);
  }
  
  return data.access_token;
}

// Helper: Query GSC URL Inspection API
async function inspectUrl(url, accessToken) {
  const response = await fetch(
    'https://searchconsole.googleapis.com/v1/urlInspection/index:inspect',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inspectionUrl: url,
        siteUrl: 'sc-domain:grantparkevents.com'
      })
    }
  );
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`GSC API error: ${response.status} ${error}`);
  }
  
  return await response.json();
}

export default async (req, context) => {
  try {
    // Build10.13.2: Parse query parameters for pagination and filtering
    const url = new URL(req.url);
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);
    const limit = parseInt(url.searchParams.get('limit') || '20', 10);
    const futureOnly = url.searchParams.get('futureOnly') === 'true';
    // Build10.14.11: Force refresh bypasses server-side Blob cache entirely
    const forceRefresh = url.searchParams.get('forceRefresh') === 'true';
    
    console.log('[GSC] Request params:', { offset, limit, futureOnly, forceRefresh });
    
    // Check if credentials are configured
    const hasCredentials = Netlify.env.get('GSC_PROJECT_ID') && 
                          Netlify.env.get('GSC_PRIVATE_KEY_ID') && 
                          Netlify.env.get('GSC_PRIVATE_KEY') && 
                          Netlify.env.get('GSC_CLIENT_EMAIL');
    
    if (!hasCredentials) {
      return new Response(JSON.stringify({
        error: 'Google credentials not configured in Netlify environment variables'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get OAuth2 access token
    console.log('[GSC] Getting access token...');
    const accessToken = await getAccessToken();
    console.log('[GSC] Access token obtained');

    // Get events from Netlify Blobs
    let events = [];
    try {
      const store = getStore('events');
      const eventsData = await store.get('grantParkEvents');
      events = eventsData ? JSON.parse(eventsData) : [];
      console.log('[GSC] Loaded', events.length, 'events from Netlify Blobs');
    } catch (blobError) {
      console.log('[GSC] Could not fetch events:', blobError.message);
    }
    
    // Build10.13.2: Filter for future events only if requested
    if (futureOnly) {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      events = events.filter(evt => evt.date >= today);
      console.log('[GSC] Filtered to', events.length, 'future events (date >= ' + today + ')');
    }
    
    // Load cached index status (per-URL timestamps, 24-hour TTL each)
    // Build10.14.9: Fixed stale cache bug — previously used single global timestamp
    // which reset every time ANY new URL was added, keeping old statuses forever
    // Build10.14.11: forceRefresh bypasses cache entirely for fresh GSC API data
    const cacheStore = getStore('gsc-index-cache');
    let cachedStatuses = {};
    if (!forceRefresh) {
      try {
        const cacheData = await cacheStore.get('index-status-cache-v2');
        if (cacheData) {
          const parsed = JSON.parse(cacheData);
          const allEntries = parsed.statuses || {};
          const now = Date.now();
          const TTL = 24 * 60 * 60 * 1000; // 24 hours
          
          // Only keep entries whose individual timestamp is within TTL
          for (const [url, entry] of Object.entries(allEntries)) {
            if (entry.cachedAt && (now - entry.cachedAt) < TTL) {
              cachedStatuses[url] = entry;
            }
          }
          
          const total = Object.keys(allEntries).length;
          const valid = Object.keys(cachedStatuses).length;
          const expired = total - valid;
          console.log('[GSC] Cache: ' + valid + ' valid, ' + expired + ' expired of ' + total + ' total');
        }
      } catch (err) {
        console.log('[GSC] No cache found');
      }
    } else {
      console.log('[GSC] forceRefresh=true — skipping cache, querying GSC API directly');
    }

    // Build list of ALL URLs (for total count)
    const allUrlsToCheck = [
      { url: 'https://www.grantparkevents.com/', type: 'index' },
      { url: 'https://www.grantparkevents.com/about', type: 'static' },
      { url: 'https://www.grantparkevents.com/signup', type: 'static' }
    ];

    // Add published event URLs
    events.forEach(evt => {
      if (!evt.date || !evt.id || !evt.published) return;
      
      const titleSlug = evt.title
        .toLowerCase()
        .trim()  // Build10.14.11: Match index.html slug generation
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      const eventUrl = `https://www.grantparkevents.com/events/${evt.date}-${titleSlug}-${evt.id}`;
      
      allUrlsToCheck.push({
        url: eventUrl,
        type: 'event',
        eventDate: evt.date,
        updatedAt: evt.updatedAt || null  // Build10.13.8: Fixed camelCase (was evt.updated_at)
      });
    });
    
    // Build10.13.2: Apply pagination - get subset to check
    const totalUrls = allUrlsToCheck.length;
    const urlsToCheck = allUrlsToCheck.slice(offset, offset + limit);
    const hasMore = (offset + limit) < totalUrls;
    
    console.log('[GSC] Pagination: offset=' + offset + ', limit=' + limit + ', total=' + totalUrls + ', checking=' + urlsToCheck.length + ', hasMore=' + hasMore);

    // Query GSC API for uncached URLs
    const pages = [];
    const newStatuses = {};
    let queriedCount = 0;
    
    for (const item of urlsToCheck) {
      // Check cache first
      if (cachedStatuses[item.url]) {
        pages.push({
          ...cachedStatuses[item.url],
          updatedAt: item.updatedAt || cachedStatuses[item.url].updatedAt || null,
          fromCache: true
        });
        continue;
      }
      
      // Build10.13.2: Query GSC API (pagination controls batch size now)
      try {
        console.log('[GSC] Inspecting:', item.url);
        const inspection = await inspectUrl(item.url, accessToken);
        queriedCount++;
        
        const indexStatus = inspection.inspectionResult?.indexStatusResult;
        const coverageState = indexStatus?.coverageState || 'unknown';
        const verdict = indexStatus?.verdict || 'unknown';
        
        // Build10.14.9: Verbose logging for diagnostics
        console.log('[GSC] Result for', item.url.split('/').pop(), '→ verdict:', verdict, ', coverageState:', coverageState);
        
        // Build10.14.11: Comprehensive status mapping (verdict-first, then coverageState)
        // Verdict values: PASS=indexed, FAIL=error, NEUTRAL=excluded/other
        // Previous code missed many coverageState variants causing false "pending" statuses
        let status = 'unknown';
        let details = coverageState;
        
        if (verdict === 'PASS') {
          // All PASS variants are indexed regardless of coverageState wording
          status = 'indexed';
          details = coverageState || 'Indexed by Google';
        } else if (verdict === 'FAIL') {
          // Error states - something is actively wrong
          status = 'error';
          details = coverageState || 'Error';
        } else if (verdict === 'NEUTRAL') {
          // NEUTRAL = "Excluded" in GSC UI — map by specific coverageState
          if (coverageState === 'Discovered - currently not indexed') {
            status = 'discovered';
            details = 'Discovered but not crawled yet';
          } else if (coverageState === 'Crawled - currently not indexed') {
            status = 'crawled-not-indexed';
            details = 'Crawled but not indexed yet';
          } else if (coverageState === 'URL is unknown to Google') {
            status = 'unknown';
            details = 'Not known to Google';
          } else if (coverageState === 'Page with redirect') {
            status = 'redirect';
            details = 'Page with redirect';
          } else if (coverageState && coverageState.includes('Duplicate')) {
            status = 'duplicate';
            details = coverageState;
          } else if (coverageState && coverageState.includes('canonical')) {
            status = 'duplicate';
            details = coverageState;
          } else if (coverageState && coverageState.includes('noindex')) {
            status = 'noindex';
            details = coverageState;
          } else if (coverageState && coverageState.includes('robots')) {
            status = 'excluded';
            details = coverageState;
          } else if (coverageState && coverageState.includes('Soft 404')) {
            status = 'error';
            details = 'Soft 404';
          } else {
            // Any other NEUTRAL status — show as excluded with raw coverageState
            status = 'excluded';
            details = coverageState || 'Excluded';
          }
        } else {
          // Unknown verdict — preserve raw data
          status = 'pending';
          details = coverageState || 'Status unknown';
        }
        
        const pageData = {
          url: item.url,
          type: item.type,
          status: status,
          details: details,
          eventDate: item.eventDate || null,
          updatedAt: item.updatedAt || null,  // Build10.13.7: Pass through last edit timestamp
          gscData: {
            coverageState,
            verdict,
            lastCrawlTime: indexStatus?.lastCrawlTime || null
          }
        };
        
        pages.push(pageData);
        newStatuses[item.url] = { ...pageData, cachedAt: Date.now() };
        
        // Small delay to avoid hammering API
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error('[GSC] Error inspecting', item.url, ':', error.message);
        pages.push({
          url: item.url,
          type: item.type,
          status: 'error',
          details: `Error: ${error.message}`,
          eventDate: item.eventDate || null,
          updatedAt: item.updatedAt || null  // Build10.13.7: Include updatedAt even in errors
        });
      }
    }

    // Update cache with new statuses (per-URL timestamps)
    if (Object.keys(newStatuses).length > 0) {
      const updatedCache = {
        ...cachedStatuses,
        ...newStatuses
      };
      
      try {
        await cacheStore.set('index-status-cache-v2', JSON.stringify({
          statuses: updatedCache
        }));
        console.log('[GSC] Cache updated with', Object.keys(newStatuses).length, 'new entries (per-URL TTL)');
      } catch (err) {
        console.error('[GSC] Could not update cache:', err.message);
      }
    }

    return new Response(JSON.stringify({ 
      pages,
      meta: {
        total: totalUrls,
        offset: offset,
        limit: limit,
        returned: pages.length,
        hasMore: hasMore,
        queriedNow: queriedCount,
        fromCache: pages.filter(p => p.fromCache).length,
        forceRefresh: forceRefresh,  // Build10.14.11: Indicate if cache was bypassed
        timestamp: new Date().toISOString()
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('[GSC] Fatal error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
