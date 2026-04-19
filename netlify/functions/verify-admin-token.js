// ================================================
// VERIFY ADMIN TOKEN
// ================================================
// Build10.29: Server-side token verification for admin login
// Build10.31.1: Failed login rate limiting (5/hour via Blobs)
// Compares submitted token against GPE_ADMIN_TOKEN env var
// Returns 200 on match, 401 on mismatch, 429 on rate limit
// ================================================

import { getStore } from '@netlify/blobs';

const MAX_FAILED_ATTEMPTS = 5;

export default async (req, context) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { token } = await req.json();
    const adminToken = process.env.GPE_ADMIN_TOKEN;

    if (!adminToken) {
      console.error('[AUTH] GPE_ADMIN_TOKEN environment variable not set');
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Build10.31.1: Check failed login rate limit
    const store = getStore('rate-limits');
    const now = new Date();
    const windowKey = 'login-fail-' + now.getFullYear() + '-' + String(now.getMonth()+1).padStart(2,'0') + '-' + String(now.getDate()).padStart(2,'0') + '-' + String(now.getHours()).padStart(2,'0');
    let failCount = 0;
    try {
      const existing = await store.get(windowKey, { type: 'json' });
      if (existing) failCount = existing.count || 0;
    } catch (e) { /* key doesn't exist yet */ }

    if (failCount >= MAX_FAILED_ATTEMPTS) {
      console.log('[AUTH] Rate limited — ' + failCount + ' failed attempts this hour');

      // Build10.31.1: Alert admin of rate-limited login attempts
      try {
        await fetch(`${process.env.URL}/.netlify/functions/send-error-alert`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            errorType: 'Failed Login Rate Limit Triggered',
            functionName: 'verify-admin-token',
            errorMessage: failCount + ' failed login attempts this hour — further attempts blocked',
            context: {
              location: 'Admin Login',
              operation: 'LOGIN',
              key: windowKey,
              timestamp: new Date().toISOString()
            }
          })
        });
      } catch (alertErr) { console.log('[AUTH] Alert send failed:', alertErr.message); }

      return new Response(JSON.stringify({ error: 'Too many failed attempts. Try again later.' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    if (!token || token !== adminToken) {
      // Increment failed attempt counter
      try {
        await store.set(windowKey, JSON.stringify({ count: failCount + 1 }));
      } catch (e) { console.log('[AUTH] Counter update failed:', e.message); }

      return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    // Success — no counter increment needed (only failures count)
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: 'Invalid request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
