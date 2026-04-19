// MailerLite Subscribe Function - Production
// Handles email signups from signup page and popup modal
// Build10.31: Global rate limiting via Netlify Blobs (60/hour)

import { getStore } from '@netlify/blobs';

const RATE_LIMIT_MAX = 60; // max signups per hour

export default async (req, context) => {
  // Only allow POST
  if (req.method !== 'POST') {
    console.log('[ERROR] Invalid method:', req.method);
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  }

  try {
    // Build10.31: Rate limit check
    const store = getStore('rate-limits');
    const now = new Date();
    const windowKey = 'subscribe-' + now.getFullYear() + '-' + String(now.getMonth()+1).padStart(2,'0') + '-' + String(now.getDate()).padStart(2,'0') + '-' + String(now.getHours()).padStart(2,'0');
    let count = 0;
    try {
      const existing = await store.get(windowKey, { type: 'json' });
      if (existing) count = existing.count || 0;
    } catch (e) { /* key doesn't exist yet — count stays 0 */ }

    if (count >= RATE_LIMIT_MAX) {
      console.log('[RATE LIMIT] Blocked — ' + count + ' signups this hour');

      // Build10.31.1: Alert admin of signup rate limit
      try {
        await fetch(`${process.env.URL}/.netlify/functions/send-error-alert`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            errorType: 'Signup Rate Limit Triggered',
            functionName: 'subscribe-mailerlite',
            errorMessage: count + ' signups this hour — further signups blocked until next hour',
            context: {
              location: 'Public Subscriber Signup',
              operation: 'SUBSCRIBE',
              key: windowKey,
              timestamp: new Date().toISOString()
            }
          })
        });
      } catch (alertErr) { console.log('[RATE LIMIT] Alert send failed:', alertErr.message); }

      return new Response(JSON.stringify({
        error: 'Too many signups. Please try again later.'
      }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    }
    const { email, source } = await req.json();
    
    console.log('[SIGNUP] New subscription attempt:', {
      email: email,
      source: source,
      timestamp: new Date().toISOString()
    });

    // Validate input
    if (!email || !source) {
      console.log('[ERROR] Missing required fields:', { email: !!email, source: !!source });
      return new Response(JSON.stringify({ 
        error: 'Missing required fields',
        required: ['email', 'source']
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    }

    // Validate source value
    const validSources = ['Page', 'Pop-Up'];
    if (!validSources.includes(source)) {
      console.log('[ERROR] Invalid source value:', { 
        received: source, 
        allowed: validSources 
      });
      return new Response(JSON.stringify({ 
        error: 'Invalid source value',
        allowed: validSources,
        received: source
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('[ERROR] Invalid email format:', email);
      return new Response(JSON.stringify({ 
        error: 'Invalid email format'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    }

    // Get current date in YYYY-MM-DD format
    const today = new Date();
    const creation_date = today.toISOString().split('T')[0];

    console.log('[SIGNUP] Validation passed, preparing API request:', {
      email: email,
      source: source,
      creation_date: creation_date
    });

    // MailerLite API configuration
    const MAILERLITE_API_KEY = Netlify.env.get('MAILERLITE_API_KEY');
    const MAILERLITE_GROUP_ID = Netlify.env.get('MAILERLITE_GROUP_ID');

    if (!MAILERLITE_API_KEY || !MAILERLITE_GROUP_ID) {
      console.log('[ERROR] Missing MailerLite configuration:', {
        hasApiKey: !!MAILERLITE_API_KEY,
        hasGroupId: !!MAILERLITE_GROUP_ID
      });
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    }

    // Prepare API payload
    const apiPayload = {
      email: email,
      fields: {
        creation_source: source,
        creation_date: creation_date
      },
      groups: [MAILERLITE_GROUP_ID]
    };

    console.log('[API] Sending request to MailerLite:', {
      endpoint: 'https://connect.mailerlite.com/api/subscribers',
      method: 'POST',
      payload: apiPayload
    });

    // Create/update subscriber in MailerLite
    const response = await fetch('https://connect.mailerlite.com/api/subscribers', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MAILERLITE_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(apiPayload)
    });

    const data = await response.json();

    console.log('[API] MailerLite response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      data: data
    });

    // Handle response
    if (response.ok) {
      console.log('[SIGNUP] ✅ SUCCESS - Subscriber added:', {
        email: email,
        source: source,
        date: creation_date,
        subscriberId: data.data?.id
      });

      // Build10.31: Increment rate limit counter (only on success)
      try {
        await store.set(windowKey, JSON.stringify({ count: count + 1 }));
      } catch (e) { console.log('[RATE LIMIT] Counter update failed:', e.message); }

      return new Response(JSON.stringify({ 
        success: true,
        message: 'Successfully subscribed to Grant Park Events newsletter',
        email: email,
        source: source,
        date: creation_date
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    } else {
      console.log('[ERROR] MailerLite API error:', {
        status: response.status,
        email: email,
        source: source,
        error: data
      });
      
      return new Response(JSON.stringify({ 
        error: 'Subscription failed',
        details: data.message || 'Unable to subscribe at this time. Please try again.'
      }), {
        status: response.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    }

  } catch (error) {
    console.log('[ERROR] Function exception:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: 'Unable to process subscription. Please try again later.'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  }
};
