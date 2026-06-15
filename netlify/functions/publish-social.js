// Publish Social — HTTP function for manual social media operations
// Actions: preview, publish, publish-one, tracking, reset-tracking, verify, token-info
// Imports shared logic from utils/social-utils.js

import {
  getFutureEvents, readEvents, readTracking, saveTracking,
  buildImageUrl, buildEventUrl, generateFBPostText,
  publishToFacebook, publishToInstagram
} from './utils/social-utils.js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Content-Type': 'application/json',
  'Cache-Control': 'no-cache'
};

export default async (req, context) => {
  if (req.method === 'OPTIONS') {
    return new Response('', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'preview';
    const days = parseInt(url.searchParams.get('days')) || 14;
    const eventId = url.searchParams.get('id');

    // Verify and token-info don't need event data
    if (action === 'verify') {
      const PAGE_ID = Netlify.env.get('META_PAGE_ID');
      const PAGE_TOKEN = Netlify.env.get('META_PAGE_ACCESS_TOKEN');
      if (!PAGE_ID || !PAGE_TOKEN) {
        return new Response(JSON.stringify({ error: 'Missing env vars', hasPageId: !!PAGE_ID, hasToken: !!PAGE_TOKEN }), { status: 500, headers: corsHeaders });
      }
      const resp = await fetch('https://graph.facebook.com/v25.0/' + PAGE_ID + '?fields=name,id,fan_count,instagram_business_account&access_token=' + PAGE_TOKEN);
      return new Response(JSON.stringify(await resp.json()), { headers: corsHeaders });
    }

    if (action === 'token-info') {
      const PAGE_TOKEN = Netlify.env.get('META_PAGE_ACCESS_TOKEN');
      if (!PAGE_TOKEN) return new Response(JSON.stringify({ error: 'No token' }), { status: 500, headers: corsHeaders });
      const resp = await fetch('https://graph.facebook.com/v25.0/debug_token?input_token=' + PAGE_TOKEN + '&access_token=' + PAGE_TOKEN);
      return new Response(JSON.stringify(await resp.json()), { headers: corsHeaders });
    }

    // Read events and tracking
    const eventsData = await readEvents();
    if (!eventsData || !Array.isArray(eventsData)) {
      return new Response(JSON.stringify({ error: 'No events found in store' }), { headers: corsHeaders });
    }
    const posted = await readTracking();

    if (action === 'preview') {
      const futureEvents = getFutureEvents(eventsData, days);
      const posts = futureEvents.map(event => ({
        eventId: event.id,
        eventTitle: event.title,
        eventDate: event.date,
        alreadyPosted: !!posted[String(event.id)],
        imageUrl: buildImageUrl(event),
        postText: generateFBPostText(event),
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
      const PAGE_ID = Netlify.env.get('META_PAGE_ID');
      const PAGE_TOKEN = Netlify.env.get('META_PAGE_ACCESS_TOKEN');
      const IG_USER_ID = Netlify.env.get('META_IG_USER_ID');

      if (!PAGE_ID || !PAGE_TOKEN) {
        return new Response(JSON.stringify({ error: 'Missing META_PAGE_ID or META_PAGE_ACCESS_TOKEN' }), { status: 500, headers: corsHeaders });
      }

      let eventsToPost;
      if (action === 'publish-one' && eventId) {
        const event = eventsData.find(e => String(e.id) === String(eventId));
        if (!event) {
          return new Response(JSON.stringify({ error: 'Event not found: ' + eventId }), { status: 404, headers: corsHeaders });
        }
        eventsToPost = [event];
      } else {
        eventsToPost = getFutureEvents(eventsData, days).filter(e => !posted[String(e.id)]);
      }

      if (eventsToPost.length === 0) {
        return new Response(JSON.stringify({ action: 'publish', published: 0, message: 'No new events to post' }), { headers: corsHeaders });
      }

      const results = [];
      for (const event of eventsToPost) {
        const trackingEntry = { postedAt: new Date().toISOString() };

        // Facebook
        try {
          const fbResult = await publishToFacebook(event, PAGE_ID, PAGE_TOKEN);
          if (fbResult.success) {
            trackingEntry.fbPostId = fbResult.postId;
            trackingEntry.type = fbResult.imageUrl ? 'photo' : 'text';
          }
          
          // Instagram (only if FB succeeded and image available)
          let igResult = null;
          if (IG_USER_ID && fbResult.success && fbResult.imageUrl) {
            try {
              igResult = await publishToInstagram(event, IG_USER_ID, PAGE_TOKEN);
              if (igResult.success) trackingEntry.igPostId = igResult.igPostId;
            } catch (igErr) {
              igResult = { success: false, error: igErr.message };
            }
          }

          posted[String(event.id)] = trackingEntry;
          results.push({ eventId: event.id, title: event.title, success: fbResult.success, fbPostId: fbResult.postId, instagram: igResult, error: fbResult.error });
        } catch (err) {
          results.push({ eventId: event.id, title: event.title, success: false, error: err.message });
        }
      }

      await saveTracking(posted);

      return new Response(JSON.stringify({
        action: 'publish',
        published: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results
      }), { headers: corsHeaders });

    } else if (action === 'tracking') {
      return new Response(JSON.stringify({ posted }), { headers: corsHeaders });

    } else if (action === 'reset-tracking') {
      await saveTracking({});
      return new Response(JSON.stringify({ message: 'Tracking reset' }), { headers: corsHeaders });

    } else if (action === 'delete') {
      const PAGE_TOKEN = Netlify.env.get('META_PAGE_ACCESS_TOKEN');
      const postId = url.searchParams.get('post_id');
      if (!postId || !PAGE_TOKEN) {
        return new Response(JSON.stringify({ error: 'post_id and token required' }), { status: 400, headers: corsHeaders });
      }
      const resp = await fetch('https://graph.facebook.com/v25.0/' + postId + '?access_token=' + PAGE_TOKEN, { method: 'DELETE' });
      return new Response(JSON.stringify(await resp.json()), { headers: corsHeaders });
    }

    return new Response(JSON.stringify({ error: 'Use ?action=preview, publish, publish-one&id=X, tracking, reset-tracking, verify, token-info, or delete&post_id=X' }), { status: 400, headers: corsHeaders });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message, stack: err.stack }), { status: 500, headers: corsHeaders });
  }
};
