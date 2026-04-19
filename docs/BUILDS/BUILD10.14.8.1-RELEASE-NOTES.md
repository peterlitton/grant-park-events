# BUILD10.14.8.1 RELEASE NOTES
## v2.3.1-Build10.14.8.1

**Date:** February 9, 2026  
**LLM:** Claude Opus 4.6  
**Type:** Bug fixes from Build10.14.8 validation  
**Previous:** v2.3.1-Build10.14.8

---

## CHANGES

### 1. Popup Settings — Dual Write (Blobs + localStorage)
**Problem:** Build10.14.8 removed localStorage write when adding Blobs save. But the public site (index.html line 2266) reads popup settings from localStorage, so it never received updated values.  
**Fix:** `savePopupSettings` now writes to BOTH Blobs AND localStorage. Background fetch from Blobs also syncs to localStorage. Blobs is authoritative (cross-device); localStorage serves the public site immediately.  
**Files:** `admin.html` — savePopupSettings function + background load handler

### 2. Popup Settings — Inline Save Status
**Problem:** Save confirmations used `showNotification()` which appears at top-right of page, easily missed when working in the popup section.  
**Fix:** Added `popupSaveStatus` state with inline indicator next to "Email Signup Popup" heading. Shows "⏳ Saving...", "✅ Settings saved!", or "❌ Save failed" in context. Removed `showNotification` calls from popup save.  
**File:** `admin.html` — popup tab header + savePopupSettings function

### 3. PNG Export — Base64 Image Conversion
**Problem:** html2canvas cannot render cross-origin images even with `useCORS: true` unless the server sends CORS headers. Logo and QR code in email template use absolute URLs, resulting in blank images in PNG output (preview worked fine since it's plain HTML rendering).  
**Fix:** Before html2canvas capture, all `<img>` elements with HTTP URLs are fetched, converted to base64 data URIs via FileReader, and replaced in-place. html2canvas then renders the embedded images directly.  
**File:** `admin.html` — exportPNG function

---

## TESTING REQUIREMENTS (AC for items 3-5)

### Item 3 — Popup Settings Persistence
- Change delay to 45 seconds via dropdown → "✅ Settings saved!" appears next to heading
- Reload page → dropdown shows 45 seconds
- Open site in incognito → popup should fire after 45 seconds
- Change headline → tab away (blur) → "✅ Settings saved!" appears
- Reload → headline persists
- Toggle on/off → inline status confirms save

### Item 4 — Popup Dropdown
- Same AC as Build10.14.8 (no changes to dropdown itself)
- Select value → save confirmation appears inline (not top of page)
- No value drift on repeated reloads

### Item 5 — PNG Export Images
- Go to Email Campaigns → select a campaign with events
- Click PNG export
- Verify exported PNG shows logo (left) and QR code (right) in header
- Both images should render fully (not blank/white)

---

## PRE-DELIVERY VALIDATION RESULTS

✅ **Structural Integrity**
   - admin.html: Braces 1283/1283, Brackets 251/251, Parens 2257/2257
   - index.html: Braces 842/842, Brackets 106/106, Parens 1492/1492

✅ **Version Consistency**
   - version.js: v2.3.1-Build10.14.8.1 ✓
   - index.html: v2.3.1-Build10.14.8.1 ✓
   - admin.html: v2.3.1-Build10.14.8.1 ✓

✅ **Code Review** — all diffs verified, no unintended changes

**VALIDATION STATUS: ALL CHECKS PASSED ✅**
