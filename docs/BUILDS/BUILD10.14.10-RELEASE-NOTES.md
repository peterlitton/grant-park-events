# Build10.14.10 Release Notes
## Server-Side Canonical Fix via Edge Function + Sitemap Routing

**Version:** v2.3.1-Build10.14.10  
**Date:** February 10, 2026  
**Previous Build:** v2.3.1-Build10.14.9  
**Built By:** Claude (Opus 4.6)

---

## Overview

This build addresses two SEO issues discovered via Google Search Console diagnostic data:

1. **"Page with redirect" status on event pages** — caused by a hardcoded canonical URL pointing to the homepage in raw HTML, which Google interprets as a redirect signal
2. **`/sitemap-events.xml` serving React app** — the `/*` catch-all redirect intercepts `.xml` requests before they reach serverless functions

---

## Problem 1: Canonical URL in Raw HTML

### Root Cause

`index.html` line 13 contains:
```html
<link rel="canonical" href="https://www.grantparkevents.com/">
```

Because GPE is a single-page app, ALL routes (`/events/*`, `/about`, `/signup`) serve this same `index.html`. Google's crawler reads the raw HTML first (before JavaScript renders), sees every event page claiming its canonical URL is the homepage, and reports "Page with redirect."

Build10.14.9 added a JavaScript fix that updates the canonical after React renders, but per Google's December 2025 documentation update:
> "Canonicals present in raw HTML are processed earlier and more reliably than JavaScript-injected ones."

Conflicting signals between raw HTML and JS-rendered canonical lead to unpredictable indexing.

### Solution: Netlify Edge Function

A new Edge Function (`netlify/edge-functions/seo-canonical.js`) intercepts requests to `/events/*`, `/about`, and `/signup` at the CDN edge — BEFORE the response reaches the browser or crawler.

**How it works:**
1. Request arrives at Netlify CDN for `/events/2026-07-17-faur-requiem-12`
2. Edge Function fires (runs before redirects/static content)
3. `context.next()` chains through the redirect rules, gets `index.html` content
4. Function replaces the hardcoded canonical with the correct URL
5. Also replaces the hardcoded `og:url` meta tag (same issue)
6. Google receives raw HTML with correct `<link rel="canonical">` matching the request URL

**What Google now sees (raw HTML):**
```html
<link rel="canonical" href="https://www.grantparkevents.com/events/2026-07-17-faur-requiem-12">
<meta property="og:url" content="https://www.grantparkevents.com/events/2026-07-17-faur-requiem-12">
```

**Safety:** `onError: "bypass"` — if the edge function fails for any reason, the page serves normally (just without the fix). No downtime risk.

**JS canonical fix retained:** The JavaScript fix from Build10.14.9 (lines 925-926, 987-988) stays in place. Now raw HTML and JS-rendered canonical agree — exactly what Google recommends.

---

## Problem 2: XML Feed Routing

### Root Cause

The `/*` catch-all redirect in `_redirects` matches everything, including `/sitemap-events.xml` and `/rss.xml`. These paths should route to serverless functions but instead serve the React app.

Note: The root `/sitemap.xml` is a static file and is served correctly. The sitemap index references `/.netlify/functions/sitemap-events` which also works. But `/sitemap-events.xml` as a direct URL was broken.

### Solution

Added explicit redirects BEFORE the catch-all:
```
/sitemap-events.xml  /.netlify/functions/sitemap-events  200
/rss.xml             /.netlify/functions/rss-feed         200
```

Netlify processes `_redirects` top-to-bottom, first match wins.

---

## Files Changed

| File | Change |
|------|--------|
| `netlify/edge-functions/seo-canonical.js` | Updated: added og:url replacement, moved config inline, updated build reference |
| `_redirects` | Added sitemap + RSS redirects before catch-all, updated header |
| `netlify.toml` | Removed edge function declarations (moved to inline config in function file) |
| `build-version.js` | Updated to Build10.14.10 |
| `version.js` | Added Build10.14.10 to history |
| `docs/SOPs/PROJECT-STANDARDS.md` | Updated current stable |
| `docs/METRICS/build-metrics-raw.csv` | Added Build10.14.10 entry |

---

## Testing Requirements

### Edge Function Canonical Fix
1. **Deploy and wait 2-3 minutes** for edge functions to propagate
2. **Test with curl (most important — simulates Google's raw HTML crawl):**
   ```bash
   curl -s https://www.grantparkevents.com/events/2026-07-17-faur-requiem-12 | grep 'rel="canonical"'
   ```
   **Expected:** `<link rel="canonical" href="https://www.grantparkevents.com/events/2026-07-17-faur-requiem-12">`
   **Not:** `<link rel="canonical" href="https://www.grantparkevents.com/">`

3. **Test og:url:**
   ```bash
   curl -s https://www.grantparkevents.com/events/2026-07-17-faur-requiem-12 | grep 'og:url'
   ```
   **Expected:** content should match the event URL, not homepage

4. **Test homepage (should NOT be modified — not in edge function paths):**
   ```bash
   curl -s https://www.grantparkevents.com/ | grep 'rel="canonical"'
   ```
   **Expected:** `<link rel="canonical" href="https://www.grantparkevents.com/">`

5. **Test /about and /signup:**
   ```bash
   curl -s https://www.grantparkevents.com/about | grep 'rel="canonical"'
   ```
   **Expected:** `<link rel="canonical" href="https://www.grantparkevents.com/about">`

### Sitemap Routing
6. **Test sitemap-events.xml:**
   ```bash
   curl -s https://www.grantparkevents.com/sitemap-events.xml | head -5
   ```
   **Expected:** XML content (not HTML/React app)

7. **Test rss.xml:**
   ```bash
   curl -s https://www.grantparkevents.com/rss.xml | head -5
   ```
   **Expected:** XML content

### Regression Checks
8. **Browser: Navigate to events** — pages should load normally
9. **Browser: Version display** — should show Build10.14.10
10. **Admin panel** — should load and function normally

---

## Success Criteria

- [ ] curl shows correct canonical URL for event pages (not homepage)
- [ ] curl shows correct og:url for event pages
- [ ] Homepage canonical still points to homepage
- [ ] /sitemap-events.xml returns XML, not React app
- [ ] /rss.xml returns XML, not React app
- [ ] Site functions normally in browser
- [ ] GSC "Page with redirect" status resolves over coming days/weeks

---

## Troubleshooting

**Edge function not working (canonical still shows homepage):**
- Edge functions may take 2-3 minutes to deploy
- Check Netlify dashboard → Functions → Edge Functions tab for deployment status
- Verify `netlify/edge-functions/seo-canonical.js` is in the deploy

**Site broken after deploy:**
- Edge function has `onError: "bypass"` — if function errors, page serves normally
- If site is completely broken, check Netlify deploy logs for edge function compilation errors

**GSC still showing "Page with redirect":**
- Google recrawls on its own schedule — may take days to weeks
- Use GSC URL Inspection tool to request re-indexing of a few event URLs
- The raw HTML fix is the authoritative signal; JS agreement reinforces it

---

## Comparison to Previous Build

| Aspect | Build10.14.9 | Build10.14.10 |
|--------|-------------|---------------|
| Canonical in raw HTML | Always homepage | Correct URL per page (edge function) |
| og:url in raw HTML | Always homepage | Correct URL per page (edge function) |
| JS canonical | Updates after render | Still updates (now agrees with raw HTML) |
| Edge function config | netlify.toml declarations | Inline config (self-contained) |
| /sitemap-events.xml | Redirected to function | Redirected to function (retained) |
| /rss.xml | Redirected to function | Redirected to function (retained) |

---

## PRE-DELIVERY VALIDATION RESULTS

✅ **Syntax Validation**
   - React.createElement pattern check: PASS (pre-existing patterns only)
   - Double comma check: PASS (empty)
   - Admin.html checks: PASS
   - Edge function syntax: PASS (no external dependencies)

✅ **Structural Integrity**
   - index.html: Braces 851/851, Brackets 108/108, Parens 1515/1515
   - admin.html: Braces 1289/1289, Brackets 260/260, Parens 2282/2282
   - admin-index-report.html: Braces 264/264, Brackets 41/41, Parens 478/478
   - sw.js: Braces 33/33
   - seo-canonical.js: Braces 7/7, Parens 17/17

✅ **Version Consistency (Single-Source)**
   - build-version.js: v2.3.1-Build10.14.10
   - index.html: No hardcoded BUILD_VERSION (loads from build-version.js)
   - admin.html: No hardcoded BUILD_VERSION (loads from build-version.js)
   - sw.js: No hardcoded CACHE_VERSION (derives from BUILD_VERSION)
   - All 3 consumer files have build-version.js script/import: Verified

✅ **File Integrity**
   - All essential files present: Verified
   - Edge function file present: Verified (67 lines)
   - Line counts reasonable: Verified
   - Release notes in docs/BUILDS/: Verified

✅ **Code Review**
   - Full diff reviewed against Build10.14.9
   - Regression caught and fixed: /rss.xml redirect was dropped during edit, restored
   - Edge function config approach verified (inline vs toml — chose inline, removed toml declarations)
   - All 7 changed files accounted for

✅ **Pattern Validation**
   - Edge function follows Netlify documented middleware pattern
   - No external dependencies (zero import risk)
   - _redirects follows established ordering pattern
   - JS canonical fix retained and consistent with edge function behavior

**VALIDATION STATUS: ALL CHECKS PASSED ✅**

Build ready for delivery.
