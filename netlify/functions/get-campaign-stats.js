// Get Campaign Stats — Build10.35
// Queries MailerLite API for sent campaign performance data
// Returns: campaign name, sent date, delivered, opens, clicks, unsubscribes, spam, bounces

export default async (req, context) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=300'
  };

  if (req.method === 'OPTIONS') {
    return new Response('', { headers: corsHeaders });
  }

  try {
    const MAILERLITE_API_KEY = Netlify.env.get('MAILERLITE_API_KEY');
    if (!MAILERLITE_API_KEY) {
      return new Response(JSON.stringify({ error: 'MAILERLITE_API_KEY not configured' }), {
        status: 500, headers: corsHeaders
      });
    }

    // Fetch sent campaigns from MailerLite
    const response = await fetch('https://connect.mailerlite.com/api/campaigns?filter[status]=sent', {
      headers: {
        'Authorization': `Bearer ${MAILERLITE_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`MailerLite API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const campaigns = (data.data || []).map(c => ({
      id: c.id,
      name: c.name,
      subject: c.emails?.[0]?.subject || c.name,
      sentAt: c.finished_at || c.scheduled_for,
      stats: {
        sent: c.stats?.sent || 0,
        opensCount: c.stats?.opens_count || 0,
        openRate: c.stats?.open_rate?.percentage || 0,
        clicksCount: c.stats?.clicks_count || 0,
        clickRate: c.stats?.click_rate?.percentage || 0,
        unsubscribes: c.stats?.unsubscribes_count || 0,
        spam: c.stats?.spam_count || 0,
        hardBounces: c.stats?.hard_bounces_count || 0,
        softBounces: c.stats?.soft_bounces_count || 0
      }
    }));

    return new Response(JSON.stringify({ campaigns }), {
      status: 200, headers: corsHeaders
    });

  } catch (err) {
    console.error('[Campaign Stats] Error:', err.message);
    return new Response(JSON.stringify({
      error: 'Failed to fetch campaign stats',
      message: err.message
    }), {
      status: 500, headers: corsHeaders
    });
  }
};
