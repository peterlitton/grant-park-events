// Test Facebook Page posting via Meta Graph API
// Temporary function — delete after validating

export default async (event, context) => {
  const PAGE_ID = process.env.META_PAGE_ID;
  const PAGE_TOKEN = process.env.META_PAGE_ACCESS_TOKEN;

  if (!PAGE_ID || !PAGE_TOKEN) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Missing META_PAGE_ID or META_PAGE_ACCESS_TOKEN env vars' })
    };
  }

  const action = (event.queryStringParameters || {}).action || 'test';

  try {
    if (action === 'test') {
      // Post a simple test message
      const response = await fetch(`https://graph.facebook.com/v25.0/${PAGE_ID}/feed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: '🔧 Test post from GPE automation. Please ignore — this will be deleted shortly.',
          access_token: PAGE_TOKEN
        })
      });

      const data = await response.json();

      if (data.error) {
        return {
          statusCode: 400,
          body: JSON.stringify({ success: false, error: data.error })
        };
      }

      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, post_id: data.id, message: 'Test post published. Delete it from your page when done.' })
      };

    } else if (action === 'delete') {
      // Delete a post by ID
      const postId = (event.queryStringParameters || {}).post_id;
      if (!postId) {
        return { statusCode: 400, body: JSON.stringify({ error: 'post_id required' }) };
      }

      const response = await fetch(`https://graph.facebook.com/v25.0/${postId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token: PAGE_TOKEN })
      });

      const data = await response.json();
      return {
        statusCode: 200,
        body: JSON.stringify({ success: data.success, deleted: postId })
      };

    } else if (action === 'verify') {
      // Just verify credentials without posting
      const response = await fetch(`https://graph.facebook.com/v25.0/${PAGE_ID}?fields=name,id,fan_count&access_token=${PAGE_TOKEN}`);
      const data = await response.json();
      return {
        statusCode: 200,
        body: JSON.stringify({ success: !data.error, page: data })
      };
    }

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
