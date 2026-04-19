/**
 * BUILD10.13.13 - CHECK PAGE CHANGES (Scheduled)
 * 
 * Runs daily to check all monitored pages for changes
 * ES module for compatibility with package.json "type": "module"
 * 
 * Schedule: 9:00 AM CT = 14:00 UTC (2:00 PM)
 * Dual-method detection:
 * 1. Try Chicago Open Data Portal API (for chicago.gov pages)
 * 2. Fall back to web scraping with content hash
 * 
 * TODO: Add Puppeteer for chicago.gov bot protection bypass
 * For now uses basic fetch (may be blocked by 403)
 */

import { getStore } from '@netlify/blobs';
import crypto from 'crypto';

// Netlify scheduled function config
export const config = {
  schedule: "0 15 * * *"  // 9:00 AM CST (15:00 UTC) / 10:00 AM CDT (15:00 UTC)
};

export default async (event, context) => {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();
  console.log('[MONITOR] Starting page change check...');
  
  try {
    const store = getStore('production');
    
    // Load settings
    const settingsJson = await store.get('monitor-settings', { type: 'text' });
    if (!settingsJson) {
      console.log('[MONITOR] No settings found, skipping check');
      return new Response(JSON.stringify({ message: 'No settings' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const settings = JSON.parse(settingsJson);
    const { urls, email, checkTime } = settings;
    
    if (!urls || urls.length === 0) {
      console.log('[MONITOR] No URLs to monitor');
      return new Response(JSON.stringify({ message: 'No URLs' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Load previous status
    const statusJson = await store.get('monitor-status', { type: 'text' });
    const previousStatus = statusJson ? JSON.parse(statusJson) : [];
    
    // Check each URL
    const results = [];
    const changedPages = [];
    
    for (const url of urls) {
      console.log('[MONITOR] Checking:', url);
      const result = await checkPage(url, previousStatus);
      results.push(result);
      
      if (result.changed) {
        changedPages.push(result);
      }
    }
    
    // Save updated status
    await store.set('monitor-status', JSON.stringify(results));
    
    // Send email if any pages changed
    let emailSent = false;
    if (changedPages.length > 0) {
      await sendChangeAlert(email, changedPages);
      emailSent = true;
    }
    
    // Calculate execution duration
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    
    // BUILD10.13.14: Create execution log entry
    await saveExecutionLog(store, {
      timestamp,
      scheduledTime: checkTime || '09:00 CT',
      duration: `${duration}s`,
      urlsChecked: results.length,
      changesDetected: changedPages.length,
      emailSent,
      status: 'success',
      results: results.map(r => ({
        url: r.url,
        method: r.method,
        status: r.status,
        lastModified: r.lastModified || null,
        hash: r.hash ? r.hash.substring(0, 8) : null,
        error: r.error || null
      }))
    });
    
    console.log('[MONITOR] Check complete:', {
      total: results.length,
      changed: changedPages.length,
      duration: `${duration}s`
    });
    
    return new Response(JSON.stringify({
      success: true,
      checked: results.length,
      changed: changedPages.length,
      duration: `${duration}s`
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('[MONITOR] Error in check-page-changes:', error);
    
    // BUILD10.13.14: Log failed execution
    try {
      const store = getStore('production');
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      await saveExecutionLog(store, {
        timestamp,
        scheduledTime: '09:00 CT',
        duration: `${duration}s`,
        urlsChecked: 0,
        changesDetected: 0,
        emailSent: false,
        status: 'error',
        error: error.message,
        results: []
      });
    } catch (logError) {
      console.error('[MONITOR] Failed to log error execution:', logError);
    }
    
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

/**
 * Check a single page using dual-method approach
 */
async function checkPage(url, previousStatus) {
  const prevData = previousStatus.find(p => p.url === url);
  
  try {
    // METHOD 1: Try Open Data Portal API (for chicago.gov)
    if (url.includes('chicago.gov')) {
      const apiResult = await checkViaAPI(url);
      if (apiResult.found) {
        const changed = prevData && prevData.lastModified !== apiResult.lastModified;
        return {
          url,
          method: 'Open Data Portal API',
          lastModified: apiResult.lastModified,
          lastChecked: new Date().toISOString(),
          status: changed ? 'changed' : 'unchanged',
          changed: changed
        };
      }
    }
    
    // METHOD 2: Fall back to web scraping with content hash
    const hashResult = await checkViaHash(url);
    const changed = prevData && prevData.hash !== hashResult.hash;
    
    return {
      url,
      method: hashResult.method,
      hash: hashResult.hash,
      lastChecked: new Date().toISOString(),
      status: changed ? 'changed' : 'unchanged',
      changed: changed,
      error: hashResult.error
    };
    
  } catch (error) {
    console.error('[MONITOR] Error checking', url, error);
    return {
      url,
      method: 'Error',
      lastChecked: new Date().toISOString(),
      status: 'error',
      error: error.message,
      changed: false
    };
  }
}

/**
 * METHOD 1: Check via Chicago Open Data Portal API
 */
async function checkViaAPI(url) {
  try {
    // Extract event name from URL for API search
    const match = url.match(/\/([^\/]+)\.html$/);
    if (!match) return { found: false };
    
    const eventSlug = match[1];
    
    // Query Open Data Portal
    const apiUrl = 'https://data.cityofchicago.org/resource/vxi5-4wr5.json';
    const response = await fetch(apiUrl);
    const events = await response.json();
    
    // Find matching event
    const event = events.find(e => 
      e.event_name && e.event_name.toLowerCase().includes(eventSlug.replace(/_/g, ' '))
    );
    
    if (event && event.last_modified) {
      return {
        found: true,
        lastModified: event.last_modified
      };
    }
    
    return { found: false };
    
  } catch (error) {
    console.error('[MONITOR] API check failed:', error);
    return { found: false };
  }
}

/**
 * METHOD 2: Check via text content hash (web scraping)
 * 
 * BUILD10.14.5: Strips all HTML markup, scripts, styles, and comments
 * before hashing. Only the visible TEXT content is hashed, which prevents
 * false positives from dynamic scripts, tracking codes, CDN variations,
 * and other non-content changes between fetches.
 */
async function checkViaHash(url) {
  try {
    // Basic fetch (may be blocked by chicago.gov)
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });
    
    if (response.status === 403) {
      return {
        method: 'Hash (blocked)',
        hash: null,
        error: '403 Forbidden - Bot protection active'
      };
    }
    
    const rawHtml = await response.text();
    const textContent = stripToTextContent(rawHtml);
    const hash = crypto.createHash('sha256').update(textContent).digest('hex');
    
    return {
      method: 'Text Content Hash',
      hash: hash
    };
    
  } catch (error) {
    return {
      method: 'Hash (error)',
      hash: null,
      error: error.message
    };
  }
}

/**
 * BUILD10.14.5: Strip HTML to text-only content for stable hashing
 * 
 * Removes all dynamic elements that cause false positives:
 * - <head> section (meta tags, link tags, dynamic references)
 * - <script> blocks (analytics, tracking, dynamic JS)
 * - <style> blocks (CSS that may vary by CDN edge)
 * - <noscript> blocks
 * - HTML comments (may contain build IDs, timestamps)
 * - All HTML tags (leaving only visible text)
 * - HTML entities
 * - Excess whitespace
 * 
 * Result: Only actual visible page text is hashed.
 * If the words on the page change, we detect it.
 * If scripts/markup/ads change, we don't.
 */
function stripToTextContent(html) {
  return html
    .replace(/<head[\s\S]*?<\/head>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&\w+;/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Send email alert via Netlify Forms
 */
async function sendChangeAlert(email, changedPages) {
  try {
    const formData = new URLSearchParams();
    formData.append('form-name', 'page-change-alerts');
    formData.append('email', email);
    formData.append('subject', `Page Change Alert - ${changedPages.length} page(s) updated`);
    
    const message = `
The following pages have been updated:

${changedPages.map(p => `
• ${p.url}
  Method: ${p.method}
  Last checked: ${p.lastChecked}
  View page: ${p.url}
`).join('\n')}

---
Grant Park Events Page Monitor
    `.trim();
    
    formData.append('message', message);
    
    await fetch(`${process.env.URL}/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString()
    });
    
    console.log('[MONITOR] Alert email sent to:', email);
    
  } catch (error) {
    console.error('[MONITOR] Error sending alert:', error);
  }
}

/**
 * BUILD10.13.14 - Save execution log
 * Maintains last 30 executions in chronological order
 */
async function saveExecutionLog(store, execution) {
  try {
    // Load existing log
    const logJson = await store.get('monitor-execution-log', { type: 'text' });
    let log = logJson ? JSON.parse(logJson) : { executions: [] };
    
    // Add new execution at the beginning (newest first)
    log.executions.unshift(execution);
    
    // Keep only last 30 executions
    if (log.executions.length > 30) {
      log.executions = log.executions.slice(0, 30);
    }
    
    // Save updated log
    await store.set('monitor-execution-log', JSON.stringify(log));
    
    console.log('[MONITOR] Execution logged:', {
      timestamp: execution.timestamp,
      urlsChecked: execution.urlsChecked,
      changesDetected: execution.changesDetected
    });
    
  } catch (error) {
    console.error('[MONITOR] Failed to save execution log:', error);
    // Don't throw - logging failure shouldn't break the monitor
  }
}
