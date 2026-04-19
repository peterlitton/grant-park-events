# BUILD10.14.5 RELEASE NOTES

**Version:** v2.3.1-Build10.14.5  
**Date:** February 9, 2026  
**Type:** Bug Fix (False Positive Elimination)  
**Risk:** Low  

---

## OVERVIEW

Eliminates false positive change detections by switching from raw HTML hashing to text-only content hashing. Previously, dynamic elements like analytics scripts, tracking codes, and CDN variations caused different hashes on every fetch — even when the actual page content hadn't changed. Now only visible text content is hashed.

## PROBLEM

The page monitor reported 8 page changes that were not real. Chicago.gov pages contain dynamic elements (Google Analytics, tag manager, ad scripts, session-specific markup) that vary between fetches. The old approach hashed the entire HTML response, meaning these dynamic elements produced different hashes each time.

**Evidence from testing:** Fetching the same chicago.gov page 5 times in a row with text-only hashing produced identical hashes every time. Raw HTML hashing produced different hashes between the scheduled run and the manual run.

## SOLUTION

Added `stripToTextContent()` function that removes all non-content HTML before hashing:
- `<head>` section (meta tags, dynamic references)
- `<script>` blocks (analytics, tracking, dynamic JS)
- `<style>` blocks (CSS that may vary by CDN edge)
- `<noscript>` blocks
- HTML comments
- All HTML tags (leaving only visible text)
- HTML entities and excess whitespace

Applied to both `check-page-changes.js` (scheduled) and `run-page-check.js` (manual).

## FILES CHANGED

1. **`netlify/functions/check-page-changes.js`** — Text-only hashing + stripToTextContent()
2. **`netlify/functions/run-page-check.js`** — Same fix
3. **`version.js`** — Updated version, date, notes, history
4. **`index.html`** — Updated version constant
5. **`admin.html`** — Updated version constant
6. **`sw.js`** — Updated cache version

## TESTING

After deployment:
1. Hard refresh admin panel
2. Click "Run Check Now" — should show 12 URLs, 0 changes
3. Click "Run Check Now" again — should still show 0 changes
4. Monitor Status should show method as "Text Content Hash"
5. Tomorrow's 9am scheduled run should also show 0 changes (unless pages actually changed)

## SUCCESS CRITERIA

- ✅ Consecutive runs show 0 false changes
- ✅ Method displays as "Text Content Hash" 
- ✅ No spurious emails sent

---

## PRE-DELIVERY VALIDATION RESULTS

✅ **Syntax Validation** — node --check passes for both functions
✅ **Structural Integrity** — All brackets balanced (index.html & admin.html)
✅ **Version Consistency** — v2.3.1-Build10.14.5 in all 4 files
✅ **File Integrity** — All essential files present
✅ **Code Review** — Diffs reviewed, identical fix in both functions

**VALIDATION STATUS: ALL CHECKS PASSED ✅**
