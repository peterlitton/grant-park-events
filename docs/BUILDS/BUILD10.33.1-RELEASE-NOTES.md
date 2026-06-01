# Build10.33.1 Release Notes
## Email Template Updates + PNG Export Logo Fix

**Version:** v2.3.1-Build10.33.1
**Date:** 2026-05-31
**Type:** Feature enhancement + bug fix

---

## Changes

### 1. Email Template: "This Week's Events" section heading

**File:** `netlify/functions/generate-email-html.js`

Added a centered heading above the events list in generated email HTML. Styled to match the campaign headline (same `<h1>` tag), at 22px.

### 2. Email Template: Event title and date sizing

**File:** `netlify/functions/generate-email-html.js`

Iterated through multiple rounds of sizing feedback:
- Event titles: 20px (original) → 22px, color changed from red (#d32f2f) back to red after testing black
- Date/time links: 15px (original) → 16px

### 3. Email Template: End time display with smart AM/PM

**File:** `netlify/functions/generate-email-html.js`

Date/time links now show end times when available, with intelligent AM/PM formatting:
- Both PM: `9:00 - 9:15pm` (strips redundant "pm" from start)
- Both AM: `9:00 - 9:15am` (strips redundant "am" from start)
- AM to PM: `9:00am - 9:15pm` (keeps both indicators)
- No end time: `9:00pm` (unchanged)

### 4. PNG Export: Logo not rendering

**File:** `admin.html`

The Export PNG function renders email HTML in a hidden iframe using `iframeDoc.write()`. This iframe's base URL is `about:blank`, so any images that fail base64 conversion have their relative URLs (e.g., `/assets/common/gpe-logo-email.png`) resolve against `about:blank` instead of the site — causing them to silently fail to load. The logo was consistently affected.

**Fix:** Inject a `<base href>` tag pointing to `window.location.origin` into the iframe HTML before rendering. This ensures relative URLs fall back to the correct origin if base64 conversion fails for any image.

## Files Changed

| File | Change |
|------|--------|
| `netlify/functions/generate-email-html.js` | "This Week's Events" heading, event sizing, end times, smart AM/PM |
| `admin.html` | PNG export `<base>` tag fix + version bump |
| `build-version.js` | Version bump |
| `index.html` | Version bump |
| `admin-dashboard.html` | Version bump |
| `CURRENT-BUILD.md` | Version bump |
| `docs/BUILDS/BUILD10.33-RELEASE-NOTES.md` | Added (was missing from repo) |

## Testing After Deploy

1. **Email Preview:** Admin → Emails → Edit a campaign with events → Preview
   - Verify "This Week's Events" heading appears above events, initial caps, smaller than campaign headline
   - Event titles in red at readable size
   - Date/time links show end times with hyphen (e.g., "Wednesday, June 3, 9:00 - 9:15pm")
   - All event links resolve to correct event pages (not homepage)
2. **PNG Export:** Admin → Emails → Export PNG
   - Verify the GPE logo appears in the top-left of the exported PNG
   - Hero image, QR code, and all event text should also render
3. **Copy HTML:** Verify the copied HTML pastes correctly into MailerLite Custom HTML Editor

---

## PRE-DELIVERY VALIDATION RESULTS

✅ Syntax: All files clean, generate-email-html.js passes
✅ Structure: index.html 918/918, admin.html 1482/1482, admin-dashboard.html 173/173
✅ Versions: All 4 locations + CURRENT-BUILD.md at v2.3.1-Build10.33.1
✅ File integrity: GOOGLE-CREDENTIALS.json absent
✅ Config files: _headers, netlify.toml, _redirects valid
✅ Feature registry: All features present
✅ Step 4d: No files removed
✅ Visual diff: 7 changes, all intentional

**VALIDATION STATUS: ALL CHECKS PASSED ✅**
