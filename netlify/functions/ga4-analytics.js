// GA4 Analytics Function - Build10.16
// Queries Google Analytics Data API for dashboard metrics
// Endpoints: top pages, daily traffic, traffic sources, platform breakdown
// Uses same service account as GSC (gpe-search-console@...)

const GA4_PROPERTY_ID = '377166392';

// Helper: Get Google API access token with Analytics scope
async function getAccessToken() {
  const credentials = {
    client_email: Netlify.env.get('GSC_CLIENT_EMAIL'),
    private_key: Netlify.env.get('GSC_PRIVATE_KEY').replace(/\\n/g, '\n')
  };
  
  const jwtHeader = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  
  const now = Math.floor(Date.now() / 1000);
  const jwtClaim = {
    iss: credentials.client_email,
    // Analytics Data API scope
    scope: 'https://www.googleapis.com/auth/analytics.readonly',
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

// Helper: Run a GA4 Data API report
async function runReport(accessToken, requestBody) {
  const response = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${GA4_PROPERTY_ID}:runReport`,
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
    throw new Error(`GA4 API error (${response.status}): ${errorText}`);
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
    return new Response(JSON.stringify({ error: 'Missing metric parameter. Use: top-pages, daily-traffic, traffic-sources, platform' }), {
      status: 400, headers: corsHeaders
    });
  }
  
  try {
    const accessToken = await getAccessToken();
    
    const now = new Date();
    const today = formatDate(now);
    const yesterday = formatDate(new Date(now - 86400000));
    const daysAgo3 = formatDate(new Date(now - 3 * 86400000));
    const daysAgo5 = formatDate(new Date(now - 5 * 86400000));
    
    let result;
    
    if (metric === 'top-pages') {
      // Top 3 most visited pages last 24 hours
      const data = await runReport(accessToken, {
        dateRanges: [{ startDate: yesterday, endDate: today }],
        dimensions: [{ name: 'pagePath' }],
        metrics: [{ name: 'screenPageViews' }],
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        limit: 10
      });
      
      result = {
        metric: 'top-pages',
        period: 'last 24 hours',
        pages: (data.rows || []).map(row => ({
          path: row.dimensionValues[0].value,
          views: parseInt(row.metricValues[0].value)
        }))
      };
      
    } else if (metric === 'daily-traffic') {
      // Build10.16.1: Accept dynamic days parameter (default 5)
      const daysParam = parseInt(url.searchParams.get('days')) || 5;
      const startDate = formatDate(new Date(now - daysParam * 86400000));
      const data = await runReport(accessToken, {
        dateRanges: [{ startDate: startDate, endDate: today }],
        dimensions: [{ name: 'date' }],
        metrics: [
          { name: 'activeUsers' },
          { name: 'sessions' },
          { name: 'screenPageViews' }
        ],
        orderBys: [{ dimension: { dimensionName: 'date' }, desc: false }]
      });
      
      result = {
        metric: 'daily-traffic',
        period: `last ${daysParam} days`,
        days: (data.rows || []).map(row => ({
          date: row.dimensionValues[0].value,
          visitors: parseInt(row.metricValues[0].value),
          sessions: parseInt(row.metricValues[1].value),
          pageViews: parseInt(row.metricValues[2].value)
        }))
      };
      
    } else if (metric === 'traffic-sources') {
      // Last 3 days traffic by source (for pie chart)
      const data = await runReport(accessToken, {
        dateRanges: [{ startDate: daysAgo3, endDate: today }],
        dimensions: [{ name: 'sessionDefaultChannelGroup' }],
        metrics: [{ name: 'sessions' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 10
      });
      
      result = {
        metric: 'traffic-sources',
        period: 'last 3 days',
        sources: (data.rows || []).map(row => ({
          source: row.dimensionValues[0].value,
          sessions: parseInt(row.metricValues[0].value)
        }))
      };
      
    } else if (metric === 'platform') {
      // Last 3 days traffic by device category (for pie chart)
      const data = await runReport(accessToken, {
        dateRanges: [{ startDate: daysAgo3, endDate: today }],
        dimensions: [{ name: 'deviceCategory' }],
        metrics: [{ name: 'sessions' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }]
      });
      
      result = {
        metric: 'platform',
        period: 'last 3 days',
        devices: (data.rows || []).map(row => ({
          device: row.dimensionValues[0].value,
          sessions: parseInt(row.metricValues[0].value)
        }))
      };
      
    } else if (metric === 'landing-pages') {
      // Build10.35: Top landing pages (first page visited)
      const daysParam = parseInt(url.searchParams.get('days')) || 7;
      const startDate = formatDate(new Date(now - daysParam * 86400000));
      const data = await runReport(accessToken, {
        dateRanges: [{ startDate, endDate: today }],
        dimensions: [{ name: 'landingPagePlusQueryString' }],
        metrics: [{ name: 'sessions' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 10
      });
      
      result = {
        metric: 'landing-pages',
        period: `last ${daysParam} days`,
        pages: (data.rows || []).map(row => ({
          path: row.dimensionValues[0].value,
          sessions: parseInt(row.metricValues[0].value)
        }))
      };
      
    } else if (metric === 'engagement') {
      // Build10.35: Add to Calendar + Share event counts
      const daysParam = parseInt(url.searchParams.get('days')) || 7;
      const startDate = formatDate(new Date(now - daysParam * 86400000));
      const data = await runReport(accessToken, {
        dateRanges: [{ startDate, endDate: today }],
        dimensions: [{ name: 'eventName' }],
        metrics: [{ name: 'eventCount' }],
        dimensionFilter: {
          orGroup: {
            expressions: [
              { filter: { fieldName: 'eventName', stringFilter: { value: 'add_to_calendar' } } },
              { filter: { fieldName: 'eventName', stringFilter: { value: 'share_event' } } }
            ]
          }
        }
      });
      
      const events = {};
      (data.rows || []).forEach(row => {
        events[row.dimensionValues[0].value] = parseInt(row.metricValues[0].value);
      });
      
      result = {
        metric: 'engagement',
        period: `last ${daysParam} days`,
        addToCalendar: events['add_to_calendar'] || 0,
        shareEvent: events['share_event'] || 0
      };
      
    } else {
      return new Response(JSON.stringify({ error: `Unknown metric: ${metric}. Use: top-pages, daily-traffic, traffic-sources, platform` }), {
        status: 400, headers: corsHeaders
      });
    }
    
    return new Response(JSON.stringify(result), {
      status: 200, headers: corsHeaders
    });
    
  } catch (err) {
    console.error('[GA4] Error:', err.message);
    return new Response(JSON.stringify({
      error: 'GA4 API error',
      message: err.message,
      hint: err.message.includes('403') ? 'Service account may not have Viewer access on GA4 property' :
            err.message.includes('404') ? 'GA4 Analytics Data API may not be enabled in Google Cloud' :
            'Check function logs for details'
    }), {
      status: 500, headers: corsHeaders
    });
  }
};
