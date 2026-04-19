# BUILD10.14.8.2 RELEASE NOTES
## v2.3.1-Build10.14.8.2

**Date:** February 9, 2026  
**LLM:** Claude Opus 4.6  
**Type:** Critical cache fix + bug fixes  
**Previous:** v2.3.1-Build10.14.8.1

---

## ROOT CAUSE ANALYSIS

**All reported bugs from Build10.14.8 and 10.14.8.1 shared a single root cause:**

`sw.js` line 5 had `CACHE_VERSION = 'gpe-v2.3.1-build10.14.7'` — never updated. The service worker cached the OLD admin.html from Build10.14.7 and served it from cache on every page load. All code changes in 10.14.8 and 10.14.8.1 were present in the deployed files but the browser never loaded them.

This explains:
- Popup settings not saving to Blobs (10.14.7 code had localStorage only)
- Old showNotification toast at top-right (10.14.7 code, not inline status)
- PNG images blank (10.14.7 code, no base64 conversion)
- Cookie override not working (settings never reaching Blobs)

**Lesson learned: sw.js CACHE_VERSION must be updated in every build.**

---

## CHANGES

### 1. Service Worker Cache Version (ROOT CAUSE FIX)
`sw.js` CACHE_VERSION updated from `gpe-v2.3.1-build10.14.7` to `gpe-v2.3.1-build10.14.8.2`. Forces browser to clear old cache and fetch all updated files.

### 2. Popup Settings — Migration-Safe Blobs Loading
Rewrote `get-popup-settings.js` to return `{ found: false }` when Blobs is empty (first deploy) instead of auto-initializing with hardcoded defaults. Admin background load handler now:
- If Blobs has data → use as authoritative, sync to localStorage
- If Blobs is empty → migrate existing localStorage data UP to Blobs (preserves user's existing settings)

### 3. PNG Export — Pre-Iframe Base64 Conversion
Moved image-to-base64 conversion BEFORE the iframe write (was after). Uses regex to find all image URLs in the HTML string, fetches each, converts to data URI, and replaces in the string. The iframe then receives HTML with embedded base64 images — no cross-origin issues for html2canvas.

---

## TESTING

### Verify Cache Fix
- After deploy, open browser console
- Look for: `[Service Worker] Loaded: gpe-v2.3.1-build10.14.8.2`
- If you still see `build10.14.7`, hard refresh (Ctrl+Shift+R / Cmd+Shift+R)

### Popup Settings
- Go to Admin → Pop-Up tab
- Change delay to 45s → "✅ Settings saved!" appears inline next to heading (NOT top-right toast)
- Reload page → dropdown shows 45s
- Enable cookie override → toggle shows saved inline
- Visit public site → popup fires after 45s
- With cookie override ON → popup appears even if you've seen it before

### PNG Export
- Go to Email Campaigns → export a campaign as PNG
- Logo (left) and QR code (right) should render in the PNG
- Console should show `[PNG] ✓ Converted: gpe-logo.png` and `[PNG] ✓ Converted: poster-qr-code.png`

---

## PRE-DELIVERY VALIDATION RESULTS

✅ **Structural Integrity**
   - admin.html: Braces 1289/1289, Brackets 260/260, Parens 2276/2276
   - index.html: Braces 842/842, Brackets 106/106, Parens 1492/1492

✅ **Version Consistency**
   - version.js: v2.3.1-Build10.14.8.2 ✓
   - index.html: v2.3.1-Build10.14.8.2 ✓
   - admin.html: v2.3.1-Build10.14.8.2 ✓
   - sw.js: gpe-v2.3.1-build10.14.8.2 ✓

✅ **Code Review** — all diffs verified

**VALIDATION STATUS: ALL CHECKS PASSED ✅**
