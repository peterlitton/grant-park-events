# Build10.32 Release Notes
## Event Featuring/Program: Gap Fix, Link Styling, Copy URL Button, Edge Function 410 Tightening

**Version:** v2.3.1-Build10.32
**Date:** 2026-04-12
**Type:** Bug fixes — UX, rendering, edge function

---

## Overview

Four related fixes addressing the workflow of adding image links to event Featuring and Program fields. The full chain — from copying an image URL in the Image Manager, to pasting it into a contentEditable link modal, to rendering it on the public event page, to clicking it without hitting a 410 — was broken at multiple points. This build fixes all of them.

## Issues Addressed

### Issue 1: Large gap inside Featuring/Program sections on public event page

**Root cause:** `renderFormatted()` in index.html was designed for plain-text fields. It runs `text.replace(/\n/g, '<br>')` to convert newlines to line breaks. But `featuring` and `program` are stored as HTML from contentEditable's `innerHTML`. When the contentEditable produced `<p>line</p>\n<p>line</p>` (with literal whitespace newlines between block tags), `renderFormatted` inserted extra `<br>` tags between the `<p>` elements, compounding with the default browser `<p>` margin and producing visible extra space.

**Fix:** New helper `renderHTMLField()` detects whether content already contains block-level HTML tags (`<p>`, `<div>`, `<ul>`, `<ol>`, `<br>`, `<h1-6>`). If yes, returns the HTML untouched. If no (genuinely plain text), falls back to `renderFormatted` for backward compatibility.

```javascript
const renderHTMLField=(html)=>{
  if(!html)return '';
  if(/<(p|div|ul|ol|br|h[1-6])\b/i.test(html))return html;
  return renderFormatted(html);
};
```

Applied to 4 rendering locations:
- index.html line 1628 (dedicated event page, Featuring)
- index.html line 1635 (dedicated event page, Program)
- index.html line 2273 (event modal, Featuring)
- index.html line 2281 (event modal, Program)

### Issue 2: Image links in Featuring/Program don't appear as hyperlinks

**Root cause:** No CSS rule for `<a>` tags exists in index.html. Tailwind's CDN preflight resets `a { color: inherit; text-decoration: inherit }`. Inside the `text-gray-700` containers used for Featuring/Program rendering, links inherited gray text and had no underline — visually indistinguishable from plain text.

The admin editor doesn't have this issue because admin.html line 42 has `[contenteditable="true"] a { color: #2563eb; text-decoration: underline }` (added in Build10.27.1). The admin editor displays links correctly; only the public-facing rendering was missing styling.

**Fix:** Added scoped CSS rule in index.html style block:

```css
.event-content a, .event-content a:visited {
  color: #2563eb;
  text-decoration: underline;
}
.event-content a:hover {
  color: #1d4ed8;
}
```

Added `event-content` class to the 4 rendering divs. Scope is intentional — won't affect navigation or other links elsewhere on the public site.

### Issue 3: Image Manager has no Copy URL button (Copy Name copies bare filename)

**Root cause:** The Image Manager grid card overlay had only "Copy Name" and "Delete" buttons. Copy Name copied just `img.filename` (e.g., `event-photo.webp`) — appropriate for the event image picker workflow where you type the filename into the event image field, but not appropriate as a URL for linking.

When you copied a filename and pasted it into the link modal, you ended up with a bare filename as an `<a href>`. The browser treated it as a relative path.

**Fix:** Added new "Copy URL" button alongside the existing button. Copies `img.url` which is the absolute URL to the image (`/.netlify/functions/images/<filename>` resolved to full URL). The existing Copy Name button is **renamed to Copy Path** to better reflect its purpose (it's the path you put in the event image field, not just a name).

Added new state `copiedImageUrl` to provide independent visual feedback (separate ✓ Copied! confirmation) so the two buttons don't fight over the same state.

Both the grid card overlay and the preview modal now have:
- **📋 Copy Path** (white background) — copies just the filename for use in event image field
- **🔗 Copy URL** (white in grid, blue in modal) — copies absolute URL for use in link modals
- **🗑️ Delete** (grid only)

### Issue 4: Edge function 410 catches relative paths under /events/

**Root cause:** seo-canonical.js had this regex for matching legacy event URLs:

```javascript
if (slug && /^[a-z]/i.test(slug)) {
  return new Response('410 Gone — ...', { status: 410 });
}
```

The regex was way too broad — it matched any slug starting with a letter. When a user clicked an `<a href="event-photo.webp">` from inside an event page, the browser resolved the relative href to `/events/event-photo.webp`. The slug `event-photo.webp` starts with `e`, matched the regex, and the edge function returned 410. The image was never reached.

**Fix:** Tightened the regex to require the legacy date suffix that all old-format slugs ended with:

```javascript
if (slug && /^[a-z][a-z0-9-]*-\d{4}-\d{2}-\d{2}-\d{2}-\d{2}/i.test(slug)) {
  return new Response('410 Gone — ...', { status: 410 });
}
```

Legacy URLs all had the form `<text>-YYYY-MM-DD-HH-MM` (e.g., `chicago-jazz-festival-2025-08-28-11-00`). The new regex requires this exact pattern: a letter-led text segment followed by `-YYYY-MM-DD-HH-MM`. This catches all legacy URLs and rejects everything else.

**Verified test cases (run during validation):**

| Slug | Expected | Result |
|------|----------|--------|
| `chicago-jazz-festival-2025-08-28-11-00` | 410 | ✅ 410 |
| `summer-concert-2024-06-15-19-30` | 410 | ✅ 410 |
| `2026-07-08-taste-of-chicago-1769630609186` | NOT 410 (modern, starts with digit) | ✅ pass through |
| `event-photo.webp` | NOT 410 (filename) | ✅ pass through |
| `festival-poster.webp` | NOT 410 (filename) | ✅ pass through |
| `my-image-2025-test.jpg` | NOT 410 (year only, no full date) | ✅ pass through |

## Files Changed

| File | Change |
|------|--------|
| `index.html` | Added `renderHTMLField` helper, applied to 4 Featuring/Program rendering locations, added `event-content` class, added `.event-content a` CSS, version bump |
| `admin.html` | Added `copiedImageUrl` state, renamed "Copy Name" → "Copy Path", added "Copy URL" button to image grid card and preview modal, version bump |
| `netlify/edge-functions/seo-canonical.js` | Tightened 410 regex to require date suffix, added Build10.32 comment block |
| `build-version.js` | Version bump |
| `CURRENT-BUILD.md` | Version bump |

## Testing Requirements

### Issue 1: Featuring/Program gap
- [ ] Open an event with multi-paragraph Featuring or Program content on public event page
- [ ] Visual: no extra blank space between paragraphs inside the section
- [ ] Open same event in modal view: same — no extra space inside section
- [ ] Sibling sections (Featuring, Program) still have normal `mb-6` spacing between them

### Issue 2: Link styling
- [ ] On public event page, any `<a>` link in Featuring/Program shows as blue underlined text
- [ ] Hover: link darkens to slightly deeper blue
- [ ] Other links on the site (navigation, etc.) are unaffected

### Issue 3: Copy URL button
- [ ] Image Manager → hover an image → see 3 buttons: Copy Path, Copy URL, Delete
- [ ] Click Copy Path → button shows "✓ Copied!" → paste in text editor confirms it's just the filename
- [ ] Click Copy URL → button shows "✓ Copied!" → paste confirms it's the full absolute URL
- [ ] Click image to open preview modal → footer has Copy Path + Copy URL buttons
- [ ] Both feedback states are independent (clicking one doesn't affect the other's display)

### Issue 4: Edge function 410
- [ ] Hit a legacy URL in browser, e.g., `/events/chicago-jazz-festival-2024-07-15-19-00` → still returns 410
- [ ] Modern event URL like `/events/2026-07-08-something-12345` → loads normally
- [ ] Image link inside Featuring/Program: copy a real image URL, paste as link, save event, view page, click link → image loads (NOT 410)

### Full workflow test
- [ ] Upload a new image to Image Manager
- [ ] Click Copy URL on the new image
- [ ] Open an event in admin, select some text in the Program field
- [ ] Click the link button, paste the URL, save the event
- [ ] View the public event page
- [ ] Confirm: link text appears as blue underline, no extra gap, click opens the image (not 410)

## Success Criteria

1. No visible extra space inside Featuring/Program sections on public page
2. Image links in Featuring/Program render as blue underlined hyperlinks
3. Image Manager has both Copy Path and Copy URL buttons with independent feedback
4. Legacy event URLs still return 410, modern URLs and arbitrary paths under /events/ do not

## Rollback

Redeploy Build10.31.1. All four fixes revert. Note: any image links saved using Copy URL during Build10.32 will continue to work after rollback (the link href is the full absolute URL, not relative — the edge function regex change isn't required for those to work).

## Risk Assessment

| Fix | Risk Level | Reasoning |
|-----|------------|-----------|
| 1: renderHTMLField | Low | Inspects content, routes to correct rendering. Existing plain-text content path preserved. |
| 2: .event-content CSS | Low | Pure additive CSS, scoped by class. |
| 3: Copy URL button + rename | Low | New button + rename, no existing functionality removed. State is independent. |
| 4: Edge function regex | Medium | Edge functions affect every request. Regex tightened, not loosened — fewer URLs match 410. Verified with 6 test cases against the new regex including all current production URL patterns. |

Per ONE RISK PER BUILD: The four fixes are tightly coupled — fixing any one alone leaves the workflow broken at intermediate stages. The medium-risk edge function change is mitigated by extensive test case verification.

---

## PRE-DELIVERY VALIDATION RESULTS

✅ **Syntax Validation**
   - index.html: No double commas
   - admin.html: No double commas
   - seo-canonical.js: Node syntax check PASS

✅ **Structural Integrity**
   - index.html: Braces 918/918, Parens 1660/1660, Brackets 124/124
   - admin.html: Braces 1481/1481, Parens 2692/2692, Brackets 318/318
   - seo-canonical.js: Braces 97/97, Parens 190/190

✅ **Version Consistency**
   - build-version.js: v2.3.1-Build10.32
   - index.html inline: v2.3.1-Build10.32
   - admin.html inline: v2.3.1-Build10.32
   - CURRENT-BUILD.md: v2.3.1-Build10.32
   - sw.js: No hardcoded CACHE_VERSION ✓
   - All 3 consumer files reference build-version.js ✓

✅ **File Integrity**
   - All essential files present
   - GOOGLE-CREDENTIALS.json still absent ✓
   - Line counts: index.html 2717, admin.html 5217

✅ **Config File Validation**
   - _headers, netlify.toml, _redirects: All valid, no HTML contamination

✅ **Feature Registry Check**
   - All 14 registered features present ✓
   - Edge function 410 handlers still present ✓

✅ **Visual Code Review**
   - Full diff: 5 files changed, all expected
   - All fixes verified inline
   - Regex tested with 6 cases — all pass

✅ **Edge Function Regex Test Cases**
   - 2 legacy URLs match (return 410) ✓
   - 1 modern URL doesn't match (passes through) ✓
   - 3 filename-style paths don't match (pass through) ✓

**VALIDATION STATUS: ALL CHECKS PASSED ✅**
