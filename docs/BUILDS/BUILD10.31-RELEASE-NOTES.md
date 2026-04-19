# Build10.31 Release Notes
## Remove Google Credentials + Rate Limit Subscribe

**Version:** v2.3.1-Build10.31
**Date:** 2026-03-19
**Type:** Security — Credential removal + rate limiting

---

## Overview

Two security improvements: removes the Google service account private key from the build package (functions already use Netlify environment variables), and adds global rate limiting to the public subscribe-mailerlite function (60 signups per hour).

## Changes

### 1. Removed: `docs/INTEGRATION/GOOGLE-CREDENTIALS.json`

This file contained a full Google Cloud service account private key (project: grant-park-events) and shipped in every build package since the GSC integration was added. The 4 GSC functions that need these credentials already read them from Netlify environment variables (`GSC_PROJECT_ID`, `GSC_PRIVATE_KEY_ID`, `GSC_PRIVATE_KEY`, `GSC_CLIENT_EMAIL`) — the JSON file was never loaded by code. It was dead weight carrying a private key.

No code changes required. The one documentation reference in `docs/SOPs/DATA-STORAGE-MAP.md` was updated to reflect that credentials live in Netlify env vars.

**Verification:** All 4 GSC functions use `Netlify.env.get('GSC_PRIVATE_KEY')` etc. None reference the JSON file path. Confirmed by grep.

### 2. Rate limiting: `subscribe-mailerlite.js`

**Mechanism:** Global hourly counter stored in Netlify Blobs (store: `rate-limits`). Each hour gets its own key (e.g., `subscribe-2026-03-19-14`). Counter increments only on successful signups. When count reaches 60, subsequent requests receive 429 Too Many Requests.

**Why global, not per-IP:** Netlify Functions don't reliably expose client IPs (CDN/proxy headers vary). A global counter is simpler, more reliable, and sufficient — 60 legitimate signups per hour is generous for a community events calendar. The goal is preventing automated flooding, not throttling individual users.

**Implementation details:**
- Import added: `@netlify/blobs` (already a project dependency)
- Constant: `RATE_LIMIT_MAX = 60`
- Before processing: reads current count from Blobs, returns 429 if at limit
- After successful MailerLite API call: increments counter via `store.set()`
- Counter keys auto-expire naturally (old hourly keys are never read again)
- Both the rate limit check and counter update are wrapped in try/catch — if Blobs fails, the signup proceeds normally (fail-open, not fail-closed)

**What the user sees:** If rate limited, the MailerLite API is never called. The response is:
```json
{ "error": "Too many signups. Please try again later." }
```
Status 429. The signup form in index.html already handles non-200 responses with an error message.

## Files Changed

| File | Change |
|------|--------|
| `docs/INTEGRATION/GOOGLE-CREDENTIALS.json` | DELETED — private key removed from build |
| `netlify/functions/subscribe-mailerlite.js` | Added Blobs import, rate limit check (pre-processing), counter increment (post-success) |
| `docs/SOPs/DATA-STORAGE-MAP.md` | Updated Google credentials reference to env vars |
| `build-version.js` | Version bump |
| `index.html` | Inline version bump |
| `admin.html` | Inline version bump |
| `CURRENT-BUILD.md` | Version bump |

## Testing Requirements

### Google credentials removal
- [ ] GSC/SEO tab in admin: run SEO validation — should work (reads env vars, not JSON)
- [ ] No reference to GOOGLE-CREDENTIALS.json in build package

### Rate limiting
- [ ] Normal signup from public site works (subscribe page or popup)
- [ ] Console shows no rate limit errors for normal usage
- [ ] To verify rate limiting works: check Netlify function logs after a signup — should show normal success, and a `rate-limits` entry should appear in Netlify Blobs

### Regression
- [ ] All admin operations work (auth from Build10.29-30 still active)
- [ ] Backup Content button works (Build10.28)
- [ ] Public site loads normally
- [ ] Events display correctly

## Success Criteria

1. `GOOGLE-CREDENTIALS.json` is not in the deployed build
2. Public signups work normally
3. GSC functions work normally (env vars unchanged)

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| GSC functions fail | Shouldn't happen — env vars unchanged | Verify GSC_* env vars still set in Netlify dashboard |
| Signups fail with 429 immediately | Rate limit counter corrupted | Check `rate-limits` store in Netlify Blobs; delete the current hour's key |
| Signups fail with 500 | Blobs import issue | Check function logs; the rate limit code is fail-open so Blobs errors shouldn't block signups |
| Netlify secret scanner flags build | Old build dirs in cache still have credentials | SECRETS_SCAN_OMIT_PATHS env var handles this (set in Build10.29) |

## Rollback

Redeploy Build10.30. Google credentials file returns (was in that build), subscribe-mailerlite loses rate limiting. No data loss. Note: the credentials file returning is not ideal — consider keeping Build10.31 even if rate limiting needs debugging, and fix forward.

## Security Status After This Build

| Risk | Before | After | Change |
|------|--------|-------|--------|
| #1: Unprotected Functions | 3 | 3 | No change (mitigated Build10.30) |
| #2: Client-side admin auth | 3 | 3 | No change (mitigated Build10.29-30) |
| #3: Google credentials in zip | 7 | 0 | RESOLVED — file deleted, env vars already in use |
| #4: No rate limiting | 6 | 3 | MITIGATED — 60/hour global limit on subscribe |
| #5: XSS via contentEditable | 6 | 6 | No change |
| #6: No CSP headers | 5 | 5 | No change |
| #7: CDN dependency | 4 | 4 | No change |
| #8: Cache poisoning | 4 | 4 | No change |
| #9: admin-login.html unversioned | 0 | 0 | No change (resolved Build10.29) |
| #10: Static site surface | 2 | 2 | No change |

**Summary:** All three critical-level risks (7+) are now resolved. The highest remaining risk is XSS via contentEditable at level 6.

---

## PRE-DELIVERY VALIDATION RESULTS

✅ **Syntax Validation**
   - subscribe-mailerlite.js: Node syntax check PASS
   - index.html: No double commas
   - admin.html: No double commas

✅ **Structural Integrity**
   - index.html: Braces 915/915, Parens 1653/1653, Brackets 123/123
   - admin.html: Braces 1474/1474, Parens 2675/2675, Brackets 314/314
   - subscribe-mailerlite.js: Braces 61/61, Parens 76/76

✅ **Version Consistency**
   - build-version.js: v2.3.1-Build10.31
   - index.html inline: v2.3.1-Build10.31
   - admin.html inline: v2.3.1-Build10.31
   - CURRENT-BUILD.md: v2.3.1-Build10.31
   - sw.js: No hardcoded CACHE_VERSION ✓
   - All 3 consumer files reference build-version.js ✓

✅ **File Integrity**
   - All essential files present
   - GOOGLE-CREDENTIALS.json confirmed deleted
   - Line counts reasonable

✅ **Config File Validation**
   - _headers, netlify.toml, _redirects: All valid, no HTML contamination

✅ **Feature Registry Check**
   - All 14 registered features present ✓

✅ **Visual Code Review**
   - Full diff: 7 changes (1 deletion, 1 function modified, 1 doc updated, 4 version bumps)
   - subscribe-mailerlite.js: rate limit logic reviewed, Blobs API matches existing project pattern (store.set with JSON.stringify, not setJSON)
   - No unintended modifications

✅ **Bug Caught Pre-Delivery**
   - `store.setJSON()` doesn't exist in Netlify Blobs API. Corrected to `store.set(key, JSON.stringify(data))` matching save-events.js, save-popup-settings.js, etc.

**VALIDATION STATUS: ALL CHECKS PASSED ✅**
