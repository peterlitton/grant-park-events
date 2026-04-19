/**
 * SEND ERROR ALERT
 * 
 * PURPOSE: Send comprehensive error alerts to site administrator via Netlify Forms
 * 
 * FEATURES:
 * - Rate limiting: Maximum 1 email per hour (prevents spam)
 * - Comprehensive error details for Netlify support
 * - Uses Netlify Forms for email delivery
 * 
 * RECIPIENT: peter@peterlitton.com
 * 
 * RATE LIMIT STORAGE: In-memory (resets on function cold start)
 * Note: This is acceptable since Netlify functions stay warm for ~15 minutes
 * and we only care about preventing spam within the same deploy/session
 * 
 * Created: Build10.13.11 (2026-02-07)
 * Updated: Build10.13.13 - Converted to ES module for consistency
 */

// In-memory rate limiting (simple approach for serverless)
let lastAlertTime = null;
const RATE_LIMIT_MS = 60 * 60 * 1000; // 1 hour

export default async (req, context) => {
  // Only accept POST
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Check rate limit
    const now = Date.now();
    if (lastAlertTime && (now - lastAlertTime) < RATE_LIMIT_MS) {
      console.log('[SEND-ERROR-ALERT] Rate limit in effect - skipping email');
      return new Response(JSON.stringify({
        success: false,
        message: 'Rate limit: Maximum 1 alert per hour',
        nextAllowedTime: new Date(lastAlertTime + RATE_LIMIT_MS).toISOString()
      }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Parse error details
    const {
      errorType,
      functionName,
      errorMessage,
      stackTrace,
      context: errorContext
    } = await req.json();

    console.log(`[SEND-ERROR-ALERT] Sending alert for ${errorType}`);

    // Get deployment/site info from Netlify environment
    const siteId = process.env.SITE_ID || 'N/A';
    const deployId = process.env.DEPLOY_ID || 'N/A';
    const deployUrl = process.env.DEPLOY_URL || 'N/A';
    const context_env = process.env.CONTEXT || 'N/A';

    // Build comprehensive error email body
    const emailBody = `
=== ERROR SUMMARY ===
Timestamp: ${new Date().toISOString()}
Site: grantparkevents.com
Environment: ${context_env}
Component: ${errorContext?.location || 'About Content Storage'}
Severity: High (blocks content display)

=== NETLIFY DETAILS ===
Site ID: ${siteId}
Deploy ID: ${deployId}
Deploy URL: ${deployUrl}
Function: /.netlify/functions/${functionName}
Region: ${process.env.AWS_REGION || 'N/A'}

=== ERROR DETAILS ===
Error Type: ${errorType}
Error Message: ${errorMessage}
Stack Trace: ${stackTrace || 'N/A'}

=== REQUEST CONTEXT ===
Location: ${errorContext?.location || 'N/A'}
Operation: ${errorContext?.operation || 'N/A'}
Key: ${errorContext?.key || 'N/A'}
Occurred At: ${errorContext?.timestamp || 'N/A'}

=== BLOBS CONTEXT ===
Store Name: production (default)
Key Attempted: '${errorContext?.key || 'about-content'}'
Operation: ${errorContext?.operation || 'N/A'}

=== FUNCTION RESPONSE ===
Function Name: ${functionName}
Status: FAILED

=== USER IMPACT ===
Impact: About page not loading or editor disabled
Status: Error returned to client
Notification: User sees error message

=== NEXT STEPS FOR NETLIFY SUPPORT ===
1. Check Netlify Blobs service status
2. Verify function deployment completed successfully
3. Check function logs in Netlify dashboard
4. Verify Blobs store 'production' is accessible
5. Check for any API rate limits or quota issues

This is an automated error alert from Grant Park Events production site.
Opened: ${new Date().toISOString()}
`;

    // Send via Netlify Forms
    // We'll post to a Netlify form endpoint (form must exist in HTML)
    const formData = new URLSearchParams();
    formData.append('form-name', 'error-alerts');
    formData.append('subject', `GPE Production Error - ${errorType}`);
    formData.append('email', 'peter@peterlitton.com');
    formData.append('message', emailBody);

    const formResponse = await fetch(`${process.env.URL}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString()
    });

    if (!formResponse.ok) {
      throw new Error(`Form submission failed: ${formResponse.status}`);
    }

    // Update rate limit timestamp
    lastAlertTime = now;

    console.log('[SEND-ERROR-ALERT] ✓ Error alert sent successfully');

    return new Response(JSON.stringify({
      success: true,
      message: 'Error alert sent',
      recipient: 'peter@peterlitton.com',
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[SEND-ERROR-ALERT] ❌ Failed to send alert:', error);
    
    // Don't trigger another alert (would create infinite loop)
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to send error alert',
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
