# DATA STORAGE MAP
## Complete Reference for Grant Park Events Data Architecture

**Version:** 1.0  
**Last Updated:** February 8, 2026  
**Created By:** Claude (Sonnet 4.5) - Build10.13.11  
**Purpose:** Single source of truth for where/how all data is stored

---

## 🎯 WHY THIS DOCUMENT EXISTS

**For Future LLMs and Developers:**
When you need to add, modify, or debug data storage, check here FIRST. This document maps every data type to its storage location, functions, and access patterns. Following these established patterns ensures consistency and maintainability.

**Core Principle:** All persistent data uses Netlify Blobs (except external APIs). All Blobs access goes through Netlify Functions.

---

## 📦 NETLIFY BLOBS STORAGE

**What:** Server-side key-value storage provided by Netlify  
**Why:** Persistent, fast, integrated with Netlify Functions  
**Access:** Only via Netlify Functions (never directly from client)

### **Storage Pattern:**
```javascript
// In Netlify Function:
const { getStore } = require('@netlify/blobs');
const store = getStore('production'); // Always use 'production' store

// GET
const data = await store.get('key-name', { type: 'json' }); // or 'text'

// SET
await store.set('key-name', data);

// DELETE
await store.delete('key-name');
```

---

## 🗺️ DATA STORAGE MAP

### **1. EVENTS**
**What:** All Grant Park events (current and upcoming)  
**Storage:** Netlify Blobs  
**Key:** `events`  
**Format:** JSON array of event objects  

**Functions:**
- **GET:** `netlify/functions/get-events.js`
- **SAVE:** `netlify/functions/save-events.js`

**Access Pattern:**
```javascript
// Frontend (index.html or admin.html):
const response = await fetch('/.netlify/functions/get-events');
const events = await response.json();

// Save:
await fetch('/.netlify/functions/save-events', {
  method: 'POST',
  body: JSON.stringify(events)
});
```

**Data Structure:**
```javascript
[
  {
    id: 123,
    title: "Event Name",
    date: "2026-07-15",
    time: "7:00 PM",
    location: "Millennium Park",
    description: "Event description...",
    image: "/assets/events/image.jpg",
    published: true,
    // ... other fields
  }
]
```

**Created:** Original architecture  
**Updated:** Build10.13.11 (no changes, documented for reference)

---

### **2. EMAIL CAMPAIGNS**
**What:** MailerLite email campaign tracking data  
**Storage:** Netlify Blobs  
**Key:** `campaigns`  
**Format:** JSON array of campaign objects  

**Functions:**
- **GET:** `netlify/functions/get-campaigns.js`
- **SAVE:** `netlify/functions/save-campaigns.js`

**Access Pattern:**
```javascript
// Frontend (admin.html only):
const response = await fetch('/.netlify/functions/get-campaigns');
const campaigns = await response.json();

// Save:
await fetch('/.netlify/functions/save-campaigns', {
  method: 'POST',
  body: JSON.stringify(campaigns)
});
```

**Data Structure:**
```javascript
[
  {
    id: "campaign-123",
    name: "Weekly Update - July 15",
    status: "SENT",
    created: "2026-07-08T10:00:00Z",
    // ... campaign metadata
  }
]
```

**Created:** Build7 (MailerLite integration)  
**Updated:** Build10.13.11 (no changes, documented for reference)

---

### **3. IMAGES**
**What:** Event images uploaded via admin panel  
**Storage:** Netlify Blobs  
**Key Pattern:** `images/[filename]` (individual keys per image)  
**Format:** Binary image data  

**Functions:**
- **LIST:** `netlify/functions/list-images.js`
- **UPLOAD:** `netlify/functions/images.js` (handles upload)
- **DELETE:** `netlify/functions/delete-image.js`

**Access Pattern:**
```javascript
// List all images:
const response = await fetch('/.netlify/functions/list-images');
const { images } = await response.json();

// Upload (multipart form data):
const formData = new FormData();
formData.append('image', file);
await fetch('/.netlify/functions/images', {
  method: 'POST',
  body: formData
});

// Delete:
await fetch('/.netlify/functions/delete-image', {
  method: 'POST',
  body: JSON.stringify({ filename: 'image.jpg' })
});
```

**Data Structure:**
```javascript
// List response:
{
  success: true,
  images: [
    {
      filename: "event-123.jpg",
      url: "/assets/events/event-123.jpg",
      size: 45678,
      uploaded: "2026-07-01T10:00:00Z"
    }
  ]
}
```

**Created:** Build2.3.1-1 (Image Manager feature)  
**Updated:** Build10.13.11 (no changes, documented for reference)

---

### **4. ABOUT PAGE CONTENT**
**What:** Text content displayed on /about page  
**Storage:** Netlify Blobs  
**Key:** `about-content`  
**Format:** Plain text string (with `\n` for newlines)  

**Functions:**
- **GET:** `netlify/functions/get-about-content.js`
- **SAVE:** `netlify/functions/save-about-content.js`

**Access Pattern:**
```javascript
// Frontend (index.html):
const response = await fetch('/.netlify/functions/get-about-content');
const { content } = await response.json();
setAboutContent(content);

// Admin (admin.html):
await fetch('/.netlify/functions/save-about-content', {
  method: 'POST',
  body: JSON.stringify({ content: text })
});
```

**Data Structure:**
```javascript
// GET response:
{
  success: true,
  content: "What is GrantParkEvents.com?\n\nWHO:\n...",
  source: "netlify-blobs",
  timestamp: "2026-02-08T10:00:00Z"
}

// SAVE request:
{
  content: "Updated text content..."
}
```

**Default Content:** If Blobs key doesn't exist, `get-about-content.js` auto-populates with default text (see function for full text).

**Fallback:** index.html has hard-coded default content as fallback if backend fetch fails.

**Created:** Build10.13.11  
**See:** `docs/BUILDS/BUILD10.13.11-RELEASE-NOTES.md` for full implementation details

---

## 🌐 EXTERNAL API INTEGRATIONS

### **1. MAILERLITE API**
**What:** Email subscriber management and stats  
**Storage:** External (MailerLite servers)  
**Access:** Via MailerLite API key (stored in Netlify environment variables)  

**Functions:**
- **SUBSCRIBE:** `netlify/functions/subscribe-mailerlite.js`
- **GET STATS:** `netlify/functions/get-subscriber-stats.js`
- **TEST CONNECTION:** `netlify/functions/test-mailerlite.js`

**Access Pattern:**
```javascript
// Subscribe a user:
await fetch('/.netlify/functions/subscribe-mailerlite', {
  method: 'POST',
  body: JSON.stringify({ email: 'user@example.com' })
});

// Get stats (admin only):
const response = await fetch('/.netlify/functions/get-subscriber-stats');
const stats = await response.json();
```

**Environment Variables Required:**
- `MAILERLITE_API_KEY`
- `MAILERLITE_GROUP_ID`

**Created:** Build7  
**Updated:** Build10.13.11 (no changes)

---

### **2. GOOGLE SEARCH CONSOLE API**
**What:** Index status and indexing requests for SEO  
**Storage:** External (Google servers)  
**Access:** Via Google Cloud service account credentials  

**Functions:**
- **CHECK STATUS:** `netlify/functions/gsc-index-status.js`
- **REQUEST INDEX:** `netlify/functions/gsc-request-index.js`
- **BATCH REQUEST:** `netlify/functions/gsc-midnight-batch.js`
- **DEBUG:** `netlify/functions/gsc-index-status-debug.js`

**Access Pattern:**
```javascript
// Check index status:
const response = await fetch('/.netlify/functions/gsc-index-status');
const { indexed, pending } = await response.json();

// Request indexing:
await fetch('/.netlify/functions/gsc-request-index', {
  method: 'POST',
  body: JSON.stringify({ url: 'https://grantparkevents.com/event/123' })
});
```

**Environment Variables Required:**
- Google Cloud credentials stored in Netlify environment variables: GSC_PROJECT_ID, GSC_PRIVATE_KEY_ID, GSC_PRIVATE_KEY, GSC_CLIENT_EMAIL (Build10.31: removed JSON file from build package)

**Created:** Build7/8 (Google Search Console integration)  
**Updated:** Build10.13.11 (no changes)

---

## 🔒 BROWSER STORAGE (DEPRECATED FOR NEW FEATURES)

### **localStorage**
**Status:** ⚠️ ONLY use for UI preferences, NOT for data persistence  

**Current Usage:**
- Admin panel temporary state (not persistent across sessions)
- Previous About content storage (deprecated in Build10.13.11)

**Do NOT use localStorage for:**
- Any data that needs to sync across browsers
- Any data that should persist in production
- Any data that admins need to see on public site

**Why:** localStorage is browser-specific and not accessible from backend or other browsers.

---

## 📋 ADDING NEW DATA STORAGE

**When you need to store new data, follow this checklist:**

### **Step 1: Choose Storage Location**
- ✅ **Netlify Blobs** for all site data (events, content, config)
- ✅ **External API** only if data must live elsewhere (subscribers, analytics)
- ❌ **localStorage** NEVER for persistent data (UI preferences only)

### **Step 2: Follow Established Pattern**
1. Create `get-[name].js` function in `netlify/functions/`
2. Create `save-[name].js` function in `netlify/functions/`
3. Use `getStore('production')` to access Blobs
4. Add error handling + email alerts (see `send-error-alert.js`)
5. Update this document with new storage entry

### **Step 3: Use Consistent Keys**
- Format: `[entity-name]` for single items (e.g., `about-content`)
- Format: `[entity-name]s` for collections (e.g., `events`, `campaigns`)
- Format: `[category]/[id]` for individual files (e.g., `images/photo.jpg`)

### **Step 4: Document Everything**
- Add entry to this file (DATA-STORAGE-MAP.md)
- Document in release notes
- Add code comments in functions explaining storage

---

## 🛠️ DEBUGGING STORAGE ISSUES

### **Data Not Saving**
1. Check Netlify function logs in dashboard
2. Verify `getStore('production')` is used (not 'staging' or other)
3. Check network tab for function response
4. Look for error alerts sent to peter@peterlitton.com

### **Data Not Loading**
1. Check browser console for fetch errors
2. Verify function returns correct format: `{ success: true, [data] }`
3. Test function directly: `/.netlify/functions/[name]`
4. Check if default/fallback content is showing

### **Cross-Browser Issues**
- If data shows in one browser but not another → likely localStorage (migrate to Blobs)
- If data shows in admin but not public site → check function permissions

---

## 📊 STORAGE SIZE LIMITS

**Netlify Blobs:**
- Free tier: 1 GB total storage
- Per-blob limit: None specified (reasonable sizes recommended)
- Current usage: ~500 KB (events + campaigns + images + about)

**Best Practices:**
- Keep event images under 500 KB each (compress before upload)
- Keep JSON arrays reasonable (< 1000 events max)
- Archive old data periodically

---

## 🔄 MIGRATION NOTES

### **From localStorage → Netlify Blobs**
**Example:** About content migration (Build10.13.11)

**Steps:**
1. Create Netlify Functions (`get-[name].js`, `save-[name].js`)
2. Update admin to save to backend instead of localStorage
3. Update public site to load from backend instead of hard-coded
4. Add fallback to default content if backend fails
5. Keep localStorage read for backwards compatibility (one-time migration)

**DO NOT delete localStorage immediately** - allow users to migrate naturally over a few days.

---

## 📚 RELATED DOCUMENTATION

- **Build Release Notes:** `docs/BUILDS/BUILD*.md` - See implementation details for each feature
- **Function Code:** `netlify/functions/` - All storage functions with inline documentation
- **API Integration:** `docs/INTEGRATION/` - External API setup and credentials
- **Testing:** `docs/TESTING/` - How to test storage functions

---

## 🎯 KEY TAKEAWAYS

1. **All persistent data → Netlify Blobs** (via Functions)
2. **All Blobs keys documented here** (check before adding new)
3. **localStorage is NOT for data** (UI preferences only)
4. **Follow established patterns** (look at existing functions)
5. **Document everything** (update this file + release notes)

---

**Questions?** Check existing function code first - it's heavily documented.

**END OF DATA STORAGE MAP**
