// ============================================================
// Edge Function: SEO Meta Injection
// ============================================================
// Build10.14.10: Server-side canonical tag injection
// Build10.17:    Extended — event-specific meta tags, OG tags,
//                Event Schema JSON-LD, and noindex for past events
//
// PROBLEM (Build10.14.10): All routes serve the same index.html
//   with identical <title>, <meta description>, canonical, and
//   OG tags pointing to the homepage. Google crawls raw HTML
//   FIRST and sees duplicate pages.
//
// PROBLEM (Build10.17): 68 published event pages all serve
//   identical generic meta tags. Google reports "Duplicate
//   canonical" in Search Console. Client-side React injects
//   event-specific meta AFTER JS execution, but Google processes
//   raw HTML meta tags earlier and more reliably.
//
// SOLUTION: This Edge Function intercepts /events/* requests,
//   fetches event data from Blobs, and injects event-specific
//   <title>, <meta description>, canonical, OG tags, Twitter
//   cards, and Event Schema JSON-LD into the raw HTML BEFORE
//   delivery. Google sees unique, correct meta on first crawl.
//
// PROCESSING ORDER (Netlify):
//   1. Edge Functions run (this function)
//   2. Redirect rules evaluated (/events/* \u2192 /index.html 200)
//   3. Static content served (index.html)
//   context.next() chains through steps 2-3, returns response
// ============================================================

import { getStore } from "@netlify/blobs";

// \u2500\u2500 Helper Functions \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

// Parse YYYY-MM-DD without timezone shift (replicates client-side parseLocalDate)
function parseLocalDate(dateStr) {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d); // month is 0-indexed
}

// Format to "FRIDAY, June 10, 2026" (replicates client-side formatDateLong)
function formatDateLong(dateStr) {
  const d = parseLocalDate(dateStr);
  if (!d) return '';
  const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
                   'July', 'August', 'September', 'October', 'November', 'December'];
  return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

// Parse time string like "6:30 PM" \u2192 { hour: 18, minute: 30 }
// Fixes client-side bug where AM/PM was stripped and ignored
function parseTime(timeStr) {
  if (!timeStr) return { hour: 18, minute: 30 }; // default 6:30 PM
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return { hour: 18, minute: 30 };
  let hour = parseInt(match[1]);
  const minute = parseInt(match[2]);
  const period = match[3].toUpperCase();
  if (period === 'PM' && hour !== 12) hour += 12;
  if (period === 'AM' && hour === 12) hour = 0;
  return { hour, minute };
}

// Format to ISO8601 for Schema.org startDate/endDate
// Uses parseLocalDate to avoid timezone drift, then sets time
function formatISO8601(dateStr, timeStr) {
  const d = parseLocalDate(dateStr);
  if (!d) return '';
  const { hour, minute } = parseTime(timeStr);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

// Strip HTML tags and common artifacts from description
// Event descriptions contain <!--StartFragment-->, <i>, <b>, <div>, <em>,
// <font>, <span>, <br>, and various HTML entities from copy/paste
function stripHTML(html) {
  if (!html) return '';
  return html
    // Remove HTML comments (<!--StartFragment--> etc.)
    .replace(/<!--[\s\S]*?-->/g, '')
    // Remove all HTML tags
    .replace(/<[^>]*>/g, ' ')
    // Decode common HTML entities
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    // Collapse whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

// Build meta description (replicates client-side createMetaDescription)
// Skips "featuring" clause for empty, "Various", "Multiple, TBA", or "TBA" performers
function createMetaDescription(event) {
  let desc = event.title;
  const performer = (event.performer || '').trim();
  const skipPerformers = ['', 'various', 'multiple, tba', 'tba'];
  if (performer && !skipPerformers.includes(performer.toLowerCase())) {
    desc += ` featuring ${performer}`;
  }
  desc += ` on ${formatDateLong(event.date)}`;
  if (event.time) desc += ` at ${event.time}`;
  desc += ` at ${event.location}, Chicago.`;
  if (desc.length > 160) desc = desc.substring(0, 157) + '...';
  return desc;
}

// Resolve image path to absolute URL (replicates client-side getAbsoluteImageUrl)
// Handles all path patterns found in production Blob data:
//   - /.netlify/functions/images/filename.jpg (standard blob storage path)
//   - bare-filename.jpg (no slash — bare filename, routed to blob storage)
//   - http(s)://... (already absolute)
//   - empty string (fallback to logo)
// NOTE: assets/events/ paths should no longer exist after Build10.17 migration
//       but handled defensively just in case
const ORIGIN = 'https://www.grantparkevents.com';
const FALLBACK_IMAGE = `${ORIGIN}/assets/common/gpe-logo.png`;

function getAbsoluteImageUrl(imgPath) {
  if (!imgPath) return FALLBACK_IMAGE;
  // Already absolute URL
  if (imgPath.startsWith('http')) return imgPath;
  // Data URI — not valid for OG/Schema, use fallback
  if (imgPath.startsWith('data:')) return FALLBACK_IMAGE;
  // Defensive: assets/events/ legacy path (should be migrated by Build10.17)
  if (imgPath.startsWith('assets/events/')) {
    const filename = imgPath.replace('assets/events/', '');
    return `${ORIGIN}/.netlify/functions/images/${filename}`;
  }
  // Blob storage path
  if (imgPath.startsWith('/.netlify/functions/images/')) return `${ORIGIN}${imgPath}`;
  // Other absolute path
  if (imgPath.startsWith('/')) return `${ORIGIN}${imgPath}`;
  // Bare filename (no slash) — route to blob storage
  if (!imgPath.includes('/')) return `${ORIGIN}/.netlify/functions/images/${imgPath}`;
  // Anything else — prefix with origin
  return `${ORIGIN}/${imgPath}`;
}

// Extract event ID from URL path
// Slug format: YYYY-MM-DD-slug-text-id (ID is always the last segment after final dash)
function extractEventIdFromPath(path) {
  if (!path || !path.startsWith('/events/')) return null;
  const slug = path.split('/events/')[1];
  if (!slug) return null;
  const parts = slug.split('-');
  return parts[parts.length - 1];
}

// Build Event Schema JSON-LD (replicates client-side generateEventSchema)
function generateEventSchema(event, eventUrl, imageUrl) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": event.title,
    "startDate": formatISO8601(event.date, event.time),
    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
    "eventStatus": "https://schema.org/EventScheduled",
    "location": {
      "@type": "Place",
      "name": event.venue || event.location,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Grant Park",
        "addressLocality": "Chicago",
        "addressRegion": "IL",
        "addressCountry": "US"
      }
    },
    "image": imageUrl,
    "description": stripHTML(event.description) || event.title,
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock",
      "url": eventUrl
    }
  };

  // Optional endDate
  if (event.endTime) {
    schema.endDate = formatISO8601(event.date, event.endTime);
  }

  // Optional performer (skip empty/various)
  const performer = (event.performer || '').trim();
  const skipPerformers = ['', 'various', 'multiple, tba', 'tba'];
  if (performer && !skipPerformers.includes(performer.toLowerCase())) {
    schema.performer = {
      "@type": "PerformingGroup",
      "name": performer
    };
  }

  // Optional organizer
  if (event.organizerName && event.organizerUrl) {
    schema.organizer = {
      "@type": "Organization",
      "name": event.organizerName,
      "url": event.organizerUrl
    };
  }

  return schema;
}

// Escape special characters for safe HTML attribute insertion
function escapeAttr(str) {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// \u2500\u2500 Main Edge Function \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

export default async (request, context) => {
  const url = new URL(request.url);
  const path = url.pathname;

  // ── Build10.18: 410 Gone for dead URLs ─────────────────────────
  // Build10.32: Tightened slug regex to require legacy date suffix.
  //   Old regex /^[a-z]/i caught any path under /events/ starting with a letter,
  //   including relative paths like /events/event-photo.webp from inside event pages.
  //   New regex requires the legacy "...-YYYY-MM-DD-HH-MM" date pattern that
  //   all old-format event slugs ended with.
  // Old-format event URLs: /events/[letter]...-YYYY-MM-DD-HH-MM (e.g., chicago-jazz-festival-2025-08-28-11-00)
  // New-format event URLs: /events/[digit]... (e.g., 2026-07-08-taste-of-chicago-1769630609186)
  // All old-format events are expired (2024-2025). No new events use old format.
  // Legacy pages: /sign-up (now /signup), /about-us-contact (now /about)
  if (path.startsWith('/events/')) {
    const slug = path.split('/events/')[1];
    if (slug && /^[a-z][a-z0-9-]*-\d{4}-\d{2}-\d{2}-\d{2}-\d{2}/i.test(slug)) {
      return new Response('410 Gone — This event page has been removed.', {
        status: 410,
        headers: { 'Content-Type': 'text/plain' }
      });
    }
  }
  if (path === '/sign-up' || path === '/about-us-contact') {
    return new Response('410 Gone — This page has been removed.', {
      status: 410,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
  // ── End 410 block ──────────────────────────────────────────────

  // Get the original response (index.html via rewrite)
  const response = await context.next();

  // Only transform HTML responses
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html')) {
    return response;
  }

  let html = await response.text();

  // \u2500\u2500 Non-event pages: canonical + og:url fix only (Build10.14.10 behavior) \u2500\u2500
  if (!path.startsWith('/events/')) {
    const canonicalUrl = `${ORIGIN}${path}`;
    html = html
      .replace(
        '<link rel="canonical" href="https://www.grantparkevents.com/">',
        `<link rel="canonical" href="${canonicalUrl}">`
      )
      .replace(
        '<meta property="og:url" content="https://www.grantparkevents.com/">',
        `<meta property="og:url" content="${canonicalUrl}">`
      );
    return new Response(html, { status: response.status, headers: response.headers });
  }

  // \u2500\u2500 Event pages: full meta injection \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

  try {
    // Extract event ID from URL
    const eventId = extractEventIdFromPath(path);
    if (!eventId) {
      // Malformed URL — return with basic canonical fix
      return applyCanonicalFix(html, path, response);
    }

    // Fetch events from Blobs
    const store = getStore('events');
    const eventsData = await store.get('grantParkEvents', { type: 'json' });
    if (!eventsData || !Array.isArray(eventsData)) {
      return applyCanonicalFix(html, path, response);
    }

    // Find matching event (compare as strings to handle numeric vs timestamp IDs)
    const event = eventsData.find(e =>
      String(e.id) === String(eventId) && e.published !== false
    );
    if (!event) {
      // Event not found or unpublished — return generic HTML with canonical fix
      return applyCanonicalFix(html, path, response);
    }

    // Build event-specific values
    const canonicalUrl = `${ORIGIN}${path}`;
    const eventTitle = `${event.title} - ${formatDateLong(event.date)} | Grant Park Events`;
    const metaDescription = createMetaDescription(event);
    const imageUrl = getAbsoluteImageUrl(event.image);
    const schemaJson = JSON.stringify(generateEventSchema(event, canonicalUrl, imageUrl));

    // Safe attribute versions
    const safeTitle = escapeAttr(eventTitle);
    const safeOgTitle = escapeAttr(event.title);
    const safeDesc = escapeAttr(metaDescription);
    const safeCanonical = escapeAttr(canonicalUrl);
    const safeImage = escapeAttr(imageUrl);

    // \u2500\u2500 String replacements in HTML \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
    // Replace generic homepage values with event-specific values

    // <title>
    html = html.replace(
      '<title>Grant Park Events 2026: Concerts, Movies, Dance and more</title>',
      `<title>${safeTitle}</title>`
    );

    // <meta name="description">
    html = html.replace(
      /<meta name="description" content="[^"]*">/,
      `<meta name="description" content="${safeDesc}">`
    );

    // <link rel="canonical">
    html = html.replace(
      '<link rel="canonical" href="https://www.grantparkevents.com/">',
      `<link rel="canonical" href="${safeCanonical}">`
    );

    // <meta property="og:title">
    html = html.replace(
      /<meta property="og:title" content="[^"]*">/,
      `<meta property="og:title" content="${safeOgTitle}">`
    );

    // <meta property="og:description">
    html = html.replace(
      /<meta property="og:description" content="[^"]*">/,
      `<meta property="og:description" content="${safeDesc}">`
    );

    // <meta property="og:url">
    html = html.replace(
      '<meta property="og:url" content="https://www.grantparkevents.com/">',
      `<meta property="og:url" content="${safeCanonical}">`
    );

    // <meta property="og:image">
    html = html.replace(
      /<meta property="og:image" content="[^"]*">/,
      `<meta property="og:image" content="${safeImage}">`
    );

    // Twitter Card tags
    html = html.replace(
      /<meta name="twitter:title" content="[^"]*">/,
      `<meta name="twitter:title" content="${safeOgTitle}">`
    );
    html = html.replace(
      /<meta name="twitter:description" content="[^"]*">/,
      `<meta name="twitter:description" content="${safeDesc}">`
    );
    html = html.replace(
      /<meta name="twitter:image" content="[^"]*">/,
      `<meta name="twitter:image" content="${safeImage}">`
    );

    // \u2500\u2500 Noindex for past events (7+ days old) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
    const eventDate = parseLocalDate(event.date);
    const today = new Date();
    const daysPast = Math.floor((today - eventDate) / (1000 * 60 * 60 * 24));
    if (daysPast > 7) {
      // Replace the default robots meta with noindex
      html = html.replace(
        '<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">',
        '<meta name="robots" content="noindex, follow">'
      );
    }

    // \u2500\u2500 Inject Event Schema JSON-LD before </head> \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
    // Insert AFTER the existing WebSite schema, before </head>
    const schemaTag = `\
  <script type="application/ld+json">${schemaJson}</script>`;
    html = html.replace('</head>', `${schemaTag}\
</head>`);

    return new Response(html, { status: response.status, headers: response.headers });

  } catch (err) {
    // Any error: return original HTML with basic canonical fix
    // This ensures the edge function never breaks the site
    console.error('[seo-canonical] Error:', err.message);
    return applyCanonicalFix(html, path, response);
  }
};

// Fallback: just fix canonical + og:url (Build10.14.10 behavior)
function applyCanonicalFix(html, path, response) {
  const canonicalUrl = `${ORIGIN}${path}`;
  const updatedHtml = html
    .replace(
      '<link rel="canonical" href="https://www.grantparkevents.com/">',
      `<link rel="canonical" href="${canonicalUrl}">`
    )
    .replace(
      '<meta property="og:url" content="https://www.grantparkevents.com/">',
      `<meta property="og:url" content="${canonicalUrl}">`
    );
  return new Response(updatedHtml, { status: response.status, headers: response.headers });
}

// Declare which paths this Edge Function handles
export const config = {
  path: ["/events/*", "/about", "/signup", "/sign-up", "/about-us-contact"],
  onError: "bypass"
};
