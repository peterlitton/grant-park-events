# FUTURE FEATURES - Grant Park Events

**Last Updated:** March 7, 2026  
**Updated By:** Claude (Opus 4) — Full evaluation against current codebase (Build10.23.1)  
**Purpose:** Open features ready for implementation  
**Status:** Active - only showing OPEN items  
**Completed Features:** See COMPLETED-FEATURES-ARCHIVE.md

---

## ⚠️ STATUS CHANGES (March 2026 Review)

The following FFs were evaluated against the current codebase (Build10.23.1). Several features listed as open have been fully or partially implemented since the last review (January 2026).

**Moved to COMPLETED (implemented since last review):**
- **FF #11:** Browser Back Button — pushState/popState fully implemented across all navigation (home, about, signup, events, modal). History state managed with handlePopState listener.
- **FF #13:** Email Share — mailto: share implemented in ShareButton component with pre-filled subject and body.
- **FF #14:** Social Media Rich Previews — OG tags, Twitter Cards, and Event Schema JSON-LD injected server-side by edge function (Build10.17). Full rich previews on all event pages.
- **FF #15:** Share Button with Copy Link & Email — Full ShareButton component with: native share (mobile), copy link (clipboard), email (mailto:), Facebook, Twitter. Appears on cards, hero, and modal. ENABLE_SHARE flag = true.
- **FF #16:** Automated Email Generator — generate-email-html.js Netlify Function builds HTML emails from event data. Campaign builder in admin.html with MailerLite integration (not Mailchimp as originally spec'd). Campaigns can be created, scheduled, and deleted.

**Changed to PARTIALLY COMPLETE:**
- **FF #2:** Share Icon on Images — ShareButton exists on cards, hero, and modal. See updated entry below for remaining work.
- **FF #17:** Image Optimization — Static assets resized (Build10.22: star.png 105→3.5KB, logo 66→26KB). Event image CDN optimization still pending. See updated entry below.

---

## 🎯 OPEN FEATURES (Ready to Implement)

### **FF #25: Edge Function LCP Image Preload** ⭐ NEW — PERFORMANCE
**Time:** 2-3 hours | **Complexity:** Medium | **Impact:** High | **Risk:** Medium  
**Requires Preview Testing:** Yes

**Problem:**
Mobile Performance score is 64. The LCP (Largest Contentful Paint) image on the homepage takes 8+ seconds because the browser cannot discover it until after the entire JS chain completes:
1. Tailwind CDN downloads (124KB, render-blocking) — 770ms
2. React + ReactDOM download (48KB, render-blocking) — 770ms
3. build-version.js downloads — 150ms
4. Inline JS executes, React app mounts
5. useEffect fires fetch('/.netlify/functions/get-events')
6. API response returns event data
7. React re-renders, image src attributes appear in DOM
8. Browser finally discovers and downloads LCP image

PSI confirms: resource load delay is 1,120ms but actual image download is only 20ms. The bottleneck is discovery, not download.

**Proposed Solution:**
Extend the existing edge function (`seo-canonical.js`) to handle `/` (homepage) requests. On homepage load:
1. Edge function reads events from Netlify Blobs (already has this code for /events/* pages)
2. Filters published, current events and sorts by date ascending (replicating client-side sort)
3. Gets the first event's image URL
4. Injects `<link rel="preload" href="[image-url]" as="image" fetchpriority="high">` into the HTML `<head>`

The browser starts downloading the LCP image immediately during step 1 of the JS chain — in parallel with everything — instead of waiting for step 7.

**Research Findings (March 7, 2026):**

Current rendering chain analysis from PSI mobile LCP breakdown:
- TTFB: 0ms (fast)
- Resource load delay: 1,120ms (waiting for JS to parse before image discovered)
- Resource load duration: 20ms (image download is trivial)
- Element render delay: 980ms (React rendering after image loads)

Edge function currently handles: `/events/*`, `/about`, `/signup`, `/sign-up`, `/about-us-contact`. Adding `/` is a config change (one line). The `onError: "bypass"` safety net means if the edge function fails, Netlify serves unmodified HTML — site works exactly as today.

Helper functions already in the edge function: `getAbsoluteImageUrl()`, `parseLocalDate()`, blob store read (`getStore('events')`). The sort/filter logic needs to be replicated from client-side `sortedEvents` useMemo (sort by date ascending, filter published + current).

**Risks:**
- Every homepage request now passes through the edge function (adds blob read latency). Current event-page TTFB with edge function is 5-40ms, suggesting minimal impact.
- Sort/filter logic must exactly match client-side logic or the preloaded image won't match the rendered LCP image. Wasted bandwidth but no visual impact.
- If first event changes between edge function read and client render (very unlikely — same blob store), preload targets wrong image. No visual impact, just wasted preload.

**Success Metric:** Mobile LCP should drop from ~8-9s toward ~6-7s by eliminating most of the 1,120ms resource load delay. Performance score should increase.

**Validation:** Run PSI on homepage before and after. Compare mobile LCP and resource load delay in LCP breakdown.

**Initial Approach:**
1. Add `/` to edge function path config
2. Add homepage handler block before the existing event-page block
3. Replicate client-side event filtering (published, not past) and sorting (date ascending)
4. Extract first event's image URL using existing `getAbsoluteImageUrl()`
5. Inject preload `<link>` tag via string replacement before `</head>`
6. Deploy to preview, run PSI against preview URL
7. Compare LCP metrics before promoting to production

---

### **FF #17: Automatic Image Compression & WebP Conversion** 🔥 PERFORMANCE — PARTIALLY COMPLETE
**Time:** 2-3 hours | **Complexity:** Medium | **Impact:** High | **Risk:** Medium  
**Requires Preview Testing:** Yes

**Completed (Build10.22, March 2026):**
- Static assets resized: star.png 105KB→3.5KB, gpe-logo.png 66KB→26KB
- Cache-busted in Build10.23.1 so CDN serves resized versions

**Still Open: Event Image CDN Optimization**

PSI flags 400-1,000KB in event image savings per page. Images are served full-resolution from `/.netlify/functions/images/` (Netlify Blobs). Netlify Image CDN (`/.netlify/images?url=...&w=...`) would auto-convert to WebP/AVIF and resize.

**Why it hasn't shipped yet:**
First attempt in Build10.22 failed — used `fit=cover` without understanding each display context's CSS constraints, causing image cropping and modal overlay issues. Rolled back.

**What's needed before reattempting:**
Per PROJECT-STANDARDS v2.4 (Rendering Context Rule), document the rendered dimensions for every display context before choosing CDN parameters. PSI already provides these:
- Card thumbnails: displayed at 396x297 (desktop), 658x494 (mobile)
- Dedicated page hero: w-full h-96 (384px height, full width)
- Modal: w-full h-96
- Calendar preview: h-32 (128px height)

Must deploy to preview and validate visually before production. Must ship separately from other changes (One Risk Per Build rule).

---

### **FF #18: Tailwind CSS Build Optimization** 🔥 PERFORMANCE
**Time:** 3-5 hours | **Complexity:** High | **Impact:** Medium | **Risk:** High

**Current State:**
Tailwind is loaded via CDN (`cdn.tailwindcss.com`, 124KB). PSI flags it as render-blocking (770ms on mobile) and 77KB unused. The CDN version compiles Tailwind in the browser at runtime, adding both download and parse time.

**What it would take:**
Replace CDN Tailwind with a pre-built, purged CSS file containing only the classes actually used. This requires:
- Installing Tailwind CLI or PostCSS locally
- Scanning index.html for used classes
- Generating a purged CSS file (~5-15KB vs 124KB)
- Hosting the CSS file as a static asset
- Removing the CDN script tag

**Assessment:**
This is an architectural change. The current project has no build pipeline — everything is hand-edited and deployed via zip drag-and-drop. Adding a Tailwind build step means Peter would need to run a command before every deploy, or we'd need to pre-build and include the CSS in every package.

The upside is significant for mobile: eliminates a 124KB render-blocking CDN request, removes 77KB unused CSS, and removes the browser-side Tailwind compilation step. Could improve FCP by 500-770ms on mobile.

The downside is ongoing maintenance complexity. Any new Tailwind class added to the HTML would require regenerating the CSS.

**Recommendation:** High impact but high friction. Consider only if mobile performance remains a priority after FF #25 and FF #17 are complete.

---

### **FF #19: Code Splitting & Progressive Loading** 🔥 PERFORMANCE
**Time:** 5+ hours | **Complexity:** Very High | **Impact:** High | **Risk:** High

**Current State:**
The entire application is a single inline `<script>` block in index.html (~25KB of React.createElement code). PSI flags 9KB minification savings. There's no code splitting — every component loads on every page.

**Assessment:**
Code splitting requires a module bundler (Vite, webpack, Rollup). The current architecture is a single HTML file with inline JS, no npm, no build step. Implementing this would be a fundamental architecture change:
- Convert inline JS to separate .js modules
- Add a bundler configuration
- Set up route-based code splitting
- Change the deploy workflow to include a build step

**Recommendation:** Not feasible within the current architecture without a major rebuild. The 9KB minification savings from a simpler approach (running terser on the inline JS) is achievable without architecture changes, but the real code-splitting benefits are not. Defer until/unless the project moves to a build-pipeline architecture.

---

### **FF #24: Unschedule Campaign Button**
**Time:** 30-45 min | **Complexity:** Low | **Impact:** Medium

Add ability to reverse "Mark Scheduled" action in Email Campaigns admin panel.

**Current State:** After clicking "Mark Scheduled", the campaign status changes and there's no way to reverse it without deleting and recreating the campaign. Admin has full campaign CRUD with MailerLite integration.

**Implementation:**
- Update `admin.html` campaign status logic
- Add conditional button text: "Mark Scheduled" vs "Unschedule"
- Toggle campaign status between "Draft" and "Scheduled"
- If campaign has a MailerLite campaign ID, handle the MailerLite side too
- Save updated status to Netlify Blobs

---

### **FF #1: Email Pop-Up Preview**
**Time:** 30-45 min | **Complexity:** Low | **Impact:** Medium

**Current State:** Admin can configure popup settings (delay, text, enable/disable) via the admin panel. Settings save to Netlify Blobs and apply to all visitors. But there's no way to preview the popup's appearance without enabling it on the live site.

**Implementation:**
- Add "Preview" button in admin popup settings section
- Show the popup exactly as visitors see it (using current settings)
- Preview mode only — doesn't affect live site or save anything

---

### **FF #2: Share Icon on Images** — PARTIALLY COMPLETE
**Time:** 30-60 min remaining | **Complexity:** Low | **Impact:** Medium

**Completed:** ShareButton component exists with full sharing options (native share, copy link, email, Facebook, Twitter). It appears on card view, hero/dedicated page, and modal.

**Remaining:** The original spec called for a white share icon overlay on the upper-right corner of event images (Amazon-style). The current ShareButton may not be positioned as an overlay on the image itself. Needs visual review to determine if the current placement satisfies the original intent, or if repositioning is desired.

**Assessment:** This may already be "done enough." Peter should review the current share button placement and decide if the Amazon-style image overlay is still wanted.

---

### **FF #4: PDF Inline Rendering**
**Time:** 20-30 min | **Complexity:** Low | **Impact:** Low

**Current State:** PDF tracking exists in analytics. The original issue was PDFs forcing download instead of displaying inline. This depends on how PDFs are linked in event descriptions — if they're hosted on Netlify, a `Content-Disposition: inline` header rule in `_headers` would fix it. If they're external links, we have no control.

**Assessment:** Low priority. Depends on whether any current events actually link to PDFs and whether the download behavior is still an issue.

---

### **FF #22: Mobile Swipe Tutorial Overlay**
**Time:** 2-3 hours | **Complexity:** Medium | **Impact:** Medium

**Current State:** Swipe navigation is fully implemented in the event modal (touch start/end handlers, left/right navigation). But there's no first-time tutorial overlay explaining the swipe feature to new mobile users.

**Assessment:** The swipe feature works. The question is whether users are discovering it. Analytics (if tracking swipe events) could answer this. If swipe usage is low on mobile, the tutorial would help. If it's already well-used, this is low priority.

**Note on localStorage:** The spec uses localStorage to remember dismissal. This works in the browser but not in artifacts/preview environments. For production this is fine.

---

### **FF #23: Clickable Event Dates with Calendar Preview**
**Time:** 2-3 hours | **Complexity:** Medium | **Impact:** High

**Current State:** "Add to Calendar" already exists as a dedicated section in the event modal and dedicated event page, with Google Calendar, iCal/Apple, and .ics download options.

**What this FF adds:** Making every date display across the site clickable (cards, modal header, calendar view) with a hover popup showing the calendar options. Currently users have to scroll to the "Add to Calendar" section; this would make it accessible anywhere a date appears.

**Assessment:** Good UX improvement. The calendar infrastructure already exists — this is about surfacing it in more places with a new interaction pattern. Medium complexity because the CalendarPreview popup component needs to handle positioning relative to different date elements across different views.

---

## 📊 REVISED QUICK REFERENCE

### **By Priority (Performance-focused, March 2026):**

**Top Priority — Mobile Performance:**
1. FF #25: Edge Function LCP Preload (2-3 hrs) — targets root cause of 8s mobile LCP
2. FF #17: Event Image CDN (2-3 hrs) — 400-1,000KB savings, requires reattempt with proper investigation
3. FF #18: Tailwind Build (3-5 hrs) — eliminates 124KB render-blocking, but architectural change

**Quick Wins — Admin/UX:**
4. FF #24: Unschedule Button (30-45 min)
5. FF #1: Email Popup Preview (30-45 min)
6. FF #4: PDF Inline (20-30 min, if still relevant)

**Medium — User Features:**
7. FF #23: Clickable Dates (2-3 hrs)
8. FF #2: Share Icon repositioning (30-60 min, if wanted)
9. FF #22: Swipe Tutorial (2-3 hrs, if analytics show low swipe adoption)

**Deferred — Requires Architecture Change:**
10. FF #19: Code Splitting (5+ hrs, not feasible without build pipeline)

---

### **Recommended Next Sequence (Performance Track):**

| Step | FF | What | Preview Required |
|------|-----|------|-----------------|
| 1 | #25 | Edge function LCP preload | Yes |
| 2 | #17 | Netlify Image CDN (reattempt) | Yes |
| 3 | #18 | Tailwind build optimization | Yes |

Each ships as its own build. Each validates on preview before production. Each measured with PSI before and after.

---

## 🎯 TOTAL OPEN FEATURES: 10
(Down from 15 — 5 moved to completed)

**Last Updated:** March 7, 2026
