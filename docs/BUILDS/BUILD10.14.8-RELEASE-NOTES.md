# BUILD10.14.8 RELEASE NOTES
## v2.3.1-Build10.14.8

**Date:** February 9, 2026  
**LLM:** Claude Opus 4.6  
**Type:** Bug fixes + UX improvements (7 items)  
**Previous:** v2.3.1-Build10.14.7

---

## OVERVIEW

Seven queued fixes addressing monitor tab navigation, popup settings persistence, About page defaults, email template spacing, chart presets, and subscriber source data normalization.

---

## CHANGES

### 1. Monitor Tab — Removed Page Reload After Run Now
**Problem:** Run Now button triggered `window.location.reload()` after success, resetting user to Events tab instead of staying on Monitor.  
**Fix:** Removed the reload. Existing state update calls (`setMonitorStatus`, `setMonitorExecutions`) already refresh data via React re-render.  
**File:** `admin.html` line ~2808  

### 2. About Page — Empty Default
**Problem:** Hardcoded "What is GrantParkEvents.com?" default text in `useState()` got overwritten by Blobs/localStorage content on load, creating confusion about what was saved vs. default.  
**Fix:** Changed `useState("What is GrantParkEvents.com?...")` to `useState('')`. Page starts empty; only saved content displays. Reset button changed from "Reset" to "Clear" with matching empty behavior.  
**File:** `admin.html` lines ~1207, ~2672

### 3. Popup Settings — Netlify Blobs Persistence
**Problem:** `savePopupSettings()` only wrote to localStorage. The admin panel already fetched from `get-popup-settings` (Blobs) on load, but that function didn't exist — silently 404'd. Settings were localStorage-only, creating inconsistency.  
**Fix:** Created both `get-popup-settings.js` and `save-popup-settings.js` Netlify Functions. Updated `savePopupSettings()` to POST to Blobs. Background load at startup now successfully fetches from Blobs.  
**Files:**  
- `netlify/functions/get-popup-settings.js` (NEW)
- `netlify/functions/save-popup-settings.js` (NEW)
- `admin.html` lines ~1929-1933

### 4. Popup Delay — Slider Replaced With Dropdown
**Problem:** Range slider had stale closure bug — `onMouseUp` captured old `popupSettings` state while `onChange` updated it, causing inconsistent delay values.  
**Fix:** Replaced `<input type="range">` (3-30s) with `<select>` dropdown (0-300s in 5-second increments). Single `onChange` handler calls `savePopupSettings()` directly, eliminating the closure issue. Cleaner UX with explicit value selection.  
**File:** `admin.html` lines ~3580-3605

### 5. Email Template — Header Padding
**Problem:** Logo and QR code flush against top/bottom edges of header row with no breathing room.  
**Fix:** Changed header cell padding from `0 30px` to `20px 30px`, adding 20px top/bottom spacing.  
**File:** `netlify/functions/generate-email-html.js` line 100

### 6. Subscriber Growth Chart — 180-Day Preset
**Problem:** Chart only had 30/60/90/All Time presets. No mid-range option for ~6 month view.  
**Fix:** Added 180 to preset array: `[30, 60, 90, 180, 'all']`. Filtering logic already supports any numeric value.  
**File:** `admin.html` line ~407

### 7. Source Pie Chart — Name Normalization
**Problem:** "Pop-Up" and "Pop-UP" appeared as separate slices in the Subscriber Sources pie chart due to case-sensitive grouping.  
**Fix:** Added `normalizeSource()` function in `get-subscriber-stats.js` that maps known variants to canonical names before grouping. Handles: Pop-Up/Pop-UP/popup → "Pop-Up", page/signup page → "Page", api/import → "API".  
**File:** `netlify/functions/get-subscriber-stats.js` lines ~116-130

---

## NEW FILES

| File | Purpose |
|------|---------|
| `netlify/functions/get-popup-settings.js` | Read popup settings from Netlify Blobs |
| `netlify/functions/save-popup-settings.js` | Write popup settings to Netlify Blobs |

---

## TESTING REQUIREMENTS

1. **Monitor Tab:** Click Run Now → verify page stays on Monitor tab after success, status updates in-place
2. **About Page:** Navigate to About tab → verify textarea starts empty (or shows saved content, not hardcoded default). Click Clear → verify textarea empties
3. **Popup Settings:** Change delay to a new value via dropdown → reload page → verify value persists. Change headline → reload → verify it persists
4. **Popup Dropdown:** Verify dropdown shows options from "Immediate (0s)" through "300 seconds" in 5-second increments
5. **Email Template:** Generate a test email campaign → verify logo/QR have breathing room at top/bottom of header
6. **Growth Chart:** Navigate to Subscribers tab → verify "180 Days" button appears between 90 Days and All Time
7. **Source Chart:** Check Subscriber Sources pie chart → "Pop-Up" and "Pop-UP" should now appear as single "Pop-Up" slice

---

## PRE-DELIVERY VALIDATION RESULTS

✅ **Syntax Validation**
   - React.createElement pattern check: PASS (known false positives only)
   - Props object validation: PASS
   - Double comma check: PASS
   - All results consistent with pre-existing patterns

✅ **Structural Integrity**
   - index.html: Braces 842/842, Brackets 106/106, Parens 1492/1492
   - admin.html: Braces 1274/1274, Brackets 248/248, Parens 2224/2224

✅ **Version Consistency**
   - version.js: v2.3.1-Build10.14.8 ✓
   - index.html: v2.3.1-Build10.14.8 ✓
   - admin.html: v2.3.1-Build10.14.8 ✓
   - No old version references remaining

✅ **File Integrity**
   - All essential files present and non-empty
   - index.html: 2534 lines
   - admin.html: 4455 lines
   - version.js: 98 lines
   - 2 new functions verified

✅ **Code Review**
   - All diffs reviewed line-by-line
   - Every change maps to a planned queue item
   - Comments added explaining changes
   - No unintended modifications

✅ **Pattern Validation**
   - New Netlify Functions follow save-about-content.js / get-about-content.js patterns
   - ES module imports, error alerting, CORS headers all consistent

**VALIDATION STATUS: ALL CHECKS PASSED ✅**
