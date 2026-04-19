// VERIFICATION TOOL - Check Time Format Compliance
// Purpose: Verify all events use standard format after Build69 migration
// Safe: Read-only, reports only

import { getStore } from '@netlify/blobs';

export default async (req, context) => {
  try {
    const eventsStore = getStore('events');
    const eventsData = await eventsStore.get('grantParkEvents', { type: 'json' });
    const events = eventsData || [];

    // Standard format regex: H:MMam/pm or HH:MMam/pm (e.g., 7:00pm, 12:30am)
    const standardFormat = /^\d{1,2}:\d{2}(am|pm)$/;

    // Check each event
    const results = events.map(event => {
      const startValid = event.time ? standardFormat.test(event.time) : null;
      const endValid = event.endTime ? standardFormat.test(event.endTime) : null;

      return {
        id: event.id,
        title: event.title,
        startTime: event.time || 'MISSING',
        startValid: startValid === null ? 'N/A' : (startValid ? 'PASS' : 'FAIL'),
        endTime: event.endTime || 'none',
        endValid: endValid === null ? 'N/A' : (endValid ? 'PASS' : 'FAIL'),
        overall: (startValid !== false && endValid !== false) ? 'PASS' : 'FAIL'
      };
    });

    // Count results
    const summary = {
      totalEvents: events.length,
      allPass: results.filter(r => r.overall === 'PASS').length,
      anyFail: results.filter(r => r.overall === 'FAIL').length,
      missingTime: results.filter(r => r.startTime === 'MISSING').length,
      successRate: `${Math.round((results.filter(r => r.overall === 'PASS').length / events.length) * 100)}%`
    };

    // Failed events detail
    const failures = results.filter(r => r.overall === 'FAIL');

    // Format violations found
    const violations = {
      startTimeFormats: [...new Set(
        results
          .filter(r => r.startValid === 'FAIL')
          .map(r => r.startTime)
      )],
      endTimeFormats: [...new Set(
        results
          .filter(r => r.endValid === 'FAIL')
          .map(r => r.endTime)
      )]
    };

    return new Response(JSON.stringify({
      status: summary.anyFail === 0 ? 'SUCCESS' : 'FAILED',
      summary,
      failures,
      violations,
      allResults: results
    }, null, 2), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ 
      status: 'ERROR',
      error: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
