# Build10.41 — Tech Build (TB)

**Version:** v2.3.1-Build10.41
**Date:** 2026-06-22
**Type:** Feature (dashboard card) + documentation + email asset swap. Poster QR phone-validated before integration.

## What's in this build

| File | Change |
|------|--------|
| `admin-dashboard.html` | NEW "Poster QR Visits" card on Campaigns page + `qrTrafficPoster` state + fetch (`?page=/poster-qr`). Version → 10.41. |
| `netlify/functions/generate-email-html.js` | Email header QR cache-buster `?v=2.3.0` → `?v=10.41` (forces fetch of new self-hosted QR). |
| `assets/common/poster-qr-code.png` | REPLACEMENT poster QR — encodes `/poster-qr` directly (self-hosted, no scan.page). Phone-validated. |
| `build-version.js` | Version → 10.41; BUILD_DATE/BUILD_NOTES updated. |
| `CURRENT-BUILD.md` | Version → 10.41; date 2026-06-22. |
| `index.html`, `admin.html` | Version string → 10.41 (no other change). |
| `docs/SOPs/QR-CODE-REGISTRY.md` | NEW — centralized registry of all QR codes. Poster marked live. |
| `docs/BUILDS/BUILD10.41-RELEASE-NOTES.md` | NEW — release notes. |
| `docs/SOPs/feature-registry-check.sh` | Registered both QR cards + email QR image. |
| `docs/SOPs/FEATURE-REGISTRY.md` | Same registrations documented. |

## Validation (pre-delivery)

- Braces 374/374 MATCH · Parens 571/571 MATCH · no double commas
- Feature registry Step 4c: ALL FEATURE CHECKS PASSED (2 QR cards + email QR image)
- `node --check` on `admin-dashboard.html` embedded JS: passed
- `node -c netlify/functions/generate-email-html.js`: passed
- Version consistency: all 5 files at v2.3.1-Build10.41

## Deploy

Copy all files into the repo at the same relative paths and push. Single atomic build — no staged parts, no `_redirects` change. `/poster-qr` is served by the existing catch-all; `ga4-analytics.js` already supports `?page=`.

After deploy, verify:
1. Exec dashboard → Campaigns → "Poster QR Visits" card renders (empty until scans accrue).
2. Generate a test email from admin → confirm the QR image loads and scans to `https://www.grantparkevents.com/poster-qr`.

## Post-deploy

- scan.page can be safely cancelled — no GPE QR depends on it (see QR-CODE-REGISTRY.md).
- Reminder: the Meta App Secret reset is still an open security item from the prior session (unrelated to this build).
