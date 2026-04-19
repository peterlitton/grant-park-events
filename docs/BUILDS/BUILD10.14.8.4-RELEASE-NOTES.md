# BUILD10.14.8.4 RELEASE NOTES — STABLE
## v2.3.1-Build10.14.8.4

**Date:** February 9, 2026  
**LLM:** Claude Opus 4.6  
**Type:** Stable release — bug fixes + architecture improvement  
**Previous Stable:** v2.3.1-Build10.14.7  
**Status:** ✅ STABLE — All items validated by Peter

---

## SUMMARY

This release delivers 7 queued feature fixes plus 2 architectural improvements
that emerged during validation. The build went through 5 iterations (10.14.8
through 10.14.8.4) to resolve cascading issues caused by a stale service worker
cache — itself caused by the version drift problem that has plagued this project
since Build6. That systemic issue is now architecturally eliminated.

---

## FEATURES & FIXES DELIVERED

### 1. Monitor Tab — Reload Removed ✅
**Problem:** `window.location.reload()` after Run Now reset user to Events tab.  
**Fix:** Removed reload. Existing state updates (`setMonitorStatus`, `setMonitorExecutions`) refresh data in place.  
**File:** admin.html

### 2. About Page — Empty Default ✅
**Problem:** Hardcoded default text in `useState()` caused confusion vs. saved content.  
**Fix:** Default changed to empty string. "Reset" button renamed to "Clear" — empties textarea.  
**File:** admin.html

### 3. Popup Settings — Blobs Persistence ✅
**Problem:** Settings saved to localStorage only — didn't persist across browsers/devices. Admin fetched from non-existent `get-popup-settings` endpoint (silently 404'd).  
**Fix:** Created Netlify Functions for save/get. Admin writes to both Blobs and localStorage (dual write). Public site fetches from Blobs endpoint first, localStorage fallback, then defaults.  
**Files:** netlify/functions/get-popup-settings.js (NEW), netlify/functions/save-popup-settings.js (NEW), admin.html, index.html

### 4. Popup Delay — Dropdown Conversion ✅
**Problem:** Range slider had stale closure bug — `onMouseUp` captured old state while `onChange` updated it, causing value drift.  
**Fix:** Replaced slider with `<select>` dropdown (0–300s, 5s increments, 61 options). Single `onChange` handler eliminates closure issue. Inline save status indicator ("✅ Settings saved!") next to heading.  
**File:** admin.html

### 5. Email Template — Header Padding ✅
**Problem:** Logo/QR code flush against header edges.  
**Fix:** Changed padding from `0 30px` to `20px 30px`.  
**File:** netlify/functions/generate-email-html.js

### 6. Subscriber Growth Chart — 180-Day Preset ✅
**Problem:** No mid-range option between 90 days and All Time.  
**Fix:** Added 180 to preset array: `[30, 60, 90, 180, 'all']`.  
**File:** admin.html

### 7. Source Name Normalization ✅
**Problem:** "Pop-Up" and "Pop-UP" appeared as separate pie chart slices.  
**Fix:** Added `normalizeSource()` function mapping variants to canonical names.  
**File:** netlify/functions/get-subscriber-stats.js

### 8. PNG Export — CORS Fix ✅
**Problem:** Email HTML used absolute URLs (`https://www.grantparkevents.com/...`). Admin runs on different origin (`gpe20.netlify.app`) → CORS blocked image fetch → blank logo/QR in PNG output.  
**Fix:** Before base64 conversion, strip domain prefix to make URLs relative (same-origin). Then convert all images to base64 data URIs before writing to iframe for html2canvas.  
**File:** admin.html

### 9. Single-Source Version Control ✅
**Problem:** Version was hardcoded in 4 separate files (version.js, index.html, admin.html, sw.js). Each build required 4 manual find-and-replace operations. Missed sw.js → browser served cached old code → all Build10.14.8 fixes invisible.  
**Fix:** Created `/build-version.js` as the ONLY file that defines version. All other files load it at runtime via `<script>` tag or `importScripts()`. No copies exist to drift.  
**Files:** build-version.js (NEW), index.html, admin.html, sw.js, _headers, netlify/functions/get-version.js

---

## ARCHITECTURAL CHANGES

### Version Control — build-version.js
| File | Before (4 copies) | After (1 source) |
|------|-------------------|-------------------|
| `build-version.js` | Did not exist | `var BUILD_VERSION = '...'` (THE source) |
| `index.html` | `const BUILD_VERSION = '...'` | `<script src="/build-version.js">` |
| `admin.html` | `const BUILD_VERSION = '...'` | `<script src="/build-version.js">` |
| `sw.js` | `const CACHE_VERSION = 'gpe-...'` | `importScripts('/build-version.js')` → derives |
| `version.js` | `export const BUILD_VERSION = '...'` | DEPRECATED (history only) |

**To update version in future builds:** Edit `build-version.js` only. One file, three lines.

### Popup Settings — Blobs as Authoritative Store
| Context | Source | Fallback |
|---------|--------|----------|
| Admin saves | Blobs + localStorage (dual write) | — |
| Admin loads | Blobs (if found) | localStorage → defaults |
| Public site | Blobs endpoint fetch | localStorage → defaults |

### PNG Export — Same-Origin Image Pipeline
1. Generate email HTML (contains absolute `grantparkevents.com` URLs)
2. Strip domain prefix → relative paths (`/assets/common/gpe-logo.png`)
3. Fetch each image from same origin (no CORS)
4. Convert to base64 data URIs
5. Write processed HTML to iframe
6. html2canvas captures with embedded images

---

## BUILD ITERATION HISTORY

| Build | Issue | Root Cause |
|-------|-------|------------|
| 10.14.8 | All 7 fixes delivered | Validated in code but... |
| 10.14.8.1 | Popup still broken, PNG blank, old notifications | sw.js not updated (still caching 10.14.7) |
| 10.14.8.2 | Same symptoms | Identified sw.js root cause, fixed cache version |
| 10.14.8.3 | Version drift eliminated | Created build-version.js single source architecture |
| 10.14.8.4 | PNG CORS, popup in incognito | Relative URL conversion, Blobs fetch on public site |

**Key lesson:** sw.js was invisible infrastructure that nobody opened during normal feature work, the validation SOP didn't check it, and its failure mode (serving cached old code) mimics broken new code. Now eliminated by architecture — sw.js derives its cache name from the same shared variable, so version changes propagate automatically.

---

## FILES CHANGED (cumulative from Build10.14.7)

### NEW FILES
- `/build-version.js` — single version source of truth
- `/netlify/functions/get-popup-settings.js` — Blobs read endpoint
- `/netlify/functions/save-popup-settings.js` — Blobs write endpoint

### MODIFIED FILES
- `index.html` — popup Blobs fetch, build-version.js script tag
- `admin.html` — popup dual write, inline save status, dropdown, about default, monitor reload, 180d preset, PNG base64 pipeline, build-version.js script tag
- `sw.js` — importScripts build-version.js, derives CACHE_VERSION
- `_headers` — short cache rule for build-version.js
- `netlify/functions/generate-email-html.js` — header padding
- `netlify/functions/get-subscriber-stats.js` — source normalization
- `netlify/functions/get-version.js` — reads from build-version.js
- `version.js` — deprecated (VERSION_HISTORY only)
- `docs/SOPs/PROJECT-STANDARDS.md` — v2.2, version control, popup, PNG sections
- `docs/SOPs/BUILD-VALIDATION-SOP.md` — single-source version checks

---

## VALIDATION RESULTS

✅ **Structural Integrity**
   - index.html: Braces 851/851, Brackets 106/106, Parens 1510/1510
   - admin.html: Braces 1289/1289, Brackets 260/260, Parens 2282/2282

✅ **Version Consistency (Single-Source)**
   - build-version.js: `v2.3.1-Build10.14.8.4`
   - No hardcoded BUILD_VERSION in index.html or admin.html
   - No hardcoded CACHE_VERSION in sw.js
   - All 3 consumers load build-version.js

✅ **All 11 Acceptance Criteria Passed**
   1. Monitor: Run Now keeps user on Monitor tab ✓
   2. About: Starts empty, Clear button works ✓
   3. Popup: Settings persist across browsers via Blobs ✓
   4. Dropdown: 61 options, no drift, inline save status ✓
   5. Email padding: Logo/QR have visible spacing ✓
   6. Chart: 180 Days button appears and filters ✓
   7. Sources: Single "Pop-Up" slice ✓
   8. PNG: Logo and QR code render (not blank) ✓
   9. Version: Single source, no drift ✓
   10. SW: Loads current version ✓
   11. Popup timer: Works in incognito/new browser ✓

**VALIDATION STATUS: ALL CHECKS PASSED ✅**
**RELEASE STATUS: STABLE ✅**
