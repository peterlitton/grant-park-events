# Social Media Implementation: Validation Plan

**Version:** 1.5
**Date:** 2026-06-14
**Reference:** social-media-implementation-plan-v1.3.md

### Change Log

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-06-14 | Initial validation plan with 20 ACs |
| 1.1 | 2026-06-14 | Phase 1 validated — all 7 ACs passed with evidence |
| 1.2 | 2026-06-14 | Phase 2 pre-validation finding: social-posts.js (Build71) non-functional. New function required. |
| 1.3 | 2026-06-14 | Phase 2 ACs 2.1, 2.2, 2.3, 2.8 validated. Instagram integration verified. publish-social.js deployed and posting to both FB and IG. |
| 1.4 | 2026-06-14 | AC 2.4 passed — operator validated all posts on FB and IG. 6 posts published. 12 exceptions documented. |
| 1.5 | 2026-06-14 | Added 9 new ACs: 2.9-2.10 (scheduler logic), 3.6-3.10 (post-deployment), 4.5-4.7 (measurement). Total: 29 ACs. |

---

## Purpose

This document defines how each Acceptance Criterion (AC) will be validated. Every AC has a specific test, an expected result, and a pass/fail determination. No AC is considered done until its validation has been executed and passed.

---

## Phase 1: Setup — ✅ COMPLETE (7/7 passed)

### AC 1.1 — Meta Developer App exists and is connected to business portfolio

**Method:** Visual inspection
**Steps:**
1. Navigate to developers.facebook.com/apps
2. Confirm app named "GPE" appears in the list
3. Open app → Dashboard → confirm "Grant Park Events" business portfolio is connected

**Expected result:** App exists, business portfolio shows "Grant Park Events"
**Status:** ✅ PASSED — confirmed via screenshots during setup

---

### AC 1.2 — Permissions added and Ready for testing

**Method:** Visual inspection
**Steps:**
1. Open GPE app → Use cases → Customize "Manage everything on your Page"
2. Verify pages_manage_posts shows "Ready for testing"
3. Verify pages_read_engagement shows "Ready for testing"

**Expected result:** Both permissions show "Ready for testing" with "Actions" dropdown
**Status:** ✅ PASSED — confirmed via screenshots during setup

---

### AC 1.3 — Credentials stored in Netlify environment variables

**Method:** Visual inspection
**Steps:**
1. Open Netlify dashboard → Site settings → Environment variables
2. Confirm META_PAGE_ID exists with value 284246551446085
3. Confirm META_PAGE_ACCESS_TOKEN exists with a non-empty value

**Expected result:** Both variables exist with values set
**Status:** ✅ PASSED — confirmed during setup

---

### AC 1.4 — GET page info returns "Grant Park Events" using stored credentials

**Method:** Automated API call from deployed Netlify function
**Test endpoint:** `/.netlify/functions/test-meta-post?action=verify`
**Executed:** 2026-06-14

**Response:**
```json
{"name":"Grant Park Events","id":"284246551446085","fan_count":26}
```

**Status:** ✅ PASSED — name matches, ID matches, fan_count returned

---

### AC 1.5 — POST creates a visible post on the Facebook Page

**Method:** Automated API call + visual verification
**Test endpoint:** `/.netlify/functions/test-meta-post?action=test`
**Executed:** 2026-06-14

**Response:**
```json
{"id":"284246551446085_122215668584326914"}
```

**Status:** ✅ PASSED — post ID returned, post was visible on facebook.com/grantparkevents

---

### AC 1.6 — DELETE removes the test post

**Method:** Automated API call
**Test endpoint:** `/.netlify/functions/test-meta-post?action=delete&post_id=284246551446085_122215668584326914`
**Executed:** 2026-06-14

**Response:**
```json
{"success":true}
```

**Status:** ✅ PASSED — post removed

---

### AC 1.7 — Long-lived Page Access Token is stored

**Method:** Token debug via Graph API
**Test endpoint:** `/.netlify/functions/test-meta-post?action=token-info`
**Executed:** 2026-06-14

**Response:**
```
Valid: true
Expires: NEVER
Type: PAGE
Scopes: pages_show_list, business_management, pages_read_engagement, pages_manage_posts, public_profile
```

**Status:** ✅ PASSED — non-expiring PAGE token with all required scopes

---

## Phase 2: Build — 🔵 IN PROGRESS

### Pre-requisite Finding

The existing `social-posts.js` (Build71) returns HTTP 502 when called. Root cause: it uses legacy Netlify Functions v1 format (`event.queryStringParameters`) with a v2 export (`export default`). These are incompatible — confirmed by comparing to working functions (`get-campaign-stats.js`, `ga4-analytics.js`) which use `new URL(req.url)`, `Netlify.env.get()`, and `new Response()`.

The content generation logic inside `social-posts.js` (event reading, templates, hashtags, date formatting) is valid and reusable. A new function must be built using the verified v2 pattern before any Phase 2 AC can be tested.

**All Phase 2 ACs are blocked on this new function being built and deployed.**

### AC 2.1 — Function reads published, future events from Netlify Blobs

**Method:** Call function, inspect response
**Steps:**
1. Call the social posting function with a "preview" or "dry-run" parameter
2. Inspect the returned events list

**Expected result:** Response contains an array of published events with dates in the future. Each event has at minimum: title, date, time, location, image URL.
**Pass criteria:** At least 1 future event returned with all required fields
**Fail criteria:** Empty array, or events missing required fields
**Status:** ✅ PASSED — 97 future events read, all required fields present. Function: publish-social.js

---

### AC 2.2 — Function generates correct post text from event data

**Method:** Call function in dry-run mode, inspect output
**Steps:**
1. Call function with a specific event ID in dry-run mode
2. Compare generated post text to the event's source data

**Expected result:** Post text contains:
- Event title (exact match)
- Date in human-readable format (e.g., "Saturday, June 14")
- Time (if present in event data)
- Location (venue name)
- Link to event page on grantparkevents.com with UTM parameters

**Pass criteria:** All 5 elements present and accurate
**Fail criteria:** Any element missing or inaccurate
**Status:** ⬜ Not tested

---

### AC 2.3 — Function publishes photo post with hero image

**Method:** Live API call + visual verification
**Steps:**
1. Call function to publish a single event post (non-dry-run)
2. Inspect API response for post ID
3. View post on facebook.com/grantparkevents

**Expected result:** Post appears with hero image displayed, text visible, and link functional
**Pass criteria:** Image renders, text is correct, link works
**Fail criteria:** No image, text mismatch, or broken link
**Status:** ✅ PASSED — Facebook and Instagram. Navy Pier Fireworks: FB post 122215674716326914, IG post 18015024008851325. Instagram uses 2-step container model with status check loop (2s intervals, 5 retries).

---

### AC 2.4 — Post displays correctly on Facebook Page

**Method:** Visual inspection on mobile and desktop
**Steps:**
1. View the post from AC 2.3 on a mobile device
2. View the same post on a desktop browser
3. Check: image quality, text formatting, link preview

**Expected result:** Post looks professional on both form factors. Image is not cropped badly, text is readable, link preview shows GPE branding.
**Pass criteria:** Acceptable on both mobile and desktop
**Fail criteria:** Image distorted, text truncated, or link preview broken
**Status:** ✅ PASSED — Operator validated posts on both facebook.com/grantparkevents and Instagram. Posts confirmed: image renders correctly, text accurate, links functional. Validated on mobile.

Posts validated:
- Arrested Development | Millennium Park Summer Music Series (FB)
- Haydn's Military Symphony (FB)
- Navy Pier Summer Fireworks (FB + IG)
- Copland's Symphony No. 3 (FB + IG) — FB: https://www.facebook.com/grantparkevents/posts/122215677104326914

---

### AC 2.5 — No duplicate posts

**Method:** Run function twice, inspect results
**Steps:**
1. Call function to publish posts for upcoming events
2. Note which events were posted
3. Call function again immediately
4. Inspect response and Facebook page

**Expected result:** Second call publishes zero posts. Response indicates events were already posted.
**Pass criteria:** No duplicate posts on the page after second run
**Fail criteria:** Any event appears more than once
**Status:** ⬜ Not tested

---

### AC 2.6 — Function runs on schedule without manual intervention

**Method:** Observe Netlify function logs over 3 days
**Steps:**
1. Deploy function with cron schedule
2. After 24 hours, check Netlify function logs for scheduled executions
3. Verify at least 1 execution per day for 3 consecutive days

**Expected result:** Function executes daily at the configured time. Logs show successful completion.
**Pass criteria:** 3 consecutive successful executions
**Fail criteria:** Missed execution or error in any run
**Status:** ⬜ Not tested

---

### AC 2.7 — Graceful error handling

**Method:** Induce failure conditions, inspect responses
**Steps:**
1. Test with an event that has no hero image → verify post still publishes (text-only)
2. Test with an invalid Page Access Token → verify function returns error without crashing
3. Test with no future events → verify function completes with "nothing to post" response

**Expected result:** Each failure condition produces a clear response, not a 502 or unhandled crash
**Pass criteria:** All 3 failure conditions handled gracefully
**Fail criteria:** Any condition causes a 502 or unhandled exception
**Status:** ⬜ Not tested

---

### AC 2.8 — UTM parameters in event page links

**Method:** Inspect generated post text
**Steps:**
1. Generate a post in dry-run mode
2. Extract the event page URL from the post text
3. Verify URL contains utm_source=facebook and utm_medium=social

**Expected result:** URL format: https://www.grantparkevents.com/events/{slug}?utm_source=facebook&utm_medium=social
**Pass criteria:** Both UTM parameters present
**Fail criteria:** Either parameter missing
**Status:** ⬜ Not tested

---


### AC 2.9 — Events post on the correct day per the mapping table

**Method:** Preview eligible events for multiple days, verify against mapping table
**Steps:**
1. For a known set of upcoming events, manually calculate their expected posting day
2. Run the scheduler logic and compare which events it selects
3. Verify every match against the mapping table

**Expected result:** Each event's calculated posting day matches the table:
Monday→Thursday, Tuesday→Thursday, Wednesday→Tuesday, Thursday→Tuesday, Friday→Wednesday, Saturday→Wednesday, Sunday→Thursday

**Pass criteria:** 100% match across all future events
**Fail criteria:** Any event scheduled for the wrong day
**Status:** ⬜ Not tested

---

### AC 2.10 — Scheduler handles days with no eligible events

**Method:** Simulate or observe a day with no posting-day matches
**Steps:**
1. Check a day where no events have a matching posting day (e.g., Monday, Friday)
2. Verify the function completes with "0 posted" and no errors

**Expected result:** Logs "No events to post today", exits cleanly
**Pass criteria:** No errors, no crashes, no empty posts
**Fail criteria:** Error, crash, or unintended post
**Status:** ⬜ Not tested

---

## Phase 3: Launch — ⬜ NOT STARTED

### AC 3.1 — At least 5 real events published

**Method:** Count posts on Facebook Page
**Pass criteria:** 5+ event posts
**Status:** ⬜ Not tested

### AC 3.2 — All posts render correctly

**Method:** Visual inspection of each post
**Pass criteria:** Zero defects across all posts
**Status:** ⬜ Not tested

### AC 3.3 — No duplicate posts

**Method:** Scan Facebook Page
**Pass criteria:** Zero duplicates
**Status:** ⬜ Not tested

### AC 3.4 — Scheduled function runs 3 consecutive days without failure

**Method:** Netlify function logs review
**Pass criteria:** 3/3 successful
**Status:** ⬜ Not tested

### AC 3.5 — Temporary test code removed

**Method:** Code review — search for meta-verify, meta-test, meta-delete, test-meta-post
**Pass criteria:** Zero references to temporary test code
**Status:** ⬜ Not tested

---


### AC 3.6 — Scheduler posts correct events on correct days for 7 consecutive days

**Method:** Review Netlify function logs and FB/IG pages daily for 1 week
**Pass criteria:** Every posted event matches its expected posting day. No missed events.
**Status:** ⬜ Not tested

### AC 3.7 — Token remains valid after 30 days

**Method:** Call test-meta-post ?action=token-info after 30 days
**Pass criteria:** Token valid, type PAGE, expires NEVER
**Status:** ⬜ Not tested

### AC 3.8 — No duplicate posts after 14 days of operation

**Method:** Scan Facebook Page and Instagram profile after 14 days
**Pass criteria:** Each event has exactly one FB post and one IG post
**Status:** ⬜ Not tested

### AC 3.9 — Posts render correctly across all event types

**Method:** Visual inspection after 3+ event categories have posted (classical, music series, fireworks, etc.)
**Pass criteria:** No broken images, mashed text, or wrong hashtags across any event type
**Status:** ⬜ Not tested

### AC 3.10 — Scheduler recovers from transient API failure

**Method:** Observe behavior after a failed posting attempt
**Expected result:** Failed events are NOT marked as posted in tracking, and post successfully on the next scheduled run
**Pass criteria:** Event eventually posts after a transient failure
**Status:** ⬜ Not tested

---

## Phase 4: Measure — ⬜ NOT STARTED

### AC 4.1 — GA4 shows referral traffic from Facebook with UTM parameters

**Pass criteria:** At least 1 session attributed to facebook/social
**Status:** ⬜ Not tested

### AC 4.2 — Facebook Page follower count tracked

**Baseline:** 26 followers (confirmed 2026-06-14 via AC 1.4)
**Pass criteria:** Baseline recorded and queryable
**Status:** ⬜ Not tested

### AC 4.3 — Post reach and engagement metrics accessible

**Pass criteria:** At least reach and engagement counts available
**Status:** ⬜ Not tested

### AC 4.4 — Dashboard shows social media performance

**Pass criteria:** Section exists with data on campaigns page
**Status:** ⬜ Not tested

---


### AC 4.5 — Organic reach exceeds follower count

**Method:** Query post insights via Graph API or Meta Business Suite after 30 days
**Pass criteria:** Average post reach > 26 (baseline follower count)
**Status:** ⬜ Not tested

### AC 4.6 — Follower growth trend is positive

**Method:** Compare follower count to baseline (26) at day 14 and day 30
**Pass criteria:** Net positive follower growth
**Status:** ⬜ Not tested

### AC 4.7 — At least 1 referral visit from Facebook within 14 days

**Method:** GA4 traffic acquisition report, filter source=facebook, medium=social
**Pass criteria:** At least 1 session with UTM parameters from automated posts
**Status:** ⬜ Not tested

---

*Phase 1 validated 2026-06-14. Phase 2 pending.*
