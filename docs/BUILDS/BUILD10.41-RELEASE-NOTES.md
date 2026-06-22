# Build10.41 Release Notes
## Poster QR Visits dashboard card + QR Code Registry

**Version:** v2.3.1-Build10.41
**Date:** 2026-06-22
**Type:** Feature — new dashboard card + documentation; no backend change

---

## Overview

Added a "Poster QR Visits" card to the executive dashboard's Campaigns page, mirroring the existing "Business Card QR Visits" card. Created a centralized QR Code Registry documenting every GPE QR code, its destination, and its tracking. Generated a self-hosted replacement for the poster QR code to remove the scan.page dependency.

## Background

The poster QR previously encoded a `scan.page` dynamic redirect (`scan.page/WwrvP3` → `/?utm_source=poster&utm_medium=qr`). With scan.page being cancelled, that code would break once the service is gone — the encoded value points at scan.page, not at GPE. The replacement encodes a self-hosted path directly, tracked the same way as the business card QR.

## Changes

### 1. New Dashboard Card: Poster QR Visits

**File:** `admin-dashboard.html`

- Added `qrTrafficPoster` state.
- Added one fetch to `loadAll`: `ga4-analytics?metric=qr-traffic&page=/poster-qr` (results index 15).
- Added a "Poster QR Visits" `Card` on the Campaigns page (page 2), directly below "Business Card QR Visits", reusing the existing `QrTrafficChart`, `Card`, and `fmt` helpers.
- Subtitle: "Page: /poster-qr · last 30 days". Header shows total page views.
- **No backend change** — `ga4-analytics.js` already supports the `?page=` override (defaults to `/gpe-bcard-qr`). The card shows "No QR traffic data found" until scans on `/poster-qr` begin.

### 2. QR Code Registry (new doc)

**File:** `docs/SOPs/QR-CODE-REGISTRY.md`

Centralized record of every QR code: encoded value, destination, tracking mechanism, dashboard card, and status. Covers the Business Card and Poster codes, the scan.page decommission, the pagePath-vs-UTM tracking architecture, a create/replace SOP, and density rules for keeping codes scannable at the email's 66px render.

### 3. Feature Registry updates

**Files:** `docs/SOPs/feature-registry-check.sh`, `docs/SOPs/FEATURE-REGISTRY.md`

Registered both QR cards under a new `admin-dashboard.html` section (grep signatures `Business Card QR Visits` and `Poster QR Visits`) to catch silent regressions.

### 4. Replacement poster QR asset (live)

**File:** `assets/common/poster-qr-code.png`

512×512, 8-bit grayscale, QR version 3 (29×29 modules), error correction M. Encodes `https://www.grantparkevents.com/poster-qr` directly — no third-party redirect. Round-trip verified; scans at 66px (email size); **phone-validated** by operator. Replaces the previous scan.page-based image.

### 5. Email template cache-buster

**File:** `netlify/functions/generate-email-html.js`

Bumped the header QR image cache-buster (line ~137) from `?v=2.3.0` to `?v=10.41` so email clients and the CDN fetch the new self-hosted QR instead of the cached scan.page image. Same filename, so this one-line change is the only code edit. Registered `poster-qr-code.png` as a feature signature.

## Tracking note

Historical poster traffic under UTM `poster / qr` is retained in GA4 and not deleted. New poster scans begin a fresh pagePath series on `/poster-qr`, now visible on the dashboard.

## Validation

- Braces: 374/374 MATCH
- Parens: 571/571 MATCH
- Double commas: none
- Feature registry (Step 4c): ALL FEATURE CHECKS PASSED (incl. both QR cards + email QR image)
- Embedded JS: `node --check` passed (`admin-dashboard.html`)
- Function syntax: `node -c netlify/functions/generate-email-html.js` passed
- Version consistency: all 5 files at v2.3.1-Build10.41

## Deploy notes

This build is now self-contained — dashboard card, docs, the email cache-buster, and the replacement QR asset all ship together. The poster QR was phone-validated before integration. The "Poster QR Visits" card shows an empty state until `/poster-qr` scans accrue. No `_redirects` or other function change required.
