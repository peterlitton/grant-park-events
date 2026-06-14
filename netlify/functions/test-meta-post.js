// Test Meta Graph API — Temporary validation function
// Pattern copied from get-campaign-stats.js (confirmed working)

export default async (req, context) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache'
  };

  if (req.method === 'OPTIONS') {
    return new Response('', { headers: corsHeaders });
  }

  try {
    const PAGE_ID = Netlify.env.get('META_PAGE_ID');
    const PAGE_TOKEN = Netlify.env.get('META_PAGE_ACCESS_TOKEN');

    if (!PAGE_ID || !PAGE_TOKEN) {
      return new Response(JSON.stringify({ error: 'Missing env vars', hasPageId: !!PAGE_ID, hasToken: !!PAGE_TOKEN }), {
        status: 500, headers: corsHeaders
      });
    }

    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'verify';

    if (action === 'verify') {
      const resp = await fetch('https://graph.facebook.com/v25.0/' + PAGE_ID + '?fields=name,id,fan_count&access_token=' + PAGE_TOKEN);
      const data = await resp.json();
      return new Response(JSON.stringify(data), { headers: corsHeaders });

    } else if (action === 'test') {
      const resp = await fetch('https://graph.facebook.com/v25.0/' + PAGE_ID + '/feed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: '🔧 Test post from GPE automation. Please ignore — this will be deleted shortly.',
          access_token: PAGE_TOKEN
        })
      });
      const data = await resp.json();
      return new Response(JSON.stringify(data), { headers: corsHeaders });

    } else if (action === 'delete') {
      const postId = url.searchParams.get('post_id');
      if (!postId) {
        return new Response(JSON.stringify({ error: 'post_id param required' }), {
          status: 400, headers: corsHeaders
        });
      }
      const resp = await fetch('https://graph.facebook.com/v25.0/' + postId + '?access_token=' + PAGE_TOKEN, {
        method: 'DELETE'
      });
      const data = await resp.json();
      return new Response(JSON.stringify(data), { headers: corsHeaders });

    } else if (action === 'token-info') {
      const resp = await fetch('https://graph.facebook.com/v25.0/debug_token?input_token=' + PAGE_TOKEN + '&access_token=' + PAGE_TOKEN);
      const data = await resp.json();
      return new Response(JSON.stringify(data), { headers: corsHeaders });
    }

    return new Response(JSON.stringify({ error: 'Use ?action=verify, test, delete, or token-info' }), {
      status: 400, headers: corsHeaders
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: corsHeaders
    });
  }
};
