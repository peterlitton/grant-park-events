/**
 * GET POPUP SETTINGS
 * 
 * PURPOSE: Retrieve popup settings from Netlify Blobs storage
 * 
 * STORAGE:
 * - Backend: Netlify Blobs
 * - Store: production (default)
 * - Key: 'popup-settings'
 * 
 * PATTERN: ES module matching get-about-content.js / get-events.js architecture
 * 
 * MIGRATION NOTE (Build10.14.8.2):
 * - Returns { found: false } when Blobs has no data (first deploy)
 * - Admin handles migration from localStorage to Blobs on first load
 * - Does NOT auto-initialize with defaults (avoids overwriting localStorage user data)
 * 
 * Created: Build10.14.8 (2026-02-09)
 * Updated: Build10.14.8.2 - Migration-safe: no auto-initialization
 */

import { getStore } from '@netlify/blobs';

export default async (req, context) => {
  try {
    console.log('[GET-POPUP-SETTINGS] Starting fetch from Netlify Blobs...');
    
    const store = getStore('production');
    const settingsData = await store.get('popup-settings');
    
    // If no settings exist, return indicator (admin will handle migration)
    if (!settingsData) {
      console.log('[GET-POPUP-SETTINGS] No settings in Blobs - admin will migrate from localStorage');
      
      return new Response(JSON.stringify({ found: false }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    console.log('[GET-POPUP-SETTINGS] ✓ Successfully retrieved settings');
    
    // settingsData is already a JSON string, return directly
    return new Response(settingsData, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
    
  } catch (error) {
    console.error('[GET-POPUP-SETTINGS] ❌ Error:', error);
    
    try {
      await fetch(`${process.env.URL}/.netlify/functions/send-error-alert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          errorType: 'Netlify Blobs Fetch Failure',
          functionName: 'get-popup-settings',
          errorMessage: error.message,
          stackTrace: error.stack,
          context: {
            location: 'Get Popup Settings Function',
            operation: 'GET',
            key: 'popup-settings',
            timestamp: new Date().toISOString()
          }
        })
      });
    } catch (alertError) {
      console.error('[GET-POPUP-SETTINGS] Failed to send error alert:', alertError);
    }
    
    return new Response(JSON.stringify({
      found: false,
      error: 'Failed to retrieve popup settings',
      message: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
};
