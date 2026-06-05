# Build10.35 Series Release Notes
## Dashboard Redesign + Campaign Analytics + Bug Fixes

**Version:** v2.3.1-Build10.35 through Build10.35.5
**Date:** 2026-06-01 through 2026-06-04
**Type:** Major feature + bug fixes

---

## Build10.35 — Dashboard Redesign

Complete rebuild of `admin-dashboard.html` (516 → 374 lines).

### Dashboard Layout
- Two swipeable pages: **Analytics** ← swipe → **Campaigns**
- Dot + label navigation at top, touch swipe or tap to switch
- All sections open by default, no close/chevron indicators
- Card layout, mobile-first design

### Analytics Page Sections
1. **Combined Search Performance** — impressions + clicks + CTR% in one card, daily table with totals
2. **Google Rankings** — 10 rows (was 5), position badges color-coded, impressions + clicks columns
3. **Top Search Queries** — 10 rows (was 3), impressions + clicks + CTR% columns (no % in data values)
4. **Top Pages** — limited to 5, friendly page names
5. **Top Landing Pages** — horizontal bar chart, first page visited
6. **New Subscribers** — 30-day bar chart with daily numbers above bars, total count
7. **Site Traffic** — Plotly line chart, period toggle 7/14/30 days
8. **Event Engagement** — Add to Calendar + Shares counts from GA4 custom events
9. **Sources & Devices** — Plotly donut charts
10. Comma formatting throughout via `n.toLocaleString()`

### Campaigns Page
- Each sent campaign card: delivered count, opens (count + rate), clicks (count + rate)
- Secondary stats: unsubs, spam, bounces (shown if non-zero), "✓ Clean delivery" badge if all zero
- Campaign trend chart: Plotly dual Y axes — bars for counts (left), lines for rates (right)

### New Function: `netlify/functions/get-campaign-stats.js`
- Queries `https://connect.mailerlite.com/api/campaigns?filter[status]=sent`
- Uses `MAILERLITE_API_KEY` (Bearer auth)
- Returns: id, name, subject, sentAt, stats (sent, opensCount, openRate, clicksCount, clickRate, unsubscribes, spam, hardBounces, softBounces)
- Open/click rates calculated from counts (sent/opensCount × 100) — MailerLite API returns 0 for rate fields
- 5-minute cache

### Updated Functions
- `ga4-analytics.js`: Added `landing-pages` metric (landingPagePlusQueryString dimension, sessions, limit 10) and `engagement` metric (queries add_to_calendar and share_event custom events)
- `gsc-search-analytics.js`: top-queries-impressions expanded 3→10, top-queries-clicks expanded 3→10, top-positions expanded 5→10 (rowLimit 25→50)

---

## Build10.35.1 — Traffic Chart Fix
- Fixed property name mismatch: GA4 function returns `days`, dashboard referenced `daily`

## Build10.35.2 — Campaign API Fix
- MailerLite API rejected `limit=20` (only accepts 10/25/50/100). Removed limit parameter entirely.

## Build10.35.3 — Dashboard Header Restored
- GPE logo header restored at top of page
- Admin button restored (links to /admin.html)
- Refresh button proper styling
- Chicago timezone on refresh timestamp
- noindex/nofollow meta tag restored
- Defensive null checks on all data access to prevent blank page on API errors

## Build10.35.4 — Campaign Rates + Sort Order
- Campaign open/click rates calculated from counts instead of relying on MailerLite's broken rate fields
- Daily search performance sorted newest first
- Subtitle clarified: "GSC · ~2 day data lag"

## Build10.35.5 — Admin Footer + Hero Image Fix

### Admin Footer Pinned to Bottom
**File:** `admin.html`

On mobile, the admin footer was floating up the page behind the Edit Event modal.

**Fix:** Standard CSS sticky footer pattern:
- Outer wrapper: `min-h-screen flex flex-col` (removed `pb-20` that blocked bottom)
- Content area: added `flex-1` to grow and fill remaining space
- Footer: changed `mt-8` to `mt-auto` to pin to bottom

### Hero Image URL Doubling
**File:** `netlify/functions/generate-email-html.js`

The email template prepended `https://www.grantparkevents.com/.netlify/functions/images/` to the `heroImage` field. One campaign had the full URL stored in `heroImage`, causing the prefix to double.

**Root cause:** The admin heroImage input accepts any format. One campaign was saved with the full URL instead of just the filename.

**Fix:** Smart URL resolution before template insertion:
- Starts with `http` → use as-is (already full URL)
- Starts with `/` → prepend domain only
- Otherwise → prepend full path (assumes filename)
- Empty/null → no hero image rendered

Verified against all 3 actual stored campaign values plus null/empty edge cases.

---

## Files Changed (cumulative across Build10.35 series)

| File | Change |
|------|--------|
| `admin-dashboard.html` | Complete rewrite — card layout, swipe pages, all new sections |
| `admin.html` | Footer flex layout fix + version bumps |
| `netlify/functions/ga4-analytics.js` | Added landing-pages + engagement metrics |
| `netlify/functions/gsc-search-analytics.js` | Expanded queries 3→10, positions 5→10 |
| `netlify/functions/get-campaign-stats.js` | New — MailerLite campaign analytics |
| `netlify/functions/generate-email-html.js` | Hero image URL doubling fix |
| `build-version.js` | Version bumps |
| `index.html` | Version bumps |
| `CURRENT-BUILD.md` | Version bumps |

## GA4 Custom Events Already Tracked
Confirmed in index.html — these feed the Event Engagement dashboard section:
- `add_to_calendar` (line 269)
- `share_event` (line 389)

---

## PRE-DELIVERY VALIDATION RESULTS (Build10.35.5)

✅ Syntax: All files clean, all functions pass node -c
✅ Structure: index.html 905/905, admin.html 1475/1475, dashboard 267/267
✅ Versions: All consistent at v2.3.1-Build10.35.5
✅ Hero image fix: Verified all 6 input cases produce correct output
✅ Footer layout: flex-col + flex-1 + mt-auto, no pb-20
✅ API endpoints: campaign stats, landing pages, engagement all returning data
✅ Feature registry: All features present

**VALIDATION STATUS: ALL CHECKS PASSED ✅**
