/**
 * BUILD10.13.13 - SAVE MONITOR SETTINGS
 * 
 * Saves page monitoring settings to Netlify Blobs
 * ES module for compatibility with package.json "type": "module"
 * 
 * POST /.netlify/functions/save-monitor-settings
 * Body: { urls: string, checkTime: string, email: string }
 */

import { getStore } from '@netlify/blobs';

export default async (req, context) => {
  // Build10.30: CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Build10.30: Auth check
  const authHeader = req.headers.get('authorization');
  const token = process.env.GPE_ADMIN_TOKEN;
  if (!authHeader || authHeader !== `Bearer ${token}`) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  try {
    const { urls, checkTime, email } = await req.json();

    // Validate inputs
    if (!email || !checkTime) {
      return new Response(JSON.stringify({ error: 'Email and check time are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Parse URLs - handle newlines, spaces, commas, or any combination
    // Split on any whitespace, filter empty, validate each as a URL
    const urlList = (urls || '')
      .split(/[\s,]+/)  // Split on any whitespace (spaces, newlines, tabs) or commas
      .map(url => url.trim())
      .filter(url => {
        // Filter out empty strings
        if (url.length === 0) return false;
        
        // Validate it's actually a URL (starts with http:// or https://)
        return url.startsWith('http://') || url.startsWith('https://');
      });

    const settings = {
      urls: urlList,
      checkTime: checkTime, // Format: "09:00"
      timezone: 'America/Chicago',
      email: email,
      updatedAt: new Date().toISOString()
    };

    // Save to Blobs
    const store = getStore('production');
    await store.set('monitor-settings', JSON.stringify(settings));

    console.log('[MONITOR] Settings saved:', {
      urlCount: urlList.length,
      checkTime,
      email
    });

    return new Response(JSON.stringify({
      success: true,
      urlCount: urlList.length
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('[MONITOR] Error saving settings:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
};
