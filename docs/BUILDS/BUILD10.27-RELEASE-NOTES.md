# Build10.27 Release Notes

**Version:** v2.3.1-Build10.27
**Date:** 2026-03-12
**Base:** Build10.26.1

## Overview

Email campaign enhancements: mobile-responsive template, clickable logo/hero images, Link button in rich text toolbar, and link support in paste cleanup.

## Changes

### 1. Mobile-Responsive Email Template (generate-email-html.js)
- **Problem:** Email text appeared too small on mobile. The 600px fixed-width table was being scaled down by mobile email clients.
- **Fix:** Changed main container from `width="600"` to `style="width:100%;max-width:600px;"`. On mobile, the table renders at screen width instead of being scaled.
- Also bumped Text field font from 16px to 18px for better mobile readability.

### 2. Clickable Logo and Hero Image (generate-email-html.js)
- Logo image wrapped in `<a href="https://www.grantparkevents.com" target="_blank">`.
- Hero image (when present) wrapped in the same link.
- Both link to the homepage.

### 3. Link Button in Toolbar (admin.html)
- Added "🔗 Link" button to EventFieldToolbar (appears on all rich text fields: Description, Featuring, Programming, Text).
- **New link:** Select text → click Link → enter URL in prompt → creates `<a>` tag.
- **Edit existing link:** Select linked text → click Link → shows current URL → enter new URL or type "remove" to unlink.
- Uses `document.execCommand('createLink')` and `document.execCommand('unlink')`.

### 4. Link Support in Paste Cleanup (admin.html)
- Added `A` to `allowedTags` in `cleanPastedHTML`.
- When pasting content with links, the `href` attribute is preserved (all other attributes stripped).
- `target="_blank"` added to all preserved links for safety.

## Files Modified
- `admin.html` — Link button in toolbar + paste cleanup (5024 lines, +36 from base)
- `netlify/functions/generate-email-html.js` — responsive width, logo/hero links, text font size
- `build-version.js` — version + notes + date
- `index.html` — version bump only
- `CURRENT-BUILD.md` — version + date

## Testing

### Email Template
1. Create a campaign with all fields → Preview → logo and hero should be clickable (open homepage)
2. Preview on mobile device or resize browser — text should be readable, not tiny
3. Create text-only campaign (no hero/events) → Preview → should render cleanly

### Link Button
1. Go to any event edit form (Description, Featuring, Programming) or campaign Text field
2. Type some text, select a word → click 🔗 Link → enter a URL → word becomes a link
3. Select the linked word → click 🔗 Link → should show current URL with edit/remove options
4. Type "remove" → link should be removed, text stays
5. Paste content with links from a webpage → links should be preserved

## PRE-DELIVERY VALIDATION RESULTS

✅ **Syntax Validation** — No double commas in admin.html or index.html
✅ **Structural Integrity** — admin.html braces 1443/1443, parens 2558/2558, brackets 305/305; index.html braces 915/915, parens 1653/1653
✅ **Version Consistency** — v2.3.1-Build10.27 in build-version.js, index.html, admin.html, CURRENT-BUILD.md
✅ **File Integrity** — All files present, index.html 2699 lines, admin.html 5024 lines
✅ **Config Files** — _headers, netlify.toml, _redirects all valid
✅ **Feature Registry** — All checks passed
✅ **Code Review** — All diffs verified: admin.html (toolbar + paste), generate-email-html.js (responsive + links + font), index.html (version only)

**VALIDATION STATUS: ALL CHECKS PASSED ✅**
