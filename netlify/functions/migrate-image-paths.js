// ============================================================
// Serverless Function: Migrate Image Paths (One-Time)
// ============================================================
// Build10.17: Fixes legacy "assets/events/" image paths in Blob data
//
// PROBLEM: 21 events still have image paths like "assets/events/filename.jpg"
//   from the original seed data. The client-side getAbsoluteImageUrl() silently
//   converts these to "/.netlify/functions/images/filename.jpg" at runtime,
//   but the underlying Blob data is stale.
//
// SOLUTION: This one-time function reads all events from Blobs, updates any
//   "assets/events/" paths to "/.netlify/functions/images/", and saves back.
//
// USAGE: Call /.netlify/functions/migrate-image-paths in browser
//   - Safe to run multiple times (idempotent)
//   - Reports count of changed vs unchanged events
//   - Does NOT modify any field other than "image"
// ============================================================

import { getStore } from "@netlify/blobs";

export default async (req, context) => {
  // CORS headers
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*"
  };

  try {
    const store = getStore("events");
    const eventsData = await store.get("grantParkEvents", { type: "json" });

    if (!eventsData || !Array.isArray(eventsData)) {
      return new Response(JSON.stringify({
        success: false,
        error: "No events found in Blob storage"
      }), { status: 404, headers });
    }

    let changed = 0;
    let unchanged = 0;
    const changes = [];

    const updatedEvents = eventsData.map(event => {
      if (event.image && event.image.startsWith('assets/events/')) {
        const filename = event.image.replace('assets/events/', '');
        const newPath = `/.netlify/functions/images/${filename}`;
        changes.push({
          id: event.id,
          title: event.title,
          oldPath: event.image,
          newPath: newPath
        });
        changed++;
        return { ...event, image: newPath };
      }
      unchanged++;
      return event;
    });

    if (changed > 0) {
      // Save updated events back to Blobs
      await store.set("grantParkEvents", JSON.stringify(updatedEvents));
    }

    return new Response(JSON.stringify({
      success: true,
      summary: {
        total: eventsData.length,
        changed: changed,
        unchanged: unchanged
      },
      changes: changes,
      message: changed > 0
        ? `Migration complete: ${changed} image paths updated`
        : "No migration needed: all paths already correct"
    }, null, 2), { status: 200, headers });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), { status: 500, headers });
  }
};
