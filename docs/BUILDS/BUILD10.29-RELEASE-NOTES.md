# Build10.29 Release Notes
## Auth Token Infrastructure (Phase 1 — Non-Breaking)

**Version:** v2.3.1-Build10.29
**Date:** 2026-03-19
**Type:** Security — Server-side auth infrastructure
**Prerequisite:** GPE_ADMIN_TOKEN environment variable must be set in Netlify dashboard before deploy

---

## Overview

Phase 1 of server-side authentication for Netlify Functions. This build adds token infrastructure without changing function behavior — functions still accept unauthenticated requests. Admin now sends an Authorization header with every write/delete request, and login is verified server-side. Phase 2 (Build10.30) will add enforcement to functions.

## Problem Addressed

All write/delete functions (save-events, save-campaigns, save-about-content, save-popup-settings, delete-image, save-monitor-settings) accept any POST request from any origin with no authentication. The /.netlify/functions/ path is a well-known Netlify convention. A single unauthenticated curl command could wipe all site content. See GPE-Security-Risks-Evaluation.docx for full analysis.

## What Ships

### 1. New function: `verify-admin-token.js`
- Accepts POST with `{ token: "..." }` body
- Compares against `GPE_ADMIN_TOKEN` environment variable
- Returns 200 on match, 401 on mismatch, 500 if env var not set
- Handles CORS preflight (OPTIONS)
- ES module format matching existing function architecture

### 2. New file: `admin-login.html` (version-controlled)
- Replaces the previously unversioned login page on production
- Password input with Enter key support
- Calls `verify-admin-token` for server-side verification
- On success: stores token as `gpe_admin_token` in sessionStorage, sets `gpe_admin_auth` and `gpe_admin_time` for backward compatibility, redirects to admin.html
- On failure: shows "Incorrect password" error
- Tailwind-styled, matches admin aesthetic
- Has `noindex, nofollow` meta tag

### 3. Updated: `admin.html`
- **`getAuthHeaders()` helper** — returns `{ 'Content-Type': 'application/json', 'Authorization': 'Bearer <token>' }` using token from sessionStorage
- **`handle401()` helper** — checks for 401 response, clears session, redirects to login (available for Phase 2)
- **9 fetch calls updated** to use `getAuthHeaders()` instead of `{ 'Content-Type': 'application/json' }`:
  1. Line 1523: save-popup-settings (background migration)
  2. Line 1729: save-events
  3. Line 1752: save-campaigns
  4. Line 1785: delete-mailerlite-campaign (first instance)
  5. Line 1831: delete-mailerlite-campaign (second instance)
  6. Line 2209: delete-image
  7. Line 2236: save-popup-settings (main save)
  8. Line 2261: save-about-content
  9. Line 3138: save-monitor-settings
- **4 non-write fetch calls left untouched** (generate-email-html ×3, scrape-event ×1) — these are read/generate operations, not write/delete

## What Does NOT Ship

Functions are NOT modified. They continue accepting any request. The Authorization header is sent but harmlessly ignored by existing function code. This is intentional — Phase 1 is non-breaking.

## Prerequisite: Netlify Environment Variable

**Before deploying this build:**
1. Netlify dashboard → Site settings → Environment variables
2. Add variable: Key = `GPE_ADMIN_TOKEN`, Value = your admin password
3. Scope = Functions

If not set, verify-admin-token returns 500 and login fails.

## Files Changed

| File | Change |
|------|--------|
| `netlify/functions/verify-admin-token.js` | NEW — 62 lines, server-side token verification |
| `admin-login.html` | NEW — 101 lines, version-controlled login page |
| `admin.html` | Added getAuthHeaders + handle401 helpers, updated 9 fetch calls |
| `build-version.js` | Version bump |
| `index.html` | Inline version bump |
| `CURRENT-BUILD.md` | Version bump |

## Testing Requirements

- [ ] Set GPE_ADMIN_TOKEN in Netlify dashboard before deploy
- [ ] admin-login.html loads at /admin-login.html
- [ ] Wrong password → "Incorrect password" message, no redirect
- [ ] Correct password → redirects to admin.html with working session
- [ ] Network tab: all write/delete requests show Authorization header
- [ ] Save events → works
- [ ] Save campaigns → works
- [ ] Save about content → works
- [ ] Save popup settings → works
- [ ] Delete image → works
- [ ] Save monitor settings → works
- [ ] Logout → clears session, redirects to login
- [ ] Re-login → all operations still work
- [ ] Public site completely unaffected (events load, signup works)
- [ ] Backup Content button still works (Build10.28)

## Success Criteria

1. Login works via server-side verification
2. All admin operations work with auth headers being sent
3. Network tab confirms Authorization header on every write/delete request
4. No function behavior changes — unauthenticated direct calls still work (that's Phase 2)

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| Login returns "Connection error" | verify-admin-token function didn't deploy | Check Netlify function logs |
| Login always fails | GPE_ADMIN_TOKEN not set or wrong value | Check Netlify env vars, scope must include Functions |
| Admin operations fail after login | getAuthHeaders not returning token | Check sessionStorage has gpe_admin_token |
| Public site broken | Should not happen — no public-facing changes | Rollback to Build10.28 |

## Rollback

Redeploy Build10.28. No function behavior was changed, so reverting removes the token sending. admin-login.html reverts to the old unversioned copy still on production. GPE_ADMIN_TOKEN env var can stay in the dashboard harmlessly.

## Pre-existing Issue Noted

admin.html references `delete-mailerlite-campaign` at lines 1785 and 1831, but that function file does not exist in the build. Not introduced by this build — pre-existing. Auth headers are added to these calls for consistency; they'll fail with a 404 regardless.

---

## PRE-DELIVERY VALIDATION RESULTS

✅ **Syntax Validation**
   - verify-admin-token.js: Node syntax check PASS
   - admin-login.html: HTML tags balanced
   - index.html: No double commas
   - admin.html: No double commas
   - Pre-existing false positives only (regex, SVG, multi-line props)

✅ **Structural Integrity**
   - index.html: Braces 915/915, Parens 1653/1653, Brackets 123/123
   - admin.html: Braces 1474/1474, Parens 2675/2675, Brackets 314/314

✅ **Version Consistency**
   - build-version.js: v2.3.1-Build10.29
   - index.html inline: v2.3.1-Build10.29
   - admin.html inline: v2.3.1-Build10.29
   - CURRENT-BUILD.md: v2.3.1-Build10.29
   - sw.js: No hardcoded CACHE_VERSION ✓
   - All 3 consumer files reference build-version.js ✓

✅ **File Integrity**
   - All essential files present + 2 new files
   - Line counts: index.html 2699, admin.html 5197, admin-login.html 101, verify-admin-token.js 62

✅ **Config File Validation**
   - _headers, netlify.toml, _redirects: All valid, no HTML contamination

✅ **Feature Registry Check**
   - All 14 registered features present ✓

✅ **Visual Code Review**
   - Full diff reviewed: 4 modified files + 2 new files, only expected changes
   - 9 fetch header replacements verified (getAuthHeaders)
   - 4 non-write fetch calls correctly untouched
   - No unintended file modifications

**VALIDATION STATUS: ALL CHECKS PASSED ✅**
