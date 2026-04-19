// BACKUP VERIFICATION - Compare before/after migration
// Purpose: Verify data integrity after migration
// Safe: Read-only comparison

import { getStore } from '@netlify/blobs';

export default async (req, context) => {
  try {
    const eventsStore = getStore('events');
    
    // Get current production data
    const currentData = await eventsStore.get('grantParkEvents', { type: 'json' });
    
    // Get backup data (if exists)
    const backupData = await eventsStore.get('grantParkEvents-backup-pre-build69', { type: 'json' });

    if (!backupData) {
      return new Response(JSON.stringify({
        status: 'NO_BACKUP',
        message: 'No backup found. Run this after Build69 creates backup.',
        currentEventCount: currentData ? currentData.length : 0
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const current = currentData || [];
    const backup = backupData || [];

    // Compare counts
    const comparison = {
      backup: {
        totalEvents: backup.length,
        eventIds: backup.map(e => e.id).sort((a,b) => a-b)
      },
      current: {
        totalEvents: current.length,
        eventIds: current.map(e => e.id).sort((a,b) => a-b)
      },
      integrity: {
        sameCount: backup.length === current.length,
        sameIds: JSON.stringify(backup.map(e => e.id).sort()) === JSON.stringify(current.map(e => e.id).sort()),
        missingEvents: backup.filter(b => !current.some(c => c.id === b.id)).map(e => ({ id: e.id, title: e.title })),
        newEvents: current.filter(c => !backup.some(b => b.id === c.id)).map(e => ({ id: e.id, title: e.title }))
      },
      timeChanges: []
    };

    // Check time format changes
    backup.forEach(backupEvent => {
      const currentEvent = current.find(e => e.id === backupEvent.id);
      if (currentEvent) {
        if (backupEvent.time !== currentEvent.time || backupEvent.endTime !== currentEvent.endTime) {
          comparison.timeChanges.push({
            id: backupEvent.id,
            title: backupEvent.title,
            before: {
              time: backupEvent.time,
              endTime: backupEvent.endTime || 'none'
            },
            after: {
              time: currentEvent.time,
              endTime: currentEvent.endTime || 'none'
            }
          });
        }
      }
    });

    comparison.summary = {
      dataIntegrityOK: comparison.integrity.sameCount && comparison.integrity.sameIds,
      eventsModified: comparison.timeChanges.length,
      eventsUnchanged: current.length - comparison.timeChanges.length
    };

    return new Response(JSON.stringify(comparison, null, 2), {
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
