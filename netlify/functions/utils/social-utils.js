// Social Media Utilities — shared code for publish-social.js and scheduled-post.js
// Located in netlify/functions/utils/ to avoid being treated as a standalone function

import { getStore } from "@netlify/blobs";

export function stripHtml(html) {
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

export function parseLocalDate(dateStr) {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function formatDate(dateStr) {
  const date = parseLocalDate(dateStr);
  if (!date) return '';
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'];
  return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
}

export function getEventType(event) {
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

export function generateHashtags(event) {
  const tags = ['#GrantPark', '#ChicagoEvents', '#FreeEvents'];
  if (event.venue && event.venue.includes('Millennium')) tags.push('#MillenniumPark');
  tags.push(`#${getEventType(event)}`);
  tags.push('#Chicago', '#DowntownChicago');
  return tags.join(' ');
}

export function buildEventUrl(event) {
  const slug = event.urlSlug || `${event.date}-${event.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}-${event.id}`;
  return `https://www.grantparkevents.com/events/${slug}?utm_source=facebook&utm_medium=social`;
}

export function buildImageUrl(event) {
  const img = event.image;
  if (!img) return null;
  if (img.startsWith('http') || img.startsWith('data:')) return img;
  if (img.startsWith('/')) return 'https://www.grantparkevents.com' + img;
  if (!img.includes('/')) return 'https://www.grantparkevents.com/.netlify/functions/images/' + img;
  return 'https://www.grantparkevents.com/' + img;
}

export function generateFBPostText(event) {
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

export function generateIGCaption(event) {
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

export function getFutureEvents(events, days) {
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

export async function readEvents() {
  const store = getStore("events");
  return await store.get("grantParkEvents", { type: "json" });
}

export async function readTracking() {
  const trackingStore = getStore("social-tracking");
  try {
    const data = await trackingStore.get("posted-events", { type: "json" });
    return data || {};
  } catch (e) {
    return {};
  }
}

export async function saveTracking(posted) {
  const trackingStore = getStore("social-tracking");
  await trackingStore.setJSON("posted-events", posted);
}

export async function publishToFacebook(event, PAGE_ID, PAGE_TOKEN) {
  const postText = generateFBPostText(event);
  const imageUrl = buildImageUrl(event);

  let resp;
  if (imageUrl) {
    resp = await fetch(`https://graph.facebook.com/v25.0/${PAGE_ID}/photos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: imageUrl, caption: postText, access_token: PAGE_TOKEN })
    });
  } else {
    resp = await fetch(`https://graph.facebook.com/v25.0/${PAGE_ID}/feed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: postText, access_token: PAGE_TOKEN })
    });
  }

  const data = await resp.json();
  return { success: !!(data.id || data.post_id), postId: data.id || data.post_id, error: data.error, imageUrl };
}

export async function publishToInstagram(event, IG_USER_ID, PAGE_TOKEN) {
  const imageUrl = buildImageUrl(event);
  if (!imageUrl) return { success: false, error: 'No image — Instagram requires an image' };

  const caption = generateIGCaption(event);

  // Step 1: Create container
  const containerResp = await fetch(`https://graph.facebook.com/v25.0/${IG_USER_ID}/media`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image_url: imageUrl, caption, access_token: PAGE_TOKEN })
  });
  const containerData = await containerResp.json();

  if (!containerData.id) return { success: false, error: containerData.error };

  // Wait for container to be ready
  let containerReady = false;
  for (let attempt = 0; attempt < 5; attempt++) {
    await new Promise(r => setTimeout(r, 2000));
    const statusResp = await fetch(`https://graph.facebook.com/v25.0/${containerData.id}?fields=status_code&access_token=${PAGE_TOKEN}`);
    const statusData = await statusResp.json();
    if (statusData.status_code === 'FINISHED') { containerReady = true; break; }
    if (statusData.status_code === 'ERROR') break;
  }

  if (!containerReady) return { success: false, error: 'Container not ready after retries' };

  // Step 2: Publish
  const publishResp = await fetch(`https://graph.facebook.com/v25.0/${IG_USER_ID}/media_publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ creation_id: containerData.id, access_token: PAGE_TOKEN })
  });
  const publishData = await publishResp.json();

  if (publishData.id) return { success: true, igPostId: publishData.id };
  return { success: false, error: publishData.error };
}
