# Build10.33.2 Release Notes
## Email Template Updates + PNG Export Fix

**Version:** v2.3.1-Build10.33.2
**Date:** 2026-05-31
**Type:** Feature enhancement + bug fix

---

## Changes

### 1. Email Template: "This Week's Events" section heading

**File:** `netlify/functions/generate-email-html.js`

Added a centered heading above the events list: "This Week's Events" (initial caps). Styled as `<h1>` at 22px bold, matching the campaign headline tag but slightly smaller to establish visual hierarchy.

### 2. Email Template: Event title and date sizing

**File:** `netlify/functions/generate-email-html.js`

- Event titles: 20px (original) → **26px**, red (#d32f2f), bold
- Date/time links: 15px (original) → **18px**, blue (#1976d2)

Sizes selected using an interactive slider tool against the live email layout.

### 3. Email Template: End times with smart AM/PM

**File:** `netlify/functions/generate-email-html.js`

Date/time links now display end times when available:
- Both PM: `9:00 - 9:15pm` (strips redundant pm from start)
- Both AM: `9:00 - 9:15am` (strips redundant am from start)
- AM to PM: `9:00am - 9:15pm` (keeps both)
- No end time: shows start time only

### 4. PNG Export: Replaced iframe with div

**File:** `admin.html`

The Export PNG function previously rendered email HTML in a hidden iframe. The iframe's `about:blank` origin prevented images (specifically the logo) from loading — the logo was consistently missing from exported PNGs while all other images rendered.

**Root cause:** `iframeDoc.write()` creates a document with `about:blank` as its origin. Relative image URLs cannot resolve against this origin. The base64 conversion pipeline that was supposed to pre-convert images to data URIs was also failing for the logo due to a JPEG/PNG MIME type mismatch (the logo file `gpe-logo-email.png` is actually a JPEG, from Build10.27.4).

**Fix:** Replaced the iframe with a hidden `<div>` in the current document. Images load naturally from the same origin — no base64 conversion pipeline, no Canvas workarounds, no embedded data URIs. The entire base64 conversion loop (40+ lines) and iframe setup were removed.

This is how html2canvas is designed to be used — capturing elements in the current document. The iframe was the unusual approach.

**Lines removed:** 70 (from 5245 to 5175 in admin.html)

## Files Changed

| File | Change |
|------|--------|
| `netlify/functions/generate-email-html.js` | "This Week's Events" heading, event sizing 26/18px, end times, smart AM/PM |
| `admin.html` | PNG export: iframe → div, removed base64 pipeline + version bump |
| `build-version.js` | Version bump |
| `index.html` | Version bump |
| `admin-dashboard.html` | Version bump |
| `CURRENT-BUILD.md` | Version bump |

## Testing After Deploy

1. **Email Preview:** Admin → Emails → Edit campaign → Preview
   - "This Week's Events" heading visible above events
   - Event titles in red at 26px, date/time links at 18px
   - End times shown with hyphen and smart AM/PM formatting
   - All event links resolve to correct event pages
2. **PNG Export:** Admin → Emails → Export PNG
   - Logo appears in top-left
   - All images render (hero, QR code, logo)
   - Layout matches the HTML preview
3. **Copy HTML:** Verify pasted HTML renders correctly in MailerLite

## Risk Assessment

| Item | Risk | Mitigation |
|------|------|------------|
| Div rendering differs from iframe | Low | html2canvas is designed for div capture; iframe was the unusual approach |
| Email template font sizes too large/small in email clients | Low | Sizes tested with interactive slider tool against actual layout |
| Smart AM/PM logic edge case | Low | Three clear conditions; no PM-to-AM case exists in event data |

## Rollback

Redeploy Build10.33 (pre-email changes). Email template reverts to original sizes, no "This Week's Events" heading, no end times. PNG export reverts to iframe approach (logo will be missing).

---

## PRE-DELIVERY VALIDATION RESULTS

✅ Syntax: All HTML files clean, generate-email-html.js and seo-canonical.js pass
✅ Structure: index.html 918/918 braces, admin.html 1475/1475, admin-dashboard.html 173/173
✅ Versions: All 4 locations + CURRENT-BUILD.md at v2.3.1-Build10.33.2
✅ File integrity: GOOGLE-CREDENTIALS.json absent
✅ Config files: _headers, netlify.toml, _redirects valid
✅ Feature registry: All features present
✅ Step 4d: No files removed vs previous build
✅ Visual diff: 7 file changes + 3 new release notes, all intentional

**VALIDATION STATUS: ALL CHECKS PASSED ✅**
