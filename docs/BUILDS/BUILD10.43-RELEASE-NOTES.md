# Build10.43 Release Notes
## Campaign builder always opens with fresh events (Create + Edit)

**Version:** v2.3.1-Build10.43
**Date:** 2026-06-23
**Type:** Bug fix / hardening — campaign builder (`admin.html`). No backend change.

---

## Problem

The campaign builder operated on the admin app's in-memory `events` state, loaded once on page load. If an event was edited after the admin tab loaded (e.g. adding an end time), the builder — and therefore the generated email — kept using the pre-edit copy. The server, data, and email template were all correct; only the client's in-memory list was stale, so the fix was to refresh that list at the right moment.

## Fix

**File:** `admin.html`

Added a shared open handler and a refresh helper, and routed all three builder entry points through it:

```js
const refreshEvents = async () => {
  const response = await fetch('/.netlify/functions/get-events');
  if (!response.ok) throw new Error('get-events returned ' + response.status);
  setEvents(await response.json());
};

const openCampaignBuilder = async (campaign) => {
  setEditingCampaign(campaign || null);
  setRefreshingEvents(true);
  try { await refreshEvents(); }
  catch (e) { showNotification('Could not refresh events — using current data'); }
  finally { setRefreshingEvents(false); setShowCampaignBuilder(true); }
};
```

Entry points now routed through it:
- "➕ Create Campaign" (header button)
- "➕ Create Campaign" (empty-state button)
- "Edit" (per-campaign button)

Behavior: while refreshing, the Create buttons show "⏳ Refreshing events…" and all three are disabled. `get-events` is served `no-cache`, so the re-fetch reliably returns the latest data. On refresh failure the builder still opens with current data plus a notification (fail-open) — a network hiccup never blocks campaign work.

This makes stale event data in a generated email structurally impossible under normal operation, for both new and edited campaigns.

## SOP hardening

The Build10.42 feature-registry signature for the hidden-event exclusion was a version-tagged code comment (`Build10.42: Exclude hidden events`). The version-bump `sed` rewrote that comment to `Build10.43`, which would have silently broken the signature. Changed the comment and registry pattern to a version-independent string (`Exclude hidden events from campaign picker`) so future version bumps can't drift it. (The registry check caught this before delivery — working as intended.)

## Documentation

- Updated `docs/SOPs/CAMPAIGN-EVENT-PICKER.md` with a "Data freshness" section describing the refresh-on-open flow.
- Registered the behavior in `feature-registry-check.sh` / `FEATURE-REGISTRY.md` (signature: `openCampaignBuilder`).

## Validation

- Braces: 1480/1480 MATCH
- Parens: 2689/2689 MATCH
- Double commas: none
- Embedded JS: `node --check` passed
- Feature registry: ALL FEATURE CHECKS PASSED
- Version consistency: all 5 files at v2.3.1-Build10.43

## Deploy

Single-file change to `admin.html` plus version bump and docs. After deploy: edit an event's time, then (without manually refreshing the admin) click Create Campaign or Edit — the builder should reflect the edit, and the buttons should briefly show "⏳ Refreshing events…".
