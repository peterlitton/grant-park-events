# PROJECT STANDARDS
## Grant Park Events Development Standards

**Version:** 2.4  
**Last Updated:** March 7, 2026  
**Current Stable:** v2.3.1-Build10.22

## DEPLOYMENT (Peter's Answers A1-A3)
- Peter downloads, unzips, drag/drop to Netlify
- Peter tests AFTER deployment (not locally)
- Claude MUST validate all code before delivery
- See BUILD-VALIDATION-SOP.md for validation process

## BUILD NUMBERING (B1-B2)
- Small refinement = Build##.1
- New feature = Build## (increment)
- Must be sequential (no skipping)

## CONFIG FILE INTEGRITY (Build10.17.4+)

**NEVER fetch `_headers`, `_redirects`, `netlify.toml`, or any `netlify/` files from the live site via HTTP.** The `_redirects` catch-all (`/* → /index.html 200`) serves HTML for these paths, silently corrupting the files. This caused Build10.17.1-10.17.3 failures.

**Safe sources for config files:** Previous build package, working directory, or `docs/` reference copies.

**Validation:** BUILD-VALIDATION-SOP.md Step 4b checks config file content before every delivery.

## SOURCE VERIFICATION (Build10.17.5+)

**Every session that touches code must start from the version in `CURRENT-BUILD.md`.** Not an older archive, not a live site fetch, not whatever happens to be in the working directory.

**Before modifying any file, verify:**
1. Check `CURRENT-BUILD.md` for the deployed version number
2. Confirm the file being edited comes from that build — not an older version
3. For `admin-index-report.html`: check the internal version comment (e.g. `// Build version: Build10.XX`)
4. If the file's internal version doesn't match `CURRENT-BUILD.md`, STOP and source the correct version

**Why this exists:** Build10.17.1-10.17.5 lost the Inspect clipboard feature because `admin-index-report.html` was sourced from Build10.14.11 instead of the latest deployed build. The file worked — no errors — but a feature was silently dropped.

## FEATURE REGISTRY (Build10.17.5+)

**`docs/SOPs/FEATURE-REGISTRY.md`** lists grep-able signatures for critical features per file.

**BUILD-VALIDATION-SOP.md Step 4c** runs `docs/SOPs/feature-registry-check.sh` to verify all registered features are present. A missing pattern means a feature was silently dropped during a rebuild.

**When adding features:** Add a new entry to FEATURE-REGISTRY.md with the file, grep pattern, build number, and description. This is mandatory for any feature added to a file that gets rebuilt frequently (especially `admin-index-report.html`, `admin.html`).

**Why this exists:** Structural integrity checks confirm files aren't broken but cannot detect removed features. The registry catches what syntax checks miss.

## ASSET MANAGEMENT
### Icons
- **Documentation:** /docs/SOPs/ICON-NAMING-GUIDE.md
- **Location:** /assets/common/
- **Naming:** icon-{size}.png (e.g., icon-192.png)
- **Required sizes:** 48, 72, 96, 144, 180, 192, 512, 512-maskable

### Images
- **Documentation:** /docs/SOPs/IMAGE-PATH-SOP.md

## SCOPE (C1)
- admin.html IN SCOPE (can modify)

## MULTIPLE REQUESTS (D1)
- Ask which to prioritize or combine

## ERROR HANDLING (E1)
- Test BEFORE delivery (CRITICAL)
- Never present with known errors
- Run all validation checks
- Fix errors, re-validate, present clean

## OPUS (F1)
- Peter initiates if needed
- Claude says "recommend Opus" when stuck

## VERSION CONTROL (G1) — Build10.14.8.3+

**Single source of truth: `/build-version.js`**

This is the ONLY file that defines version. All other files load it at runtime.

```javascript
// build-version.js — THE ONLY PLACE VERSION IS DEFINED
var BUILD_VERSION = 'v2.3.1-Build##';
var BUILD_DATE = 'YYYY-MM-DD';
var BUILD_NOTES = 'Description';
```

**Consumers (read-only — never define version themselves):**
- `index.html` → `<script src="/build-version.js">`
- `admin.html` → `<script src="/build-version.js">`
- `sw.js` → `importScripts('/build-version.js')`
- `get-version.js` → fetches `/build-version.js` over HTTP

**Rules:**
- NO hardcoded `BUILD_VERSION` or `CACHE_VERSION` in any other file
- To change version: edit `build-version.js` only
- `version.js` is DEPRECATED (kept for VERSION_HISTORY reference only)

## TIMEZONE (H1)
- Central Time (Chicago)

## POPUP SETTINGS ARCHITECTURE (Build10.14.8.4+)
- **Authoritative store:** Netlify Blobs via `save-popup-settings` / `get-popup-settings`
- **Admin saves to:** Blobs + localStorage (dual write)
- **Public site reads from:** Blobs endpoint first → localStorage fallback → hardcoded defaults
- **Why:** localStorage is per-browser. Blobs ensures settings apply to all visitors.

## PNG EXPORT (Build10.14.8.4+)
- Email HTML contains absolute URLs (`https://www.grantparkevents.com/...`)
- Admin may run on different origin (`gpe20.netlify.app`)
- Before html2canvas: strip domain prefix to make URLs relative, then convert to base64
- This avoids CORS and ensures html2canvas can render all images

## BREAKING CHANGES (I1)
- STOP and flag to Peter
- Present options
- Wait for direction

## SUCCESS SIGNALS (J1-J2)
- Positive: "Solved", "Perfect", "Well done"
- Will be obvious

## COST ESTIMATES (K1)
- NEVER provide man hour cost estimates unless Peter explicitly asks
- External costs (fees, subscriptions) are acceptable
- If uncertain whether Claude can do work, state that clearly
- Focus on technical requirements, not speculative costs

## QUALITY
- Zero tolerance for production issues
- Gold standard = BUILD-VALIDATION-SOP.md
- Quality over speed always
- Comprehensive documentation required

## INVESTIGATION BEFORE RECOMMENDATION (Build10.22+)

**Don't propose a fix until you've confirmed the problem exists in the environment you're targeting.** Collect the current production scores on the exact pages and tool that will be used to validate. State the specific metric being targeted, its current value, and the expected value after the fix. If you can't predict the outcome with confidence, you haven't investigated enough to build.

**Why this exists:** Build10.20 fixed CLS on preview URLs, but production already had CLS 0. The fix was unnecessary and wasted a build cycle.

## RENDERING CONTEXT RULE (Build10.22+)

**Before recommending or implementing any change that affects visual rendering, document the current rendering chain (HTML attributes + CSS + container constraints) for every affected element.** This investigation happens before proposing the change to Peter, not after approval.

Rendering changes include: image dimensions, width/height attributes, layout styles, image sources, CSS classes, fit/cover/contain parameters.

**Why this exists:** Build10.22.1 added `width:900,height:195` to a logo constrained by `h-[69px]` CSS, causing aspect ratio distortion. The failed Build10.22 used `fit=cover` without understanding each display context's CSS. Both were code-correct but visually broken.

## ONE RISK PER BUILD (Build10.22+)

**Never combine a proven-safe change with an uncertain one in the same build.** If a build contains a mix and something breaks, the safe work gets rolled back too.

**Why this exists:** The first Build10.22 bundled resized assets (safe) with Netlify Image CDN (uncertain). The CDN failed, requiring rollback of the asset work as well.

## PREVIEW BEFORE PRODUCTION FOR NEW TECHNIQUES (Build10.22+)

**Any approach not previously used in this project must be validated on a preview deploy before Peter deploys to production.** Medium or high risk items (as identified in the pre-build gate scope) mean preview-test-first, not ship-and-hope. Peter should not be the one discovering visual failures.

**Why this exists:** Netlify Image CDN was flagged as medium risk in the scope document but was shipped directly to production without preview validation, causing image cropping and modal overlay issues.

**READ BUILD-VALIDATION-SOP.md FOR COMPLETE REQUIREMENTS**
