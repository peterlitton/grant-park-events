/**
 * SAVE POPUP SETTINGS
 * 
 * PURPOSE: Save popup settings to Netlify Blobs storage
 * 
 * STORAGE:
 * - Backend: Netlify Blobs
 * - Store: production (default)
 * - Key: 'popup-settings'
 * 
 * PATTERN: ES module matching save-about-content.js architecture
 * 
 * ERROR HANDLING:
 * - If Blobs save fails: Returns error status + triggers email alert
 * 
 * Created: Build10.14.8 (2026-02-09)
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

  // Only allow POST requests
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
    console.log('[SAVE-POPUP-SETTINGS] Starting save to Netlify Blobs...');
    
    // Parse request body
    const settings = await req.json();
    
    // Validate required fields
    if (!settings || typeof settings !== 'object') {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid settings - must be a JSON object'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get Blobs store
    const store = getStore('production');
    
    // Save settings as JSON string
    await store.set('popup-settings', JSON.stringify(settings));
    
    console.log('[SAVE-POPUP-SETTINGS] ✓ Successfully saved settings');
    console.log(`[SAVE-POPUP-SETTINGS] Settings: enabled=${settings.enabled}, delay=${settings.delay}`);
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Popup settings saved successfully',
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
    
  } catch (error) {
    console.error('[SAVE-POPUP-SETTINGS] ❌ Error:', error);
    
    // Trigger error alert email
    try {
      await fetch(`${process.env.URL}/.netlify/functions/send-error-alert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          errorType: 'Netlify Blobs Save Failure',
          functionName: 'save-popup-settings',
          errorMessage: error.message,
          stackTrace: error.stack,
          context: {
            location: 'Save Popup Settings Function',
            operation: 'SET',
            key: 'popup-settings',
            timestamp: new Date().toISOString()
          }
        })
      });
    } catch (alertError) {
      console.error('[SAVE-POPUP-SETTINGS] Failed to send error alert:', alertError);
    }
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to save popup settings',
      message: error.message,
      details: 'Netlify Blobs save failed - site administrator has been notified'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
};
