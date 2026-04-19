/**
 * BUILD10.13.13 - GET MONITOR SETTINGS
 * 
 * Retrieves page monitoring settings from Netlify Blobs
 * ES module for compatibility with package.json "type": "module"
 * 
 * GET /.netlify/functions/get-monitor-settings
 */

import { getStore } from '@netlify/blobs';

export default async (req, context) => {
  try {
    const store = getStore('production');
    const settingsJson = await store.get('monitor-settings', { type: 'text' });

    if (!settingsJson) {
      // Return empty defaults if no settings exist yet
      return new Response(JSON.stringify({
        success: true,
        settings: {
          urls: [],
          checkTime: '09:00',
          timezone: 'America/Chicago',
          email: 'peter@peterlitton.com'
        }
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    const settings = JSON.parse(settingsJson);

    return new Response(JSON.stringify({
      success: true,
      settings: settings
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('[MONITOR] Error loading settings:', error);
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
