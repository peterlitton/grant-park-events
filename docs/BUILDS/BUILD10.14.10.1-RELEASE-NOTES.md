# Build10.14.10.1 Release Notes
## RSS Feed Response Format Fix + Sitemap Redirect Cleanup

**Version:** v2.3.1-Build10.14.10.1  
**Date:** February 10, 2026  
**Previous Build:** v2.3.1-Build10.14.10  
**Built By:** Claude (Opus 4.6)

---

## Overview

Two fixes based on post-deploy diagnostics from Build10.14.10:

1. **RSS feed 502 fix** — Function was returning v1 response format with v2 export syntax
2. **Sitemap redirect removal** — Removed stale-cached vanity URL that nothing references

---

## Fix 1: RSS Feed 502 → Working Feed

### Root Cause (confirmed by Netlify function logs)

```
NetlifyUserError: Function returned an unsupported value.
Accepted types are 'Response' or 'undefined'
```

`rss-feed.js` (created Build71) used `export default` (Netlify Functions v2) but returned `{ statusCode: 200, headers: {...}, body: xml }` (v1 format). Functions v2 requires `new Response(body, { status, headers })`.

This bug existed since Build71 but was never triggered because `/rss.xml` was caught by the `/*` catch-all and served the React app. Build10.14.9 added a redirect that routed `/rss.xml` to the function, exposing the pre-existing bug.

### Fix

All three return statements rewritten to match `sitemap-events.js` (the known working pattern):

| Before (v1 — crashes) | After (v2 — works) |
|---|---|
| `return { statusCode: 200, body: xml }` | `return new Response(xml, { status: 200 })` |

Also fixed:
- Function parameter renamed `event` → `req` to avoid shadowing with `.filter(event => ...)` callback
- Consistent `charset=utf-8` on all Content-Type headers

---

## Fix 2: Sitemap Redirect Removal

### Why Removed

`/sitemap-events.xml` redirect was added in Build10.14.9 but served stale CDN cache (homepage-only XML from a prior deploy). Investigation showed:

- **Nothing references this path** — `sitemap.xml` points to `/.netlify/functions/sitemap-events` (direct function URL)
- **Google uses the direct function URL** — confirmed working, returns 79+ events
- **The vanity path is cosmetic** — fighting CDN cache for a URL nothing uses is wasted effort

The working sitemap chain is completely untouched:
- `sitemap.xml` (static) → references `/.netlify/functions/sitemap-events`
- `/.netlify/functions/sitemap-events` → generates events from Blobs
- Google Search Console follows this chain

---

## Files Changed

| File | Change |
|------|--------|
| `netlify/functions/rss-feed.js` | All returns: v1 → v2 format. Param rename. |
| `_redirects` | Removed `/sitemap-events.xml` redirect. Kept `/rss.xml`. |
| `build-version.js` | Updated to Build10.14.10.1 |
| `version.js` | Added Build10.14.10.1 to history |
| `docs/SOPs/PROJECT-STANDARDS.md` | Updated current stable |
| `docs/METRICS/build-metrics-raw.csv` | Added Build10.14.10.1 entry |

---

## Testing Requirements

### RSS Feed (primary AC)
1. Visit `https://www.grantparkevents.com/rss.xml` → should show XML feed with events (not 502)
2. Visit `https://www.grantparkevents.com/.netlify/functions/rss-feed` → same result

### Sitemap (regression check — should be unchanged)
3. `https://www.grantparkevents.com/sitemap.xml` → still shows sitemap index
4. `https://www.grantparkevents.com/.netlify/functions/sitemap-events` → still returns 79+ events

### General regression
5. Site loads, events navigate normally
6. View Page Source on any event page → canonical shows event URL (edge function still working)

---

## Success Criteria

- [ ] `/rss.xml` returns XML feed (not 502)
- [ ] `/.netlify/functions/rss-feed` returns XML feed
- [ ] `sitemap.xml` unchanged
- [ ] `/.netlify/functions/sitemap-events` still returns all events
- [ ] Site functions normally
- [ ] Edge function canonical fix still working

---

## PRE-DELIVERY VALIDATION RESULTS

✅ **Syntax Validation**
   - Double comma check (all HTML files): PASS
   - No v1 response patterns in rss-feed.js code: PASS (only in comment)
   - Three `new Response()` returns confirmed

✅ **Structural Integrity**
   - index.html: Braces 851/851, Brackets 108/108, Parens 1515/1515
   - admin.html: Braces 1289/1289, Brackets 260/260, Parens 2282/2282
   - admin-index-report.html: Braces 264/264, Brackets 41/41, Parens 478/478
   - rss-feed.js: Braces 53/53, Parens 109/109
   - seo-canonical.js: Braces 7/7, Parens 17/17

✅ **Version Consistency (Single-Source)**
   - build-version.js: v2.3.1-Build10.14.10.1
   - No hardcoded BUILD_VERSION in HTML files
   - No hardcoded CACHE_VERSION in sw.js
   - All 3 consumer files reference build-version.js

✅ **File Integrity**
   - All essential files present
   - Line counts reasonable
   - Release notes in docs/BUILDS/ (not root)

✅ **Code Review**
   - Full diff against Build10.14.10 reviewed
   - 6 files changed, all accounted for
   - No unintended modifications

✅ **Pattern Validation**
   - rss-feed.js matches sitemap-events.js pattern exactly (export, import, Response format)
   - _redirects ordering correct (rss before catch-all)
   - Sitemap chain untouched

**VALIDATION STATUS: ALL CHECKS PASSED ✅**

Build ready for delivery.
