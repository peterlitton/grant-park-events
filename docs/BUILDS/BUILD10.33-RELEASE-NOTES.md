# Build10.33 Release Notes
## Weekend Pill Repositioned + Friday Added to "This Weekend"

**Version:** v2.3.1-Build10.33
**Date:** 2026-05-31
**Type:** UI adjustment + logic change

---

## Changes

### 1. Pill position moved from top-left to top-right

The TODAY / THIS WEEKEND pill on event cards was positioned `top-4 left-4` (overlapping with the Chicago star icon at `top-3 left-3` on events with images). Moved to `top-4 right-4` — same distance from edges, no overlap with the star.

### 2. "This Weekend" now includes Friday

`isThisWeekend()` previously matched only Saturday and Sunday. Now matches Friday, Saturday, and Sunday. Events on the upcoming Friday will show the blue "THIS WEEKEND" pill.

**Logic:** Friday is calculated as Saturday minus 1 day, using the same Saturday anchor the function already computed.

**Edge case behavior (unchanged):** If today IS Friday/Saturday/Sunday, `isToday()` takes priority and shows the red "TODAY" pill instead. The "THIS WEEKEND" pill only appears for upcoming weekend days that aren't today.

## Files Changed

| File | Change |
|------|--------|
| `index.html` | `isThisWeekend` expanded to include Friday; pill position `left-4` → `right-4` |
| `build-version.js` | Version bump |
| `admin.html` | Inline version bump |
| `admin-dashboard.html` | Inline version bump |
| `CURRENT-BUILD.md` | Version bump |

## Testing After Deploy

1. Check event cards on the public site — any event this Friday, Saturday, or Sunday should show a blue "THIS WEEKEND" pill in the **top-right** corner
2. Any event happening today should show a red "TODAY" pill in the top-right corner instead
3. Verify the Chicago star icon (top-left on events with images) no longer overlaps with the pill
4. Events not this weekend should have no pill

---

## PRE-DELIVERY VALIDATION RESULTS

✅ Syntax: All HTML files clean, seo-canonical.js passes
✅ Structure: index.html 918/918 braces, 1663/1663 parens, 124/124 brackets
✅ Versions: All 4 locations + CURRENT-BUILD.md consistent at v2.3.1-Build10.33
✅ File integrity: GOOGLE-CREDENTIALS.json absent, all files present
✅ Config files: _headers, netlify.toml, _redirects valid
✅ Feature registry: All 14 features present
✅ Step 4d: No files removed vs previous build
✅ Visual diff: 5 file changes, all intentional

**VALIDATION STATUS: ALL CHECKS PASSED ✅**
