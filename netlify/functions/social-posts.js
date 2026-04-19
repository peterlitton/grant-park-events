// Social Post Generator - Generates ready-to-post social media content
// Build71 - Social Media Automation Suite

import { getStore } from "@netlify/blobs";

export default async (event, context) => {
  try {
    const params = event.queryStringParameters || {};
    const action = params.action || 'generate';
    
    const store = getStore("events");
    const eventsData = await store.get("grantParkEvents", { type: "json" });
    
    if (!eventsData || !Array.isArray(eventsData)) {
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "No events found", posts: [] })
      };
    }

    // Get future, published events
    const futureEvents = getFutureEvents(eventsData);

    switch (action) {
      case 'generate':
        // Generate posts for next 7 days
        const days = parseInt(params.days) || 7;
        const posts = generateWeeklyPosts(futureEvents, days);
        return jsonResponse(200, { posts, count: posts.length });
      
      case 'event':
        // Generate single event post
        const eventId = params.id;
        const event = eventsData.find(e => String(e.id) === String(eventId));
        if (!event) {
          return jsonResponse(404, { error: "Event not found" });
        }
        const post = generateEventPost(event);
        return jsonResponse(200, { post });
      
      case 'roundup':
        // Generate weekend roundup
        const roundup = generateWeekendRoundup(futureEvents);
        return jsonResponse(200, { post: roundup });
      
      case 'preview':
        // Generate week preview
        const preview = generateWeekPreview(futureEvents);
        return jsonResponse(200, { post: preview });
      
      default:
        return jsonResponse(400, { error: "Invalid action" });
    }

  } catch (error) {
    console.error("Social Post Generator Error:", error);
    return jsonResponse(500, { error: error.message });
  }
};

// Helper: JSON response
function jsonResponse(statusCode, data) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache"
    },
    body: JSON.stringify(data)
  };
}

// Helper: Get future published events
function getFutureEvents(events) {
  const now = new Date();
  
  return events
    .filter(event => {
      if (event.published === false) return false;
      if (!event.date) return false;
      
      const eventDate = parseLocalDate(event.date);
      if (!eventDate) return false;
      
      let endDateTime;
      if (event.endTime) {
        const endHours = parseTime(event.endTime);
        endDateTime = new Date(eventDate);
        endDateTime.setHours(Math.floor(endHours), (endHours % 1) * 60, 0);
      } else {
        endDateTime = new Date(eventDate);
        endDateTime.setHours(23, 59, 59);
      }
      
      return now <= endDateTime;
    })
    .sort((a, b) => {
      const dateA = parseLocalDate(a.date);
      const dateB = parseLocalDate(b.date);
      return dateA - dateB;
    });
}

// Parse local date
function parseLocalDate(dateStr) {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

// Parse time
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

// Generate slug
function generateSlug(title, id, date) {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${date}-${slug}-${id}`;
}

// Format date for display
function formatDate(dateStr) {
  const date = parseLocalDate(dateStr);
  if (!date) return '';
  
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December'];
  
  return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
}

// Short date format
function formatShortDate(dateStr) {
  const date = parseLocalDate(dateStr);
  if (!date) return '';
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  return `${months[date.getMonth()]} ${date.getDate()}`;
}

// Get event category/type for hashtags
function getEventType(event) {
  const title = (event.title || '').toLowerCase();
  
  if (title.includes('music') || title.includes('concert') || title.includes('symphony')) {
    return 'ClassicalMusic';
  }
  if (title.includes('jazz')) {
    return 'JazzMusic';
  }
  if (title.includes('blues')) {
    return 'BluesMusic';
  }
  if (title.includes('movie') || title.includes('film')) {
    return 'OutdoorMovies';
  }
  if (title.includes('firework')) {
    return 'Fireworks';
  }
  if (title.includes('festival')) {
    return 'ChicagoFestival';
  }
  if (title.includes('dance')) {
    return 'DancePerformance';
  }
  
  return 'ChicagoEvents';
}

// Generate hashtags for event
function generateHashtags(event, includeType = true) {
  const base = ['#GrantPark', '#ChicagoEvents', '#FreeEvents'];
  
  if (event.venue && event.venue.includes('Millennium')) {
    base.push('#MillenniumPark');
  }
  
  if (includeType) {
    base.push(`#${getEventType(event)}`);
  }
  
  base.push('#Chicago', '#DowntownChicago');
  
  return base.join(' ');
}

// TEMPLATE 1: Single Event Announcement
function generateEventPost(event) {
  const slug = generateSlug(event.title, event.id, event.date);
  const url = `https://www.grantparkevents.com/events/${slug}`;
  const date = formatDate(event.date);
  const location = event.venue || event.location || 'Grant Park';
  
  // Truncate description to ~100 characters
  const desc = event.description 
    ? (event.description.substring(0, 100) + (event.description.length > 100 ? '...' : ''))
    : '';
  
  const time = event.time || '';
  const hashtags = generateHashtags(event);
  
  const text = `🎵 ${event.title}
📅 ${date}${time ? ` at ${time}` : ''}
📍 ${location}

${desc}

FREE admission 🎟️
${url}

${hashtags}`;

  return {
    type: 'event_announcement',
    eventId: event.id,
    eventTitle: event.title,
    text,
    url,
    imageUrl: event.image || null,
    scheduledFor: event.date,
    platform: 'facebook,instagram',
    characterCount: text.length
  };
}

// TEMPLATE 2: Weekly Preview (7 days)
function generateWeeklyPosts(events, days = 7) {
  const now = new Date();
  const endDate = new Date(now);
  endDate.setDate(endDate.getDate() + days);
  
  const weekEvents = events.filter(event => {
    const eventDate = parseLocalDate(event.date);
    return eventDate && eventDate >= now && eventDate <= endDate;
  }).slice(0, 10); // Max 10 events
  
  return weekEvents.map(event => generateEventPost(event));
}

// TEMPLATE 3: Weekend Roundup
function generateWeekendRoundup(events) {
  const now = new Date();
  const dayOfWeek = now.getDay();
  
  // Find next Saturday and Sunday
  const daysUntilSaturday = (6 - dayOfWeek + 7) % 7;
  const saturday = new Date(now);
  saturday.setDate(saturday.getDate() + daysUntilSaturday);
  
  const sunday = new Date(saturday);
  sunday.setDate(sunday.getDate() + 1);
  
  // Get Saturday and Sunday events
  const weekendEvents = events.filter(event => {
    const eventDate = parseLocalDate(event.date);
    if (!eventDate) return false;
    
    return (
      eventDate.toDateString() === saturday.toDateString() ||
      eventDate.toDateString() === sunday.toDateString()
    );
  }).slice(0, 5);
  
  if (weekendEvents.length === 0) {
    return {
      type: 'weekend_roundup',
      text: 'No events scheduled this weekend. Check back soon!',
      events: []
    };
  }
  
  const eventList = weekendEvents.map((event, i) => {
    const day = formatShortDate(event.date);
    return `📅 ${day}: ${event.title}`;
  }).join('\n');
  
  const text = `✨ YOUR WEEKEND IN GRANT PARK ✨

This weekend's FREE events:

${eventList}

Full calendar → grantparkevents.com

#ChicagoEvents #GrantPark #FreeEvents #ChicagoWeekend`;

  return {
    type: 'weekend_roundup',
    text,
    events: weekendEvents.map(e => e.id),
    platform: 'facebook,instagram',
    characterCount: text.length
  };
}

// TEMPLATE 4: Week Preview
function generateWeekPreview(events) {
  const now = new Date();
  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);
  
  const weekEvents = events.filter(event => {
    const eventDate = parseLocalDate(event.date);
    return eventDate && eventDate >= now && eventDate <= nextWeek;
  }).slice(0, 5);
  
  if (weekEvents.length === 0) {
    return {
      type: 'week_preview',
      text: 'No events scheduled this week. Check back soon!',
      events: []
    };
  }
  
  const eventList = weekEvents.map(event => {
    const day = formatShortDate(event.date);
    return `📅 ${day}: ${event.title}`;
  }).join('\n');
  
  const text = `🌟 THIS WEEK IN GRANT PARK 🌟

Upcoming FREE events:

${eventList}

See full schedule → grantparkevents.com

#GrantPark #ChicagoEvents #FreeChicago`;

  return {
    type: 'week_preview',
    text,
    events: weekEvents.map(e => e.id),
    platform: 'facebook,instagram',
    characterCount: text.length
  };
}
