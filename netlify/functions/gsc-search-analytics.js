// GSC Search Analytics Function - Build10.16
// Queries Google Search Console Search Analytics API for dashboard metrics
// Endpoints: overview (clicks/impressions), top-queries-impressions, top-queries-clicks, top-positions
// Uses same service account as GSC index status

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
  if (data.error) {
    throw new Error(`OAuth2 error: ${data.error_description || data.error}`);
  }
  
  return data.access_token;
}

// Helper: Query GSC Search Analytics API
async function searchAnalytics(accessToken, requestBody) {
  // GSC Search Analytics uses sc-domain property
  const siteUrl = 'sc-domain:grantparkevents.com';
  const response = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    }
  );
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`GSC API error (${response.status}): ${errorText}`);
  }
  
  return response.json();
}

// Helper: Format date as YYYY-MM-DD
function formatDate(date) {
  return date.toISOString().split('T')[0];
}

export default async (req, context) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };
  
  if (req.method === 'OPTIONS') {
    return new Response('', { headers: corsHeaders });
  }
  
  const url = new URL(req.url);
  const metric = url.searchParams.get('metric');
  
  if (!metric) {
    return new Response(JSON.stringify({ error: 'Missing metric parameter. Use: overview, top-queries-impressions, top-queries-clicks, top-positions' }), {
      status: 400, headers: corsHeaders
    });
  }
  
  try {
    const accessToken = await getAccessToken();
    
    // GSC data has ~2 day lag, so use 3-5 days ago as the range
    const now = new Date();
    const daysAgo3 = formatDate(new Date(now - 3 * 86400000));
    const daysAgo7 = formatDate(new Date(now - 7 * 86400000));
    const daysAgo28 = formatDate(new Date(now - 28 * 86400000));
    
    let result;
    
    if (metric === 'overview') {
      // Total clicks and impressions for last 7 days
      const data = await searchAnalytics(accessToken, {
        startDate: daysAgo7,
        endDate: daysAgo3,
        dimensions: ['date'],
        rowLimit: 10
      });
      
      let totalClicks = 0, totalImpressions = 0;
      const daily = (data.rows || []).map(row => {
        totalClicks += row.clicks;
        totalImpressions += row.impressions;
        return {
          date: row.keys[0],
          clicks: row.clicks,
          impressions: row.impressions,
          ctr: Math.round(row.ctr * 10000) / 100,
          position: Math.round(row.position * 10) / 10
        };
      });
      
      result = {
        metric: 'overview',
        period: 'last 7 days (GSC data has ~2 day lag)',
        totalClicks,
        totalImpressions,
        avgCtr: totalImpressions > 0 ? Math.round((totalClicks / totalImpressions) * 10000) / 100 : 0,
        daily
      };
      
    } else if (metric === 'top-queries-impressions') {
      // Top 3 search terms by impressions
      const data = await searchAnalytics(accessToken, {
        startDate: daysAgo7,
        endDate: daysAgo3,
        dimensions: ['query'],
        rowLimit: 5,
        dimensionFilterGroups: []
      });
      
      // API returns sorted by clicks by default, re-sort by impressions
      const rows = (data.rows || []).sort((a, b) => b.impressions - a.impressions);
      
      result = {
        metric: 'top-queries-impressions',
        period: 'last 7 days',
        queries: rows.slice(0, 10).map(row => ({
          query: row.keys[0],
          impressions: row.impressions,
          clicks: row.clicks,
          ctr: Math.round(row.ctr * 10000) / 100,
          position: Math.round(row.position * 10) / 10
        }))
      };
      
    } else if (metric === 'top-queries-clicks') {
      // Top 10 search terms by clicks
      const data = await searchAnalytics(accessToken, {
        startDate: daysAgo7,
        endDate: daysAgo3,
        dimensions: ['query'],
        rowLimit: 10
        // Default sort is by clicks descending
      });
      
      result = {
        metric: 'top-queries-clicks',
        period: 'last 7 days',
        queries: (data.rows || []).map(row => ({
          query: row.keys[0],
          clicks: row.clicks,
          impressions: row.impressions,
          ctr: Math.round(row.ctr * 10000) / 100,
          position: Math.round(row.position * 10) / 10
        }))
      };
      
    } else if (metric === 'top-positions') {
      // Top 10 search terms by best (lowest) average position
      const data = await searchAnalytics(accessToken, {
        startDate: daysAgo28,
        endDate: daysAgo3,
        dimensions: ['query'],
        rowLimit: 50
      });
      
      // Sort by position ascending (best rank first), filter to terms with some impressions
      const rows = (data.rows || [])
        .filter(row => row.impressions >= 3)
        .sort((a, b) => a.position - b.position);
      
      result = {
        metric: 'top-positions',
        period: 'last 28 days',
        queries: rows.slice(0, 10).map(row => ({
          query: row.keys[0],
          position: Math.round(row.position * 10) / 10,
          clicks: row.clicks,
          impressions: row.impressions
        }))
      };
      
    } else {
      return new Response(JSON.stringify({ error: `Unknown metric: ${metric}` }), {
        status: 400, headers: corsHeaders
      });
    }
    
    return new Response(JSON.stringify(result), {
      status: 200, headers: corsHeaders
    });
    
  } catch (err) {
    console.error('[GSC Search Analytics] Error:', err.message);
    return new Response(JSON.stringify({
      error: 'GSC Search Analytics error',
      message: err.message
    }), {
      status: 500, headers: corsHeaders
    });
  }
};
