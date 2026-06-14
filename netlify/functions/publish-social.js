// Publish Social — Automated Facebook Page posting from GPE event data
// Uses verified Netlify Functions v2 pattern (from get-campaign-stats.js)
// Actions: preview (dry-run), publish (post to FB), publish-one (single event)

import { getStore } from "@netlify/blobs";

// Strip HTML tags and fragments from event content
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
  // Match site's getAbsoluteImageUrl logic exactly
  if (img.startsWith('http') || img.startsWith('data:')) return img;
  if (img.startsWith('/')) return 'https://www.grantparkevents.com' + img;
  // Bare filename — route to blob storage
  if (!img.includes('/')) return 'https://www.grantparkevents.com/.netlify/functions/images/' + img;
  return 'https://www.grantparkevents.com/' + img;
}

function generatePostText(event) {
  const date = formatDate(event.date);
  const location = event.venue || event.location || 'Grant Park';
  const time = event.time || '';
  const url = buildEventUrl(event);
  const hashtags = generateHashtags(event);

  const desc = stripHtml(event.description);
  const shortDesc = desc.length > 150 ? desc.substring(0, 147) + '...' : desc;

  const featuring = stripHtml(event.featuring);
  const featLine = featuring ? `🎤 Featuring: ${featuring.length > 100 ? featuring.substring(0, 97) + '...' : featuring}` : '';

  const lines = [
    `🎵 ${event.title}`,
    `📅 ${date}${time ? ` at ${time}` : ''}`,
    `📍 ${location}`,
    '',
    shortDesc,
  ];

  if (featLine) lines.push('', featLine);

  lines.push('', '🎟️ Free admission', url, '', hashtags);

  return lines.join('\n');
}

function getFutureEvents(events, days) {
  const now = new Date();
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() + days);

  return events
    .filter(event => {
      if (event.published === false) return false;
      if (!event.date) return false;
      const eventDate = parseLocalDate(event.date);
      if (!eventDate) return false;
      return eventDate >= now && eventDate <= cutoff;
    })
    .sort((a, b) => parseLocalDate(a.date) - parseLocalDate(b.date));
}

export default async (req, context) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache'
  };

  if (req.method === 'OPTIONS') {
    return new Response('', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'preview';
    const days = parseInt(url.searchParams.get('days')) || 14;
    const eventId = url.searchParams.get('id');

    // Read events from Blobs
    const store = getStore("events");
    const eventsData = await store.get("grantParkEvents", { type: "json" });

    if (!eventsData || !Array.isArray(eventsData)) {
      return new Response(JSON.stringify({ error: 'No events found in store' }), { headers: corsHeaders });
    }

    // Read tracking data (which events have been posted)
    const trackingStore = getStore("social-tracking");
    let posted = {};
    try {
      const trackingData = await trackingStore.get("posted-events", { type: "json" });
      if (trackingData) posted = trackingData;
    } catch (e) {
      posted = {};
    }

    if (action === 'preview') {
      // AC 2.1, 2.2, 2.8: Dry run — generate posts without publishing
      const futureEvents = getFutureEvents(eventsData, days);
      const posts = futureEvents.map(event => ({
        eventId: event.id,
        eventTitle: event.title,
        eventDate: event.date,
        alreadyPosted: !!posted[String(event.id)],
        imageUrl: buildImageUrl(event),
        postText: generatePostText(event),
        eventUrl: buildEventUrl(event)
      }));

      return new Response(JSON.stringify({
        action: 'preview',
        totalFutureEvents: futureEvents.length,
        alreadyPosted: posts.filter(p => p.alreadyPosted).length,
        newToPost: posts.filter(p => !p.alreadyPosted).length,
        posts
      }), { headers: corsHeaders });

    } else if (action === 'publish' || action === 'publish-one') {
      // AC 2.3, 2.5: Publish to Facebook
      const PAGE_ID = Netlify.env.get('META_PAGE_ID');
      const PAGE_TOKEN = Netlify.env.get('META_PAGE_ACCESS_TOKEN');

      if (!PAGE_ID || !PAGE_TOKEN) {
        return new Response(JSON.stringify({ error: 'Missing META_PAGE_ID or META_PAGE_ACCESS_TOKEN' }), {
          status: 500, headers: corsHeaders
        });
      }

      let eventsToPost;
      if (action === 'publish-one' && eventId) {
        const event = eventsData.find(e => String(e.id) === String(eventId));
        if (!event) {
          return new Response(JSON.stringify({ error: 'Event not found: ' + eventId }), {
            status: 404, headers: corsHeaders
          });
        }
        eventsToPost = [event];
      } else {
        eventsToPost = getFutureEvents(eventsData, days)
          .filter(e => !posted[String(e.id)]);
      }

      if (eventsToPost.length === 0) {
        return new Response(JSON.stringify({ action: 'publish', published: 0, message: 'No new events to post' }), {
          headers: corsHeaders
        });
      }

      const results = [];
      for (const event of eventsToPost) {
        const postText = generatePostText(event);
        const imageUrl = buildImageUrl(event);

        let resp, data;
        try {
          if (imageUrl) {
            // Photo post with caption
            resp = await fetch(`https://graph.facebook.com/v25.0/${PAGE_ID}/photos`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                url: imageUrl,
                caption: postText,
                access_token: PAGE_TOKEN
              })
            });
          } else {
            // Text-only post (no image)
            resp = await fetch(`https://graph.facebook.com/v25.0/${PAGE_ID}/feed`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                message: postText,
                access_token: PAGE_TOKEN
              })
            });
          }

          data = await resp.json();

          if (data.id || data.post_id) {
            // Track successful post
            posted[String(event.id)] = {
              postId: data.id || data.post_id,
              postedAt: new Date().toISOString(),
              type: imageUrl ? 'photo' : 'text'
            };
            results.push({ eventId: event.id, title: event.title, success: true, postId: data.id || data.post_id });
          } else {
            results.push({ eventId: event.id, title: event.title, success: false, error: data.error });
          }
        } catch (err) {
          results.push({ eventId: event.id, title: event.title, success: false, error: err.message });
        }
      }

      // Save updated tracking data
      await trackingStore.setJSON("posted-events", posted);

      return new Response(JSON.stringify({
        action: 'publish',
        published: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results
      }), { headers: corsHeaders });

    } else if (action === 'tracking') {
      // View tracking data
      return new Response(JSON.stringify({ posted }), { headers: corsHeaders });

    } else if (action === 'reset-tracking') {
      // Reset tracking — for testing only
      await trackingStore.setJSON("posted-events", {});
      return new Response(JSON.stringify({ message: 'Tracking reset' }), { headers: corsHeaders });
    }

    return new Response(JSON.stringify({ error: 'Use ?action=preview, publish, publish-one&id=X, tracking, or reset-tracking' }), {
      status: 400, headers: corsHeaders
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message, stack: err.stack }), {
      status: 500, headers: corsHeaders
    });
  }
};
