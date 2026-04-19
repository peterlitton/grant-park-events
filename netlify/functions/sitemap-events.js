// ================================================
// DYNAMIC SITEMAP GENERATOR FOR GRANT PARK EVENTS
// ================================================
// Auto-generates sitemap-events.xml from Netlify Blobs
// Filters for current, published events only
// Updates automatically when events change
// ================================================

import { getStore } from "@netlify/blobs";

export default async (req, context) => {
  try {
    // Get event data from Netlify Blobs (same store as get-events function)
    const store = getStore("events");
    const eventsDataStr = await store.get("grantParkEvents");
    
    if (!eventsDataStr) {
      console.log('No events data found in blob storage');
      return new Response(generateEmptySitemap(), {
        status: 200,
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
        }
      });
    }
    
    const eventsData = JSON.parse(eventsDataStr);
    
    if (!Array.isArray(eventsData)) {
      console.error('Events data is not an array');
      return new Response(generateEmptySitemap(), {
        status: 200,
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          'Cache-Control': 'public, max-age=3600'
        }
      });
    }
    
    // Filter for published, current events only
    const currentEvents = eventsData.filter(event => {
      // Must be published
      if (event.published === false) return false;
      
      // Must have a date
      if (!event.date) return false;
      
      // Check if event is still current (not past)
      const eventDate = parseLocalDate(event.date);
      if (!eventDate) return false;
      
      const now = new Date();
      
      let endDateTime;
      if (event.endTime) {
        const endHours = parseTime(event.endTime);
        endDateTime = new Date(eventDate);
        endDateTime.setHours(Math.floor(endHours), (endHours % 1) * 60, 0);
      } else {
        // No end time, assume 11:59 PM
        endDateTime = new Date(eventDate);
        endDateTime.setHours(23, 59, 59);
      }
      
      return now <= endDateTime;
    });
    
    // Generate sitemap XML
    const xml = generateSitemapXML(currentEvents);
    
    console.log(`Generated sitemap with ${currentEvents.length} events`);
    
    return new Response(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
      }
    });
    
  } catch (error) {
    console.error('Sitemap generation error:', error);
    return new Response(generateEmptySitemap(), {
      status: 500,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=300' // 5 minute cache on errors
      }
    });
  }
};

// ================================================
// HELPER FUNCTIONS (match index.html logic exactly)
// ================================================

// Parse date without timezone conversion (matches index.html)
function parseLocalDate(dateStr) {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d); // month is 0-indexed in JS
}

// Parse time to decimal hours (matches index.html)
// "6:30 PM" → 18.5, "7:00 AM" → 7.0
function parseTime(timeStr) {
  if (!timeStr) return 0;
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return 0;
  
  let hour = parseInt(match[1]);
  const minute = parseInt(match[2]);
  const period = match[3].toUpperCase();
  
  if (period === 'PM' && hour !== 12) hour += 12;
  if (period === 'AM' && hour === 12) hour = 0;
  
  return hour + (minute / 60);
}

// Generate URL slug (matches index.html exactly)
function generateSlug(title, id, date) {
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  // Date-first format: YYYY-MM-DD-slug-id
  if (date) {
    return `${date}-${slug}-${id}`;
  }
  return `${slug}-${id}`;
}

// Generate sitemap XML
function generateSitemapXML(events) {
  const baseUrl = 'https://www.grantparkevents.com';
  const today = new Date().toISOString().split('T')[0];
  
  const urls = events.map(event => {
    const slug = generateSlug(event.title, event.id, event.date);
    const url = `${baseUrl}/events/${slug}`;
    
    // Events change weekly (performer updates, description changes)
    // Priority 0.8 = important but not as high as homepage
    return `  <url>
    <loc>${escapeXml(url)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
  }).join('\n');
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

// Generate empty sitemap (fallback for errors)
function generateEmptySitemap() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`;
}

// Escape XML special characters
function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
