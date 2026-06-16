# Build10.40 Release Notes
## Landing Pages Chart — Exclude Home

**Version:** v2.3.1-Build10.40
**Date:** 2026-06-15
**Type:** Dashboard enhancement

### Condition
Home page dominates the Top Landing Pages chart (4,276 sessions vs 154 for the next page), making all event page bars appear as thin slivers. The chart provides no useful insight into which event pages visitors are landing on.

### Change
Home entries are filtered from the bar chart and summed into the subtitle. Bars rescale to the highest non-home page.

**Before:** "First page visited · 7 days" with Home dominating at full width
**After:** "First page visited · 7 days · 4,434 Home" with event pages at readable scale

### Implementation
Client-side filter in `admin-dashboard.html`. All entries where `pageName(path) === 'Home'` are summed and excluded from the bar chart. No server-side or GA4 query changes.

### Files Changed
- `admin-dashboard.html` — Landing pages rendering logic (lines 388-398)
- Version bump files

### Verification
1. Open executive dashboard → Analytics page
2. Confirm "Top Landing Pages" subtitle shows Home total
3. Confirm chart shows only non-Home pages with readable bars
4. Confirm Home is not listed in any bar

**VALIDATION STATUS: PENDING ⬜**
