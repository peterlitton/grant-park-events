# Build10.31.1 Release Notes
## Login Page Styling + Failed Login Rate Limiting + Rate Limit Alerts

**Version:** v2.3.1-Build10.31.1
**Date:** 2026-03-19
**Type:** UI refinement + Security hardening

---

## Overview

Restores the Chicago star visual identity to the admin login page, adds brute-force protection (5 failed logins per hour), and sends email alerts to the admin when either rate limit (login or signup) is triggered.

## Changes

### 1. Login page visual updates (`admin-login.html`)

- **Background:** Dark blue (#1e3a5f) with repeating Chicago 6-point star pattern (lighter blue #2a4f7a at 50% opacity, 60px grid)
- **Header icon:** Yellow ⭐ emoji replaced with blue Chicago 6-point star SVG (#93c5fd, 48px)
- **Footer text:** Updated from gray to blue-300 at 60% opacity to match new background
- **429 handling:** Login form now shows "Too many failed attempts. Try again later." when the server returns 429

### 2. Failed login rate limiting (`verify-admin-token.js`)

- **Mechanism:** Global hourly counter in Netlify Blobs (store: `rate-limits`, key pattern: `login-fail-YYYY-MM-DD-HH`)
- **Limit:** 5 failed attempts per hour
- **Counter increments only on failed logins** — successful logins don't count
- **When rate limited:** Returns 429 regardless of password (prevents timing attacks)
- **Fail-open:** If Blobs is unavailable, login proceeds normally
- **Auto-reset:** Hourly keys, old keys never read again

### 3. Rate limit email alerts (`verify-admin-token.js` + `subscribe-mailerlite.js`)

Both rate-limited functions now call `send-error-alert` when their limit is triggered. This sends an email notification via the existing Netlify Forms alert system (recipient: peter@peterlitton.com).

**Login rate limit alert:**
- Fires when the 5th failed login attempt is blocked
- Subject: "GPE Production Error - Failed Login Rate Limit Triggered"
- Includes: attempt count, hourly window key, timestamp

**Signup rate limit alert:**
- Fires when the 60th signup attempt in an hour is blocked
- Subject: "GPE Production Error - Signup Rate Limit Triggered"
- Includes: signup count, hourly window key, timestamp

Both alert calls are wrapped in try/catch — if the alert fails to send, the rate limit response still returns normally. The existing `send-error-alert` function has its own 1-hour rate limit, so repeated triggers within the same hour won't spam your inbox.

### 4. CORS header fix

Added `Access-Control-Allow-Origin: '*'` to the 401 response in verify-admin-token.js (was missing, could cause CORS errors on preview domains).

## Files Changed

| File | Change |
|------|--------|
| `admin-login.html` | Star background, SVG icon, footer color, 429 error handling |
| `netlify/functions/verify-admin-token.js` | Blobs import, rate limit check, failed attempt counter, alert on rate limit, CORS fix on 401 |
| `netlify/functions/subscribe-mailerlite.js` | Alert on rate limit trigger |
| `build-version.js` | Version bump |
| `index.html` | Inline version bump |
| `admin.html` | Inline version bump |
| `CURRENT-BUILD.md` | Version bump |

## Testing Requirements

### Login page visuals
- [ ] admin-login.html shows blue background with repeating star pattern
- [ ] Blue Chicago 6-point star in red header (not yellow emoji)
- [ ] Footer text readable against blue background

### Failed login rate limiting
- [ ] Correct password → logs in normally
- [ ] Wrong password → "Incorrect password" message
- [ ] 5 wrong passwords in a row → "Too many failed attempts. Try again later."
- [ ] After rate limited, even correct password returns 429 (until the hour rolls over)

### Rate limit alerts
- [ ] After 5th failed login → check email for "Failed Login Rate Limit Triggered" alert
- [ ] Alert includes timestamp and attempt count
- [ ] (Signup alert can be verified by checking Netlify function logs — don't flood 60 signups to test)

### Regression
- [ ] Admin operations work after login (auth from Build10.29-30)
- [ ] Public site unaffected
- [ ] Backup Content button works
- [ ] Subscriber signup works (rate limit from Build10.31)

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| Always shows "Too many failed attempts" | Counter stuck from testing | Delete `login-fail-*` key from `rate-limits` store in Netlify Blobs dashboard |
| No alert email received | send-error-alert's own 1hr rate limit, or Netlify Forms issue | Check function logs for send-error-alert; verify the `error-alerts` form exists in Netlify Forms |
| Star background not showing | Browser cache | Hard refresh (Ctrl+Shift+R) |

## Rollback

Redeploy Build10.31. Login page reverts to gray background with yellow star emoji, rate limiting and alerts removed from verify-admin-token, subscribe-mailerlite loses alert. All other security features remain.

---

## PRE-DELIVERY VALIDATION RESULTS

✅ **Syntax Validation**
   - verify-admin-token.js: Node syntax check PASS
   - subscribe-mailerlite.js: Node syntax check PASS
   - admin-login.html: HTML tags balanced
   - index.html: No double commas
   - admin.html: No double commas

✅ **Structural Integrity**
   - index.html: Braces 915/915, Parens 1653/1653, Brackets 123/123
   - admin.html: Braces 1474/1474, Parens 2675/2675, Brackets 314/314
   - verify-admin-token.js: Braces 43/43, Parens 50/50
   - subscribe-mailerlite.js: Braces 68/68, Parens 82/82

✅ **Version Consistency**
   - build-version.js: v2.3.1-Build10.31.1
   - index.html inline: v2.3.1-Build10.31.1
   - admin.html inline: v2.3.1-Build10.31.1
   - CURRENT-BUILD.md: v2.3.1-Build10.31.1
   - sw.js: No hardcoded CACHE_VERSION ✓
   - All 3 consumer files reference build-version.js ✓

✅ **File Integrity**
   - All essential files present
   - GOOGLE-CREDENTIALS.json still absent ✓
   - Line counts: admin-login.html 106, verify-admin-token.js 111, subscribe-mailerlite.js 261

✅ **Config File Validation**
   - _headers, netlify.toml, _redirects: All valid, no HTML contamination

✅ **Feature Registry Check**
   - All 14 registered features present ✓

✅ **Visual Code Review**
   - Full diff vs Build10.31: 7 files changed + 1 release notes added, all expected
   - Alert calls follow same pattern as save-about-content.js, save-popup-settings.js
   - Both alert calls wrapped in try/catch (fail-safe)
   - No unintended modifications

**VALIDATION STATUS: ALL CHECKS PASSED ✅**
