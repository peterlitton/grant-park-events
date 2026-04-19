// DIAGNOSTIC ONLY - Zero Risk, Read-Only
// Purpose: See what events exist in production Netlify Blobs

import { getStore } from '@netlify/blobs';

export default async (req, context) => {
  try {
    const eventsStore = getStore('events'); // FIXED: was 'gpe-events'

    // READ ONLY - no modifications
    const eventsData = await eventsStore.get('grantParkEvents', { type: 'json' }); // FIXED: was 'events'
    const events = eventsData || [];

    // Analyze what we have
    const hardcodedIds = [51, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
    
    const report = {
      totalEvents: events.length,
      eventIds: events.map(e => e.id).sort((a,b) => a-b),
      sampleEvents: events.slice(0, 5).map(e => ({
        id: e.id,
        title: e.title,
        time: e.time,
        endTime: e.endTime
      })),
      timeFormats: {
        startTimes: [...new Set(events.map(e => e.time).filter(Boolean))],
        endTimes: [...new Set(events.map(e => e.endTime).filter(Boolean))]
      },
      hardcodedEventStatus: {
        expectedIds: hardcodedIds,
        foundInProduction: hardcodedIds.filter(id => events.some(e => e.id === id)),
        missingFromProduction: hardcodedIds.filter(id => !events.some(e => e.id === id))
      }
    };

    return new Response(JSON.stringify(report, null, 2), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
