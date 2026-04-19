# FUTURE FEATURES - Grant Park Events

**Last Updated:** January 25, 2026  
**Purpose:** Open features ready for implementation  
**Status:** Active - only showing OPEN items  
**Completed Features:** See COMPLETED-FEATURES-ARCHIVE.md

---

## 🎯 OPEN FEATURES (Ready to Implement)

### **FF #24: Unschedule Campaign Button** ⭐ NEW
**Time:** 30-45 min | **Complexity:** Low | **Impact:** Medium

Add ability to reverse "Mark Scheduled" action in Email Campaigns admin panel.

**Current Behavior:**
- After clicking "Mark Scheduled", button disappears
- Campaign status changes to "Scheduled"
- No way to reverse this action

**Requested Behavior:**
- After clicking "Mark Scheduled", button changes to "Unschedule"
- Clicking "Unschedule" changes status back to "Draft"
- Button returns to "Mark Scheduled"
- Allows user to correct mistakes or reschedule campaigns

**Implementation:**
- Update `admin.html` campaign status logic
- Add conditional button text: "Mark Scheduled" vs "Unschedule"
- Toggle campaign status between "Draft" and "Scheduled"
- Save updated status to Netlify Blobs
- No backend changes needed (client-side only)

**Benefits:**
- Fix mistakes without deleting/recreating campaign
- Better workflow flexibility
- More forgiving UX

**Planned For:** build62

---

### **FF #1: Email Pop-Up Preview**
**Time:** 30-45 min | **Complexity:** Low | **Impact:** Medium

Add preview functionality to see how the email signup popup will appear to users before enabling it on the live site.

**Details:**
- Show preview button in admin panel
- Display popup exactly as users will see it
- Test different settings (delay, text, etc.)
- Preview without affecting live site

---

### **FF #2: Share Icon on Images**
**Time:** 1-2 hours | **Complexity:** Medium | **Impact:** High

Add white share icon to upper right corner of all event images with menu (similar to Amazon product images).

**Details:**
- White icon overlay on event images
- Click to show share menu
- Options: Copy link, Share to Facebook, Share to Twitter, Email, etc.
- Works on both card view and modal images
- Clean, modern design

**Reference:** See uploaded Amazon-style share menu screenshot

---

### **FF #4: PDF Inline Rendering**
**Time:** 20-30 min | **Complexity:** Low | **Impact:** Medium

Fix PDF links to render in browser tab instead of forcing download prompt.

**Current Issue:**
- PDF links work but trigger "Save As" download dialog
- Users want PDFs to display directly in browser

**Solution Options:**
1. **For Netlify-hosted PDFs:** Configure `_headers` file with `Content-Disposition: inline`
2. **Embed viewer:** Use `<embed>` or `<iframe>` to force inline display
3. **PDF.js integration:** Custom PDF viewer that always renders inline
4. **Cloud hosting:** Use services that default to inline (Google Drive viewer mode)

---

### **FF #11: Browser Back Button Support for Dedicated Event Pages**
**Time:** 1-2 hours | **Complexity:** Medium | **Impact:** High

Fix browser back button behavior when navigating from dedicated event page to homepage and back.

**Current Issue:**
- Browser back button doesn't work properly with event pages
- Can lose navigation state

**Solution:**
- Proper history state management
- pushState/popState implementation
- Smooth navigation between homepage and event pages

---

### **FF #13: Email Share Functionality**
**Time:** 1 hour | **Complexity:** Low | **Impact:** Medium

Share events via email with pre-filled message.

**Details:**
- Email share button
- Pre-filled subject and body
- Event details included
- mailto: link implementation

---

### **FF #14: Social Media Rich Previews**
**Time:** 2-3 hours | **Complexity:** Medium | **Impact:** High

Open Graph & Twitter Card previews for social sharing.

**Details:**
- Add Open Graph meta tags per event
- Add Twitter Card meta tags
- Rich previews when sharing on social media
- Proper image/title/description

**Note:** Requires paid Netlify plan for server-side rendering.

---

### **FF #15: Share Button with Copy Link & Email**
**Time:** 1 hour | **Complexity:** Low | **Impact:** Medium

Unified share button with copy link and email options.

**Details:**
- Single share button
- Dropdown with options: Copy Link, Email
- Clean, simple UI
- Works with unique event URLs

---

### **FF #16: Automated Email Generator for Mailchimp**
**Time:** 3-4 hours | **Complexity:** High | **Impact:** Very High

Auto-generate Mailchimp email campaigns from event data.

**Details:**
- Export events to Mailchimp format
- Auto-generate HTML email template
- Populate with event details
- One-click campaign creation
- Massive time saver for admin

---

### **FF #17: Automatic Image Compression & WebP Conversion** 🔥
**Time:** 2-3 hours | **Complexity:** Medium | **Impact:** High

Automatically optimize images on upload.

**Details:**
- Compress images automatically
- Convert to WebP format
- Multiple size variants (thumbnail, full)
- Improves page load speed significantly
- Better mobile performance

---

### **FF #18: Tailwind CSS Build Optimization** 🔥
**Time:** 1-2 hours | **Complexity:** Medium | **Impact:** Medium

Remove unused Tailwind classes for smaller CSS file.

**Details:**
- PurgeCSS integration
- Remove unused classes
- Smaller CSS bundle
- Faster page load
- Production build optimization

---

### **FF #19: Code Splitting & Progressive Loading**
**Time:** 3-4 hours | **Complexity:** High | **Impact:** High

Load code progressively for faster initial page load.

**Details:**
- Split code into chunks
- Lazy load non-critical components
- Progressive enhancement
- Better initial load time
- Improved Core Web Vitals

---

### **FF #22: Mobile Swipe Tutorial Overlay**
**Time:** 2-3 hours | **Complexity:** Medium | **Impact:** Medium

Add first-time user tutorial overlay on mobile event modal to explain swipe navigation.

**Details:**
- Tinted overlay when user first opens event modal on mobile
- Clear instructions to swipe left/right to navigate events
- Visual swipe gesture indicators/animation
- X close button to dismiss tutorial
- localStorage to remember dismissal (never show again on that device)
- Only display on mobile devices (tablets and phones)
- Non-intrusive design that doesn't block functionality
- Smooth fade-in/fade-out transitions

**User Experience:**
- First-time mobile user opens event modal
- Semi-transparent overlay appears with animation
- Shows visual swipe gesture (animated arrows or hand icon)
- Text: "Swipe left or right to browse events"
- User can dismiss with X button or by swiping
- Tutorial never shows again on that device

**Technical Implementation:**
```javascript
// Check if tutorial has been shown
const tutorialShown = localStorage.getItem('swipe-tutorial-shown');

if (!tutorialShown && isMobileDevice()) {
  showSwipeTutorial();
}

function dismissTutorial() {
  localStorage.setItem('swipe-tutorial-shown', 'true');
  hideTutorial();
}
```

**Benefits:**
- Improves discoverability of swipe navigation
- Reduces confusion for first-time mobile users
- Better mobile UX
- Only shown once (not annoying)

---

### **FF #23: Clickable Event Dates with Calendar Preview**
**Time:** 2-3 hours | **Complexity:** Medium | **Impact:** High

Make all event dates clickable with hover state, showing calendar preview with "Add to Calendar" option.

**Details:**
- All date displays become clickable links
- Common hover state (underline, color change, cursor pointer)
- Click opens calendar preview popup/tooltip
- Preview shows: Event name, date/time, location
- "Add to Calendar" button in preview (Google, Outlook, Apple)
- Start with ONE date location first, then roll out to all
- Consistent behavior across all date displays

**Implementation Phases:**

**Phase 1: Proof of Concept (1 location)**
- Choose one date location (e.g., event modal main date)
- Implement hover state
- Create calendar preview component
- Test Add to Calendar functionality
- Get user approval

**Phase 2: Rollout (All locations)**
- Event cards (grid/list view)
- Event modal header
- Calendar view entries
- Anywhere a date is displayed

**Hover State:**
```css
.clickable-date {
  cursor: pointer;
  color: #2563eb; /* blue-600 */
  text-decoration: underline;
  text-decoration-style: dotted;
  transition: all 0.2s;
}

.clickable-date:hover {
  color: #1d4ed8; /* blue-700 */
  text-decoration-style: solid;
}
```

**Calendar Preview Popup:**
```
┌───────────────────────────────┐
│  Summer Concert               │
│  Monday, July 15, 2026        │
│  7:30 PM - 9:00 PM           │
│  Jay Pritzker Pavilion       │
│                               │
│  [📅 Add to Calendar ▼]       │
│    → Google Calendar          │
│    → Outlook                  │
│    → Apple Calendar           │
│    → Download .ics            │
└───────────────────────────────┘
```

**Date Locations to Update:**
1. Event card date (grid view)
2. Event card date (list view)
3. Event modal main date
4. Calendar view event entries
5. Calendar hover preview dates
6. Email digest dates (future)

**User Experience:**
- User sees date displayed
- Date appears clickable (underline, blue color)
- Hover shows tooltip: "Click to add to calendar"
- Click opens preview popup
- User selects calendar option
- Calendar event added or .ics downloaded

**Benefits:**
- Quick access to Add to Calendar
- Better discoverability of calendar feature
- Consistent UX across site
- Reduces clicks to add event
- Professional interaction pattern

**Technical Considerations:**
- Reuse existing calendar button logic
- Create shared CalendarPreview component
- Event handlers for date clicks
- Position popup relative to clicked date
- Close popup on outside click or ESC key
- Mobile-friendly touch targets

---
- localStorage to remember dismissal (never show again on that device)
- Only display on mobile devices (tablets and phones)
- Non-intrusive design that doesn't block functionality
- Smooth fade-in/fade-out transitions

**User Experience:**
- First-time mobile user opens event modal
- Semi-transparent overlay appears with animation
- Shows visual swipe gesture (animated arrows or hand icon)
- Text: "Swipe left or right to browse events"
- User can dismiss with X button or by swiping
- Tutorial never shows again on that device

**Technical Implementation:**
```javascript
// Check if tutorial has been shown
const tutorialShown = localStorage.getItem('swipe-tutorial-shown');

if (!tutorialShown && isMobileDevice()) {
  showSwipeTutorial();
}

function dismissTutorial() {
  localStorage.setItem('swipe-tutorial-shown', 'true');
  hideTutorial();
}
```

**Benefits:**
- Improves discoverability of swipe navigation
- Reduces confusion for first-time mobile users
- Better mobile UX
- Only shown once (not annoying)

---

## 📊 QUICK REFERENCE

### **By Time Required:**

**Quick (<1 hour):**
- FF #4: PDF Inline Rendering (30 min)
- FF #24: Unschedule Campaign Button (45 min)
- FF #1: Email Preview (45 min)
- FF #13: Email Share (1 hour)
- FF #15: Share Button (1 hour)

**Medium (1-3 hours):**
- FF #2: Share Icon (2 hours)
- FF #11: Browser Back Button (2 hours)
- FF #14: Social Media Previews (2-3 hours)
- FF #17: Image Optimization (2-3 hours)
- FF #18: Tailwind Build (1-2 hours)
- FF #22: Mobile Swipe Tutorial (2-3 hours)
- FF #23: Clickable Event Dates (2-3 hours)

**Complex (3+ hours):**
- FF #16: Mailchimp Generator (3-4 hours)
- FF #19: Code Splitting (3-4 hours)

---

### **By Impact:**

**High Impact:**
- FF #2: Share Icon (viral growth)
- FF #11: Browser Back Button (UX)
- FF #14: Social Media Previews (SEO)
- FF #16: Mailchimp Generator (admin efficiency)
- FF #17: Image Optimization (performance)
- FF #19: Code Splitting (performance)
- FF #23: Clickable Event Dates (UX + calendar adoption)

**Medium Impact:**
- FF #1: Email Preview (admin QoL)
- FF #4: PDF Inline (UX)
- FF #13: Email Share (sharing)
- FF #15: Share Button (sharing)
- FF #18: Tailwind Build (performance)
- FF #22: Mobile Swipe Tutorial (mobile UX)

---

### **Recommended Bundles:**

**Bundle A: Quick Wins (2-3 hours)**
- FF #4: PDF Inline (30 min)
- FF #1: Email Preview (45 min)
- FF #13: Email Share (1 hour)

**Bundle B: Sharing Suite (4-5 hours)**
- FF #2: Share Icon (2 hours)
- FF #13: Email Share (1 hour)
- FF #15: Share Button (1 hour)

**Bundle C: Performance Pack (6-9 hours)**
- FF #17: Image Optimization (3 hours)
- FF #18: Tailwind Build (2 hours)
- FF #19: Code Splitting (4 hours)

**Bundle D: Mobile UX (3-4 hours)**
- FF #22: Swipe Tutorial (2-3 hours)
- FF #11: Browser Back Button (2 hours)

**Bundle E: Calendar Enhancement (3-4 hours)**
- FF #23: Clickable Event Dates (2-3 hours)
- FF #11: Browser Back Button (2 hours)

---

## 🎯 TOTAL OPEN FEATURES: 15

**Last Updated:** January 30, 2026
