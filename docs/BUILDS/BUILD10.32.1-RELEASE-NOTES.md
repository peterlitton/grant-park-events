# Build10.32.1 Release Notes
## Add package.json with @netlify/blobs Dependency (Build Image Compatibility)

**Version:** v2.3.1-Build10.32.1
**Date:** 2026-04-12
**Type:** Build infrastructure fix
**Required:** Build10.32 failed to deploy due to Netlify build image change

---

## Why This Build Exists

Build10.32 packaged successfully and passed all SOP validation, but failed to deploy on Netlify with this error:

```
✘ [ERROR] Could not resolve "@netlify/blobs"
    ../../../tmp/.../bundled-@netlify_blobs.js:1:21:
      1 │ import * as mod from "@netlify/blobs";
        ╵                      ~~~~~~~~~~~~~~~~

Bundling of edge function failed
There was an error when loading the '@netlify/blobs' npm module.
Support for npm modules in edge functions is an experimental feature.
```

The edge function `seo-canonical.js` imports `@netlify/blobs` to fetch event data for SEO meta injection. This import has been in the code since Build10.17 and has shipped successfully many times. **Build10.32 did not change this import.**

## What Changed on Netlify's Side

Comparing the failed build log to a previous successful one:

| Item | Previous (working) | Current (failed) |
|------|--------------------|--------------------|
| Build image | older | `noble-new-builds` (`ff61fcb8...`) |
| Cache | available | `Failed to fetch cache, continuing with build` |
| Edge function bundler | resolved `@netlify/blobs` automatically | requires explicit `package.json` declaration |

The combination of (a) a new build image with stricter edge function bundling and (b) a failed cache fetch exposed the underlying issue: **the project has no `package.json`**, so the edge function bundler had no way to resolve `@netlify/blobs` from scratch.

Previous deploys worked because the cached `node_modules` directory from earlier builds happened to include `@netlify/blobs` (auto-installed by Netlify's lenient older bundler). When the cache was lost, there was nothing to fall back to.

## The Fix

Added a `package.json` at the project root that explicitly declares `@netlify/blobs` as a dependency. This is the documented Netlify approach for npm modules in edge functions.

```json
{
  "name": "grant-park-events",
  "version": "2.3.1",
  "private": true,
  "description": "Grant Park Events - Chicago community events calendar",
  "type": "module",
  "dependencies": {
    "@netlify/blobs": "^10.7.4"
  }
}
```

**Notes on the package.json design:**
- `"private": true` — prevents accidental npm publication
- `"type": "module"` — matches what all 39 serverless functions already use (ESM with `import`/`export default`). Several functions explicitly comment that they were "Converted to ES module for compatibility with package.json 'type': 'module'" — implying a previous package.json existed at some point. This restores the expected configuration.
- `^10.7.4` — current latest, verified via npm registry. The caret allows minor and patch updates within the 10.x range.
- No `devDependencies`, no `scripts` — this project uses zip drag-and-drop deployment, not a build pipeline. There's nothing for Netlify to run beyond installing the declared dependency.

## What This Build Includes

This is Build10.32 + the package.json fix. **All four Build10.32 fixes are included** (they never made it to production):

1. **renderHTMLField** helper — stops Featuring/Program double-processing
2. **`.event-content a` CSS** — links inside event content show as blue underline
3. **Copy URL button + rename Copy Name → Copy Path** in Image Manager
4. **Tightened edge function 410 regex** — only matches legacy event slugs with date suffix

See `BUILD10.32-RELEASE-NOTES.md` for full details on those four fixes.

## Files Changed (vs Build10.32)

| File | Change |
|------|--------|
| `package.json` | NEW — declares @netlify/blobs dependency, type: module |
| `build-version.js` | Version bump |
| `index.html` | Inline version bump |
| `admin.html` | Inline version bump |
| `CURRENT-BUILD.md` | Version bump |

## Risk Assessment

**Risk level: Low.**

What could go wrong:
- `"type": "module"` could affect how Node interprets `.js` files. **Mitigated:** All 39 serverless functions already use pure ESM syntax (`import`/`export default`, no `require`/`module.exports`). The 3 root-level `.js` files (`build-version.js`, `sw.js`, `version.js`) are browser-context files served as static assets, not executed by Node. They are unaffected by the `type` setting.
- The dependency version could be incompatible. **Mitigated:** `^10.7.4` is the current latest stable. The Netlify Blobs API hasn't had breaking changes since v7.0.0 (which the existing code already accommodates).
- The cache flush could affect other behaviors. **Mitigated:** This change explicitly declares what was previously implicit. There's no behavior change for code already running in production.

## Testing Requirements

### Pre-deploy
- [x] package.json is valid JSON (verified)
- [x] All version bumps consistent (verified)
- [x] All Build10.32 fixes still present (verified by diff)

### Post-deploy
- [ ] Build completes successfully on Netlify (this is the primary test)
- [ ] Edge function `seo-canonical` deploys without bundler errors
- [ ] Visit a current event page → page loads with correct meta tags
- [ ] All 39 serverless functions work normally (test by saving an event, hitting save-events)
- [ ] All Build10.32 fixes work as designed (Featuring/Program rendering, Copy URL button, etc.)

## Rollback

If this build fails for any reason, redeploy Build10.31.1. That version was last known to deploy successfully. You'll lose all four Build10.32 fixes but the site will remain functional.

If the build fails again with a *different* error related to `package.json`, the most likely culprit is the `"type": "module"` setting interacting with something unexpected. The fast workaround is to deploy a version without that line:

```json
{
  "name": "grant-park-events",
  "version": "2.3.1",
  "private": true,
  "dependencies": {
    "@netlify/blobs": "^10.7.4"
  }
}
```

## Why This Wasn't Caught in SOP Validation

The Build Validation SOP checks the code in the package, not the build infrastructure. There's no way to know in advance that Netlify has changed their build image until the deploy is attempted. This is a class of failure that only deploy attempts can surface.

**Going forward:** the absence of `package.json` was an undocumented assumption in the project's build configuration. Adding it makes the dependency explicit and protects against future build image changes that might be even stricter.

---

## PRE-DELIVERY VALIDATION RESULTS

✅ **Package.json Validation**
   - Valid JSON
   - Declares @netlify/blobs ^10.7.4
   - type: module matches existing function syntax

✅ **Syntax Validation**
   - index.html: No double commas
   - admin.html: No double commas
   - seo-canonical.js: Node syntax check PASS

✅ **Structural Integrity**
   - index.html: Braces 918/918, Parens 1660/1660, Brackets 124/124
   - admin.html: Braces 1481/1481, Parens 2692/2692, Brackets 318/318

✅ **Version Consistency**
   - build-version.js: v2.3.1-Build10.32.1
   - index.html inline: v2.3.1-Build10.32.1
   - admin.html inline: v2.3.1-Build10.32.1
   - CURRENT-BUILD.md: v2.3.1-Build10.32.1
   - sw.js: No hardcoded CACHE_VERSION ✓

✅ **File Integrity**
   - All essential files present
   - GOOGLE-CREDENTIALS.json still absent ✓
   - package.json line count: 10

✅ **Config File Validation**
   - _headers, netlify.toml, _redirects: All valid

✅ **Feature Registry Check**
   - All 14 registered features present ✓

✅ **Visual Code Review**
   - Diff vs Build10.32: 5 changes (1 new file + 4 version bumps)
   - All Build10.32 fixes preserved
   - No unintended modifications

**VALIDATION STATUS: ALL CHECKS PASSED ✅**
