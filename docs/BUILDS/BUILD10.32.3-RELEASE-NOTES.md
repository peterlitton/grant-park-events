# Build10.32.3 Release Notes
## Dashboard New Subscribers Fix

**Version:** v2.3.1-Build10.32.3
**Date:** 2026-04-13
**Type:** Bug fix (one-line)

---

## Issue

After Build10.32.2 restored `admin-dashboard.html`, Peter reported the "New Subscribers" card always showed 0, even though MailerLite had a new subscriber added that day.

## Root Cause

Field name mismatch between the dashboard and the Netlify function it calls.

`get-subscriber-stats.js` returns its stats object with the field named `recent`:

```javascript
const stats = {
  total: processedSubscribers.length,
  thisMonth: thisMonth.length,
  unsubRate: unsubRate,
  ...
  recent: recentSubscribers,    // <-- field name is 'recent'
  ...
};
```

But `admin-dashboard.html` was reading `subData.recentSubscribers`:

```javascript
const recent = (subData.recentSubscribers || []).filter(s => { ... });
```

Since `recentSubscribers` doesn't exist on the response, the `||` fallback always returned `[]`, the filter always returned `[]`, and the count was always 0. Regardless of how many new subscribers MailerLite had, the dashboard could never see them.

This bug has been in `admin-dashboard.html` since at least Build10.16.8 (the version we restored from). It was likely present from the original Build10.16.0 release. Nobody noticed because checking "0 new subscribers in the last 24 hours" looked plausible most of the time.

**Verification:** `admin.html`'s Subscribers tab uses the correct field name (`stats.recent`) at lines 650, 834, and 876. So we have a working reference.

## Fix

One word change in `admin-dashboard.html`:

```diff
-          const recent = (subData.recentSubscribers || []).filter(s => {
+          const recent = (subData.recent || []).filter(s => {
```

## Files Changed

| File | Change |
|------|--------|
| `admin-dashboard.html` | `recentSubscribers` → `recent` (1 line) + comment + version bump |
| `build-version.js` | Version bump |
| `index.html` | Inline version bump |
| `admin.html` | Inline version bump |
| `CURRENT-BUILD.md` | Version bump |

## Testing After Deploy

1. Visit `https://www.grantparkevents.com/admin-dashboard.html`
2. "New Subscribers" should now show the actual count of subscribers added in the last 24 hours
3. Add a test subscriber via the public site, wait ~5 minutes (MailerLite cache), refresh dashboard, verify count increments
4. The exact subscriber count depends on the 24-hour rolling window relative to current time

## Known Limitations (NOT in this fix)

These are present in the existing code but not addressed in this build (one risk per build):

- **5-minute cache:** `get-subscriber-stats` has `Cache-Control: public, max-age=300`, so new subscribers may not appear for up to 5 minutes
- **Date parsing edge case:** MailerLite returns dates as `"YYYY-MM-DD HH:MM:SS"` which browsers parse as local time. If you're in a different timezone than where MailerLite stores the time, the 24-hour boundary could miss edge cases. Not addressed because (a) it's working fine for non-edge cases now and (b) we don't yet know if MailerLite stores in UTC or your local time
- **24-hour rolling window:** A subscriber added at 4 PM yesterday won't show up after 4 PM today. Calendar-day "today" might be more intuitive. Not changed to preserve existing semantics.

## Risk Assessment

Risk: **Negligible.** One-word string change. The replaced field name is the one used successfully by `admin.html`'s Subscribers tab. If anything was going to go wrong with `subData.recent`, it would have already been broken in admin.html.

## Rollback

Redeploy Build10.32.2. Dashboard reverts to always showing 0 new subscribers.

---

## PRE-DELIVERY VALIDATION RESULTS

✅ **Syntax Validation**
   - All HTML files: No double commas

✅ **Structural Integrity**
   - index.html: Braces 918/918, Parens 1660/1660
   - admin.html: Braces 1481/1481, Parens 2692/2692
   - admin-dashboard.html: Braces 168/168, Parens 230/230 (was 229/229; +1 paren from new comment)

✅ **Version Consistency**
   - build-version.js: v2.3.1-Build10.32.3
   - index.html inline: v2.3.1-Build10.32.3
   - admin.html inline: v2.3.1-Build10.32.3
   - admin-dashboard.html inline: v2.3.1-Build10.32.3
   - CURRENT-BUILD.md: v2.3.1-Build10.32.3

✅ **File Integrity**
   - admin-dashboard.html: 493 lines (was 491; +2 from new comments)

✅ **Config File Validation**
   - _headers, netlify.toml, _redirects: All valid

✅ **Feature Registry Check**
   - All 14 registered features present ✓

✅ **Step 4d: Missing-Files Check vs Build10.32.2**
   - No files removed ✓

✅ **Visual Code Review**
   - Diff: 5 file changes (4 version bumps + 1 substantive)
   - The substantive change is exactly the 3 lines expected (comment + comment + field name)

**VALIDATION STATUS: ALL CHECKS PASSED ✅**
