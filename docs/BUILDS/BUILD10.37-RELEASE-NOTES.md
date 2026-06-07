# Build10.37 Release Notes
## Real-time Dashboard: Today Page + 3-Page Navigation

**Version:** v2.3.1-Build10.37
**Date:** 2026-06-05
**Type:** Feature — new dashboard page and GA4 endpoints

---

## Overview

Added a "Today" page to the executive dashboard with real-time and same-day analytics. Dashboard now has 3 swipeable pages: Today → Analytics → Campaigns.

## Changes

### 1. New Dashboard Page: Today

**File:** `admin-dashboard.html`

Three new sections on the first (default) page:

**Right Now** (GA4 Realtime API — last 30 minutes)
- Active visitor count with pulsing green indicator
- Pages being viewed right now (top 5 by active users)
- Device breakdown (mobile/desktop/tablet)

**Today's Traffic** (GA4 Data API — today's date)
- Hourly bar chart showing visits per hour
- Color-coded: blue (past hours), amber (current hour), gray (upcoming)
- Chart height increased to 110px for better x-axis readability
- Hour labels shown every 3rd hour (12a, 3, 6, 9, 12p, 3, 6, 9)
- Total visits today in header

**Today's Top Pages** (GA4 Data API — today's date)
- Top 5 most-viewed pages since midnight CT
- Friendly page names via existing `pageName()` helper

### 2. Three-Page Swipe Navigation

**File:** `admin-dashboard.html`

Expanded from 2 pages to 3:
- **Page 1: Today** — Right Now, Today's Traffic, Today's Top Pages
- **Page 2: Analytics** — Search Performance, Rankings, Queries, Pages, Landing Pages, Subscribers, Traffic, Engagement, Sources & Devices
- **Page 3: Campaigns** — Trend chart, campaign cards

Navigation: 3 dot indicators with labels (Today · Analytics · Campaigns). Tap or swipe.

Swipe handler updated to support `page < 2` / `page > 0` for 3-page navigation.

### 3. New GA4 API Endpoints

**File:** `netlify/functions/ga4-analytics.js`

**`runRealtimeReport` helper** — new function for GA4 Realtime API endpoint (`properties/{id}:runRealtimeReport`). Same auth as existing `runReport`.

**`realtime` metric** — 3 parallel realtime API calls:
- Total active users
- Top 5 pages by active users (dimension: `unifiedScreenName`)
- Device category breakdown (dimension: `deviceCategory`)
- Returns: `{ activeUsers, pages: [{page, activeUsers}], devices: {mobile, desktop, tablet} }`

**`today-traffic` metric** — standard report with `startDate: 'today'`:
- Dimension: `dateHour` for hourly breakdown
- Returns: `{ totalToday, hours: [{hour, sessions}] }`

**`today-pages` metric** — standard report with `startDate: 'today'`:
- Top 5 pages by `screenPageViews`
- Returns: `{ pages: [{path, views}] }`

## Files Changed

| File | Change |
|------|--------|
| `admin-dashboard.html` | Today page added, 3-page navigation, chart height increased (374→460 lines) |
| `netlify/functions/ga4-analytics.js` | `runRealtimeReport` helper + 3 new metrics (265→364 lines) |
| `build-version.js` | Version bump |
| `index.html` | Version bump |
| `admin.html` | Version bump |
| `CURRENT-BUILD.md` | Version bump |

## Testing After Deploy

1. Open `/admin-dashboard.html` on mobile
2. Default page should be "Today" with green pulsing dot
3. Verify "Right Now" shows active user count and pages
4. Verify "Today's Traffic" shows hourly bar chart with current hour in amber
5. Verify "Today's Top Pages" shows today's most-viewed pages
6. Swipe left → "Analytics" page (existing sections)
7. Swipe left → "Campaigns" page (existing campaign cards)
8. Tap dot labels to navigate between pages
9. Tap "Refresh" to reload all data

## Risk Assessment

| Item | Risk | Notes |
|------|------|-------|
| GA4 Realtime API access | Low | Uses same service account and analytics.readonly scope as existing metrics |
| Realtime API rate limits | Low | Called once on page load + on refresh. GA4 allows ~10 requests/second |
| Today data delay | Low | GA4 same-day data may have ~30 min processing delay. Realtime data is immediate. |
| Existing sections affected | None | Inserted as new page; analytics and campaigns pages unchanged |

---

## PRE-DELIVERY VALIDATION RESULTS

✅ Syntax: All 8 files clean (5 JS pass node -c, 3 HTML no double commas)
✅ Structure: All balanced (braces, parens, brackets)
✅ Versions: All 5 locations consistent at v2.3.1-Build10.37
✅ sw.js: clean (no stale cache version)
✅ Script refs: 4/4
✅ File integrity: GOOGLE-CREDENTIALS.json absent
✅ Config files: _headers, netlify.toml, _redirects valid
✅ Feature registry: All features present
✅ GA4 metrics: 9 total (6 existing + 3 new)
✅ Dashboard: 3 pages defined and wired (todayPage, analyticsPage, campaignPage)
✅ Swipe: supports 3 pages (0→2 forward, 2→0 backward)
✅ Data property names verified between API responses and dashboard rendering

**VALIDATION STATUS: ALL CHECKS PASSED ✅**

---

## Build10.37.1 — Hourly Chart X-Axis Fix
- Moved hour labels out of chart height container into separate row below
- Chart container only contains values + bars

## Build10.37.2 — Plotly Hourly Chart + Label Cleanup
- Replaced CSS div-based hourly chart with Plotly bar chart
- Hover tooltips on each bar
- Hour labels under every bar: 12, 1, 2, 3...11, 12pm, 1, 2...11
- Only noon shows "12pm" suffix — all others just the number
- Legend simplified to "Past" and "Now" only (removed "Upcoming")
- Proper x-axis handling by Plotly (no manual label spacing)

## Build10.37.3 — Hourly Chart X-Axis Fix
- Fixed Plotly treating hour labels as numbers (showed 0, 5, 10 instead of hours)
- Fixed duplicate labels causing PM bars to merge with AM bars
- Uses integer x positions (0-23) with tickvals/ticktext for display labels
- Labels: 12, 1, 2...11, 12pm, 1, 2...11 — each bar has unique position
- Hover tooltips show visit count
- Increased top margin for text-above-bar visibility

## Build10.37.4 — Force Horizontal Labels
- Added `tickangle: 0` to prevent Plotly auto-rotating x-axis labels vertically

## Build10.37.5 — Program Notes Label Change
- Removed "(PDF)" from "View Program Notes (PDF)" → "View Program Notes" (index.html, 2 locations)
- Admin field label: "Program PDF Link" → "Program Notes Link" (admin.html)
- Text-only change, no code

## Build10.37.6 — Business Card QR Traffic Chart

**New GA4 metric:** `qr-traffic`
- Queries `sessionSource` filtered to `gpe-bcard-qr` (configurable via `?source=` param)
- Returns daily session counts for last 30 days (configurable via `?days=` param)
- Response: `{ source, period, days: [{date, sessions}], total }`

**Dashboard:** Added "Business Card QR Visits" card to campaigns page
- Plotly bar chart showing daily visits from QR source
- Total visit count in header
- Positioned below MailerLite campaign cards
- Shows "No QR traffic data found" if source has no data

**Files changed:**
- `netlify/functions/ga4-analytics.js` — new `qr-traffic` metric
- `admin-dashboard.html` — QrTrafficChart component + campaigns page card + state + fetch
- Version bump files
