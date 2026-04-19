# Build10.25 Release Notes

**Version:** v2.3.1-Build10.25
**Date:** 2026-03-09
**Base:** Build10.24.2

## Overview

New feature: Real-time event search on the homepage. Desktop supports type-to-search (start typing anywhere on the page). Mobile uses a magnifying glass icon with a slide-down overlay search bar. Also renames "Home" to "Events" in all navigation.

## New Feature: Event Search

### Desktop Behavior
- Gray magnifying glass icon appears in header, left of nav links (only on homepage card view)
- Click magnifying glass → 220px fixed-width search field appears left of the icon
- OR just start typing anywhere on the page — search field appears and captures keystrokes
- Real-time AND filtering: each space-separated term must match somewhere in the event's searchable text
- Searchable fields: title, performer, location, day name (FRIDAY), month (September), date, year, time
- Case-insensitive partial matching: "Cop Fri" → Copland's Symphony on Friday only
- Clear button (text) — clears query, keeps field open, refocuses
- Close button (X icon) — clears query AND closes field
- Esc key — same as close
- Magnifying glass turns red when search is active
- Global keydown listener ignores: inputs/textareas/selects (email popup, contact form), modifier keys, function keys

### Mobile Behavior
- Gray magnifying glass icon left of hamburger menu (only on homepage card view)
- Tap magnifying glass → search bar slides down below header as an overlay (doesn't push content)
- Slide-down animation: 200ms ease-out fade + translateY
- Search bar has: magnifying glass icon, input field, Clear (when text exists), Close (X)
- Same real-time AND filtering as desktop
- Opening hamburger menu closes search
- Tapping magnifying glass again closes search

### Shared Behavior
- Magnifying glass hidden on: About, Sign Up, dedicated event page, calendar view
- Switching to calendar view closes search
- Navigating to another page closes search
- No results: shows ChicagoStar icon + "No events match [query]" + Clear search button
- Cards filter in place (not a separate overlay)
- Modal navigation still uses full unfiltered event list (prev/next traverses all events)

## Navigation Rename

"Home" → "Events" in all four nav locations:
- Dedicated page desktop nav
- Dedicated page mobile menu
- Main header desktop nav
- Main header mobile menu

## Technical Details

### New State
- `searchQuery` (string) — current search text
- `searchActive` (boolean) — whether search UI is visible

### New Functions
- `getSearchString(ev)` — builds lowercase searchable string from all event fields including full day name and month name
- `openSearch()` — activates search, focuses visible input via `data-search-input` attribute
- `clearSearch()` — empties query, refocuses input
- `closeSearch()` — empties query and deactivates search

### New useMemo
- `filteredEvents` — derived from `sortedEvents` + `searchQuery`, AND-matches all space-separated tokens
- `isSearching` — derived boolean (searchActive OR searchQuery has content)

### New useEffects
- View change listener: closes search when switching to calendar
- Global keydown listener: captures printable keystrokes on homepage card view, ignores other inputs

### CSS
- `@keyframes searchSlideDown` added to style block for mobile overlay animation

### DOM Changes
- Main header: `relative` class added for mobile overlay positioning
- Desktop: search area (input + clear + close + magnifying glass) added left of nav links, wrapped in `hidden md:flex`
- Mobile: magnifying glass added left of hamburger, wrapped in `md:hidden`; search overlay at `absolute top-full` below header
- Both search inputs use `data-search-input` attribute for focus management (avoids ref conflicts between desktop/mobile)

## Files Modified
- `index.html` — search feature + nav rename (2698 lines, +105 from base)
- `build-version.js` — version + notes
- `admin.html` — version bump only
- `CURRENT-BUILD.md` — version update

## Testing Checklist

### Desktop
- [ ] Navigate to homepage — magnifying glass visible left of "Events" nav
- [ ] Click magnifying glass — field appears with cursor
- [ ] Type "Cop Fri" — only Friday Copland event shows
- [ ] Type "Friday" — all Friday events show
- [ ] Type "July" — all July events show
- [ ] Type "sept" — September events show
- [ ] Click Clear — query empties, field stays, all events return
- [ ] Click X — query empties, field closes
- [ ] Press Esc — same as X
- [ ] Start typing without clicking magnifying glass — field appears, captures text
- [ ] Click About tab — search closes, magnifying glass disappears
- [ ] Return to Events — magnifying glass reappears
- [ ] Switch to Calendar view — search closes, magnifying glass disappears
- [ ] Type gibberish — "No events match" message with Clear button
- [ ] Open email popup while searching — popup gets focus, search stays

### Mobile
- [ ] Magnifying glass visible left of hamburger
- [ ] Tap magnifying glass — search bar slides down below header
- [ ] Search bar overlays content (doesn't push down)
- [ ] Type and filter works same as desktop
- [ ] Clear and Close work
- [ ] Tap hamburger — search closes
- [ ] Navigate to About — search closes, magnifying glass gone
- [ ] Navigate back to Events — magnifying glass returns

### Nav Rename
- [ ] Desktop: "Events" shows instead of "Home" (both headers)
- [ ] Mobile menu: "Events" shows instead of "Home" (both headers)

## PRE-DELIVERY VALIDATION RESULTS

✅ **Syntax Validation** — No double commas
✅ **Structural Integrity** — Braces 916/916, Brackets 123/123, Parens 1653/1653
✅ **Version Consistency** — v2.3.1-Build10.25 in build-version.js, index.html, admin.html, CURRENT-BUILD.md
✅ **File Integrity** — All files present, 2698 lines index.html
✅ **Config Files** — _headers, netlify.toml, _redirects all valid
✅ **Feature Registry** — 13/13 passed
✅ **Code Review** — Diff reviewed, all changes intentional, no regressions
✅ **No duplicate state declarations** — searchQuery and searchActive each declared once
✅ **Home→Events rename** — 0 remaining 'Home' nav text references

**VALIDATION STATUS: ALL CHECKS PASSED ✅**
