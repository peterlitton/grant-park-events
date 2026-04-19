# Build73.2 - Version Discrepancy Note

**Date:** February 2, 2026  
**Status:** Documented - No Action Required

---

## 📋 DISCREPANCY DETAILS

**Build Folder Name:** `gpe20-v2.3.0-build73.2`  
**version.js Content:** `v2.3.0-Build73.1`  

**Issue:** The `version.js` file was not updated during Build73.2 deployment.

---

## 🔍 WHAT HAPPENED

Build73.2 was created to fix the QR code CDN cache issue:
- **Change Made:** Added cache-busting parameter `?v=2.3.0` to QR code URL
- **File Modified:** `netlify/functions/generate-email-html.js` (line 108)
- **version.js:** Was not updated to reflect Build73.2

This means:
- The deployed code IS Build73.2 (has the QR code fix)
- The version.js file still shows Build73.1
- The footer and any version-dependent code references Build73.1

---

## ✅ RESOLUTION

**Decision:** Document only, no corrective build needed.

**Rationale:**
- The critical fix (QR code cache-busting) IS deployed and working
- version.js is internal-only reference
- Footer version display doesn't affect functionality
- Next build (Build73.3+) will have correct version.js

---

## 🎯 CRITICAL FIX IN BUILD73.2

**The Important Part:** QR code cache-busting fix

**Problem:**
- URL `https://grantparkevents.com/assets/common/poster-qr-code.png` was returning HTML instead of PNG
- Netlify CDN had cached the incorrect response with 1-year max-age
- Email templates showed broken QR code images

**Solution:**
- Added cache-busting parameter: `?v=2.3.0`
- New URL: `https://grantparkevents.com/assets/common/poster-qr-code.png?v=2.3.0`
- Forces CDN to fetch fresh PNG file
- File modified: `netlify/functions/generate-email-html.js` (line 108)

**Status:** ✅ FIXED and DEPLOYED

---

## 📝 NEXT BUILD REQUIREMENTS

When creating Build73.3 (or next version):
- Update version.js to match build number
- Follow standard version increment process
- Use `update-version.sh` script to update all files consistently

---

*Document created: February 2, 2026*
