/**
 * SAVE ABOUT CONTENT
 * 
 * PURPOSE: Save About page content to Netlify Blobs storage
 * 
 * STORAGE:
 * - Backend: Netlify Blobs
 * - Store: production (default)
 * - Key: 'about-content'
 * 
 * PATTERN: ES module matching save-events.js architecture
 * 
 * ERROR HANDLING:
 * - If Blobs save fails: Returns error status + triggers email alert
 * 
 * Created: Build10.13.11 (2026-02-07)
 * Updated: Build10.13.13 - Converted to ES module for Blobs compatibility
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
    console.log('[SAVE-ABOUT-CONTENT] Starting save to Netlify Blobs...');
    
    // Parse request body
    const { content } = await req.json();
    
    // Validate content
    if (!content || typeof content !== 'string') {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid content - must be a non-empty string'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get Blobs store
    const store = getStore('production');
    
    // Save content
    await store.set('about-content', content);
    
    console.log('[SAVE-ABOUT-CONTENT] ✓ Successfully saved content');
    console.log(`[SAVE-ABOUT-CONTENT] Content length: ${content.length} characters`);
    
    return new Response(JSON.stringify({
      success: true,
      message: 'About content saved successfully',
      contentLength: content.length,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
    
  } catch (error) {
    console.error('[SAVE-ABOUT-CONTENT] ❌ Error:', error);
    
    // Trigger error alert email
    try {
      await fetch(`${process.env.URL}/.netlify/functions/send-error-alert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          errorType: 'Netlify Blobs Save Failure',
          functionName: 'save-about-content',
          errorMessage: error.message,
          stackTrace: error.stack,
          context: {
            location: 'Save About Content Function',
            operation: 'SET',
            key: 'about-content',
            timestamp: new Date().toISOString()
          }
        })
      });
    } catch (alertError) {
      console.error('[SAVE-ABOUT-CONTENT] Failed to send error alert:', alertError);
    }
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to save About content',
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
