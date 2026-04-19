// ============================================================
// Serverless Function: Validate SEO Meta Tags
// ============================================================
// Build10.17: Post-deploy validation for edge function SEO injection
//
// Called by the admin panel "Validate SEO" button.
// Fetches a sample of live event pages and checks that the
// edge function correctly injected event-specific meta tags.
//
// CHECKS PER EVENT URL:
//   1. <title> contains event name (not generic homepage title)
//   2. <meta name="description"> is event-specific
//   3. <link rel="canonical"> is self-referencing
//   4. <meta property="og:title"> contains event name
//   5. <meta property="og:image"> is not the generic logo (if event has image)
//   6. Event Schema JSON-LD present (@type: Event)
//   7. Past events have noindex meta
//
// USAGE: GET /.netlify/functions/validate-seo
//   Returns JSON with pass/fail per check per event
// ============================================================

import { getStore } from "@netlify/blobs";

const ORIGIN = 'https://www.grantparkevents.com';
const GENERIC_TITLE = 'Grant Park Events 2026: Concerts, Movies, Dance and more';

// Generate slug (replicates client-side generateSlug)
function generateSlug(title, id, date) {
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (date) return `${date}-${slug}-${id}`;
  return `${slug}-${id}`;
}

// Parse YYYY-MM-DD
function parseLocalDate(dateStr) {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export default async (req, context) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*"
  };

  try {
    // Get all events
    const store = getStore("events");
    const eventsData = await store.get("grantParkEvents", { type: "json" });

    if (!eventsData || !Array.isArray(eventsData)) {
      return new Response(JSON.stringify({
        success: false,
        error: "No events found in Blob storage"
      }), { status: 404, headers });
    }

    // Filter to published events only
    const published = eventsData.filter(e => e.published !== false);

    // Sample strategy: pick up to 8 representative events
    // - First 2 published events (test basic injection)
    // - 1 event with empty performer (test performer skip)
    // - 1 event with bare filename image (test image resolution)
    // - 1 event with /.netlify/ image path
    // - 1 past event if any (test noindex)
    // - 2 random from remainder
    const sample = [];
    const today = new Date();

    // First 2
    if (published[0]) sample.push(published[0]);
    if (published[1]) sample.push(published[1]);

    // Empty performer
    const emptyPerformer = published.find(e =>
      !sample.includes(e) && (!e.performer || e.performer.trim() === '')
    );
    if (emptyPerformer) sample.push(emptyPerformer);

    // Bare filename image
    const bareImage = published.find(e =>
      !sample.includes(e) && e.image && !e.image.includes('/')
    );
    if (bareImage) sample.push(bareImage);

    // /.netlify/ path image
    const netlifyImage = published.find(e =>
      !sample.includes(e) && e.image && e.image.startsWith('/.netlify/')
    );
    if (netlifyImage) sample.push(netlifyImage);

    // Past event (7+ days)
    const pastEvent = published.find(e => {
      if (sample.includes(e)) return false;
      const d = parseLocalDate(e.date);
      if (!d) return false;
      return Math.floor((today - d) / (1000 * 60 * 60 * 24)) > 7;
    });
    if (pastEvent) sample.push(pastEvent);

    // Fill remaining with random picks up to 8 total
    const remaining = published.filter(e => !sample.includes(e));
    while (sample.length < 8 && remaining.length > 0) {
      const idx = Math.floor(Math.random() * remaining.length);
      sample.push(remaining.splice(idx, 1)[0]);
    }

    // Validate each sample event
    const results = [];
    for (const event of sample) {
      const slug = generateSlug(event.title, event.id, event.date);
      const eventUrl = `${ORIGIN}/events/${slug}`;
      const checks = {};
      let fetchError = null;

      try {
        // Build10.18: Cache-bust to ensure validator tests current edge function output,
        // not stale CDN cache from a previous build
        const resp = await fetch(eventUrl + '?_validate=' + Date.now(), {
          headers: { 'User-Agent': 'GPE-SEO-Validator/1.0' }
        });
        const html = await resp.text();

        // Check 1: Title contains event name
        const titleMatch = html.match(/<title>([^<]*)<\/title>/);
        const pageTitle = titleMatch ? titleMatch[1] : '';
        checks.title = {
          pass: pageTitle.includes(event.title) && pageTitle !== GENERIC_TITLE,
          found: pageTitle.substring(0, 80)
        };

        // Check 2: Meta description is event-specific
        const descMatch = html.match(/<meta name="description" content="([^"]*)"/);
        const metaDesc = descMatch ? descMatch[1] : '';
        checks.metaDescription = {
          pass: metaDesc.includes(event.title),
          found: metaDesc.substring(0, 80)
        };

        // Check 3: Canonical is self-referencing
        const canonMatch = html.match(/<link rel="canonical" href="([^"]*)"/);
        const canonical = canonMatch ? canonMatch[1] : '';
        checks.canonical = {
          pass: canonical === eventUrl,
          found: canonical
        };

        // Check 4: OG title contains event name
        const ogTitleMatch = html.match(/<meta property="og:title" content="([^"]*)"/);
        const ogTitle = ogTitleMatch ? ogTitleMatch[1] : '';
        checks.ogTitle = {
          pass: ogTitle.includes(event.title),
          found: ogTitle.substring(0, 80)
        };

        // Check 5: OG image is event-specific (if event has image)
        const ogImageMatch = html.match(/<meta property="og:image" content="([^"]*)"/);
        const ogImage = ogImageMatch ? ogImageMatch[1] : '';
        if (event.image) {
          checks.ogImage = {
            pass: ogImage !== `${ORIGIN}/assets/common/gpe-logo.png` || !event.image,
            found: ogImage.substring(0, 80)
          };
        } else {
          checks.ogImage = {
            pass: true,
            found: ogImage.substring(0, 80),
            note: 'Event has no image — fallback expected'
          };
        }

        // Check 6: Event Schema present
        const schemaPresent = html.includes('"@type":"Event"') || html.includes('"@type": "Event"');
        checks.eventSchema = {
          pass: schemaPresent,
          found: schemaPresent ? 'Present' : 'Missing'
        };

        // Check 7: Past event noindex (only test if event is 7+ days old)
        const eventDate = parseLocalDate(event.date);
        const daysPast = eventDate ? Math.floor((today - eventDate) / (1000 * 60 * 60 * 24)) : 0;
        if (daysPast > 7) {
          const hasNoindex = html.includes('<meta name="robots" content="noindex, follow">');
          checks.noindex = {
            pass: hasNoindex,
            found: hasNoindex ? 'noindex present' : 'noindex MISSING',
            daysPast: daysPast
          };
        }

        // Check 8: No assets/events references
        const hasLegacyPath = html.includes('assets/events/');
        checks.noLegacyPaths = {
          pass: !hasLegacyPath,
          found: hasLegacyPath ? 'Legacy assets/events/ found!' : 'Clean'
        };

      } catch (err) {
        fetchError = err.message;
      }

      // Count passes/fails
      const checkEntries = Object.entries(checks);
      const passCount = checkEntries.filter(([, v]) => v.pass).length;
      const failCount = checkEntries.filter(([, v]) => !v.pass).length;

      results.push({
        event: {
          id: event.id,
          title: event.title,
          date: event.date,
          hasImage: !!event.image,
          hasPerformer: !!event.performer
        },
        url: eventUrl,
        fetchError: fetchError,
        checks: checks,
        summary: fetchError ? 'FETCH_ERROR' : (failCount === 0 ? 'ALL_PASS' : `${failCount} FAIL`),
        passCount: passCount,
        failCount: failCount
      });
    }

    // Overall summary
    const allPass = results.every(r => r.summary === 'ALL_PASS');
    const totalChecks = results.reduce((sum, r) => sum + r.passCount + r.failCount, 0);
    const totalPass = results.reduce((sum, r) => sum + r.passCount, 0);

    // Also check for legacy paths in Blob data
    const legacyPathEvents = eventsData.filter(e =>
      e.image && e.image.startsWith('assets/events/')
    );

    return new Response(JSON.stringify({
      success: true,
      timestamp: new Date().toISOString(),
      overall: {
        status: allPass && legacyPathEvents.length === 0 ? 'ALL_PASS' : 'HAS_FAILURES',
        eventsChecked: results.length,
        totalPublished: published.length,
        totalChecks: totalChecks,
        totalPass: totalPass,
        legacyImagePaths: legacyPathEvents.length
      },
      results: results,
      legacyPathEvents: legacyPathEvents.length > 0
        ? legacyPathEvents.map(e => ({ id: e.id, title: e.title, image: e.image }))
        : []
    }, null, 2), { status: 200, headers });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), { status: 500, headers });
  }
};
