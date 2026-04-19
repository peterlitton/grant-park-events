/**
 * EmailOctopus Subscription Handler (Legacy - kept for compatibility)
 * Note: System now uses MailerLite, this is kept as backup
 */

export default async (req, context) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Get environment variables
  const API_KEY = Netlify.env.get('EMAILOCTOPUS_API_KEY');
  const LIST_ID = Netlify.env.get('EMAILOCTOPUS_LIST_ID');

  // Validate environment variables are set
  if (!API_KEY || !LIST_ID) {
    console.error('Missing environment variables');
    return new Response(JSON.stringify({ 
      error: 'Server configuration error. Please contact administrator.' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Parse request body
    const { email, OriginalSource, DateAdded } = await req.json();

    // Validate email
    if (!email || !email.trim()) {
      return new Response(JSON.stringify({ error: 'Email is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: 'Please enter a valid email address' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Call EmailOctopus API
    const apiUrl = `https://emailoctopus.com/api/1.6/lists/${LIST_ID}/contacts`;
    
    // Use provided DateAdded or fallback to current date (YYYY-MM-DD format)
    const signupDate = DateAdded || new Date().toISOString().split('T')[0];
    
    // Use provided OriginalSource or fallback to 'webform'
    const source = OriginalSource || 'webform';
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        api_key: API_KEY,
        email_address: email.trim().toLowerCase(),
        status: 'SUBSCRIBED',
        fields: {
          OriginalSource: source,
          DateAdded: signupDate
        }
      })
    });

    const data = await response.json();

    // Handle different response codes
    if (response.ok) {
      return new Response(JSON.stringify({ 
        success: true,
        message: 'Successfully subscribed! Check your inbox Monday mornings.'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else if (response.status === 409 || data.error?.code === 'MEMBER_EXISTS_WITH_EMAIL_ADDRESS') {
      return new Response(JSON.stringify({ 
        success: true,
        message: 'You\'re already subscribed! Check your inbox Monday mornings.'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else if (response.status === 400 && data.error?.code === 'INVALID_PARAMETERS') {
      return new Response(JSON.stringify({ 
        error: 'Invalid email address. Please check and try again.'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      console.error('EmailOctopus API error:', data);
      return new Response(JSON.stringify({ 
        error: 'Unable to subscribe at this time. Please try again later.'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('Subscription error:', error);
    return new Response(JSON.stringify({ 
      error: 'An error occurred. Please try again later.'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
