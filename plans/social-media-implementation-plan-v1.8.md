# Social Media Implementation Plan
## Grant Park Events — June 2026

**Version:** 1.8  
**Last updated:** 2026-06-14  
**Status:** Phase 2 — Build (in progress). Facebook and Instagram posting validated. Posting schedule defined.

### Change Log

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-06-08 | Initial plan: platforms, APIs, architecture, phased rollout |
| 1.1 | 2026-06-08 | Added Meta developer documentation references |
| 1.2 | 2026-06-14 | Updated with confirmed app setup: GPE app created, Page ID confirmed, permissions added, authentication flow verified, open items resolved |
| 1.3 | 2026-06-14 | Added Definition of Done with 20 testable acceptance criteria across 4 phases |
| 1.4 | 2026-06-14 | Meta integration verified. Phase 1 complete. Phase 2 in progress — publish-social.js deployed, first real post published. |
| 1.5 | 2026-06-14 | Instagram integration verified. Both FB and IG posting confirmed working. IG Business Account ID, permissions, and 2-step container publishing with status check documented. |
| 1.6 | 2026-06-14 | All posts validated by operator. Published posts inventory added. Exceptions log added. Posting schedule research added. AC 2.4 passed. |
| 1.7 | 2026-06-14 | Scheduler specification added (spec-social-scheduler.md). Posting day mapping, cron schedule, edge cases, data flow defined. |
| 1.8 | 2026-06-14 | Scheduler built (scheduled-post.js). 9 new ACs added (2.9-2.10, 3.6-3.10, 4.5-4.7). Total: 29 ACs. Full document bundle delivered. |

---

## Platforms

### Primary: Facebook (Page Posts + Events)

Facebook is the only major platform with a built-in event discovery engine. Auto-created Facebook Events enter the "Events Near You" recommendation system, reaching people who have never heard of GPE. Page posts provide supplementary content and shareability.

### Secondary: Instagram (Cross-Post from Facebook)

Instagram is already connected to GPE's Facebook Page via Meta Business Suite. The same Meta Graph API that publishes to Facebook can publish to Instagram in the same workflow. Incremental effort is minimal.

### Not Included

- **TikTok / YouTube:** Require video content that cannot be automated from existing event data
- **X/Twitter:** Declining audience, low event discovery capability
- **Facebook Groups:** Third-party Group publishing API was deprecated by Meta in April 2024

---

## Existing Infrastructure

| Asset | Status |
|-------|--------|
| Facebook Page | `facebook.com/grantparkevents` — active, 26 followers, GPE branding |
| Facebook Page ID | `284246551446085` — confirmed via Graph API |
| Meta Business Suite | Linked to Facebook Page |
| Meta Business ID | `464823716002443` |
| Meta Developer App | **GPE** — created, use case: "Manage everything on your Page" |
| App Permissions (required) | `business_management`, `pages_show_list`, `public_profile` — Ready for testing |
| App Permissions (added) | `pages_manage_posts`, `pages_read_engagement` — Ready for testing |
| Page Tasks Confirmed | CREATE_CONTENT, MANAGE, MODERATE, ADVERTISE, ANALYZE, MESSAGING |
| Authentication | Facebook Login for Business (auto-included with use case) |
| Instagram Business Account ID | `17841466312115763` — confirmed via Graph API |
| Instagram App ID | `1309432010856255` (GPE-IG) |
| Instagram API path | API setup with Facebook Login (uses existing Page Access Token) |
| Instagram permissions added | `instagram_basic`, `instagram_content_publish` — Ready for testing |
| Event data | Structured in Netlify Blobs — title, date, time, location, image URL, description, featuring |
| Hosting | Netlify (supports scheduled functions via cron) |
| Image hosting | Event hero images served from `grantparkevents.com` (same-origin, publicly accessible) |
| Graph API version | v25.0 (released February 2026) |
| Deployed functions | `publish-social.js` (event posting), `test-meta-post.js` (validation, temporary) |
| Posting schedule doc | social-media-posting-schedule.md — data-driven timing research |
| Scheduler function | scheduled-post.js — daily cron at 12pm CT (0 17 * * * UTC) |
| Scheduler spec | spec-social-scheduler.md — cron trigger, day mapping, edge cases, data flow |
| First post published | 2026-06-14: Arrested Development | Millennium Park Summer Music Series (Post ID: 122215670894326914) |

---

## Content Types to Automate

### ~~1. Facebook Events~~ — NOT AVAILABLE

Facebook Event creation via the Graph API is **restricted to whitelisted partners only** (per Meta's own documentation). The current Event endpoint reference page has been removed from Meta's developer docs. This endpoint is not available for general use.

**Impact:** Facebook Events cannot be automated. Events must be created manually through Meta Business Suite's native interface if desired. The automation scope is limited to Page posts and Instagram content publishing.

**Validation:** Confirm by testing `POST /{page-id}/events` in the Graph API Explorer (`developers.facebook.com/tools/explorer`) with a Page Access Token. Expected result: endpoint unavailable error.

### 2. Facebook Page Posts (Primary Automated Content)

Event announcement posts with image, description, and link back to GPE site.

**Post format:**
- Hero image as photo attachment
- Event title, date/time, brief description
- Link to event page on grantparkevents.com
- Posted to `/{page-id}/feed` or `/{page-id}/photos`

### 3. Instagram Feed Posts

Cross-published from the same event data. Instagram requires the 2-step container model (create container → publish).

**Post format:**
- Hero image (must be publicly accessible URL)
- Caption: event title, date/time, description, hashtags (#ChicagoEvents, #GrantPark, #FreeEvents, etc.)
- No link in caption (Instagram doesn't support clickable links in post captions)

---

## Technical Requirements

### Meta Developer App

A Meta Developer App is required for all API access. Setup:

1. Register at `developers.facebook.com`
2. Create a new app (type: Business)
3. App ID and App Secret issued on creation
4. Add Facebook Login product to the app

### Permissions Required

All permissions have been added to the GPE app and are "Ready for testing."

| Permission | Purpose | Status |
|------------|---------|--------|
| `business_management` | Read/write with Business Manager API | ✅ Required — auto-added |
| `pages_show_list` | Access list of Pages the user manages | ✅ Required — auto-added |
| `public_profile` | Read default public profile fields | ✅ Required — auto-added |
| `pages_manage_posts` | Create, edit, delete Page posts | ✅ Added — Ready for testing |
| `pages_read_engagement` | Read content posted by the Page | ✅ Added — Ready for testing |

**App Review:** Not yet required. "Ready for testing" status means the app can be tested by users with a role on the app (Peter). App Review is required before the app can be used by anyone outside the app's role list or published. Since Peter is the sole operator posting to his own page, App Review may not be needed for this use case — to be confirmed.

**Note:** The "Manage everything on your Page" use case is **incompatible** with the standalone "Facebook Login" use case. The app uses "Facebook Login for Business" instead, which is automatically included.

### Authentication Flow (Confirmed)

Tested and working via Graph API Explorer:

1. User (Peter) generates a **User Access Token** via Graph API Explorer with the GPE app selected
2. Call `GET /me/accounts` with the User Token → returns Page ID (`284246551446085`) and short-lived Page Access Token
3. Exchange the short-lived Page Access Token for a **long-lived Page Access Token** via:
   ```
   GET /oauth/access_token?grant_type=fb_exchange_token
     &client_id={app-id}
     &client_secret={app-secret}
     &fb_exchange_token={short-lived-token}
   ```
4. The long-lived Page Access Token is used for all subsequent API calls

**Token lifespan:** Long-lived Page Access Tokens obtained from long-lived User Access Tokens do not expire. However, they can be invalidated if the user changes their password, deauthorizes the app, or the app secret changes. Periodic verification is recommended.

### API Endpoints

**Current API version:** v25.0 (released February 2026)

**Facebook Page Post:**
```
POST /{page-id}/feed
Parameters: message, link, published, scheduled_publish_time
```

**Facebook Photo Post:**
```
POST /{page-id}/photos
Parameters: url (image URL), caption, published, scheduled_publish_time
```

**Instagram Content Publishing (2-step):**
```
Step 1: POST /{ig-user-id}/media
Parameters: image_url, caption
Returns: container_id

Step 2: POST /{ig-user-id}/media_publish
Parameters: creation_id (container_id from step 1)
Returns: published media ID
```

**Scheduled Publishing:**
Both Facebook and Instagram support scheduling via the API. For Facebook, set `published=false` and `scheduled_publish_time` to a future UNIX timestamp. Instagram scheduling uses the same container model with a `scheduled_publish_time` parameter.

### Rate Limits

| Platform | Limit |
|----------|-------|
| Facebook Page posts | No hard per-day limit published, but best practice < 5/day |
| Instagram feed posts | 25 API-published posts per 24 hours |
| Graph API calls | 200 calls per user per hour |

GPE's volume (5-15 events per week) is well within all limits.

### Image Requirements

| Platform | Format | Min Resolution | Max File Size |
|----------|--------|---------------|---------------|
| Facebook | JPEG, PNG | 600x315 recommended | 10MB |
| Instagram | JPEG | 1080x1080 (square) recommended | 8MB |

GPE hero images are already hosted publicly and meet Facebook requirements. Instagram may benefit from square-cropped versions, but the API accepts non-square images (they display with letterboxing).

---

## Automation Architecture

### Data Flow

```
Netlify Blobs (event data)
  → Scheduled Netlify Function (cron)
    → Reads upcoming events
    → For each event not yet posted:
      → POST to Facebook Page (image + caption + link)
      → POST to Instagram (image + caption)
      → If supported: CREATE Facebook Event
      → Mark event as posted (update Blob or tracking record)
```

### Trigger

A Netlify scheduled function running on a defined schedule (e.g., daily at 8am CT). The function:

1. Reads all events from Netlify Blobs
2. Filters to events happening in the next 7-14 days
3. Checks which events have already been posted (via a tracking record)
4. For unposted events, calls the Meta Graph API to publish
5. Records the post IDs to avoid duplicate posting

### Content Generation

Post text is generated from structured event data using templates:

**Facebook Post template:**
```
{title}
📅 {dayOfWeek}, {date} at {time}
📍 {location}

{description}

{featuring (if present)}

🎟️ Free admission
👉 {eventPageURL}
```

**Instagram Caption template:**
```
{title}
📅 {dayOfWeek}, {date} at {time}
📍 {location}

{description}

{featuring (if present)}

Free admission · Link in bio
#ChicagoEvents #GrantPark #FreeThingsToDo #ChicagoSummer #MillenniumPark
```

---

## Credential Storage

Meta API credentials stored as Netlify environment variables, consistent with the existing approach for Google service account credentials and MailerLite API key.

**Never share tokens in chat, commit to repos, or expose in client-side code.**

| Variable | Content | Status |
|----------|---------|--------|
| `META_APP_ID` | App ID from Meta Developer Dashboard (GPE app) | To be added |
| `META_APP_SECRET` | App Secret from Meta Developer Dashboard | To be added |
| `META_PAGE_ACCESS_TOKEN` | Long-lived Page Access Token for Grant Park Events | To be generated |
| `META_PAGE_ID` | `284246551446085` | Confirmed |
| `META_IG_USER_ID` | `17841466312115763` | ✅ Stored |

---

## Open Items Requiring Verification

1. ~~**Facebook Event creation API**~~ — **RESOLVED: Not available.** Restricted to whitelisted partners.

2. ~~**Instagram account type**~~ — **RESOLVED.** Business account confirmed. IG Business Account ID: `17841466312115763`. API setup path: Facebook Login. Permissions: `instagram_basic`, `instagram_content_publish`.

3. ~~**App Review timeline**~~ — **LIKELY NOT NEEDED.** Permissions are "Ready for testing." Since Peter is the sole operator posting to his own page via his own app, App Review may not be required. To be confirmed — if the app only needs to operate on behalf of users with roles on the app, testing mode is sufficient.

4. ~~**Token refresh strategy**~~ — **RESOLVED.** Long-lived Page Access Tokens obtained from long-lived User Access Tokens do not expire under normal conditions. Periodic verification recommended.

5. **Image aspect ratios** — Whether existing GPE hero images render acceptably on Instagram without cropping, or if square-crop variants are needed.

6. ~~**Facebook Page ID**~~ — **RESOLVED:** `284246551446085`

7. ~~**Long-lived token generation**~~ — **RESOLVED.** Non-expiring PAGE token generated and stored in Netlify env vars.

8. ~~**Instagram use case**~~ — **RESOLVED.** "Manage messaging & content on Instagram" use case added. API setup with Facebook Login configured. Both permissions added and working.

---

## Definition of Done

### Phase 1: Setup — DONE when:

| # | Acceptance Criteria | Status |
|---|-------------------|--------|
| 1.1 | Meta Developer App (GPE) exists and is connected to Grant Park Events business portfolio | ✅ Done |
| 1.2 | `pages_manage_posts` and `pages_read_engagement` permissions are added and "Ready for testing" | ✅ Done |
| 1.3 | `META_PAGE_ID` and `META_PAGE_ACCESS_TOKEN` are stored as Netlify environment variables | ✅ Done |
| 1.4 | `GET /v25.0/{PAGE_ID}?fields=name,id` returns "Grant Park Events" using stored credentials | ✅ Passed |
| 1.5 | `POST /v25.0/{PAGE_ID}/feed` with a test message creates a visible post on facebook.com/grantparkevents | ✅ Passed |
| 1.6 | `DELETE /v25.0/{POST_ID}` removes the test post | ✅ Passed |
| 1.7 | Long-lived Page Access Token is stored (does not expire under normal conditions) | ✅ Passed — type: PAGE, expires: NEVER |

### Phase 2: Build — DONE when:

| # | Acceptance Criteria | Status |
|---|-------------------|--------|
| 2.1 | Netlify function reads published, future events from Netlify Blobs | ✅ Passed — 97 future events |
| 2.2 | Function generates post text from event data: title, date, time, location, description, link to event page | ✅ Passed — validated across all 97 events |
| 2.3 | Function publishes a photo post to Facebook Page with event hero image and generated text | ✅ Passed — Posts to both FB and IG. Navy Pier Fireworks: FB `122215674716326914`, IG `18015024008851325` |
| 2.4 | Published post displays correctly on facebook.com/grantparkevents: image renders, text is complete, link works | ✅ Passed — operator validated FB and IG posts |
| 2.5 | Function tracks which events have been posted and does not create duplicate posts | ⚠️ Partial — `publish` action deduplicates, `publish-one` does not yet |
| 2.6 | Function runs on a defined schedule (e.g., daily at 8am CT) without manual intervention | ⬜ |
| 2.7 | Function handles errors gracefully: API failures, missing event data, missing images | ⬜ |
| 2.8 | Event page URL includes UTM parameters for referral tracking (`?utm_source=facebook&utm_medium=social`) | ✅ Passed |

| 2.9 | Events post on the correct day per the posting day mapping table | ⬜ |
| 2.10 | Scheduler handles days with no eligible events without errors | ⬜ |

### Phase 3: Launch — DONE when:

| # | Acceptance Criteria | Status |
|---|-------------------|--------|
| 3.1 | At least 5 real upcoming events are published to Facebook Page via automation | ⬜ |
| 3.2 | All posts render correctly: images display, text is accurate, links resolve to correct event pages | ⬜ |
| 3.3 | No duplicate posts exist on the page | ⬜ |
| 3.4 | Scheduled function has run at least 3 consecutive days without failure | ⬜ |
| 3.5 | Temporary test functions and test metrics are removed from codebase | ⬜ |

| 3.6 | Scheduler posts correct events on correct days for 7 consecutive days | ⬜ |
| 3.7 | Token remains valid after 30 days | ⬜ |
| 3.8 | No duplicate posts after 14 days of operation | ⬜ |
| 3.9 | Posts render correctly across all event types (3+ categories) | ⬜ |
| 3.10 | Scheduler recovers from transient API failure | ⬜ |

### Phase 4: Measure — DONE when:

| # | Acceptance Criteria | Status |
|---|-------------------|--------|
| 4.1 | GA4 shows referral traffic from facebook.com with UTM parameters | ⬜ |
| 4.2 | Facebook Page follower count is tracked (baseline: 26 followers as of June 2026) | ⬜ |
| 4.3 | Post reach and engagement metrics are accessible via Graph API or Meta Business Suite | ⬜ |
| 4.4 | Dashboard or report shows social media performance alongside existing metrics | ⬜ |

| 4.5 | Organic reach exceeds follower count (baseline: 26) after 30 days | ⬜ |
| 4.6 | Follower growth trend is positive after 30 days | ⬜ |
| 4.7 | At least 1 referral visit from Facebook within 14 days | ⬜ |

---

## Phased Rollout

### Phase 1: Setup — ✅ COMPLETE
- ✅ Create Meta Developer App (GPE)
- ✅ Select "Manage everything on your Page" use case
- ✅ Connect Grant Park Events business portfolio
- ✅ Add permissions: `pages_manage_posts`, `pages_read_engagement`
- ✅ Confirm Page ID: `284246551446085`
- ✅ Confirm Page tasks: CREATE_CONTENT, MANAGE, MODERATE
- ✅ Test User Token → `GET /me/accounts` → Page Token flow
- ✅ Generate long-lived Page Access Token — type: PAGE, expires: NEVER
- ✅ Store credentials in Netlify environment variables
- ✅ Verify Instagram Business Account connection — ID: 17841466312115763
- ✅ Add Instagram use case — permissions: instagram_basic, instagram_content_publish
- ✅ Test first post — validated via publish-social.js function

### Phase 2: Build (After Phase 1 Complete)
- Build Netlify scheduled function
- Implement event data → post content generation
- Implement Meta Graph API posting logic
- Test with scheduled posts

| 2.9 | Events post on the correct day per the posting day mapping table | ⬜ |
| 2.10 | Scheduler handles days with no eligible events without errors | ⬜ |

### Phase 3: Launch
- Deploy scheduled function
- Publish first batch of upcoming events
- Monitor post quality and image rendering

| 3.6 | Scheduler posts correct events on correct days for 7 consecutive days | ⬜ |
| 3.7 | Token remains valid after 30 days | ⬜ |
| 3.8 | No duplicate posts after 14 days of operation | ⬜ |
| 3.9 | Posts render correctly across all event types (3+ categories) | ⬜ |
| 3.10 | Scheduler recovers from transient API failure | ⬜ |

### Phase 4: Measure
- Track Facebook Page follower growth
- Track post reach and engagement
- Track referral traffic to grantparkevents.com from Meta (via UTM parameters)
- Track Instagram reach and profile visits (if cross-posting enabled)

---

*This document defines the technical plan. No code has been written.*

---

## Published Posts Inventory

| # | Event | Date | Facebook | Instagram | Status |
|---|-------|------|----------|-----------|--------|
| 1 | Test post (AC 1.5) | 2026-06-14 | 284246551446085_122215668584326914 | — | Created and deleted (AC 1.6) |
| 2 | Arrested Development | Millennium Park Summer Music Series | 2026-06-15 | 122215670894326914 | — | FB only (first real post) |
| 3 | Duplicate of #2 (AC 2.5 test) | 2026-06-14 | 122215671560326914 | — | Deleted — exposed dedup bug |
| 4 | Haydn's Military Symphony | 2026-06-17 | 122215674296326914 | Failed | FB posted, IG failed (container not ready) |
| 5 | Navy Pier Summer Fireworks | 2026-06-17 | 122215674716326914 | 18015024008851325 | First successful dual post |
| 6 | Copland's Symphony No. 3 | 2026-06-19 | 122215677104326914 | 18179564770400014 | Validated by operator |

---

## Exceptions Log

Issues encountered during implementation, root cause, and resolution.

### E1: test-meta-post.js 502 — wrong env var access
**Symptom:** Function returned HTTP 502 on every call.
**Root cause:** Used `process.env` instead of `Netlify.env.get()`. Netlify Functions v2 requires the Netlify-specific API.
**Resolution:** Examined working functions (get-campaign-stats.js, ga4-analytics.js), found all use `Netlify.env.get()`. Rewrote function to match verified pattern.
**Lesson:** Look at working code before writing new code.

### E2: test-meta-post.js 502 — wrong export format
**Symptom:** Second attempt still 502'd using `export const handler` (v1 format).
**Root cause:** Guessed at the fix instead of verifying. Mixed v1 export with v2 patterns.
**Resolution:** Confirmed all working functions use `export default async (req, context)` with `new Response()`. Matched exactly.
**Lesson:** Verify every claim with evidence before stating it.

### E3: social-posts.js (Build71) non-functional
**Symptom:** Existing social-posts.js returned HTTP 502.
**Root cause:** Uses legacy v1 `event.queryStringParameters` pattern with v2 `export default` export. These are incompatible.
**Resolution:** Built new `publish-social.js` using verified v2 pattern. Reused content generation logic.
**Lesson:** Test existing functions before building on top of them.

### E4: Short-lived token stored
**Symptom:** API calls returned "Session has expired" error.
**Root cause:** Stored the short-lived User Access Token instead of exchanging for a long-lived Page Access Token.
**Resolution:** Exchanged User Token → long-lived User Token → Page Access Token (non-expiring). Updated Netlify env var.
**Lesson:** Follow the documented token exchange flow completely.

### E5: Token and App Secret exposed in chat
**Symptom:** Credentials visible in conversation history.
**Root cause:** Operator shared token for troubleshooting, App Secret shared in oauth URL.
**Resolution:** Token regenerated. App Secret reset required.
**Action required:** Reset App Secret in Meta Developer Dashboard.

### E6: Instagram container not ready
**Symptom:** Instagram publish returned "Media ID is not available — media is not ready for publishing."
**Root cause:** Step 2 (publish) called immediately after Step 1 (create container). Container needs processing time.
**Resolution:** Added status check loop: poll container status every 2 seconds, up to 5 retries, wait for `FINISHED` status before publishing.
**Lesson:** Read the API documentation for async processing requirements.

### E7: Image URL construction — bare filenames
**Symptom:** Image URLs like `grantparkevents.comarresteddev.jpg` (missing path separator).
**Root cause:** 43 of 97 events store images as bare filenames without a path prefix.
**Resolution:** Replicated the site's `getAbsoluteImageUrl()` logic exactly — bare filenames route to `/.netlify/functions/images/{filename}`.
**Lesson:** Analyze ALL data (97 events, not 1) before writing code.

### E8: HTML stripping — three patterns
**Symptom:** Featuring showed mashed names: "Arrested DevelopmentLinda SolDJ Ca$h Era"
**Root cause:** Events use three different HTML patterns: `<div>` (classical), `<p>` (Music Series), `<li>` (Taste of Chicago). Initial stripHtml only handled `<div>`.
**Resolution:** Added comma separators for all patterns. Validated across all 97 events.
**Lesson:** Test against the full data set, not a sample.

### E9: Hashtag misclassification
**Symptom:** Arrested Development tagged #ClassicalMusic.
**Root cause:** `getEventType()` matched on "music" in "Music Series" title.
**Resolution:** Narrowed match: only "symphony/concert/orchestra" trigger #ClassicalMusic. "music series" triggers #LiveMusic.
**Lesson:** Test category logic against all event titles.

### E10: Duplicate post created (OPEN)
**Symptom:** `publish-one` created a second post for an already-posted event.
**Root cause:** `publish-one` action bypasses the tracking check that `publish` action uses.
**Resolution:** Deferred. The `publish` action correctly deduplicates. `publish-one` needs the same check.
**Status:** Open.

### E11: Instagram permissions required new token
**Symptom:** `instagram_business_account` field not returned after adding IG permissions.
**Root cause:** Page Access Token was generated before Instagram permissions were added. Scopes are set at generation time.
**Resolution:** Generated new token with all permissions, exchanged for new long-lived Page Token.
**Lesson:** Adding permissions to the app requires regenerating the access token.

### E12: Instagram API setup path confusion
**Symptom:** Initially directed operator to wrong Instagram setup path.
**Root cause:** Guessed instead of reading the documentation.
**Resolution:** Read the Instagram Content Publishing API docs. Facebook Login path uses existing Page Access Token (our architecture).
**Lesson:** Read the documentation before giving instructions.

---

## Reference: Meta Developer Documentation

**Portal:** [developers.facebook.com/docs](https://developers.facebook.com/docs/)

The following sections of Meta's developer documentation are directly relevant to this implementation:

### Core

| Documentation | URL | Relevance |
|--------------|-----|-----------|
| Graph API | [developers.facebook.com/docs/graph-api](https://developers.facebook.com/docs/graph-api/) | Primary interface for all read/write operations to Meta's social graph |
| Meta App Development | [developers.facebook.com/docs/development](https://developers.facebook.com/docs/development/) | App registration, dashboard configuration, build/test/release process |
| Permissions Reference | [developers.facebook.com/docs/permissions](https://developers.facebook.com/docs/permissions/) | Full list of available permissions with descriptions and review requirements |
| Responsible Platform Initiatives | [developers.facebook.com/docs/resp-plat-initiatives](https://developers.facebook.com/docs/resp-plat-initiatives) | App review compliance and approved usage verification |

### Social Integrations (Primary)

| Documentation | URL | Relevance |
|--------------|-----|-----------|
| Facebook Pages API | [developers.facebook.com/docs/pages-api](https://developers.facebook.com/docs/pages-api/) | Page post publishing, insights, comment moderation, real-time updates |
| Instagram Platform | [developers.facebook.com/docs/instagram-platform](https://developers.facebook.com/docs/instagram-platform/) | Instagram content publishing (2-step container model), insights, account management |
| Threads API | [developers.facebook.com/docs/threads](https://developers.facebook.com/docs/threads/) | Potential future expansion — text-based cross-posting |

### Authentication

| Documentation | URL | Relevance |
|--------------|-----|-----------|
| Facebook Login | [developers.facebook.com/documentation/facebook-login](https://developers.facebook.com/documentation/facebook-login) | OAuth 2.0 flow for obtaining user and page access tokens |

### Additional (Potential Use)

| Documentation | URL | Relevance |
|--------------|-----|-----------|
| Sharing | [developers.facebook.com/docs/sharing](https://developers.facebook.com/docs/sharing/) | Open Graph tags for GPE event pages — improves link preview when shared |
| Social Plugins | [developers.facebook.com/docs/plugins](https://developers.facebook.com/docs/plugins/) | Embed Facebook content on grantparkevents.com (e.g., follow button, event widget) |
| Page Stories API | [developers.facebook.com/docs/page-stories-api](https://developers.facebook.com/docs/page-stories-api/) | Facebook/Instagram Stories — potential "this weekend" ephemeral content |
| Meta Business SDK | [developers.facebook.com/docs/business-sdk](https://developers.facebook.com/docs/business-sdk/) | Server-side SDK that may simplify Graph API integration for Node.js |
| Webhooks | [developers.facebook.com/docs/graph-api/webhooks](https://developers.facebook.com/docs/graph-api/webhooks/) | Real-time notifications for comments, messages, or post interactions |
| Developer Policies | [developers.facebook.com/devpolicy](https://developers.facebook.com/devpolicy) | Required reading before App Review submission |
| Meta Platform Terms | [developers.facebook.com/terms](https://developers.facebook.com/terms) | Terms of service for API usage |
