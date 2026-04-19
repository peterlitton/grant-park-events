# BUILD10.14.9 RELEASE NOTES
## v2.3.1-Build10.14.9

**Date:** February 10, 2026  
**LLM:** Claude Opus 4.6  
**Type:** Bug fix + data maintenance + diagnostics  
**Previous Stable:** v2.3.1-Build10.14.8.4

---

## Overview

Three changes: GSC Index Report cache fixes (backend per-URL TTL + frontend progressive save), raw GSC API data display for diagnostics, and Build Metrics CSV backfill for 44 missing builds.

## Problem Addressed

1. **GSC Index Report — stale "pending" statuses:** Events showing "⏳ pending" despite being indexed in GSC. Root cause was dual-layer caching failure:
   - Backend (Netlify Blobs): Single global `timestamp` reset every time any new URL was added, keeping old statuses "fresh" forever
   - Frontend (localStorage): Cache only saved after ALL ~80 sequential API calls completed (~10+ min). User navigating away = no cache saved. Every visit started from scratch.

2. **No diagnostic visibility:** Status column showed only mapped values. No way to see what Google's API actually returned.

3. **Build Metrics chart incomplete:** CSV data ended at Build6.2 (Feb 5). 44 builds missing from chart.

## Technical Implementation

### Backend: Per-URL Cache Timestamps (gsc-index-status.js)
- New cache key `index-status-cache-v2` (abandons old stale v1 data)
- Each cached entry gets its own `cachedAt: Date.now()` field
- Cache read filters entries individually — only those within 24-hour TTL kept
- Expired entries discarded and re-queried from live GSC API
- Verbose logging: `[GSC] Result for [url] → verdict: X, coverageState: Y`

### Frontend: Progressive Cache Save (admin-index-report.html)
- `saveToCache(allPages)` called after EVERY batch (not just at end)
- Navigate away after 10 URLs? Those 10 are cached for next visit
- limit=1 preserved (OAuth + blob + GSC API = ~8sec per URL, must stay under 26sec Netlify timeout)

### Raw GSC Data Display (admin-index-report.html)
- Status column now shows `verdict / coverageState` in small gray text below status icon
- Cached entries show "(cached)" indicator
- Makes mapping bugs immediately visible

### CSV Backfill (docs/METRICS/build-metrics-raw.csv)
- Backfilled 44 builds (6.3 through 10.14.9) from release notes, transcripts, version history
- CSV now has 160 rows (header + 159 builds)

## Why It Works

**Old behavior:** Global timestamp meant adding URL #80 reset the timer for URL #1 (cached 10 minutes ago as "pending"). URL #1 never expired, never got re-queried. Frontend localStorage only saved after all 80 complete — user always left before that, so no frontend cache either. Every visit = 80 fresh API calls, 10+ minutes, always starting from zero.

**New behavior:** Each URL expires on its own schedule. URL #1 cached as "pending" today will expire in 24 hours and get re-queried tomorrow. Frontend saves after each URL, so even partial visits build up cache. Second visit same day loads instantly from localStorage.

## Testing Requirements

1. First visit after deploy: Index Report loads one URL at a time (same speed as before)
2. Check status column: each row should show raw verdict/coverageState below the icon
3. Navigate away mid-load, come back: cached URLs load instantly, only uncached ones query API
4. Netlify function logs: `[GSC] Cache: X valid, Y expired of Z total` and `[GSC] Result for [url] → verdict: X, coverageState: Y`
5. Build Metrics tab: chart extends through Feb 10 with full history

## Troubleshooting

If "pending" persists after deploy:
- Raw GSC data below status icon reveals actual API response
- If raw shows "PASS / Submitted and indexed" but status shows pending → mapping bug in status logic
- If raw shows something unexpected → Google hasn't processed yet, wait and re-check
- Netlify function logs provide server-side confirmation

## Success Criteria

- Index Report cache works progressively (partial loads persist)
- Stale "pending" entries expire after 24 hours and get fresh data
- Raw API response visible in every status cell
- Build Metrics chart shows data through Build10.14.9
- No regressions to existing functionality

## Comparison to Previous Build

- v2.3.1-Build10.14.8.4: PNG CORS fix, popup Blobs on public site
- v2.3.1-Build10.14.9: GSC cache architecture fix, diagnostics, CSV maintenance

---

## PRE-DELIVERY VALIDATION RESULTS

✅ **Syntax Validation**
   - React.createElement pattern check: PASS (known pre-existing patterns only)
   - Props object validation: PASS (known pre-existing patterns only)
   - String quote validation: PASS (known pre-existing patterns only)
   - Trailing comma check: PASS
   - Element type validation: PASS (known pre-existing patterns only)

✅ **Structural Integrity**
   - Brace matching: PASS (index 851/851, admin 1289/1289, report 264/264, gsc 75/75, sw 33/33)
   - Bracket matching: PASS (index 106/106, admin 260/260, report 41/41)
   - Parenthesis matching: PASS (index 1510/1510, admin 2282/2282, report 478/478)

✅ **Version Consistency (Single-Source)**
   - build-version.js: v2.3.1-Build10.14.9
   - index.html: No hardcoded BUILD_VERSION (loads from build-version.js)
   - admin.html: No hardcoded BUILD_VERSION (loads from build-version.js)
   - sw.js: No hardcoded CACHE_VERSION (derives from BUILD_VERSION via importScripts)
   - All 3 consumer files have build-version.js script/import: Verified

✅ **File Integrity**
   - All essential files present: Verified
   - No empty/corrupted files: Verified
   - Line counts reasonable: index 2572, admin 4529, report 889, gsc 307
   - Release notes in docs/BUILDS/: Verified
   - Release notes NOT in root: Verified

✅ **Code Review**
   - All diffs reviewed: Complete (admin-index-report, gsc-index-status, build-version, version, PROJECT-STANDARDS, CSV)
   - Context checked: Complete
   - Nesting verified: Correct
   - Pattern consistency: Verified
   - Comments added: Complete (progressive cache, per-URL TTL, verbose logging, raw display)

✅ **Pattern Validation**
   - limit=1 preserved (matches stable build)
   - Same e() createElement patterns used for new UI elements
   - Same Netlify Blobs import pattern
   - Cache structure follows existing conventions
   - No new dependencies introduced

**VALIDATION STATUS: ALL CHECKS PASSED ✅**

Build ready for delivery.
