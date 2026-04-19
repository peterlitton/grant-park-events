/**
 * BUILD10.13.13 - GET MONITOR STATUS
 * 
 * Retrieves current monitoring status for all tracked pages
 * ES module for compatibility with package.json "type": "module"
 * 
 * GET /.netlify/functions/get-monitor-status
 */

import { getStore } from '@netlify/blobs';

export default async (req, context) => {
  try {
    const store = getStore('production');
    const statusJson = await store.get('monitor-status', { type: 'text' });

    if (!statusJson) {
      return new Response(JSON.stringify({
        success: true,
        status: []
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    const status = JSON.parse(statusJson);

    return new Response(JSON.stringify({
      success: true,
      status: status
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('[MONITOR] Error loading status:', error);
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
