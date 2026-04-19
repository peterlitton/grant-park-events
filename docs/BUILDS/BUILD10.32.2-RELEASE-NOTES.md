# Build10.32.2 Release Notes
## Restore admin-dashboard.html + Add Missing-Files SOP Check

**Version:** v2.3.1-Build10.32.2
**Date:** 2026-04-13
**Type:** File restoration + dependency declaration + SOP improvement

---

## Why This Build Exists

After Build10.32.1 deployed successfully, Peter reported that `https://www.grantparkevents.com/admin-dashboard.html` no longer renders. Investigation revealed:

1. **`admin-dashboard.html` is missing from production.** It was last present in Build10.16.8 and was lost between then and Build10.25.8 — without any release note documenting its removal.
2. **Two supporting Netlify functions were also lost** in the same gap: `ga4-analytics.js` and `gsc-search-analytics.js` — the data sources for the dashboard's GA4 and GSC charts.
3. **Build10.32.1 didn't introduce this issue.** The files have been missing for weeks. Every drag-and-drop deploy since the loss has been completely replacing production with a zip that didn't contain them. The dashboard URL has been a 404 the whole time.
4. **A second undeclared dependency was discovered:** `node-html-parser` is used by `scrape-event.js` but was not declared in the package.json added in Build10.32.1. Same risk profile as the `@netlify/blobs` issue — would have failed on the next cache miss.

The Build10.16.8 versions of the dashboard and its supporting functions are the canonical state. No release notes or chat history indicate any further updates were made to these files after Build10.16.8 before they were lost.

## Changes

### 1. Restored: `admin-dashboard.html` (491 lines)

Source: Build10.16.8, verbatim. Contains all 8 sub-builds of refinements applied between Build10.16 and Build10.16.8 (full-width logo, condensed GSC summary table, "Executive Dashboard" title, Plotly chart with date range selector, side-by-side donut charts, sans-serif typography, etc.).

Inline `BUILD_VERSION` bumped from `v2.3.1-Build10.16.8` to `v2.3.1-Build10.32.2` to maintain version parity across the package per the version-gate convention. The file content is otherwise byte-identical to its Build10.16.8 state.

### 2. Restored: `netlify/functions/ga4-analytics.js` (213 lines)

Source: Build10.16.8, verbatim. Queries the Google Analytics Data API for the dashboard's traffic charts. Uses `Netlify.env.get('GSC_*')` for service account credentials (same env vars used by GSC functions — already configured in your Netlify dashboard).

Endpoints:
- `?metric=top-pages` — Top 10 pages by views, last 24 hours
- `?metric=daily-traffic[&days=N]` — Daily visitors/sessions/pageviews (default 5 days, configurable)
- `?metric=traffic-sources` — Sessions by channel group, last 3 days
- `?metric=platform` — Sessions by device category, last 3 days

GA4 Property ID `377166392` is hardcoded in the function (matches existing documented property).

### 3. Restored: `netlify/functions/gsc-search-analytics.js` (230 lines)

Source: Build10.16.8, verbatim. Queries the Google Search Console Search Analytics API for the dashboard's search performance tables.

Endpoints:
- `?metric=overview` — Daily clicks/impressions/CTR/position, last 7 days
- `?metric=top-queries-impressions` — Top 3 queries by impression count
- `?metric=top-queries-clicks` — Top 3 queries by click count
- `?metric=top-positions` — Top 5 queries by best average position (28-day window, min 3 impressions)

Uses the same `GSC_*` env vars as the existing GSC functions.

### 4. Added: `node-html-parser ^6.1.12` to package.json

`scrape-event.js` imports `node-html-parser` to parse scraped event pages. This dependency was undeclared. Same risk that took down Build10.32 (cache fetch fails → undeclared dep → bundler error). Adding it now prevents a future build failure.

Version range matches what was declared in Build10.16.8's original package.json (`^6.1.12`). Major version 7.x exists but introduces breaking changes; staying on 6.x avoids surprise breakage in the working scrape function.

### 5. New SOP step: STEP 4d — Missing-Files Check vs Previous Build

**File:** `docs/SOPs/BUILD-VALIDATION-SOP.md`

New step added between Step 4c (Feature Registry) and Step 5 (Visual Code Review). It uses `find` + `comm` to compare the file list of the new build against the previous build and flag any files that were in the previous build but are missing from the new one.

The Feature Registry check (Step 4c) catches features removed from inside a file. Step 4d catches entire files removed from the package — the failure mode that took out the dashboard.

**Verified the new check would have caught the original loss:** Running Step 4d on Build10.16.8 → Build10.25.8 correctly flags `admin-dashboard.html`, `ga4-analytics.js`, `gsc-search-analytics.js`, `package.json`, `init-events.js`, and several stale doc files. The high-impact losses would have been caught at validation time.

## Files Changed

| File | Change |
|------|--------|
| `admin-dashboard.html` | RESTORED from Build10.16.8 (version bumped to 10.32.2) |
| `netlify/functions/ga4-analytics.js` | RESTORED from Build10.16.8 |
| `netlify/functions/gsc-search-analytics.js` | RESTORED from Build10.16.8 |
| `package.json` | Added `node-html-parser ^6.1.12` dependency |
| `docs/SOPs/BUILD-VALIDATION-SOP.md` | New Step 4d (Missing-Files Check) |
| `build-version.js` | Version bump |
| `index.html` | Inline version bump |
| `admin.html` | Inline version bump |
| `CURRENT-BUILD.md` | Version bump |

## Files NOT Restored (Intentional)

`netlify/functions/init-events.js` — was also lost in the gap, but **Build10.17 release notes confirm this file was intentionally deleted** (dormant seed data function, security risk of accidental data overwrite). Not restoring.

## Testing Requirements

### Pre-deploy
- [x] All structural validation passed
- [x] Version consistency across all 4 locations
- [x] New Step 4d validated against Build10.16.8 → Build10.25.8 (correctly flags the original loss)
- [x] Step 4d run on this build vs Build10.32.1 (correctly shows no files removed, three added)

### Post-deploy
- [ ] Visit `https://www.grantparkevents.com/admin-dashboard.html` → page loads (not 404)
- [ ] Dashboard renders with: GPE logo, "Executive Dashboard" title, Google Search Performance table, Site Traffic chart, Top Pages, Top Queries, donut charts (Sources + Devices)
- [ ] Date range buttons under traffic chart work (5d / 2w / 1m / 3m)
- [ ] Build completes on Netlify (package.json now declares node-html-parser as well)
- [ ] Existing scrape-event functionality still works (uses node-html-parser)
- [ ] All Build10.32 fixes still working (Featuring/Program rendering, Copy URL button, edge function 410)
- [ ] Admin → Logout works, Admin → Dashboard link works

## Risk Assessment

| Item | Risk | Mitigation |
|------|------|------------|
| Restored files are stale (~2 months old) | Low | No release notes or chats indicate any updates after 10.16.8. The files were untouched and dropped accidentally. |
| Version mismatch in dashboard footer | None | Inline BUILD_VERSION updated to match package version per version-gate convention. |
| `node-html-parser ^6.1.12` is older than latest (7.1.0) | Low | Major version 7 has breaking changes. Staying on 6.x matches what was working in 10.16.8. Can upgrade later as a separate change. |
| GA4 / GSC env vars not configured | None | Same vars used by existing GSC functions in production — already configured. Verified by Netlify build log showing `GSC_CLIENT_EMAIL`, `GSC_PRIVATE_KEY`, etc. |
| Step 4d false positives (intentional removals) | Low | Step explicitly handles this — flagged files are reviewed against release notes. |

## Rollback

Redeploy Build10.32.1. The dashboard goes back to 404 (no worse than current production). All other functionality preserved.

---

## PRE-DELIVERY VALIDATION RESULTS

✅ **Package.json**
   - Valid JSON
   - Both dependencies declared: @netlify/blobs ^10.7.4, node-html-parser ^6.1.12
   - type: module preserved

✅ **Syntax Validation**
   - index.html: No double commas
   - admin.html: No double commas
   - admin-dashboard.html: No double commas
   - ga4-analytics.js: Node syntax PASS
   - gsc-search-analytics.js: Node syntax PASS
   - seo-canonical.js: Node syntax PASS

✅ **Structural Integrity**
   - index.html: Braces 918/918, Parens 1660/1660, Brackets 124/124
   - admin.html: Braces 1481/1481, Parens 2692/2692, Brackets 318/318
   - admin-dashboard.html: Braces 168/168, Parens 229/229, Brackets 45/45
   - ga4-analytics.js: Braces 77/77, Parens 92/92
   - gsc-search-analytics.js: Braces 55/55, Parens 95/95

✅ **Version Consistency**
   - build-version.js: v2.3.1-Build10.32.2
   - index.html inline: v2.3.1-Build10.32.2
   - admin.html inline: v2.3.1-Build10.32.2
   - admin-dashboard.html inline: v2.3.1-Build10.32.2
   - CURRENT-BUILD.md: v2.3.1-Build10.32.2
   - sw.js: No hardcoded CACHE_VERSION ✓
   - 4/4 consumer files reference build-version.js ✓

✅ **File Integrity**
   - All essential files present
   - GOOGLE-CREDENTIALS.json still absent ✓
   - Line counts: index.html 2717, admin.html 5217, admin-dashboard.html 491

✅ **Config File Validation**
   - _headers, netlify.toml, _redirects: All valid

✅ **Feature Registry Check**
   - All 14 registered features present ✓

✅ **NEW: Step 4d — Missing-Files Check**
   - vs Build10.32.1: 0 files removed ✓
   - 3 files added (the restored ones)
   - Self-validation: Step 4d run against Build10.16.8 → Build10.25.8 correctly identifies the original loss ✓

✅ **Visual Code Review**
   - Full diff: 9 changes (3 new files + 6 modifications)
   - No unintended modifications

**VALIDATION STATUS: ALL CHECKS PASSED ✅**
