# FEATURE REGISTRY
## Grepable Feature Signatures for Build Validation

**Created:** Build10.17.5 (2026-02-27)
**Purpose:** Catch silent feature regressions. Each entry is a grep pattern that MUST be present in the specified file. If missing, a feature was lost during a rebuild.

**Why this exists:** Build10.17.1-10.17.5 lost the Inspect clipboard feature from `admin-index-report.html` because a session sourced the file from Build10.14.11 instead of the latest deployed version. The feature worked silently — no errors, no structural failures — so existing validation didn't catch it.

**Rules:**
- Add an entry every time a feature is added to a file that gets rebuilt frequently
- Each entry must be a unique grep pattern (not a common word)
- Run `docs/SOPs/feature-registry-check.sh` as part of build validation (Step 4c)
- If a check fails: the feature was silently dropped — investigate and restore

---

## admin-index-report.html

| Feature | Grep Pattern | Added In | Description |
|---------|-------------|----------|-------------|
| Inspect copies URL | `clipboard.writeText(page.url)` | Build10.17 | Single-click Inspect copies full URL to clipboard AND opens GSC |
| Live age clock | `setTick` | Build10.17.5 | "Updated X minutes ago" re-renders every 60 seconds |
| Minimal nav bar | `Back to Admin` | Build10.17.5 | Replaced old fake tab bar with simple back link |

## admin.html

| Feature | Grep Pattern | Added In | Description |
|---------|-------------|----------|-------------|
| Event visibility filter | `eventVisibilityFilter` | Build10.17.1 | Clickable Total/Published/Hidden filter pills |
| Full SEO validation | `fullSeoValidating` | Build10.17.1 | Validates all published events, not just 8 |
| Index Report link | `admin-index-report` | Build10.17.3 | Tab bar link to Index Report page |
| Tab wrap layout | `flex flex-wrap` | Build10.17.1 | Tabs wrap instead of horizontal scroll |

## index.html

(No feature signatures registered yet — index.html changes infrequently)

## Edge functions

| Feature | File Must Exist | Added In | Description |
|---------|----------------|----------|-------------|
| SEO canonical injection | `netlify/edge-functions/seo-canonical.js` | Build10.17 | Injects correct canonical/og:url into raw HTML |

### Edge function grep signatures

| Feature | Grep Pattern | Added In | Description |
|---------|-------------|----------|-------------|
| 410 old-format events | `410 Gone` | Build10.18 | Returns 410 for old-format event URLs (slug starts with letter) |
| 410 legacy pages | `about-us-contact` | Build10.18 | Returns 410 for /sign-up and /about-us-contact |

## Config files (non-feature, but critical content)

| File | Grep Pattern | Description |
|------|-------------|-------------|
| netlify.toml | `functions = "netlify/functions"` | Functions directory declaration |
| _headers | `Cache-Control: no-cache, no-store, must-revalidate` | build-version.js cache rule |
| _redirects | `/.netlify/functions/rss-feed` | RSS function route |
