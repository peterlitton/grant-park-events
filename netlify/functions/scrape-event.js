// Netlify Function: scrape-event.js
// Purpose: Fetch and parse event information from external URLs
// Used by: Admin panel "Fetch Content from Website" feature

import { parse } from 'node-html-parser';

export default async (req, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return new Response('', { status: 200, headers });
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers
    });
  }

  try {
    const { url } = await req.json();
    
    if (!url) {
      return new Response(JSON.stringify({ error: 'URL is required' }), {
        status: 400,
        headers
      });
    }

    console.log('Scraping URL:', url);

    // Fetch the webpage
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const root = parse(html);

    // Initialize result object
    const result = {
      title: '',
      performer: '',
      date: '',
      time: '',
      location: '',
      venue: '',
      description: '',
      image: '',
      organizerName: '',
      organizerUrl: url
    };

    // Extract data based on common patterns and metadata

    // 1. Try Open Graph tags first (most reliable)
    const ogTitle = root.querySelector('meta[property="og:title"]');
    const ogDescription = root.querySelector('meta[property="og:description"]');
    const ogImage = root.querySelector('meta[property="og:image"]');
    
    if (ogTitle) result.title = ogTitle.getAttribute('content');
    if (ogDescription) result.description = ogDescription.getAttribute('content');
    if (ogImage) result.image = ogImage.getAttribute('content');

    // 2. Try Schema.org structured data
    const schemaScripts = root.querySelectorAll('script[type="application/ld+json"]');
    for (const script of schemaScripts) {
      try {
        const data = JSON.parse(script.text);
        if (data['@type'] === 'Event' || data['@type'] === 'MusicEvent') {
          if (data.name) result.title = data.name;
          if (data.description) result.description = data.description;
          if (data.image) result.image = typeof data.image === 'string' ? data.image : data.image.url;
          if (data.performer) {
            result.performer = typeof data.performer === 'string' 
              ? data.performer 
              : data.performer.name;
          }
          if (data.startDate) {
            const eventDate = new Date(data.startDate);
            result.date = eventDate.toISOString().split('T')[0]; // YYYY-MM-DD
            
            // Extract time if available
            const timeMatch = data.startDate.match(/T(\d{2}):(\d{2})/);
            if (timeMatch) {
              let hours = parseInt(timeMatch[1]);
              const minutes = timeMatch[2];
              const ampm = hours >= 12 ? 'PM' : 'AM';
              if (hours > 12) hours -= 12;
              if (hours === 0) hours = 12;
              result.time = `${hours}:${minutes} ${ampm}`;
            }
          }
          if (data.location) {
            if (typeof data.location === 'string') {
              result.venue = data.location;
            } else {
              result.venue = data.location.name || '';
              result.location = data.location.address?.addressLocality || '';
            }
          }
        }
      } catch (e) {
        console.log('Schema parsing error:', e.message);
      }
    }

    // 3. Fallback: Try common HTML elements if we don't have data yet
    if (!result.title) {
      const h1 = root.querySelector('h1');
      if (h1) result.title = h1.text.trim();
    }

    // 4. Try meta description if no OG description
    if (!result.description) {
      const metaDesc = root.querySelector('meta[name="description"]');
      if (metaDesc) result.description = metaDesc.getAttribute('content');
    }

    // 5. Extract venue/location from common patterns
    if (!result.venue) {
      const venueEl = root.querySelector('.venue, .location, [itemprop="location"]');
      if (venueEl) result.venue = venueEl.text.trim();
    }

    // 6. Try to find date if not in schema
    if (!result.date) {
      const timeEl = root.querySelector('time[datetime]');
      if (timeEl) {
        const datetime = timeEl.getAttribute('datetime');
        if (datetime) {
          const eventDate = new Date(datetime);
          if (!isNaN(eventDate.getTime())) {
            result.date = eventDate.toISOString().split('T')[0];
          }
        }
      }
    }

    // 7. Extract site name for organizer
    const siteName = root.querySelector('meta[property="og:site_name"]');
    if (siteName) {
      result.organizerName = siteName.getAttribute('content');
    } else {
      try {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname.replace('www.', '');
        result.organizerName = hostname.split('.')[0];
      } catch (e) {
        console.log('URL parsing error:', e.message);
      }
    }

    // Clean up the data
    Object.keys(result).forEach(key => {
      if (typeof result[key] === 'string') {
        result[key] = result[key].trim();
      }
    });

    // Make image URL absolute if it's relative
    if (result.image && !result.image.startsWith('http')) {
      try {
        const urlObj = new URL(url);
        const baseUrl = `${urlObj.protocol}//${urlObj.host}`;
        result.image = new URL(result.image, baseUrl).href;
      } catch (e) {
        console.log('Image URL error:', e.message);
      }
    }

    console.log('Scrape result:', result);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers
    });

  } catch (error) {
    console.error('Scraping error:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Failed to scrape URL',
      message: error.message 
    }), {
      status: 500,
      headers
    });
  }
};
