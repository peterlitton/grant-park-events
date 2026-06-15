// Scheduled Social Post — Daily cron at 12pm CT
// Posts upcoming events to FB + IG based on posting day schedule
// Spec: spec-social-scheduler.md

import { getStore } from "@netlify/blobs";

// Posting day mapping: event day (0=Sun) → posting day offset (days before event)
// Sunday→Thursday(3), Monday→Thursday(4), Tuesday→Thursday(5),
// Wednesday→Tuesday(1), Thursday→Tuesday(2), Friday→Wednesday(2), Saturday→Wednesday(3)
const POSTING_OFFSETS = {
  0: 3,  // Sunday event → post 3 days before (Thursday)
  1: 4,  // Monday event → post 4 days before (Thursday)
  2: 5,  // Tuesday event → post 5 days before (Thursday)
  3: 1,  // Wednesday event → post 1 day before (Tuesday)
  4: 2,  // Thursday event → post 2 days before (Tuesday)
  5: 2,  // Friday event → post 2 days before (Wednesday)
  6: 3,  // Saturday event → post 3 days before (Wednesday)
};

function stripHtml(html) {
  if (!html) return '';
  return html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<\/b>\s*<b>/gi, ', ')
    .replace(/<br\s*\/?>/gi, ', ')
    .replace(/<\/div>/gi, ', ')
    .replace(/<div>/gi, ', ')
    .replace(/<\/p>/gi, ', ')
    .replace(/<p[^>]*>/gi, ', ')
    .replace(/<\/li>/gi, ', ')
    .replace(/<li>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/,\s*,/g, ',')
    .replace(/,\s*,/g, ',')
    .replace(/,\s*$/g, '')
    .replace(/^\s*,\s*/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseLocalDate(dateStr) {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatDate(dateStr) {
  const date = parseLocalDate(dateStr);
  if (!date) return '';
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'];
  return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
}

function getEventType(event) {
  const title = (event.title || '').toLowerCase();
  if (title.includes('symphony') || title.includes('concert') || title.includes('orchestra')) return 'ClassicalMusic';
  if (title.includes('jazz')) return 'JazzMusic';
  if (title.includes('blues')) return 'BluesMusic';
  if (title.includes('movie') || title.includes('film')) return 'OutdoorMovies';
  if (title.includes('firework')) return 'Fireworks';
  if (title.includes('festival')) return 'ChicagoFestival';
  if (title.includes('dance')) return 'DancePerformance';
  if (title.includes('music series')) return 'LiveMusic';
  return 'ChicagoEvents';
}

function generateHashtags(event) {
  const tags = ['#GrantPark', '#ChicagoEvents', '#FreeEvents'];
  if (event.venue && event.venue.includes('Millennium')) tags.push('#MillenniumPark');
  tags.push(`#${getEventType(event)}`);
  tags.push('#Chicago', '#DowntownChicago');
  return tags.join(' ');
}

function buildEventUrl(event) {
  const slug = event.urlSlug || `${event.date}-${event.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}-${event.id}`;
  return `https://www.grantparkevents.com/events/${slug}?utm_source=facebook&utm_medium=social`;
}

function buildImageUrl(event) {
  const img = event.image;
  if (!img) return null;
  if (img.startsWith('http') || img.startsWith('data:')) return img;
  if (img.startsWith('/')) return 'https://www.grantparkevents.com' + img;
  if (!img.includes('/')) return 'https://www.grantparkevents.com/.netlify/functions/images/' + img;
  return 'https://www.grantparkevents.com/' + img;
}

function generateFBPostText(event) {
  const date = formatDate(event.date);
  const location = event.venue || event.location || 'Grant Park';
  const time = event.time || '';
  const url = buildEventUrl(event);
  const hashtags = generateHashtags(event);
  const desc = stripHtml(event.description);
  const shortDesc = desc.length > 150 ? desc.substring(0, 147) + '...' : desc;
  const featuring = stripHtml(event.featuring);
  const featLine = featuring ? `🎤 Featuring: ${featuring.length > 100 ? featuring.substring(0, 97) + '...' : featuring}` : '';

  const lines = [`🎵 ${event.title}`, `📅 ${date}${time ? ` at ${time}` : ''}`, `📍 ${location}`, '', shortDesc];
  if (featLine) lines.push('', featLine);
  lines.push('', '🎟️ Free admission', url, '', hashtags);
  return lines.join('\n');
}

function generateIGCaption(event) {
  const date = formatDate(event.date);
  const location = event.venue || event.location || 'Grant Park';
  const time = event.time || '';
  const hashtags = generateHashtags(event);
  const desc = stripHtml(event.description);
  const shortDesc = desc.length > 150 ? desc.substring(0, 147) + '...' : desc;
  const featuring = stripHtml(event.featuring);
  const featLine = featuring ? `🎤 Featuring: ${featuring.length > 100 ? featuring.substring(0, 97) + '...' : featuring}` : '';

  const lines = [`🎵 ${event.title}`, `📅 ${date}${time ? ` at ${time}` : ''}`, `📍 ${location}`, '', shortDesc];
  if (featLine) lines.push('', featLine);
  lines.push('', '🎟️ Free admission · Link in bio', '', hashtags);
  return lines.join('\n');
}

function getPostingDate(eventDateStr) {
  const eventDate = parseLocalDate(eventDateStr);
  if (!eventDate) return null;
  const eventDay = eventDate.getDay();
  const offset = POSTING_OFFSETS[eventDay];
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

    // Read events
    const store = getStore("events");
    const eventsData = await store.get("grantParkEvents", { type: "json" });
    if (!eventsData || !Array.isArray(eventsData)) {
      console.log('[scheduled-post] No events in store');
      return;
    }

    // Read tracking
    const trackingStore = getStore("social-tracking");
    let posted = {};
    try {
      const trackingData = await trackingStore.get("posted-events", { type: "json" });
      if (trackingData) posted = trackingData;
    } catch (e) {
      posted = {};
    }

    // Today in CT (approximate — use UTC date which is close enough for day matching)
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Find events whose posting day is today
    const eligible = eventsData.filter(event => {
      if (event.published === false) return false;
      if (!event.date) return false;
      if (posted[String(event.id)]) return false;

      const eventDate = parseLocalDate(event.date);
      if (!eventDate || eventDate < today) return false;

      const postingDate = getPostingDate(event.date);
      return postingDate && isSameDay(postingDate, today);
    });

    console.log(`[scheduled-post] ${eventsData.length} total events, ${eligible.length} eligible for posting today`);

    if (eligible.length === 0) {
      console.log('[scheduled-post] No events to post today');
      return;
    }

    // Publish each eligible event
    for (const event of eligible) {
      const fbText = generateFBPostText(event);
      const igCaption = generateIGCaption(event);
      const imageUrl = buildImageUrl(event);

      console.log(`[scheduled-post] Publishing: ${event.title} (${event.date})`);

      const trackingEntry = {
        postedAt: new Date().toISOString(),
        type: imageUrl ? 'photo' : 'text'
      };

      // Facebook post
      try {
        let fbResp, fbData;
        if (imageUrl) {
          fbResp = await fetch(`https://graph.facebook.com/v25.0/${PAGE_ID}/photos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: imageUrl, caption: fbText, access_token: PAGE_TOKEN })
          });
        } else {
          fbResp = await fetch(`https://graph.facebook.com/v25.0/${PAGE_ID}/feed`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: fbText, access_token: PAGE_TOKEN })
          });
        }
        fbData = await fbResp.json();

        if (fbData.id || fbData.post_id) {
          trackingEntry.fbPostId = fbData.id || fbData.post_id;
          console.log(`[scheduled-post] FB posted: ${trackingEntry.fbPostId}`);
        } else {
          console.log(`[scheduled-post] FB FAILED:`, JSON.stringify(fbData.error));
        }
      } catch (err) {
        console.log(`[scheduled-post] FB ERROR: ${err.message}`);
      }

      // Instagram post (only if image available and FB succeeded)
      if (IG_USER_ID && imageUrl && trackingEntry.fbPostId) {
        try {
          // Step 1: Create container
          const containerResp = await fetch(`https://graph.facebook.com/v25.0/${IG_USER_ID}/media`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image_url: imageUrl, caption: igCaption, access_token: PAGE_TOKEN })
          });
          const containerData = await containerResp.json();

          if (containerData.id) {
            // Wait for container to be ready
            let containerReady = false;
            for (let attempt = 0; attempt < 5; attempt++) {
              await new Promise(r => setTimeout(r, 2000));
              const statusResp = await fetch(`https://graph.facebook.com/v25.0/${containerData.id}?fields=status_code&access_token=${PAGE_TOKEN}`);
              const statusData = await statusResp.json();
              if (statusData.status_code === 'FINISHED') { containerReady = true; break; }
              if (statusData.status_code === 'ERROR') break;
            }

            if (containerReady) {
              // Step 2: Publish
              const publishResp = await fetch(`https://graph.facebook.com/v25.0/${IG_USER_ID}/media_publish`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ creation_id: containerData.id, access_token: PAGE_TOKEN })
              });
              const publishData = await publishResp.json();
              if (publishData.id) {
                trackingEntry.igPostId = publishData.id;
                console.log(`[scheduled-post] IG posted: ${trackingEntry.igPostId}`);
              } else {
                console.log(`[scheduled-post] IG publish FAILED:`, JSON.stringify(publishData.error));
              }
            } else {
              console.log(`[scheduled-post] IG container not ready after retries`);
            }
          } else {
            console.log(`[scheduled-post] IG container FAILED:`, JSON.stringify(containerData.error));
          }
        } catch (err) {
          console.log(`[scheduled-post] IG ERROR: ${err.message}`);
        }
      }

      // Save tracking
      posted[String(event.id)] = trackingEntry;
    }

    // Persist tracking
    await trackingStore.setJSON("posted-events", posted);
    console.log(`[scheduled-post] Done. Posted ${eligible.length} events.`);

  } catch (err) {
    console.log(`[scheduled-post] FATAL ERROR: ${err.message}`);
  }
};

export const config = {
  schedule: "0 17 * * *"
};
