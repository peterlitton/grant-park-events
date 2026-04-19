# BUILD73.2 RELEASE NOTES

**Version:** v2.3.0-Build73.2  
**Date:** February 2, 2026  
**Type:** Hotfix - CDN Cache Issue  
**Status:** PRODUCTION

---

## 🎯 SUMMARY

Fixes QR code display in email templates by adding cache-busting parameter to bypass poisoned CDN cache.

---

## 🔧 CHANGES

### File Modified:
`netlify/functions/generate-email-html.js` (line 108)

### Change:
```javascript
// Before
src="https://grantparkevents.com/assets/common/poster-qr-code.png"

// After  
src="https://grantparkevents.com/assets/common/poster-qr-code.png?v=2.3.0"
```

---

## 🐛 ISSUE RESOLVED

**Problem:** QR code image in email templates returned HTML instead of PNG.

**Root Cause:** Netlify CDN cached an incorrect response (HTML redirect) for the QR code URL with:
- `cache-control: public, max-age=31536000, immutable` (1 year!)
- `content-type: text/html`

**Diagnosis:**
- Direct URL returned `content-type: text/html` 
- Adding `?v=test123` parameter returned `content-type: image/png`
- Confirmed: File exists and is accessible, but CDN cache was poisoned

**Solution:** Cache-busting query parameter forces CDN to fetch fresh copy.

---

## 📋 TESTING

1. ✅ Deploy Build73.2
2. ✅ Go to Admin → Email Campaigns
3. ✅ Create or edit a campaign
4. ✅ Verify QR code displays in preview
5. ✅ Export PNG and verify QR code visible

---

## 🔄 RELATED

- **Build74:** Attempted On-Demand Builder for SSR (failed, rolled back)
- **BUILD74-ODB-RESEARCH.md:** Research on proper Netlify caching approach for future SSR implementation

---

## 📁 FILES IN PACKAGE

- All files from Build73.1
- Updated: `netlify/functions/generate-email-html.js`
- Updated: `docs/SOPs/PROJECT-STANDARDS.md` (version)
- Updated: `docs/BUILDS/BUILD-HISTORY.md`
- Updated: `docs/AI/CHAT-HANDOFF.md`
- Added: `docs/AI/BUILD74-ODB-RESEARCH.md`
