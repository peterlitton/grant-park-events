# BUILD10.14.4 RELEASE NOTES

**Version:** v2.3.1-Build10.14.4  
**Date:** February 9, 2026  
**Type:** Bug Fix (Critical)  
**Risk:** Low  

---

## OVERVIEW

Fixes the "Run Now" button 500 error by creating a separate HTTP-callable function. The root cause was that `check-page-changes.js` exports a `schedule` config, making it a Netlify Scheduled Function — which Netlify explicitly prohibits from being invoked via HTTP URL.

## PROBLEM

The admin panel "Run Check Now" button returned a 500 "Internal Error" when calling `/.netlify/functions/check-page-changes`. The Netlify Dashboard "Run now" button worked fine.

**Previous diagnosis (incorrect):** Duplicate redirect rules in `_redirects` and `netlify.toml`.

**Actual root cause:** Netlify Scheduled Functions cannot be invoked via HTTP URL. From Netlify docs: "You can't invoke scheduled functions directly with a URL." The Dashboard trigger bypasses HTTP entirely via Netlify's internal API.

**Evidence:** All other functions (`get-events`, `get-monitor-settings`, `get-monitor-status`, etc.) work perfectly via HTTP — proving redirects are not the issue. Only the scheduled function fails.

## SOLUTION

Created `run-page-check.js` — identical monitoring logic, no `schedule` config. This makes it a regular Netlify Function, callable via HTTP. Updated admin panel to call `/.netlify/functions/run-page-check` instead of `/.netlify/functions/check-page-changes`.

**Architecture:**
- `check-page-changes.js` — Scheduled function, runs daily at 9am CST via Netlify scheduler
- `run-page-check.js` — HTTP function, called by admin "Run Now" button
- Both share identical monitoring logic (check pages, save status, log execution)

## FILES CHANGED

1. **`netlify/functions/run-page-check.js`** — NEW: HTTP-callable page check function
2. **`admin.html`** (line 2789) — Updated fetch URL from `check-page-changes` to `run-page-check`
3. **`netlify.toml`** — Removed duplicate `[[redirects]]` section (cleanup, not cause of 500)
4. **`_redirects`** — Removed unnecessary `/.netlify/*` rule, added clarifying comment
5. **`version.js`** — Updated version, date, notes, history; fixed VERSION_REGEX for multi-dot builds
6. **`sw.js`** — Updated cache version
7. **`index.html`** — Updated version constant
8. **`admin.html`** — Updated version constant

## ADDITIONAL FIX: VERSION_REGEX

The version regex in `version.js` only supported single-dot build numbers (`Build10.14` but not `Build10.14.4`). This was silently breaking the `get-version` function since Build10.14. Fixed regex from `(\.\d+)?` to `(\.\d+)*` to support any number of dot-separated segments.

## TESTING

After deployment:
1. Hard refresh admin panel (Ctrl+Shift+R)
2. Navigate to Monitor tab
3. Click "Run Check Now"
4. Should see "Check Complete!" with 12 URLs checked
5. Verify Monitor Status shows all 12 URLs
6. Verify Execution History shows "Manual Run" entry
7. Verify scheduled 9am run still works tomorrow

## SUCCESS CRITERIA

- ✅ "Run Now" button returns JSON response (not 500)
- ✅ Monitor Status shows 12 URLs with timestamps
- ✅ Execution History logs the manual run
- ✅ All other admin functions still work
- ✅ Version shows 10.14.4 everywhere
- ✅ `get-version` function returns valid response (regex fix)

---

## PRE-DELIVERY VALIDATION RESULTS

✅ **Syntax Validation**
   - React.createElement pattern check: PASS (pre-existing patterns only)
   - Function syntax (node --check): PASS — all 3 function files valid
   - Trailing comma check: PASS
   
✅ **Structural Integrity**
   - index.html — Braces: 842/842, Brackets: 106/106, Parens: 1492/1492
   - admin.html — Braces: 1262/1262, Brackets: 245/245, Parens: 2191/2191

✅ **Version Consistency**
   - version.js: v2.3.1-Build10.14.4 ✓
   - index.html: v2.3.1-Build10.14.4 ✓
   - admin.html: v2.3.1-Build10.14.4 ✓
   - sw.js: gpe-v2.3.1-build10.14.4 ✓
   - No stale version references (except VERSION_HISTORY)

✅ **File Integrity**
   - All essential files present
   - New function file: 341 lines (matches check-page-changes.js at 346)
   - 35 total function files
   - Release notes in docs/BUILDS/ (correct location)

✅ **Code Review**
   - All changes reviewed in context
   - run-page-check.js mirrors check-page-changes.js exactly minus schedule config
   - Admin fetch URL updated with explanatory comment
   - Config cleanup verified

**VALIDATION STATUS: ALL CHECKS PASSED ✅**
