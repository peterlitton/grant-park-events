# Build10.24 Release Notes

**Version:** v2.3.1-Build10.24
**Date:** 2026-03-08
**Base:** Build10.23.1

## Overview

Four fixes: modal z-index layering, star.png/favicon transparency restoration, scroll-to-top on page navigation.

## Changes

### Fix 1: Modal z-index (line 2011)
- **Problem:** Global header (`z-[999]`) was obscuring the top of the event modal (`z-50`). Header rendered on top of the modal overlay.
- **Fix:** Changed modal overlay from `z-50` to `z-[1000]`. Modal now layers above the header.
- **No visual change** other than the modal no longer being clipped by the header.

### Fix 2: star.png transparency (assets/star.png)
- **Problem:** Build10.22 resized star.png using `PNG:` format which dropped the alpha channel. Star rendered with a white background instead of transparent.
- **Fix:** Regenerated using `PNG32:` format which preserves RGBA transparency.
- **Result:** 48x48 PNG with alpha, 3.7KB. Corner pixels are transparent.

### Fix 3: Favicon transparency (assets/common/favicon-16.png, favicon-32.png, favicon.ico)
- **Problem:** Favicons had white backgrounds (no alpha channel). The browser tab icon showed the star in a white box.
- **Fix:** Regenerated all three from `favicon-actual.png` (6000x6000 source with transparent background) using `PNG32:` format.
- **Result:** All favicons now have transparent backgrounds. Corner pixels are `srgba(0,0,0,0)`.

### Fix 4: Scroll to top on navigation (line 806)
- **Problem:** Scrolling down the homepage, then clicking About or Sign Up, loaded those pages at the same scroll position. All three views share the window scroll because they render in the same SPA root.
- **Fix:** Added `window.scrollTo(0,0)` to the existing `useEffect` that fires on `currentPage` change.
- **Result:** Every page navigation resets scroll to top.

## Files Modified
- `index.html` — 3 code changes + version bump
- `admin.html` — version bump only
- `build-version.js` — version + notes
- `CURRENT-BUILD.md` — version update
- `assets/star.png` — regenerated with transparency
- `assets/common/favicon-16.png` — regenerated with transparency
- `assets/common/favicon-32.png` — regenerated with transparency
- `assets/common/favicon.ico` — regenerated with transparency

## Testing
1. **Modal:** Click any event card on homepage. Modal should fully cover the header — no red header bar visible above the modal.
2. **Star transparency:** Check footer star icon — should have no white box behind it.
3. **Favicon:** Check browser tab — star icon should have no white box (may need hard refresh / clear cache).
4. **Scroll:** Scroll down homepage, click About. Page should load at top. Scroll down About, click logo. Homepage should load at top.

## PRE-DELIVERY VALIDATION RESULTS

✅ **Syntax Validation** — No double commas, known patterns only
✅ **Structural Integrity** — Braces 851/851, Brackets 109/109, Parens 1517/1517
✅ **Version Consistency** — v2.3.1-Build10.24 in build-version.js, index.html, admin.html, CURRENT-BUILD.md
✅ **File Integrity** — All files present, 2592 lines index.html
✅ **Config Files** — _headers, netlify.toml, _redirects all valid
✅ **Feature Registry** — 13/13 passed
✅ **Code Review** — 3 code changes, all verified in diff

**VALIDATION STATUS: ALL CHECKS PASSED ✅**
