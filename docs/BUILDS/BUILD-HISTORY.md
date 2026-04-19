# Build History - Complete Timeline

**Project:** Grant Park Events  
**Version:** v2.3.0  
**Total Builds:** 28 (as of this document)

---

## 🎯 STABLE RELEASES

**Three stable releases identified:**

1. **v2.3.0-build13** - First stable after initial v2.3.0 work
2. **v2.3.0-build20** - Stable after rich text restoration and UI polish
3. **v2.3.0-build27** - Stable after email popup Phase 1 and EmailOctopus integration

---

## 📅 BUILD TIMELINE

### **build01-04: Foundation** (Pre-documentation)
Early v2.3.0 work, documentation not comprehensive for these builds.

---

### **build05: Initial Documented Release**
- First well-documented v2.3.0 build
- Foundation for future work

---

### **build06-14: Feature Development & Bug Discovery**
- Event management features
- Bug tracking system established
- **BUG-2026-001** discovered (text backwards in admin)
- **BUG-2026-002** discovered (scraper error)
- **BUG-2026-003** discovered (rich text editor missing)

**build13:** ✅ STABLE
- BUG-2026-001 resolved (contentEditable → textarea fix)

**build14:** ❌ FAILED
- Duplicate component definition
- Rich text editor accidentally removed

---

### **build15: Rich Text Editor Restored**
**Date:** January 28, 2026  
**Type:** Critical Fix

**Changes:**
- Restored v2.2.1 contentEditable implementation
- EventFieldToolbar component re-added
- Formatting: Bold, Italic, Lists
- Paste formatting preserved
- Zero new dependencies

**Status:** BUG-2026-003 RESOLVED

---

### **build16: Six Critical Fixes**
**Date:** January 28, 2026  
**Type:** Major Bug Fix Release

**Issues Fixed:**
1. ✅ Bullets/numbering work (JavaScript selection fix)
2. ✅ Image URL accepts relative paths (input type changed)
3. ✅ Modal stays open (removed backdrop click)
4. ✅ Page scroll locked (body overflow lock)
5. ✅ Admin version corrected
6. ✅ SOP: Version consistency enforced

**Introduced:** REGRESSION-TEST-CHECKLIST

---

### **build17: CSS List Display**
**Date:** January 28, 2026  
**Type:** UI Fix

**Changes:**
- Added CSS rules for contentEditable lists (admin.html)
- Proper bullet/number visibility
- Indentation and spacing fixed
- Scoped to contenteditable elements only

---

### **build18: Index Page List Display**
**Date:** January 28, 2026  
**Type:** UI Fix + Critical Image Fix

**Changes:**
- Added list CSS to index.html
- **Critical:** Restored modal image absolute URL fix
- Fixed image display in modals

---

### **build19: Paste Filter**
**Date:** January 28, 2026  
**Type:** Enhancement

**Changes:**
- Added cleanPastedHTML() function
- Strips colors/fonts/sizes from pasted content
- Keeps bold, italic, lists
- Prevents HTML clutter from external sources

---

### **build20: Three Bug Fixes** ✅ STABLE
**Date:** January 28, 2026  
**Type:** Bug Fix + Stable Release

**Issues Fixed:**
1. ✅ Dedicated event page images not rendering
2. ✅ Admin preview cards show HTML in snippet
3. ✅ Preserve paragraph breaks when pasting

**User Validation:** Approved all fixes

**Status:** MARKED STABLE - End of build15-20 cycle

---

### **build21: Logo Navigation Fix**
**Date:** January 28, 2026  
**Type:** Hotfix - Navigation Bug

**Problem:** Logo didn't display when navigating from dedicated pages

**Fix:**
- Changed logo path from relative to absolute
- Line 968: `assets/logo.png` → `/assets/logo.png`

**Result:** Logo displays on all pages

---

### **build22: Event Card Images Fix** ✅ STABLE
**Date:** January 28, 2026  
**Type:** Hotfix - Image Display

**Problem:** Event card images blank after navigation

**Fix:**
- Added absolute URL conversion to card images (lines 1017, 1078)
- All event images now display correctly

**User Validation:** Confirmed working

**Status:** MARKED STABLE - Complete navigation fix

---

### **build23: Email Popup Phase 1**
**Date:** January 28, 2026  
**Type:** Feature - Email Popup Implementation

**New Features:**
- Email popup displays after configurable delay
- Cookie management (30-day persistence)
- Admin panel integration (settings already existed)
- EmailOctopus submission
- Testing mode (ignore cookie)

**What Works:**
- Popup displays
- Cookie prevents repeat shows
- Email submission
- Admin controls

---

### **build24: Popup Improvements**
**Date:** January 28, 2026  
**Type:** Fix - Popup UX Enhancements

**Issues Fixed:**
1. ✅ Timer debug logging added
2. ✅ Star at top center of popup
3. ✅ Headline centered
4. ✅ Manual close only (removed auto-close)
5. ✅ Source tags: POPUP and DEDICATED

**User Feedback:** All improvements confirmed

---

### **build25: EmailOctopus Fields + UI**
**Date:** January 29, 2026  
**Type:** Fix - EmailOctopus Integration

**Changes:**
1. EmailOctopus custom fields: original_source → OriginalSource, date_added → DateAdded
2. Modal height increased (mt-12) for star visibility
3. Success messages simplified (removed extra text)

**Applied to:** Both popup and dedicated signup page

---

### **build26: Field Names Matched**
**Date:** January 29, 2026  
**Type:** Critical Fix - EmailOctopus Integration

**Problem:** Field names didn't match user's EmailOctopus setup

**User's Fields:**
- OriginalSource (text field)
- DateAdded (date field)

**Fixes:**
1. Updated field names to match exactly
2. Updated Netlify function to accept and forward fields
3. Complete data flow: Frontend → Netlify → EmailOctopus

**User Validation:** OriginalSource working, DateAdded not populating

---

### **build27: Date Format Fix** ✅ STABLE
**Date:** January 29, 2026  
**Type:** Critical Fix - EmailOctopus Date Field

**Problem:** DateAdded field not populating (wrong format)

**User Feedback:**
- OriginalSource: WORKING ✅
- DateAdded: NOT WORKING ❌

**Root Cause:** EmailOctopus date fields require YYYY-MM-DD format only

**Fix:**
- Changed from ISO timestamp to date-only format
- `new Date().toISOString()` → `new Date().toISOString().split('T')[0]`
- Applied to: Popup (line 1491), Dedicated page (line 716), Netlify function (line 56)

**Result:**
- DateAdded now sends: `2026-01-29` instead of `2026-01-29T01:41:23.456Z`

**User Validation:** Expected to confirm both fields working

**Status:** MARKED STABLE - Email popup Phase 1 complete

---

### **build28: Documentation Package**
**Date:** January 29, 2026  
**Type:** Documentation - No Code Changes

**Changes:**
- Added complete `/docs/` folder structure
- Created PROJECT-STATUS.md (master status file)
- Created BUILD-HISTORY.md (this file)
- Created ACTIVE-BUGS.md
- Created DEPLOYMENT-SOP.md
- Created TESTING-SOP.md
- Organized all existing documentation

**Purpose:** Enable complete context persistence across chat sessions

**Code:** Identical to build27 (stable)

---

## 📊 STATISTICS

### **By Type:**
- Stable Releases: 3
- Bug Fixes: ~15 builds
- Features: ~5 builds
- Enhancements: ~5 builds
- Documentation: 1 build

### **Bug Resolution:**
- BUG-2026-001: RESOLVED (build13)
- BUG-2026-002: OPEN (low priority)
- BUG-2026-003: RESOLVED (build15)

### **Feature Completion:**
- Rich text editor: ✅ Complete
- Email popup Phase 1: ✅ Complete
- EmailOctopus integration: ✅ Complete
- Navigation: ✅ Complete
- Image handling: ✅ Complete

---

## 🔄 BUILD CYCLES

### **Cycle 1: builds 15-20 (Rich Text & Polish)**
- **Duration:** 1 day
- **Focus:** Rich text editor restoration, UI fixes
- **Outcome:** build20 STABLE

### **Cycle 2: builds 21-22 (Navigation)**
- **Duration:** 1 day
- **Focus:** Logo and image navigation fixes
- **Outcome:** build22 STABLE

### **Cycle 3: builds 23-27 (Email Popup)**
- **Duration:** 1 day
- **Focus:** Email popup implementation and EmailOctopus debugging
- **Outcome:** build27 STABLE

---

## 📈 PATTERNS OBSERVED

### **Common Issues:**
1. **Image path resolution** - Context-dependent (normal vs modal)
2. **Field name mismatches** - Case sensitivity in APIs
3. **Date format requirements** - API-specific formats needed

### **Lessons Learned:**
1. Always use absolute paths for assets at any route depth
2. Verify API field names exactly (case-sensitive)
3. Check API documentation for data format requirements
4. Test navigation from all page types (home, dedicated, about)

---

### **builds 29-45: MailerLite Migration & Email Campaign System**
**Date:** January 29-30, 2026  
**Type:** Major Feature Development

**Key Changes:**
- Migrated from EmailOctopus to MailerLite
- Built complete email campaign management system
- Dashboard, campaign builder, preview, PNG export
- Test email functionality
- MailerLite scheduling integration

---

### **builds 46-47: MailerLite Integration Testing**
**Date:** January 30, 2026  
**Type:** Integration & Testing

**Changes:**
- MailerLite API verification
- Environment variable configuration
- Subscriber management functions

---

### **builds 48-51: Email Campaign System Complete**
**Date:** January 30, 2026  
**Type:** Major Feature Release

**Features Built:**
- ✅ Campaign dashboard with list table (Draft/Scheduled/Sent)
- ✅ Campaign builder with all fields
- ✅ Date pickers with auto +7 days
- ✅ Hero image selector with preview
- ✅ Event selection (auto-filters, excludes Navy Pier Fireworks)
- ✅ HTML email generation with event consolidation
- ✅ PNG export for TV display
- ✅ Test email to peter@peterlitton.com
- ✅ MailerLite campaign scheduling
- ✅ Edit/Delete with confirmations

**Problem:** Campaign storage used Lambda v1 function format:
```javascript
const { getStore } = require('@netlify/blobs');
exports.handler = async (event) => {...}
```
This format requires `connectLambda(event)` which was never called.
Result: `MissingBlobsEnvironmentError` on every storage operation.

---

### **build52: Bug Fixes**
**Date:** January 30, 2026  
**Type:** Bug Fixes

**Fixes:**
1. Date calculation bug (was creating invalid dates like 0002-07-07)
2. Hero image preview enhancement
3. Index Report navigation color consistency
4. Enhanced error logging

**Storage:** Still broken (Lambda v1 format)

---

### **builds 53-55: Netlify Blobs Troubleshooting**
**Date:** January 30, 2026  
**Type:** Storage Fix Attempts (All Failed)

**Attempts:**
- **Attempt 1-4:** Simple `getStore('campaigns')` - MissingBlobsEnvironmentError
- **Attempt 5:** Added NETLIFY_SITE_ID env var + explicit config - Still failed (needed token)

**Function logs showed:** AWS Lambda context, not Netlify-specific context
- Context had: `callbackWaitsForEmptyEventLoop`, `succeed`, `fail`
- Context missing: `site.id`, `token`

**Root Cause Never Identified:** Functions were using Lambda v1 format which doesn't auto-inject Blobs context.

---

### **build56: localStorage Workaround**
**Date:** January 30, 2026  
**Type:** Storage Workaround

**Change:** Switched from Netlify Blobs to browser localStorage

**Result:** Works immediately but NOT suitable for multi-computer workflow.

**Limitation:** User works on multiple computers - localStorage is device-specific.

---

### **build57: Cross-Device Storage Fix** ✅ STABLE
**Date:** January 30, 2026  
**Type:** Storage Architecture Fix

**Root Cause Identified:** Builds 48-55 used Lambda v1 function format which requires manual `connectLambda(event)` initialization for Blobs.

**Solution:** Use Functions v2 format (same as working `get-events.js`):
```javascript
import { getStore } from "@netlify/blobs";
export default async (req, context) => {...}
```

**New Files:**
- `netlify/functions/get-campaigns.js` (Functions v2)
- `netlify/functions/save-campaigns.js` (Functions v2)

**Modified:**
- `admin.html` - Calls functions instead of localStorage

**Result:** Campaigns now stored in Netlify Blobs, syncs across all devices.

**Status:** MARKED STABLE - Campaign storage working correctly

---

## 📊 STATISTICS

### **By Type:**
- Stable Releases: 4 (build13, build20, build22, build27, build57)
- Bug Fixes: ~20 builds
- Features: ~10 builds
- Storage Fixes: 6 builds (52-57)
- Documentation: 2 builds

### **Bug Resolution:**
- BUG-2026-001: RESOLVED (build13)
- BUG-2026-002: OPEN (low priority - scraper)
- BUG-2026-003: RESOLVED (build15)
- Campaign Storage: RESOLVED (build57)

### **Feature Completion:**
- Rich text editor: ✅ Complete
- Email popup Phase 1: ✅ Complete
- EmailOctopus integration: ✅ Complete (migrated to MailerLite)
- MailerLite integration: ✅ Complete
- Email campaign system: ✅ Complete
- Cross-device campaign storage: ✅ Complete (build57)

---

## 🔄 BUILD CYCLES

### **Cycle 1: builds 15-20 (Rich Text & Polish)**
- **Duration:** 1 day
- **Focus:** Rich text editor restoration, UI fixes
- **Outcome:** build20 STABLE

### **Cycle 2: builds 21-22 (Navigation)**
- **Duration:** 1 day
- **Focus:** Logo and image navigation fixes
- **Outcome:** build22 STABLE

### **Cycle 3: builds 23-27 (Email Popup)**
- **Duration:** 1 day
- **Focus:** Email popup implementation and EmailOctopus debugging
- **Outcome:** build27 STABLE

### **Cycle 4: builds 29-47 (MailerLite Migration)**
- **Duration:** 1 day
- **Focus:** EmailOctopus → MailerLite migration, email campaign system
- **Outcome:** System built, storage broken

### **Cycle 5: builds 48-57 (Campaign Storage)**
- **Duration:** 1 day
- **Focus:** Email campaign system + storage fix
- **Outcome:** build57 STABLE

---

## 📈 PATTERNS OBSERVED

### **Common Issues:**
1. **Image path resolution** - Context-dependent (normal vs modal)
2. **Field name mismatches** - Case sensitivity in APIs
3. **Date format requirements** - API-specific formats needed
4. **Function format matters** - Lambda v1 vs Functions v2 have different context injection

### **Lessons Learned:**
1. Always use absolute paths for assets at any route depth
2. Verify API field names exactly (case-sensitive)
3. Check API documentation for data format requirements
4. Test navigation from all page types (home, dedicated, about)
5. **Use Functions v2 format for Netlify Blobs** - auto-configures context
6. **Match patterns from working code** - get-events.js worked, should have copied it exactly

---

## 🎯 CURRENT STATUS

**build57 is STABLE** - All features working:
- ✅ Event management
- ✅ Email signup (MailerLite)
- ✅ Email campaigns with cross-device storage
- ✅ PNG export
- ✅ MailerLite scheduling

---

### **builds 58-73.2: Performance, SEO, and Fixes**
**Date:** January 31 - February 2, 2026  
**Type:** Performance Optimization, SEO Attempts, Bug Fixes

**Key Changes:**
- **Build72:** Self-hosted React libraries for performance, _redirects fix attempt
- **Build73.1:** Removed utility files (verify-build69.html, reset-storage.html)
- **Build74:** On-Demand Builder for SSR - FAILED, rolled back
- **Build73.2:** QR code cache-busting fix for email templates

**Build74 Notes:**
- Attempted Netlify On-Demand Builders for server-side SEO
- Builder function never invoked - requests went to index.html
- Research revealed On-Demand Builders are legacy feature
- Netlify now recommends `durable` cache directive instead
- Full research documented in BUILD74-ODB-RESEARCH.md

**Build73.2 Fix:**
- QR code URL `poster-qr-code.png` was returning HTML (CDN cache poisoning)
- CDN had cached incorrect response with 1-year max-age
- Fixed by adding `?v=2.3.0` cache-busting parameter
- File: `netlify/functions/generate-email-html.js` line 108
- **Note:** version.js was not updated in Build73.2 (still shows Build73.1)

**Current Stable:** v2.3.0-Build73.2 (version.js shows Build73.1)

---

*This document updated with each build to maintain complete project history.*
