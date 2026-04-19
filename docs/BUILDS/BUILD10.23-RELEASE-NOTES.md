# Build10.23 Release Notes

**Version:** v2.3.1-Build10.23
**Date:** 2026-03-07
**Base:** Build10.22

## Overview

Three zero-risk fixes: absolute paths for preload and favicon HTML attributes, fetchpriority hint on dedicated event page hero image. Also includes updated PROJECT-STANDARDS.md v2.4 with new development process rules.

## Changes

### Fix 1: Preload path (line 62)
- **Problem:** `<link rel="preload" href="assets/common/gpe-logo.png">` used a relative path. On `/events/*` pages, the browser resolved this to `/events/assets/common/gpe-logo.png`, which the edge function matched as an old-format event URL (slug starts with 'a') and returned 410 Gone. This caused console errors and dropped Best Practices from 100 to 96.
- **Fix:** Changed to `href="/assets/common/gpe-logo.png"` (added leading slash).
- **Same class of fix as:** Build10.22 star.png path correction (confirmed working).

### Fix 2: Favicon/icon paths (lines 79-88)
- **Problem:** Six `<link>` tags for favicons and icons used relative `href="assets/common/..."` paths. Same 410 risk as Fix 1 on event pages, though not flagged by PSI.
- **Fix:** Added leading `/` to all six paths.
- **Files affected:** favicon.ico, favicon-16.png, favicon-32.png, icon-180.png, icon-192.png, icon-512.png

### Fix 3: Dedicated page hero fetchpriority (line 1526)
- **Problem:** PSI flagged "fetchpriority=high should be applied" on the dedicated event page hero image.
- **Fix:** Added `fetchpriority:'high'` to the hero img element. Same attribute already used on card view first image since Build10.21.
- **Note:** PSI may still flag this due to React client-side rendering (PSI evaluates static HTML before JS executes). The attribute is harmless either way.

### Documentation: PROJECT-STANDARDS.md v2.4
- Added four new development process rules derived from Build10.22 session lessons:
  - Investigation Before Recommendation
  - Rendering Context Rule
  - One Risk Per Build
  - Preview Before Production for New Techniques

## Files Modified
- `index.html` — 3 fixes + version bump
- `admin.html` — version bump only
- `build-version.js` — version + notes
- `CURRENT-BUILD.md` — version update
- `docs/SOPs/PROJECT-STANDARDS.md` — v2.3 → v2.4

## Testing Requirements
1. **Primary validation:** Run PSI on `https://www.grantparkevents.com/events/2026-05-24-sue-os-music-festival-1770252009652`
   - Best Practices should go from 96 → 100
   - "Browser errors logged to console" should no longer show gpe-logo.png 410
2. **Visual check:** Logo and favicons render correctly on homepage and event pages
3. **No regression:** Homepage should match Build10.22 scores

## PRE-DELIVERY VALIDATION RESULTS

✅ **Syntax Validation**
   - React.createElement pattern check: PASS (known SVG patterns only)
   - Props object validation: PASS
   - String quote validation: PASS
   - Trailing comma check: PASS
   - Element type validation: PASS (regex patterns only)

✅ **Structural Integrity**
   - Brace matching: PASS (851 open, 851 close)
   - Bracket matching: PASS (108 open, 108 close)
   - Parenthesis matching: PASS (1516 open, 1516 close)

✅ **Version Consistency (Single-Source)**
   - build-version.js: v2.3.1-Build10.23
   - index.html inline (CDN-proof fallback): v2.3.1-Build10.23
   - admin.html inline (CDN-proof fallback): v2.3.1-Build10.23
   - sw.js: derives CACHE_VERSION from BUILD_VERSION via importScripts
   - All 3 consumer files reference build-version.js: Verified

✅ **File Integrity**
   - All essential files present: Verified
   - index.html: 2591 lines (reasonable)
   - build-version.js: 25 lines
   - Release notes: docs/BUILDS/BUILD10.23-RELEASE-NOTES.md

✅ **Config File Content (4b)**
   - _headers: valid (no HTML contamination)
   - netlify.toml: valid (no HTML contamination)
   - _redirects: valid (no HTML contamination)

✅ **Feature Registry (4c)**
   - 13/13 feature checks passed

✅ **Code Review**
   - Diff reviewed: 8 changed lines in index.html (7 path fixes + 1 fetchpriority)
   - 1 changed line in admin.html (version)
   - 2 changed lines in build-version.js (version + notes)
   - No stray edits

**VALIDATION STATUS: ALL CHECKS PASSED ✅**
