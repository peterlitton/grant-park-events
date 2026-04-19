// RSS Feed Generator for Social Media Automation
// Generates RSS 2.0 feed of upcoming Grant Park events
// Build71 - Social Media Automation Suite
// Build10.14.10.1 - Fixed response format (v1→v2: new Response() instead of {statusCode,body})

import { getStore } from "@netlify/blobs";

export default async (req, context) => {
  try {
    const store = getStore("events");
    const eventsData = await store.get("grantParkEvents", { type: "json" });
    
    if (!eventsData || !Array.isArray(eventsData)) {
      return new Response(generateEmptyFeed(), {
        status: 200,
        headers: {
          "Content-Type": "application/xml; charset=utf-8",
          "Cache-Control": "public, max-age=3600"
        }
      });
    }

    // Filter for published, future events only
    const now = new Date();
    const futureEvents = eventsData
      .filter(event => {
        if (event.published === false) return false;
        if (!event.date) return false;
        
        const eventDate = parseLocalDate(event.date);
        if (!eventDate) return false;
        
        // Calculate event end time
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
      })
      .sort((a, b) => {
        const dateA = parseLocalDate(a.date);
        const dateB = parseLocalDate(b.date);
        return dateA - dateB;
      })
      .slice(0, 50); // Limit to 50 most recent events

    const rss = generateRSSFeed(futureEvents);

    return new Response(rss, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600"
      }
    });

  } catch (error) {
    console.error("RSS Feed Error:", error);
    
    return new Response(generateEmptyFeed(), {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=300"
      }
    });
  }
};

// Helper: Parse local date without timezone conversion
function parseLocalDate(dateStr) {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

// Helper: Parse time string to decimal hours
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

// Helper: Generate event URL slug
function generateSlug(title, id, date) {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${date}-${slug}-${id}`;
}

// Helper: Format date to RFC 822 (RSS standard)
function formatRFC822(dateStr, timeStr) {
  const date = parseLocalDate(dateStr);
  if (!date) return new Date().toUTCString();
  
  if (timeStr) {
    const hours = parseTime(timeStr);
    date.setHours(Math.floor(hours), (hours % 1) * 60, 0);
  } else {
    date.setHours(18, 30, 0); // Default 6:30 PM
  }
  
  return date.toUTCString();
}

// Helper: Escape XML special characters
function escapeXML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Helper: Generate empty RSS feed
function generateEmptyFeed() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>Grant Park Events - Chicago 2026</title>
    <link>https://www.grantparkevents.com</link>
    <description>Free events in Grant Park and Millennium Park, Chicago</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="https://www.grantparkevents.com/.netlify/functions/rss-feed" rel="self" type="application/rss+xml"/>
  </channel>
</rss>`;
}

// Main: Generate RSS feed
function generateRSSFeed(events) {
  const items = events.map(event => {
    const slug = generateSlug(event.title, event.id, event.date);
    const url = `https://www.grantparkevents.com/events/${slug}`;
    const pubDate = formatRFC822(event.date, event.time);
    
    // Build description with formatting
    let description = escapeXML(event.description || event.title);
    
    // Add event details
    const details = [];
    if (event.time) details.push(`Time: ${escapeXML(event.time)}`);
    if (event.endTime) details.push(`Ends: ${escapeXML(event.endTime)}`);
    if (event.location || event.venue) details.push(`Location: ${escapeXML(event.location || event.venue)}`);
    if (event.organizerName) details.push(`Organizer: ${escapeXML(event.organizerName)}`);
    
    if (details.length > 0) {
      description += `\n\n${details.join(' | ')}`;
    }
    
    // Add link
    description += `\n\nDetails: ${url}`;
    
    // Image enclosure (for rich social media previews)
    let enclosure = '';
    if (event.image) {
      const imageUrl = event.image.startsWith('http') 
        ? event.image 
        : `https://www.grantparkevents.com/${event.image}`;
      enclosure = `<enclosure url="${escapeXML(imageUrl)}" type="image/jpeg"/>
      <media:content url="${escapeXML(imageUrl)}" type="image/jpeg" medium="image"/>`;
    }
    
    return `    <item>
      <title>${escapeXML(event.title)}</title>
      <link>${url}</link>
      <description><![CDATA[${description}]]></description>
      <pubDate>${pubDate}</pubDate>
      <guid isPermaLink="true">${url}</guid>
      ${enclosure}
      <category>Chicago Events</category>
      ${event.venue ? `<category>${escapeXML(event.venue)}</category>` : ''}
    </item>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>Grant Park Events - Chicago 2026</title>
    <link>https://www.grantparkevents.com</link>
    <description>Your complete guide to free events in Grant Park and Millennium Park, Chicago. Concerts, movies, dance performances, festivals and more.</description>
    <language>en-us</language>
    <copyright>© 2026 GrantParkEvents.com</copyright>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <ttl>60</ttl>
    <atom:link href="https://www.grantparkevents.com/.netlify/functions/rss-feed" rel="self" type="application/rss+xml"/>
    <image>
      <url>https://www.grantparkevents.com/assets/common/gpe-logo.png</url>
      <title>Grant Park Events</title>
      <link>https://www.grantparkevents.com</link>
    </image>
${items}
  </channel>
</rss>`;
}
