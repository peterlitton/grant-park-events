// Scheduled Social Post — Daily cron at 12pm CT
// Posts upcoming events to FB + IG based on posting day schedule
// Imports shared logic from utils/social-utils.js

import {
  parseLocalDate, readEvents, readTracking, saveTracking,
  publishToFacebook, publishToInstagram
} from './utils/social-utils.js';

// Posting day mapping: event day (0=Sun) → days before event to post
const POSTING_OFFSETS = {
  0: 3,  // Sunday event → post Thursday
  1: 4,  // Monday event → post Thursday
  2: 5,  // Tuesday event → post Thursday
  3: 1,  // Wednesday event → post Tuesday
  4: 2,  // Thursday event → post Tuesday
  5: 2,  // Friday event → post Wednesday
  6: 3,  // Saturday event → post Wednesday
};

function getPostingDate(eventDateStr) {
  const eventDate = parseLocalDate(eventDateStr);
  if (!eventDate) return null;
  const offset = POSTING_OFFSETS[eventDate.getDay()];
  const postingDate = new Date(eventDate);
  postingDate.setDate(postingDate.getDate() - offset);
  return postingDate;
}

function isSameDay(d1, d2) {
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
}

export default async (req) => {
  console.log('[scheduled-post] Cron fired at', new Date().toISOString());

  try {
    const PAGE_ID = Netlify.env.get('META_PAGE_ID');
    const PAGE_TOKEN = Netlify.env.get('META_PAGE_ACCESS_TOKEN');
    const IG_USER_ID = Netlify.env.get('META_IG_USER_ID');

    if (!PAGE_ID || !PAGE_TOKEN) {
      console.log('[scheduled-post] ERROR: Missing META_PAGE_ID or META_PAGE_ACCESS_TOKEN');
      return;
    }

    const eventsData = await readEvents();
    if (!eventsData || !Array.isArray(eventsData)) {
      console.log('[scheduled-post] No events in store');
      return;
    }

    const posted = await readTracking();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Find events whose posting day is today
    const eligible = eventsData.filter(event => {
      if (event.published === false || !event.date) return false;
      if (posted[String(event.id)]) return false;
      const eventDate = parseLocalDate(event.date);
      if (!eventDate || eventDate < today) return false;
      const postingDate = getPostingDate(event.date);
      return postingDate && isSameDay(postingDate, today);
    });

    console.log(`[scheduled-post] ${eventsData.length} total, ${eligible.length} eligible today`);

    if (eligible.length === 0) {
      console.log('[scheduled-post] No events to post today');
      return;
    }

    for (const event of eligible) {
      console.log(`[scheduled-post] Publishing: ${event.title} (${event.date})`);
      const trackingEntry = { postedAt: new Date().toISOString() };

      // Facebook
      try {
        const fbResult = await publishToFacebook(event, PAGE_ID, PAGE_TOKEN);
        if (fbResult.success) {
          trackingEntry.fbPostId = fbResult.postId;
          trackingEntry.type = fbResult.imageUrl ? 'photo' : 'text';
          console.log(`[scheduled-post] FB posted: ${fbResult.postId}`);

          // Instagram
          if (IG_USER_ID && fbResult.imageUrl) {
            try {
              const igResult = await publishToInstagram(event, IG_USER_ID, PAGE_TOKEN);
              if (igResult.success) {
                trackingEntry.igPostId = igResult.igPostId;
                console.log(`[scheduled-post] IG posted: ${igResult.igPostId}`);
              } else {
                console.log(`[scheduled-post] IG FAILED:`, JSON.stringify(igResult.error));
              }
            } catch (igErr) {
              console.log(`[scheduled-post] IG ERROR: ${igErr.message}`);
            }
          }
        } else {
          console.log(`[scheduled-post] FB FAILED:`, JSON.stringify(fbResult.error));
        }
      } catch (err) {
        console.log(`[scheduled-post] ERROR: ${err.message}`);
      }

      posted[String(event.id)] = trackingEntry;
    }

    await saveTracking(posted);
    console.log(`[scheduled-post] Done. Posted ${eligible.length} events.`);

  } catch (err) {
    console.log(`[scheduled-post] FATAL: ${err.message}`);
  }
};

export const config = {
  schedule: "0 17 * * *"
};
