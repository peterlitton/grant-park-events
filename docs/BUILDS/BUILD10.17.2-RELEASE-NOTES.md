# BUILD10.17.2 RELEASE NOTES
## v2.3.1-Build10.17.2 — netlify.toml Fix + Admin UX Improvements

**Date:** 2026-02-26  
**Type:** Sub-build (hotfix + refinement)  
**Status:** Ready for deployment  
**Previous:** v2.3.1-Build10.17 (Build10.17.1 was not deployed successfully)

---

## CRITICAL FIX

### Corrupted `netlify.toml`
Build10.17.1 shipped with `netlify.toml` containing Netlify's 404 HTML page instead of valid TOML configuration. Without this file, Netlify cannot discover the `netlify/functions/` directory, causing all serverless function calls to fall through to the `_redirects` catch-all and return `index.html` instead of JSON.

**Symptom:** Every admin panel data load fails with `SyntaxError: Unexpected token '<', "<!DOCTYPE"... is not valid JSON`

**Root cause:** An earlier session fetched `netlify.toml` from the live site via HTTP. The catch-all redirect returned HTML, which was saved as the file contents and carried forward into Build10.17.1.

**Fix:** Restored correct TOML content:
```toml
[build]
  functions = "netlify/functions"

[functions]
  node_bundler = "esbuild"
```

## OVERVIEW

Build10.17.2 improves admin panel usability with a redesigned tab navigation, event visibility filtering, expanded SEO validation (all published events), and root directory cleanup.

## CHANGES

### 1. Tab Navigation Redesign
**File:** `admin.html` (lines 2330-2393)

- **Wrapped layout:** `flex flex-wrap` replaces horizontal scroll. Tabs wrap to multiple lines on narrow screens instead of requiring scrolling.
- **Icons removed:** All emoji prefixes removed from tab labels for cleaner appearance.
- **Renames:** Monitor → **Events Monitor**, SEO → **GSC/SEO**, Campaigns → **Emails**, Metrics → **Build Metrics**
- **Visual group separators:** Vertical dividers (`border-l-2`) between four logical groups:
  - Group 1: Events, Images, About, Popup
  - Group 2: Events Monitor, GSC/SEO
  - Group 3: Subscribers, Emails, Social
  - Group 4: Build Metrics
- **Compact styling:** `py-3 px-4 text-sm` (was `py-4 px-6`), plus `hover:text-gray-900` on inactive tabs.
- **Index Report link removed** from tab bar (standalone page at `/admin-index-report` still accessible directly).

### 2. Event Visibility Filter
**File:** `admin.html` (lines 1289-1290, 2247-2253, 2431-2460)

- Replaces the static "Total Events" card with an interactive **Event Counts** card.
- Three clickable pill buttons: **Total** (blue), **Published** (green), **Hidden** (amber).
- Active filter is highlighted with filled color; inactive pills are white.
- Filtering applies to the main event list below. Internal tab ID stays `events`.
- State: `eventVisibilityFilter` (`'all'` | `'published'` | `'hidden'`)
- Past events toggle still works independently.

### 3. Full SEO Validation (All Published Events)
**File:** `admin.html` (lines 1284-1286, 3800-3910)

- New **"Full Validation (All Events)"** button alongside existing Quick Validation (8 events).
- Iterates through ALL published events, fetching each event page client-side.
- Checks per event: title, meta description, canonical, og:title, schema JSON-LD, no legacy `assets/events/` paths.
- Progress indicator shows `checked/total` count during validation.
- Results display: summary card (pass/fail totals) + only failed events listed with specific failed checks shown as badges.
- State: `fullSeoValidating`, `fullSeoProgress`, `fullSeoResults`

### 4. Root Directory Cleanup
12 stale build documentation files moved from project root to `docs/BUILDS/`:
- BUILD10-MIGRATION-REMOVAL-PLAN.md
- BUILD10.14.2-CRITICAL-FIX.md
- BUILD10.14.2-VALIDATION-SUMMARY.md
- BUILD10.14.3-RELEASE-NOTES.md
- BUILD10.14.3-ROOT-CAUSE-ANALYSIS.md
- BUILD7-STAGING-SUMMARY.md
- BUILD7.1-PATCH-NOTES.md
- GOLD-STANDARD-DOCUMENTATION.md
- SONNET-HANDOFF-2026-02-04-BUILD4.md
- STABLE-RELEASE.md
- VALIDATION-PROOF.md
- VERSION-AUDIT-REPORT.md

Root now contains only: CURRENT-BUILD.md, FILE-STRUCTURE.md, QUICK-START-GUIDE.md, README.md, TROUBLESHOOTING.md

## FILES CHANGED

| File | Change |
|------|--------|
| `build-version.js` | Version → v2.3.1-Build10.17.2 |
| `index.html` | Inline version update (2 lines) |
| `admin.html` | Tab redesign, event filter, full SEO validation (~140 lines changed/added) |
| `CURRENT-BUILD.md` | Created |
| `docs/BUILDS/*` | 12 stale docs moved from root |

## RISK ASSESSMENT

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Tab wrap breaks on specific screen widths | Low — visual only | `flex-wrap` is standard CSS; tested with 10 tabs |
| Full SEO validation times out (many events) | Low — client-side with progress | Progress indicator; sequential fetch prevents overload |
| Event filter state confusion | None — defaults to 'all' on load | Clear pill button active state |

## PRE-DELIVERY VALIDATION RESULTS

✅ **Syntax Validation**
   - React.createElement pattern check: PASS (13 known false positives in index.html, stable)
   - Props object validation: PASS
   - String quote validation: PASS (backtick templates = expected)
   - Double comma check: PASS
   - Element type validation: PASS

✅ **Structural Integrity**
   - index.html: Braces 850/850, Brackets 108/108, Parens 1512/1512
   - admin.html: Braces 1424/1424, Brackets 304/304, Parens 2513/2513
   - sw.js: Braces 33/33, Brackets 11/11, Parens 99/99

✅ **Version Consistency**
   - build-version.js: v2.3.1-Build10.17.2
   - index.html inline: v2.3.1-Build10.17.2 ✓ MATCH
   - admin.html inline: v2.3.1-Build10.17.2 ✓ MATCH
   - sw.js: No hardcoded version (derives via importScripts) ✓
   - _headers: No /*.js wildcard ✓
   - CURRENT-BUILD.md: Updated ✓

✅ **File Integrity**
   - All essential files present: Verified
   - index.html: 2585 lines
   - admin.html: 4954 lines (was 4814 in Build10.17)
   - build-version.js: 25 lines
   - sw.js: 173 lines (unchanged)

✅ **Code Review**
   - index.html diff: 2 lines changed (version only)
   - admin.html diff: ~140 lines changed (all 4 features)
   - build-version.js diff: 3 lines (version, date, notes)
   - sw.js: No changes
   - All changes reviewed against Build10.17 baseline

✅ **Pattern Validation**
   - Tab button pattern consistent (all 10 use identical structure)
   - Filter pill pattern follows existing Toggle/button patterns in codebase
   - SEO validation follows same fetch+check pattern as Quick Validation

**VALIDATION STATUS: ALL CHECKS PASSED ✅**

Build ready for delivery.
