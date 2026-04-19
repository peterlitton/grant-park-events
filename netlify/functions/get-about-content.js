/**
 * GET ABOUT CONTENT
 * 
 * PURPOSE: Retrieve About page content from Netlify Blobs storage
 * 
 * STORAGE:
 * - Backend: Netlify Blobs
 * - Store: production (default)
 * - Key: 'about-content'
 * 
 * PATTERN: ES module matching get-events.js architecture
 * 
 * ERROR HANDLING:
 * - If Blobs fetch fails: Returns error status + triggers email alert
 * - If key doesn't exist: Auto-populates with default content (first-time setup)
 * 
 * Created: Build10.13.11 (2026-02-07)
 * Updated: Build10.13.13 - Converted to ES module for Blobs compatibility
 */

import { getStore } from '@netlify/blobs';

// Default About content (used for first-time initialization)
const DEFAULT_ABOUT_CONTENT = `What is GrantParkEvents.com?

WHO:
GrantParkEvents.com is a one-person, private, self-funded operation.

WHAT:
GrantParkEvents.com is a non-profit public service for the residents of and visitors to downtown Chicago.

WHY:
Events in Chicago's Grant Park are numerous, particularly in the summer. But there is not a single online resource that calendars all of the events happening in the park, independent of sponsor, organizer or owner. GrantParkEvents.com's purpose is to fill that need, simplify the entertainment discovery process and ultimately drive more enjoyment of what are mostly FREE events available to all residents and visitors. GrantParkEvents.com does not sponsor events, own the programming or otherwise claim any rights to the content published of sponsors or performers.`;

export default async (req, context) => {
  try {
    console.log('[GET-ABOUT-CONTENT] Starting fetch from Netlify Blobs...');
    
    // Get Blobs store
    const store = getStore('production');
    
    // Try to get existing content
    let content = await store.get('about-content', { type: 'text' });
    
    // If no content exists, initialize with default
    if (!content) {
      console.log('[GET-ABOUT-CONTENT] No content found - initializing with default');
      await store.set('about-content', DEFAULT_ABOUT_CONTENT);
      content = DEFAULT_ABOUT_CONTENT;
    }
    
    console.log('[GET-ABOUT-CONTENT] ✓ Successfully retrieved content');
    
    return new Response(JSON.stringify({
      success: true,
      content: content,
      source: 'netlify-blobs',
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
    
  } catch (error) {
    console.error('[GET-ABOUT-CONTENT] ❌ Error:', error);
    
    // Trigger error alert email
    try {
      await fetch(`${process.env.URL}/.netlify/functions/send-error-alert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          errorType: 'Netlify Blobs Fetch Failure',
          functionName: 'get-about-content',
          errorMessage: error.message,
          stackTrace: error.stack,
          context: {
            location: 'Get About Content Function',
            operation: 'GET',
            key: 'about-content',
            timestamp: new Date().toISOString()
          }
        })
      });
    } catch (alertError) {
      console.error('[GET-ABOUT-CONTENT] Failed to send error alert:', alertError);
    }
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to retrieve About content',
      message: error.message,
      details: 'Netlify Blobs fetch failed - site administrator has been notified'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
};
