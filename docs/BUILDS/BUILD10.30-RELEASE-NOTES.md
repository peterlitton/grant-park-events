# Build10.30 Release Notes
## Auth Enforcement (Phase 2) + Event Counts Fix

**Version:** v2.3.1-Build10.30
**Date:** 2026-03-19
**Type:** Security — Server-side auth enforcement + Bug fix
**Prerequisite:** GPE_ADMIN_TOKEN must be set in Netlify dashboard (done in Build10.29)

---

## Overview

Phase 2 of server-side authentication. All 6 write/delete functions now require a valid `Authorization: Bearer <token>` header matching the `GPE_ADMIN_TOKEN` environment variable. Unauthenticated requests receive a 401 response. Also fixes the Event Counts button overflow from Build10.28.

## Changes

### 1. Auth enforcement on 6 functions

Each function now checks the Authorization header immediately after the OPTIONS/method check. The pattern added to each:

```javascript
const authHeader = req.headers.get('authorization');
const token = process.env.GPE_ADMIN_TOKEN;
if (!authHeader || authHeader !== `Bearer ${token}`) {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
}
```

**Functions modified:**

| Function | OPTIONS Added | Auth Added | Headers Updated |
|----------|:---:|:---:|:---:|
| save-events.js | ✓ (new) | ✓ | Authorization added |
| save-campaigns.js | existed | ✓ | Authorization added |
| save-about-content.js | ✓ (new) | ✓ | Authorization added |
| save-popup-settings.js | ✓ (new) | ✓ | Authorization added |
| save-monitor-settings.js | ✓ (new) | ✓ | Authorization added |
| delete-image.js | existed | ✓ | Authorization added |

Functions that already had OPTIONS handlers (save-campaigns, delete-image) had `Authorization` added to `Access-Control-Allow-Headers`. Functions without OPTIONS handlers (save-events, save-about-content, save-popup-settings, save-monitor-settings) got a full OPTIONS handler added.

### 2. Event Counts flex-wrap fix

Quick Actions → Event Counts card: the Total/Published/Hidden filter buttons were overflowing in the 4-column grid introduced in Build10.28.

**Fix:** Changed button container from `flex gap-3 text-sm` to `flex flex-wrap gap-2 text-sm`. Buttons now wrap to a second row when the card is narrow. Gap reduced from 3 to 2 to fit better.

### 3. What stays unprotected (by design)

- `subscribe-mailerlite.js` — called from the public visitor signup form, must remain open
- `generate-email-html.js` — read/generate, not write
- `scrape-event.js` — read/generate, not write
- All `get-*` functions — read-only

## Files Changed

| File | Change |
|------|--------|
| `netlify/functions/save-events.js` | OPTIONS handler + auth check |
| `netlify/functions/save-campaigns.js` | Authorization header in OPTIONS + auth check |
| `netlify/functions/save-about-content.js` | OPTIONS handler + auth check |
| `netlify/functions/save-popup-settings.js` | OPTIONS handler + auth check |
| `netlify/functions/save-monitor-settings.js` | OPTIONS handler + auth check |
| `netlify/functions/delete-image.js` | Authorization header in OPTIONS + auth check |
| `admin.html` | Version bump + Event Counts flex-wrap fix |
| `build-version.js` | Version bump |
| `index.html` | Inline version bump |
| `CURRENT-BUILD.md` | Version bump |

## Testing Requirements

### Auth enforcement (primary)
- [ ] All admin operations still work when logged in (auth headers sent from Build10.29)
- [ ] Save events → works
- [ ] Save campaigns → works
- [ ] Save about content → works
- [ ] Save popup settings → works (both locations)
- [ ] Delete image → works
- [ ] Save monitor settings → works
- [ ] Direct curl WITHOUT token → 401:
  ```
  curl -s -o /dev/null -w "%{http_code}" -X POST \
    https://www.grantparkevents.com/.netlify/functions/save-events \
    -H "Content-Type: application/json" -d '[]'
  ```
  Expected: 401
- [ ] Direct curl WITH token → works:
  ```
  curl -s -o /dev/null -w "%{http_code}" -X POST \
    https://www.grantparkevents.com/.netlify/functions/save-events \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer YOUR_TOKEN" -d '[]'
  ```
  Expected: 200 (CAUTION: this actually saves — use current events data)
- [ ] Public site unaffected (events load, subscriber signup works)

### Event Counts fix
- [ ] Quick Actions grid → Event Counts card → buttons wrap properly in 4-column layout

### Backup
- [ ] Backup Content button still works (Build10.28)

## Success Criteria

1. Unauthenticated requests to any write/delete function return 401
2. Authenticated requests (from admin UI) work normally
3. Event Counts buttons no longer overflow their card

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| All admin saves return 401 | Token not sent or mismatch | Check sessionStorage has gpe_admin_token; verify it matches GPE_ADMIN_TOKEN env var |
| One function works, others don't | Inconsistent deployment | Redeploy; check function logs in Netlify |
| Public site subscriber signup broken | subscribe-mailerlite should NOT have auth | Verify subscribe-mailerlite.js was NOT modified |
| Event Counts buttons still overflow | Browser cache | Hard refresh (Ctrl+Shift+R) |

## Rollback

Redeploy Build10.29. Functions go back to accepting any request. Admin still sends token headers (harmlessly ignored). Event Counts flex-wrap reverts but is cosmetic only.

## Security Status After This Build

| Risk | Before | After |
|------|--------|-------|
| #1: Unprotected Functions | 7 | 3 |
| #2: Client-side admin auth | 7 | 3 (functions enforce server-side regardless) |

The remaining risk level of 3 reflects that the token is static and visible in browser DevTools during an authenticated session. This is acceptable for a single-operator site.

---

## PRE-DELIVERY VALIDATION RESULTS

✅ **Syntax Validation**
   - All 6 modified functions: Node syntax check PASS
   - index.html: No double commas
   - admin.html: No double commas

✅ **Structural Integrity**
   - index.html: Braces 915/915, Parens 1653/1653, Brackets 123/123
   - admin.html: Braces 1474/1474, Parens 2675/2675, Brackets 314/314
   - All 6 functions: Braces and parens balanced

✅ **Version Consistency**
   - build-version.js: v2.3.1-Build10.30
   - index.html inline: v2.3.1-Build10.30
   - admin.html inline: v2.3.1-Build10.30
   - CURRENT-BUILD.md: v2.3.1-Build10.30
   - sw.js: No hardcoded CACHE_VERSION ✓
   - All 3 consumer files reference build-version.js ✓

✅ **File Integrity**
   - All essential files present
   - Line counts reasonable

✅ **Config File Validation**
   - _headers, netlify.toml, _redirects: All valid, no HTML contamination

✅ **Feature Registry Check**
   - All 14 registered features present ✓
   - All 6 functions contain GPE_ADMIN_TOKEN check ✓

✅ **Visual Code Review**
   - Full diff: 10 files changed, all expected
   - admin.html: 2 changes only (version + flex-wrap)
   - Each function: consistent auth pattern applied
   - No unintended modifications

**VALIDATION STATUS: ALL CHECKS PASSED ✅**
