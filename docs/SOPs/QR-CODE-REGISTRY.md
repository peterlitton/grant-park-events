# QR CODE REGISTRY
## Single source of truth for every QR code used by Grant Park Events

**Created:** Build10.41 (2026-06-22)
**Purpose:** Memorialize every QR code GPE has produced — what it encodes, where it is printed/displayed, where it sends people, how its traffic is tracked, and how to replace it. Before generating, changing, or retiring any QR code, update this file.

**Why this exists:** QR codes are physical artifacts (posters, business cards) and embedded assets (email template) that are expensive or impossible to recall once distributed. A QR that encodes a third-party redirect can silently die when that service is cancelled. This registry prevents that by recording the real destination and tracking design of every code in one place.

---

## Active QR codes

| Code | Encoded value | Resolves to | Tracking | Dashboard card | Status |
|------|---------------|-------------|----------|----------------|--------|
| Business Card | `https://www.grantparkevents.com/gpe-bcard-qr` | Site (catch-all serves `index.html`) | GA4 pagePath `/gpe-bcard-qr` | Campaigns → "Business Card QR Visits" | ✅ Live, self-hosted |
| Poster | `https://www.grantparkevents.com/poster-qr` | Site (catch-all serves `index.html`) | GA4 pagePath `/poster-qr` | Campaigns → "Poster QR Visits" | ✅ Live Build10.41 (phone-validated); replaced scan.page code |

---

## Code detail

### 1. Business Card QR

- **Encodes:** `https://www.grantparkevents.com/gpe-bcard-qr`
- **Printed on:** GPE business cards (`GPE_Business_Card-3.pdf`, lower-right).
- **Resolution:** `/gpe-bcard-qr` is not in `_redirects`, so it falls through the catch-all (`/* → /index.html 200`) and serves the React site. The visitor sees Grant Park Events with `/gpe-bcard-qr` in the URL bar.
- **Tracking:** GA4 records a page_view on pagePath `/gpe-bcard-qr`. The dashboard's `qr-traffic` metric (`netlify/functions/ga4-analytics.js`) queries `screenPageViews` where `pagePath CONTAINS /gpe-bcard-qr`.
- **Dashboard:** Exec dashboard → Campaigns page → "Business Card QR Visits" card (added Build10.37.6).
- **Third-party dependency:** None. Self-hosted on own domain. Unaffected by the scan.page decommission.

### 2. Poster QR

- **Encodes:** `https://www.grantparkevents.com/poster-qr`
- **Used on:** Printed posters, and the email template QR image (`assets/common/poster-qr-code.png`).
- **Resolution:** `/poster-qr` falls through the catch-all (`/* → /index.html 200`) and serves the React site, same mechanism as the business card. No `_redirects` entry needed.
- **Tracking:** GA4 page_view on pagePath `/poster-qr`. Dashboard `qr-traffic` metric is called with `?page=/poster-qr`.
- **Dashboard:** Exec dashboard → Campaigns page → "Poster QR Visits" card (added Build10.41).
- **Asset:** `assets/common/poster-qr-code.png` — 512×512, 8-bit grayscale, QR version 3 (29×29 modules), error correction M. Phone-validated Build10.41 (scans → `/poster-qr`). Referenced by the email template (`generate-email-html.js`, `?v=10.41` cache-buster).
- **Third-party dependency:** None. Replaced the scan.page code in Build10.41.

---

## scan.page decommission (2026-06)

The **previous** poster QR encoded `https://scan.page/WwrvP3`, a dynamic redirect hosted by scan.page, which then resolved to `https://www.grantparkevents.com/?utm_source=poster&utm_medium=qr`.

Because the QR encoded the scan.page link rather than the destination, **cancelling scan.page would break every printed poster and the email QR** — scans would hit a dead redirect. The image itself cannot be changed after printing; only the destination behind a dynamic code can.

**Remediation (Build10.41):** Replaced with a self-hosted code that encodes `https://www.grantparkevents.com/poster-qr` directly. No third-party redirect, nothing to cancel, nothing to expire.

**Tracking change:** The old poster code tracked traffic via UTM parameters (`utm_source=poster&utm_medium=qr`), visible only in GA4's acquisition reports (no dashboard card ever read it). The new code tracks via pagePath `/poster-qr`, surfaced directly on the dashboard. Historical UTM data is retained in GA4 and is not deleted; new poster traffic begins a fresh pagePath series.

---

## Tracking architecture

Two tracking patterns exist; GPE standardizes on **pagePath** for QR codes.

| Pattern | How it works | Visible where | Used by |
|---------|--------------|---------------|---------|
| pagePath (preferred) | QR encodes a unique on-site path; catch-all serves the site; GA4 logs the path | Dashboard `qr-traffic` cards + GA4 reports | Business Card, Poster |
| UTM params | QR encodes `/?utm_source=…&utm_medium=…`; GA4 attributes session source/medium | GA4 acquisition reports only (not on dashboard) | Retired poster code (pre-Build10.41) |

The dashboard `qr-traffic` metric (`ga4-analytics.js`) accepts a `?page=` override and defaults to `/gpe-bcard-qr`. Each QR card on the dashboard calls it with the relevant path.

---

## SOP — create or replace a QR code

1. **Pick the on-site path.** Use a short, descriptive, unique path (e.g. `/poster-qr`). Keep it short — path length drives QR density (see Density rules).
2. **Confirm it resolves.** If the path should serve the site, the catch-all (`/* → /index.html 200`) handles it — no `_redirects` change. If it must redirect elsewhere, add a rule **before** the catch-all using `302` (re-pointable, not hard-cached).
3. **Generate the PNG.** 512×512, 8-bit grayscale, error correction M, encoding the full `https://www.grantparkevents.com/<path>` URL. Match the existing asset format so it drops in cleanly.
4. **Verify the round-trip.** Decode the generated PNG and confirm it returns the exact URL. Decode again at 66×66 (the email render size) and confirm it still scans.
5. **Scan-test on a real phone** before distributing or swapping the email asset. This is the one check that cannot be automated.
6. **Deploy the asset** to `assets/common/` (overwrite `poster-qr-code.png` for the poster code) and bump the email template's `?v=` cache-buster if the file name is reused.
7. **Add the dashboard card.** Add a fetch (`?metric=qr-traffic&page=/<path>`), a state var, and a `Card(...)` mirroring the existing QR cards in `admin-dashboard.html`. No backend change required.
8. **Register the feature.** Add a grep signature to `docs/SOPs/feature-registry-check.sh` and `docs/SOPs/FEATURE-REGISTRY.md`.
9. **Update this registry.** Add the code to the Active QR codes table and Code detail.

---

## Density rules (why short paths matter)

A QR rendered at the email's 66×66px must stay sparse enough to scan. Density rises with encoded-string length. Measured thresholds (error correction M):

| QR version | Modules | Scans at 66px? |
|------------|---------|----------------|
| v3 | 29×29 | ✅ reliable |
| v4 | 33×33 | ⚠️ borderline (pattern-dependent) |
| v5 | 37×37 | ❌ fails |

Keep the encoded URL short enough to stay at **v3 (≤ ~41 characters total)**. For reference: `https://www.grantparkevents.com/poster-qr` (41 chars) = v3 ✅; the full UTM URL (63 chars) = v5 ❌. Printed posters are large, so density only matters for the small email render — but the email reuses the same asset, so design for the smallest surface.

---

## Dashboard surfaces

Both QR cards live on the exec dashboard **Campaigns** page (`admin-dashboard.html`, `campaignPage`, page index 2):

- **Business Card QR Visits** — `?metric=qr-traffic` (defaults to `/gpe-bcard-qr`)
- **Poster QR Visits** — `?metric=qr-traffic&page=/poster-qr`

Both render via the shared `QrTrafficChart` component (Plotly daily bar chart, last 30 days) with a total page-views figure in the card header.
