// BUILD69 - ONE-TIME MIGRATION
// Normalize all existing event times to standard format: 7:00pm
// SAFE: Creates backup before modifying

import { getStore } from '@netlify/blobs';

// Normalize time to standard format
const normalizeTime = (timeStr) => {
  if (!timeStr) return '';
  
  let normalized = timeStr.replace(/\s/g, '').replace(/\./g, '');
  normalized = normalized.toLowerCase();
  
  const timeRegex = /^(\d{1,2}):?(\d{2})?(am|pm)$/i;
  const match = normalized.match(timeRegex);
  
  if (!match) {
    throw new Error(`Invalid time format: "${timeStr}"`);
  }
  
  let [_, hour, minutes, period] = match;
  hour = parseInt(hour);
  
  if (hour < 1 || hour > 12) {
    throw new Error(`Invalid hour: ${hour}`);
  }
  
  if (!minutes) minutes = '00';
  const min = parseInt(minutes);
  
  if (min < 0 || min > 59) {
    throw new Error(`Invalid minutes: ${min}`);
  }
  
  return `${hour}:${minutes}${period.toLowerCase()}`;
};

export default async (req, context) => {
  try {
    const eventsStore = getStore('events');
    
    // Get current events
    const eventsData = await eventsStore.get('grantParkEvents', { type: 'json' });
    if (!eventsData || eventsData.length === 0) {
      return new Response(JSON.stringify({
        status: 'NO_DATA',
        message: 'No events found to migrate'
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('📦 Backing up', eventsData.length, 'events...');
    
    // BACKUP: Save current data before migration
    await eventsStore.set('grantParkEvents-backup-pre-build69', JSON.stringify(eventsData));
    
    console.log('✅ Backup created');
    console.log('🔄 Starting migration...');
    
    // Migrate events
    const migrated = eventsData.map(event => {
      const original = { time: event.time, endTime: event.endTime };
      
      try {
        if (event.time) {
          event.time = normalizeTime(event.time);
        }
        if (event.endTime) {
          event.endTime = normalizeTime(event.endTime);
        }
        
        return {
          ...event,
          _migration: {
            original,
            success: true
          }
        };
      } catch (error) {
        console.error(`Error migrating event ${event.id}:`, error.message);
        return {
          ...event,
          _migration: {
            original,
            success: false,
            error: error.message
          }
        };
      }
    });

    // Check for failures
    const failures = migrated.filter(e => e._migration && !e._migration.success);
    
    if (failures.length > 0) {
      return new Response(JSON.stringify({
        status: 'PARTIAL_FAILURE',
        message: `${failures.length} events failed migration`,
        failures: failures.map(e => ({
          id: e.id,
          title: e.title,
          error: e._migration.error,
          original: e._migration.original
        })),
        totalEvents: eventsData.length
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Remove migration metadata before saving
    const cleanedEvents = migrated.map(e => {
      const { _migration, ...event } = e;
      return event;
    });

    // Save migrated events
    await eventsStore.set('grantParkEvents', JSON.stringify(cleanedEvents));
    
    console.log('✅ Migration complete!');
    
    // Return success report
    const changes = migrated.filter(e => {
      const m = e._migration;
      return m.original.time !== e.time || m.original.endTime !== e.endTime;
    });

    return new Response(JSON.stringify({
      status: 'SUCCESS',
      summary: {
        totalEvents: eventsData.length,
        eventsModified: changes.length,
        eventsUnchanged: eventsData.length - changes.length,
        backupCreated: true
      },
      changes: changes.map(e => ({
        id: e.id,
        title: e.title,
        before: e._migration.original,
        after: {
          time: e.time,
          endTime: e.endTime
        }
      }))
    }, null, 2), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      status: 'ERROR',
      error: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
