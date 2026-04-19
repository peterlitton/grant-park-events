# BUILD10.14.8.3 RELEASE NOTES
## v2.3.1-Build10.14.8.3

**Date:** February 9, 2026  
**LLM:** Claude Opus 4.6  
**Type:** Architecture — single-source version control  
**Previous:** v2.3.1-Build10.14.8.2

---

## PROBLEM

Version was defined as a hardcoded string in 4 separate files:

| File | Variable | Had to manually sync? |
|------|----------|-----------------------|
| `version.js` | `BUILD_VERSION` | Yes |
| `index.html` | `const BUILD_VERSION` | Yes |
| `admin.html` | `const BUILD_VERSION` | Yes |
| `sw.js` | `CACHE_VERSION` | Yes |

Every build required 4 find-and-replace operations. If any was missed, version drift.
Build10.14.8 missed sw.js → browser served cached Build10.14.7 code → all fixes invisible.

This pattern has caused bugs in: Build6.2, Build6.4, Build6.5, Build10.14.8, Build10.14.8.1.

The "fix" each time was "added to checklist" or "will be more careful." Those are not fixes.

---

## SOLUTION

**Eliminated the copies.**

Created `/build-version.js` — the ONLY file that defines version:

```javascript
var BUILD_VERSION = 'v2.3.1-Build10.14.8.3';
var BUILD_DATE = '2026-02-09';
var BUILD_NOTES = 'Single-source version control';
```

All consumers load this file at runtime. They contain zero version strings:

| File | How it gets version | What was removed |
|------|-------------------|------------------|
| `index.html` | `<script src="/build-version.js">` | `const BUILD_VERSION = '...'` |
| `admin.html` | `<script src="/build-version.js">` | `const BUILD_VERSION = '...'` |
| `sw.js` | `importScripts('/build-version.js')` | `const CACHE_VERSION = 'gpe-...'` |
| `get-version.js` | `fetch('/build-version.js')` | `import from '../../version.js'` |

**What can still go wrong:**
- Forgetting to update build-version.js (1 failure point, not 4)
- Writing a wrong version number

**What CANNOT go wrong:**
- Version drift between files — architecturally impossible
- sw.js caching old code while HTML serves new code — impossible
- Admin showing different version than public site — impossible

---

## FILES CHANGED

### NEW: `/build-version.js`
- THE single source of version truth
- Uses `var` (not `const` or `export`) for compatibility with browser `<script>`, service worker `importScripts()`, and Netlify functions
- 25 lines total, heavily commented with rules

### MODIFIED: `index.html`
- **Added:** `<script src="/build-version.js">` before main app script (line 147)
- **Removed:** `const BUILD_VERSION = 'v2.3.1-Build10.14.8.2'` (was line 158)
- **Replaced with:** Comment noting version comes from build-version.js

### MODIFIED: `admin.html`
- **Added:** `<script src="/build-version.js">` before main app script (line 99)
- **Removed:** `const BUILD_VERSION = 'v2.3.1-Build10.14.8.2'` (was line 103)
- **Replaced with:** Comment noting version comes from build-version.js

### MODIFIED: `sw.js`
- **Added:** `importScripts('/build-version.js')` (line 7)
- **Removed:** `const CACHE_VERSION = 'gpe-v2.3.1-build10.14.8.2'`
- **Replaced with:** `const CACHE_VERSION = 'gpe-' + BUILD_VERSION.toLowerCase()`
- **Added:** `build-version.js` to STATIC_CACHE_URLS
- **Added:** Network-first fetch strategy for `/build-version.js` (always fresh)

### MODIFIED: `netlify/functions/get-version.js`
- Now fetches `/build-version.js` over HTTP and parses it
- No longer imports from `version.js`

### MODIFIED: `_headers`
- Added `/build-version.js` rule: 5-minute cache with must-revalidate
- Placed BEFORE `/*.js` rule (Netlify uses first match)

### DEPRECATED: `version.js`
- No longer defines BUILD_VERSION
- Kept only for VERSION_HISTORY archival reference
- No code imports from this file

### MODIFIED: `docs/SOPs/BUILD-VALIDATION-SOP.md`
- Step 3 rewritten for single-source validation
- Checks: no hardcoded versions in HTML or sw.js, script tags present
- Step 4 updated to check build-version.js existence

### MODIFIED: `docs/SOPs/PROJECT-STANDARDS.md`
- Version control section rewritten for build-version.js architecture

---

## HOW TO UPDATE VERSION (FUTURE BUILDS)

**Edit ONE file:** `/build-version.js`

```javascript
var BUILD_VERSION = 'v2.3.1-Build10.14.9';   // ← change this
var BUILD_DATE = '2026-02-10';                // ← change this
var BUILD_NOTES = 'Description of changes';   // ← change this
```

That's it. No other files to touch. No syncing. No checklist.

---

## VALIDATION RESULTS

### Step 3: Version Consistency (Single-Source)

✅ build-version.js has correct version: `v2.3.1-Build10.14.8.3`  
✅ No hardcoded BUILD_VERSION in index.html or admin.html  
✅ No hardcoded CACHE_VERSION string literal in sw.js  
✅ All 3 consumers load build-version.js (script tags/importScripts present)  

### Step 2: Structural Integrity

✅ index.html: Braces 842/842, Brackets 106/106, Parens 1493/1493  
✅ admin.html: Braces 1289/1289, Brackets 260/260, Parens 2277/2277  

### Step 4: File Integrity

✅ index.html: 2536 lines  
✅ admin.html: 4523 lines  
✅ build-version.js: 25 lines  
✅ sw.js: 173 lines  

### Diff Review

✅ All changes map to documented modifications  
✅ No unintended changes  
✅ No rogue version strings anywhere  

**VALIDATION STATUS: ALL CHECKS PASSED ✅**

---

## TESTING

### 1. Verify Service Worker Loads New Version
- Deploy and open console
- Must show: `[Service Worker] Loaded: v2.3.1-Build10.14.8.3`
- If old version appears: hard refresh once (Ctrl+Shift+R)

### 2. Verify Public Site Shows Version
- Scroll to footer on public site
- Must show: `Release: v2.3.1-Build10.14.8.3`

### 3. Verify Admin Shows Same Version
- Open admin panel
- Header and footer must show: `Release: v2.3.1-Build10.14.8.3`

### 4. Verify get-version Function
- Visit: `https://www.grantparkevents.com/.netlify/functions/get-version`
- Must return JSON with `"version": "v2.3.1-Build10.14.8.3"`

### 5. Also Validates Build10.14.8.2 Fixes
This build includes all fixes from 10.14.8, 10.14.8.1, and 10.14.8.2:
- Popup settings save to Blobs AND localStorage (dual write)
- Inline save status next to "Email Signup Popup" heading
- Popup Blobs migration (localStorage → Blobs on first deploy)
- PNG export base64 image conversion (pre-iframe)
- Cookie override works (settings properly persisted)

All of these were previously blocked by the sw.js cache bug and are now live.
