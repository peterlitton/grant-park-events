/**
 * BUILD10.13.14 - GET MONITOR EXECUTION LOG
 * 
 * Retrieves chronological execution history for page monitoring
 * Returns last 30 executions showing:
 * - Timestamp of each run
 * - URLs checked and their results
 * - Changes detected
 * - Email sent status
 * - Execution duration
 * 
 * GET /.netlify/functions/get-monitor-execution-log
 */

import { getStore } from '@netlify/blobs';

export default async (req, context) => {
  try {
    const store = getStore('production');
    const logJson = await store.get('monitor-execution-log', { type: 'text' });

    if (!logJson) {
      // No executions yet
      return new Response(JSON.stringify({
        success: true,
        executions: []
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    const log = JSON.parse(logJson);

    return new Response(JSON.stringify({
      success: true,
      executions: log.executions || []
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('[MONITOR-LOG] Error loading execution log:', error);
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
