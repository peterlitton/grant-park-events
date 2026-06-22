# Build10.42 Release Notes
## Campaign builder: exclude hidden events from the date-range picker

**Version:** v2.3.1-Build10.42
**Date:** 2026-06-22
**Type:** Bug fix — campaign builder (`admin.html`). No backend change.

---

## Problem

The email campaign builder's date-range picker selected every event whose date fell within the chosen window, regardless of visibility. Hidden events (`published === false`) were included and auto-selected into campaigns. At the time of this fix there were 2 hidden events in the data, either of which would have been pulled into any campaign covering its date.

## Fix

**File:** `admin.html` — the date-range filter `useEffect` (the block that builds `filtered` from `events`).

Added a guard as the first check in the filter:

```js
// Build10.42: Exclude hidden events (published === false)
if (event.published === false) {
  return false;
}
```

This matches the convention used elsewhere in `admin.html` (the Event Manager visibility filter, line ~2405): an event counts as hidden only when `published` is explicitly `false`, so events missing the field remain visible.

## Scope notes

- **Navy Pier Summer Fireworks is intentionally left unchanged.** The pre-existing legacy line `if (event.title === 'Navy Pier Fireworks')` was not modified. Navy Pier Summer Fireworks is included in campaigns by design.
- Date-range logic itself is unchanged: inclusive `event.date >= startDate && event.date <= endDate`, string-compared on `YYYY-MM-DD`.

## Documentation

- New: `docs/SOPs/CAMPAIGN-EVENT-PICKER.md` — documents the picker's event-selection rules.
- Registered the hidden-exclusion in `feature-registry-check.sh` / `FEATURE-REGISTRY.md` (signature: `Build10.42: Exclude hidden events`).

## Validation

- Braces: 1478/1478 MATCH
- Parens: 2675/2675 MATCH
- Double commas: none
- Embedded JS: `node --check` passed
- Feature registry: ALL FEATURE CHECKS PASSED
- Version consistency: all 5 files at v2.3.1-Build10.42

## Deploy

Single-file change to `admin.html` plus version bump and docs. Safe to deploy. After deploy, open the campaign builder, set a date range that spans a hidden event, and confirm it no longer appears in the picker.
