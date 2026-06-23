# Campaign Event Picker — Selection Rules

**File:** `admin.html` — date-range filter `useEffect` (builds `filteredEvents` from `events`).
**Last updated:** Build10.42 (2026-06-22)

This documents how the email campaign builder decides which events appear in (and are auto-selected by) the date-range picker.

## Inputs

- `formData.startDate` / `formData.endDate` — `YYYY-MM-DD` strings set by the two date inputs.
- Changing **Start Date** auto-sets **End Date** to start **+7 days** when End Date is empty or earlier than the new start. End Date is freely editable afterward.
- The filter only runs when **both** dates are set; otherwise the picker is empty.

## Selection rules (in order)

An event is included only if it passes every check:

1. **Not hidden.** Excluded when `event.published === false`. Events missing the `published` field are treated as visible (matches the Event Manager visibility convention). *(Build10.42)*
2. **Legacy Navy Pier check.** A pre-existing exact-title check `event.title === 'Navy Pier Fireworks'` returns false. The current event title is `Navy Pier Summer Fireworks`, which this check does not match — so Navy Pier Summer Fireworks is included by design. Left in place intentionally.
3. **Within the date range (inclusive).** `event.date >= startDate && event.date <= endDate`, compared as `YYYY-MM-DD` strings (lexicographic comparison is correct for this format and avoids timezone issues).

Matching events are sorted ascending by date and **all auto-selected** into `formData.selectedEventIds`. The operator can then deselect individually.

## Data freshness (Build10.43)

The builder operates on the admin app's in-memory `events` state. To guarantee that recent event edits are reflected, **opening the builder always re-fetches events first.** Both entry points — the "➕ Create Campaign" buttons and the per-campaign "Edit" button — route through `openCampaignBuilder(campaign)`, which:

1. sets the editing target (the campaign, or `null` for a new one),
2. `await`s `refreshEvents()` — a fresh `GET /.netlify/functions/get-events` (served `no-cache`) that replaces the `events` state,
3. then shows the modal.

While the refresh is in flight the buttons show "⏳ Refreshing events…" and are disabled. If the refresh fails the builder still opens with the current data and a notification is shown (fail-open). This makes stale event data in a generated email structurally impossible under normal operation, rather than relying on a manual page refresh.

## Notes

- "Hidden" everywhere in the admin = `published === false`. See the Event Manager visibility filter for the canonical usage.
- This picker governs which events the email generator (`generate-email-html.js`) renders; that function separately consolidates multi-date events by title.
