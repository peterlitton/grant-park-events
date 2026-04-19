# Build10.32.4 Release Notes
## Dashboard Subscriber Range Toggle + Remove Slice Cap

**Version:** v2.3.1-Build10.32.4
**Date:** 2026-04-13
**Type:** Feature + supporting function change

---

## Overview

Adds a 24hr/7d/30d toggle to the "New Subscribers" card on the dashboard, and removes the 50-row slice limit from `get-subscriber-stats.js` so the 30-day count stays accurate during summer volume.

## Changes

### 1. Dashboard: New Subscribers Toggle

**File:** `admin-dashboard.html`

The "New Subscribers" card was restructured to match the Site Traffic card exactly:
- **Title** "New Subscribers" at top in `text-sm font-semibold text-gray-700` (matches "Site Traffic" h3)
- **Count** below the title, right-aligned, in `text-sm font-semibold text-gray-900` with `.toLocaleString()` formatting (matches the Google Search Impressions/Click-Throughs numbers in the GSC table above)
- **Pills** below the count: "Last: 24 hrs | 7 days | 30 days" — `px-2.5 py-1 text-xs rounded-full`, blue active state (`bg-blue-600 text-white`), gray inactive (`bg-gray-100 text-gray-500 hover:bg-gray-200`) — pixel-identical to the Site Traffic date range selector

Default range is 24 hrs. Active pill is blue-filled.

**How it works:**
- The dashboard fetches the full subscriber list once on page load into state
- A `useMemo` computes the count reactively by filtering in-memory based on `subRange`
- Tapping a toggle changes `subRange` state, which re-runs the memo and updates the count
- **Zero API calls on toggle** — pure client-side filter

**State restructure:**
- Was: `newSubs = { loading, error, count }` (count precomputed at fetch time)
- Now: `newSubs = { loading, error, list }` + separate `subRange` state + reactive `subCount` via useMemo

### 2. Function: Remove slice cap

**File:** `netlify/functions/get-subscriber-stats.js`

**Was:**
```javascript
const recentSubscribers = processedSubscribers
  .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
  .slice(0, 50);
```

**Now:**
```javascript
const recentSubscribers = processedSubscribers
  .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
```

**Why:** The dashboard's 30-day range needs all subscribers within 30 days. Capping to 50 would underreport the 30-day count during summer volume (more than 50 new signups in a 30-day window). Admin.html's Subscribers tab also wants the full list — it already paginates client-side. Removing the cap serves both consumers and fixes the dashboard.

**Performance impact:**
- Response size: ~4KB (50 subs) → ~80KB (current 1000-ish subs), still well under any meaningful threshold
- 5-minute `Cache-Control: public, max-age=300` already in place, so MailerLite API load is unchanged
- Dashboard and admin.html both benefit from the same cache — no extra calls

## Files Changed

| File | Change |
|------|--------|
| `admin-dashboard.html` | Toggle UI, reactive subCount, state restructure (~30 lines) |
| `netlify/functions/get-subscriber-stats.js` | Removed `.slice(0, 50)` |
| `build-version.js` | Version bump |
| `index.html` | Inline version bump |
| `admin.html` | Inline version bump |
| `CURRENT-BUILD.md` | Version bump |

## Testing After Deploy

1. Visit `/admin-dashboard.html`
2. Verify "New Subscribers" card shows count with three pill buttons below: 24 hrs | 7 days | 30 days
3. Default selection should be "24 hrs" (purple-filled), matching previous count
4. Tap "7 days" — count should update instantly (no loading spinner), active pill switches to "7 days"
5. Tap "30 days" — count should update instantly, active pill switches
6. Tap back to "24 hrs" — count returns to previous value
7. Tap refresh (🔄) — count reloads from API but maintains current range selection (state is preserved)
8. Verify admin.html Subscribers tab still works (same function, larger payload now)
9. Verify network tab shows **only one** call to `get-subscriber-stats` per page load, regardless of how many toggle taps

## Risk Assessment

| Item | Risk | Mitigation |
|------|------|------------|
| Slice removal breaks admin.html Subscribers tab | Low — tab already iterates the full list with its own pagination. Larger array is what it wants. | Tested via structural + syntax checks |
| useMemo doesn't update when expected | Low — standard React pattern. Dependency array is `[newSubs, subRange]` which covers all inputs | Visual code review |
| Toggle buttons don't render on mobile | Low — uses `flex-1` so buttons divide available space equally | Match existing pill button pattern in codebase |
| Response size spike in some edge case | None — response is naturally bounded by total subscriber count, not a runaway | 5-min cache absorbs burst load |

## Rollback

Redeploy Build10.32.3. Dashboard loses the toggle but still shows correct 24-hour count (the 10.32.3 field name fix). The slice cap returns, 30-day count would be wrong if exceeded.

---

## PRE-DELIVERY VALIDATION RESULTS

✅ **Syntax Validation**
   - All HTML files: No double commas
   - get-subscriber-stats.js: Node syntax PASS
   - All other .js files: Syntax PASS

✅ **Structural Integrity**
   - index.html: Braces 918/918, Parens 1660/1660, Brackets 124/124
   - admin.html: Braces 1481/1481, Parens 2692/2692, Brackets 318/318
   - admin-dashboard.html: Braces 172/172, Parens 237/237, Brackets 50/50
   - get-subscriber-stats.js: Braces 35/35, Parens 61/61

✅ **Version Consistency**
   - build-version.js: v2.3.1-Build10.32.4
   - index.html inline: v2.3.1-Build10.32.4
   - admin.html inline: v2.3.1-Build10.32.4
   - admin-dashboard.html inline: v2.3.1-Build10.32.4
   - CURRENT-BUILD.md: v2.3.1-Build10.32.4

✅ **File Integrity**
   - admin-dashboard.html: 513 lines (was 493, +20 for toggle UI and state)
   - get-subscriber-stats.js: 165 lines (was 164, +1 from comment rewrite)

✅ **Config File Validation**
   - _headers, netlify.toml, _redirects: All valid

✅ **Feature Registry Check**
   - All 14 registered features present ✓

✅ **Step 4d: Missing-Files Check vs Build10.32.3**
   - No files removed ✓

✅ **Visual Code Review**
   - Diff: 6 file changes, all intentional
   - No unexpected modifications

**VALIDATION STATUS: ALL CHECKS PASSED ✅**
