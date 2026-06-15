# Specification: Automated Social Media Posting Scheduler

**Version:** 1.0
**Date:** 2026-06-14
**Reference:** social-media-implementation-plan-v1.6.md, AC 2.6

---

## Purpose

Automate the daily posting of upcoming GPE events to Facebook and Instagram without manual intervention. Events are posted on the optimal day based on data-driven posting schedule research.

## Trigger

Netlify scheduled function running daily via cron.

**Schedule:** Every day at 12:00 PM Central Time.
**Cron expression:** `0 17 * * *` (17:00 UTC = 12:00 PM CDT)

Note: When CDT ends (first Sunday of November), 12pm CT = 18:00 UTC. This will need a seasonal adjustment or a timezone-aware cron approach.

## Posting Day Logic

The function determines which events should be posted today based on the event's day of the week:

| Event Day | Posting Day | Days Before |
|-----------|-------------|-------------|
| Monday | Thursday | 4 |
| Tuesday | Thursday | 5 |
| Wednesday | Tuesday | 1 |
| Thursday | Tuesday | 2 |
| Friday | Wednesday | 2 |
| Saturday | Wednesday | 3 |
| Sunday | Thursday | 3 |

**Rule:** For each future event, calculate its posting day. If today equals that posting day, the event is eligible for posting.

## Data Flow

```
Cron fires at 12pm CT
  → Read all events from Netlify Blobs ("events" store)
  → Read tracking data from Netlify Blobs ("social-tracking" store)
  → For each published, future event:
    → Calculate posting day from event date
    → If posting day === today AND event not already tracked:
      → Generate Facebook post text (with UTM link)
      → Generate Instagram caption (with "Link in bio")
      → Resolve image URL (bare filename → /.netlify/functions/images/)
      → POST to Facebook (photo post with caption)
      → POST to Instagram (2-step container: create → status check → publish)
      → Record both post IDs in tracking store
  → Return summary: events checked, posted, skipped, failed
```

## Input

**Events store:** Netlify Blobs, store name `events`, key `grantParkEvents`. Array of event objects.

Required event fields:
- `id` — unique identifier
- `title` — event title
- `date` — YYYY-MM-DD format
- `time` — e.g., "6:30pm"
- `venue` or `location` — venue name
- `image` — image path (bare filename or /.netlify/ path)
- `description` — HTML content
- `published` — boolean (only post published events)

Optional:
- `featuring` — HTML content (performers)
- `urlSlug` — for building event page URL

**Tracking store:** Netlify Blobs, store name `social-tracking`, key `posted-events`. Object keyed by event ID.

## Output

**To Facebook:** Photo post via `POST /{PAGE_ID}/photos` with `url` (image) and `caption` (post text).

**To Instagram:** 2-step container:
1. `POST /{IG_USER_ID}/media` with `image_url` and `caption`
2. Poll `GET /{container_id}?fields=status_code` every 2 seconds, up to 5 retries
3. `POST /{IG_USER_ID}/media_publish` with `creation_id` when status is `FINISHED`

**Tracking update:** For each successfully posted event, store:
```json
{
  "fbPostId": "...",
  "igPostId": "...",
  "postedAt": "ISO 8601 timestamp",
  "type": "photo"
}
```

## Environment Variables Required

| Variable | Description |
|----------|-------------|
| `META_PAGE_ID` | `284246551446085` |
| `META_PAGE_ACCESS_TOKEN` | Non-expiring Page Access Token |
| `META_IG_USER_ID` | `17841466312115763` |

## Edge Cases

| Condition | Behavior |
|-----------|----------|
| Event already posted (in tracking) | Skip — no duplicate |
| Event has no image | Post text-only to Facebook, skip Instagram (requires image) |
| Event is unpublished (`published: false`) | Skip |
| Event date is in the past | Skip |
| Instagram container fails to reach FINISHED | Log error, Facebook post still stands |
| Facebook post fails | Log error, skip Instagram for that event |
| No events eligible today | Function completes with "0 posted" — not an error |
| Multiple events eligible on same day | Post all of them |
| Cron fires but Blobs store is empty | Return error, no crash |

## Post Content

**Facebook post text:**
```
🎵 {title}
📅 {formatted date} at {time}
📍 {venue}

{description (stripped HTML, max 150 chars)}

🎤 Featuring: {featuring (stripped HTML, max 100 chars)}

🎟️ Free admission
{event URL with utm_source=facebook&utm_medium=social}

{hashtags}
```

**Instagram caption:**
```
🎵 {title}
📅 {formatted date} at {time}
📍 {venue}

{description (stripped HTML, max 150 chars)}

🎤 Featuring: {featuring (stripped HTML, max 100 chars)}

🎟️ Free admission · Link in bio

{hashtags}
```

Featuring line omitted if event has no featuring data.

## Function Location

`netlify/functions/publish-social.js` — extends the existing function with a scheduled entry point.

Netlify scheduled functions use a `config` export:
```javascript
export const config = {
  schedule: "0 17 * * *"
};
```

The existing HTTP handler and the scheduled handler can coexist in the same file. The schedule triggers the same publish logic that the `?action=publish` HTTP endpoint uses.

## Monitoring

- `GET /.netlify/functions/publish-social?action=tracking` — view all posted events
- Netlify function logs — execution history and errors
- Future: dashboard integration (AC 4.4)

## Verification (AC 2.6)

**Pass criteria:** Function executes daily at 12pm CT for 3 consecutive days. Logs show successful completion. Events posted on correct days per the mapping table.

**Test approach:**
1. Deploy with schedule
2. After 24 hours, check Netlify function logs for scheduled execution
3. Verify events posted match the day mapping
4. Confirm 3 consecutive successful runs

---

*This document is a specification. No code included.*
