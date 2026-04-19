# Build10.14.11 Release Notes
## GSC Index Report: Cache Bypass + Comprehensive Status Mapping

**Version:** v2.3.1-Build10.14.11
**Date:** 2026-02-10
**Type:** Bug Fix (Admin Index Report accuracy)

---

## Overview

Fixes the primary bug where admin Index Report showed URLs as "not indexed" while Google Search Console's own URL Inspector showed the same URLs as indexed. Root cause: dual-layer caching (server-side Netlify Blobs + client-side localStorage) prevented the Refresh button from fetching fresh data from the GSC API. Additionally, incomplete status mapping caused many valid GSC statuses to fall through to a generic "pending" label.

---

## Problems Addressed

### 1. Stale Cache on Refresh (PRIMARY BUG)
- **Symptom:** Click Refresh in admin → still shows "not indexed" for URLs that GSC web UI shows as indexed
- **Root cause:** Refresh button bypassed client-side localStorage cache but NOT the server-side Netlify Blobs cache (24hr TTL per URL). Every API call returned cached stale data.
- **Fix:** Added `forceRefresh=true` query parameter to `gsc-index-status.js`. Refresh button now passes this param, bypassing BOTH cache layers.

### 2. Incomplete Status Mapping
- **Symptom:** URLs with statuses like "Page with redirect", "Duplicate, Google chose different canonical", etc. all showed as generic "pending"
- **Root cause:** Only 4 coverageState values were explicitly handled. Everything else defaulted to `status = 'pending'`.
- **Fix:** Verdict-first mapping: PASS→indexed, FAIL→error, NEUTRAL→mapped by specific coverageState. Added redirect, duplicate, noindex, excluded, error categories.

### 3. Slug Generation Inconsistency
- **Symptom:** Theoretical mismatch between index.html and gsc-index-status.js slug generation
- **Root cause:** index.html had `.trim()` in the slug pipeline, gsc-index-status.js did not
- **Fix:** Added `.trim()` to gsc-index-status.js for consistency

---

## Technical Implementation

### Files Changed

1. **netlify/functions/gsc-index-status.js**
   - Added `forceRefresh` query parameter parsing
   - Wrapped cache loading in `if (!forceRefresh)` conditional
   - Replaced 4-case status mapping with comprehensive verdict-first logic
   - Added `.trim()` to slug generation
   - Added `forceRefresh` to response meta

2. **admin-index-report.html**
   - `autoLoadAllEvents()` now accepts `forceServerRefresh` param
   - `refreshAllData()` passes `forceRefresh=true` to API calls
   - Updated filter logic for new status types
   - Updated stats computation for new status types
   - Added icons/colors for: crawled-not-indexed, redirect, duplicate, error, unknown
   - Updated Request Index button to show for all non-indexed statuses
   - Refresh button renamed "🔄 Fresh Refresh" with tooltip

3. **build-version.js** — Version update

### Status Mapping (New vs Old)

| GSC Verdict | GSC coverageState | Old Status | New Status |
|---|---|---|---|
| PASS | any | indexed | indexed |
| FAIL | any | pending | error |
| NEUTRAL | Discovered - currently not indexed | discovered | discovered |
| NEUTRAL | Crawled - currently not indexed | crawled-not-indexed | crawled-not-indexed |
| NEUTRAL | URL is unknown to Google | pending | unknown |
| NEUTRAL | Page with redirect | pending | redirect |
| NEUTRAL | *Duplicate* | pending | duplicate |
| NEUTRAL | *canonical* | pending | duplicate |
| NEUTRAL | *noindex* | pending | noindex |
| NEUTRAL | *robots* | pending | excluded |
| NEUTRAL | Soft 404 | pending | error |
| NEUTRAL | (other) | pending | excluded |

---

## Testing Requirements

1. **Deploy to Netlify**
2. **Navigate to admin > Index Report**
3. **Initial load** — should use client-side cache if today's data exists
4. **Click "🔄 Fresh Refresh"** — should show loading progress, querying every URL fresh from Google
5. **Verify meta.forceRefresh=true** — check browser console/network tab for API responses
6. **Verify meta.fromCache=0** — all URLs should be queried fresh on refresh
7. **Check status accuracy** — compare a few URLs against GSC web UI URL Inspector
8. **Verify filter cards** — click each filter, verify counts match table rows
9. **Verify new status types display** — if any URLs show redirect/duplicate/error, verify icon and color

---

## Troubleshooting

- **Refresh still shows stale data:** Check Netlify function logs for `forceRefresh=true` in params
- **502 timeout on refresh:** Expected if many URLs — limit=1 pagination handles this, just takes ~10min for 80 URLs
- **Status shows "error":** Check function logs for GSC API error details (quota exceeded, auth failure)
- **Counts don't add up:** Some statuses (unknown, error) aren't in any filter card — click "Total Pages" to see all

---

## Success Criteria

- ✅ Refresh button fetches fresh GSC data (meta.fromCache=0)
- ✅ URLs confirmed indexed in GSC web UI show as "indexed" in admin
- ✅ "Page with redirect" shows as "redirect" not "pending"
- ✅ Filter cards accurately count all status types
- ✅ No regression in initial page load (cache still works for first visit)

---

## PRE-DELIVERY VALIDATION RESULTS

✅ **Syntax Validation**
   - React.createElement pattern check: PASS (pre-existing false positives only)
   - Props object validation: PASS
   - String quote validation: PASS (backtick templates valid)
   - Trailing comma check: PASS
   - Element type validation: PASS (non-React lines only)
   - Node --check gsc-index-status.js: PASS

✅ **Structural Integrity**
   - admin-index-report.html: Braces 265/265, Brackets 41/41, Parens 472/472
   - gsc-index-status.js: Braces 87/87, Brackets 28/28, Parens 142/142

✅ **Version Consistency**
   - build-version.js: v2.3.1-Build10.14.11 ✓
   - index.html: No hardcoded versions ✓
   - admin.html: No hardcoded versions ✓
   - sw.js: Uses importScripts, no hardcoded versions ✓

✅ **File Integrity**
   - All essential files present: Verified
   - Line counts reasonable: Verified
   - Release notes in docs/BUILDS/: Verified

✅ **Code Review**
   - All changes diffed against Build10.14.10.1: Complete
   - Every change intentional and documented: Verified
   - No unrelated modifications: Confirmed

✅ **Pattern Validation**
   - Consistent with existing codebase patterns: Verified
   - forceRefresh follows same pattern as futureOnly parameter: Verified

**VALIDATION STATUS: ALL CHECKS PASSED ✅**

Build ready for delivery.
