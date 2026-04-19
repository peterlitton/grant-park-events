# CHAT HANDOFF - Grant Park Events 2.0

**Last Updated:** February 2, 2026  
**Current Build:** v2.3.0-Build73.2 (version.js shows Build73.1 - not updated in 73.2)  
**Status:** PRODUCTION - Deployed and Live

---

## 🚀 QUICK START FOR NEW CLAUDE SESSION

### MANDATORY First Steps:
```bash
# 1. Read project standards FIRST
view /docs/SOPs/PROJECT-STANDARDS.md

# 2. Read build validation SOP
view /docs/SOPs/BUILD-VALIDATION-SOP.md

# 3. Check current version
view /scripts/version.js
```

---

## 📋 PROJECT OVERVIEW

**What is this?**
Grant Park Events (grantparkevents.com) is a community events calendar for Chicago's Grant Park and Millennium Park. It's a single-page React application hosted on Netlify.

**Tech Stack:**
- React 18 (no JSX - uses `React.createElement`)
- Tailwind CSS (CDN)
- Netlify Functions (serverless backend)
- Netlify Blobs (data storage)
- MailerLite (email subscriptions)
- EmailOctopus (legacy - subscriber collection only)

**Key Files:**
- `index.html` - Main public site (single-page app)
- `admin.html` - Admin panel for event/campaign management
- `netlify/functions/` - All backend functions
- `assets/` - Images, logos, vendor scripts

---

## 🎯 CURRENT STATE (Build73.2)

### What's Working:
- ✅ Public event calendar with card/calendar views
- ✅ Event detail pages (modal + dedicated URLs)
- ✅ Admin panel for event management
- ✅ Email signup popup (configurable delay)
- ✅ Email campaign management system
- ✅ MailerLite integration for subscriptions
- ✅ PNG export for TV displays
- ✅ Google Analytics 4 tracking
- ✅ SEO (client-side meta tag injection)
- ✅ QR code in email templates (with cache-busting)

### Recent Fixes (Build73.2):
- **QR Code Cache Issue RESOLVED**: CDN had cached incorrect HTML response for `poster-qr-code.png`. Fixed by adding cache-busting parameter `?v=2.3.0` to the URL in email templates.

### Known Limitations:
- SEO is client-side only (React injects meta tags after page load)
- Server-side rendering (On-Demand Builders) attempted in Build74 but failed - see research doc

---

## 📁 KEY DOCUMENTATION LOCATIONS

```
/docs/
├── SOPs/
│   ├── PROJECT-STANDARDS.md    ← MUST READ FIRST
│   ├── BUILD-VALIDATION-SOP.md ← MUST READ BEFORE ANY BUILD
│   ├── DEPLOYMENT-SOP.md
│   └── TESTING-SOP.md
├── BUILDS/
│   ├── BUILD-HISTORY.md        ← Complete build timeline
│   ├── RELEASE-NOTES/          ← All past release notes
│   └── VALIDATION-REPORTS/     ← All validation reports
├── BUGS/
│   └── ACTIVE-BUGS.md
└── AI/
    └── CHAT-HANDOFF.md         ← This file
```

---

## 🔧 COMMON TASKS

### Adding/Editing Events:
1. Go to admin panel: `grantparkevents.com/admin.html`
2. Events stored in Netlify Blobs via `save-events.js`
3. Images go in `assets/events/`

### Email Campaigns:
1. Admin panel → Email Campaigns tab
2. Campaigns stored in Netlify Blobs via `save-campaigns.js`
3. Manual workflow: Create in admin → Copy HTML → Paste in MailerLite

### Creating a New Build:
1. **ALWAYS** read PROJECT-STANDARDS.md first
2. Follow Pre-Build Gate (6 steps) in BUILD-VALIDATION-SOP.md
3. Run validation scripts before delivery
4. User approval required before any code changes

---

## ⚠️ CRITICAL RULES

### Date Handling:
```javascript
// ✅ ALWAYS use this:
const parseLocalDate = (dateStr) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
};

// ❌ NEVER use:
new Date(dateString)  // Causes UTC conversion issues
```

### Version Management:
- Every package gets unique version number
- NEVER reuse version numbers
- Use `validate-increment.sh` before incrementing
- Use `update-version.sh` to update all files

### File Structure:
- Scripts in `/scripts/` (not root)
- Old release notes in `/docs/BUILDS/RELEASE-NOTES/`
- Only ONE release notes file in root for current build

---

## 🐛 RESOLVED ISSUES LOG

### QR Code Redirect (Build73.2)
**Problem:** `https://grantparkevents.com/assets/common/poster-qr-code.png` returned HTML instead of image.
**Root Cause:** Netlify CDN cached incorrect response with 1-year max-age.
**Solution:** Added cache-busting parameter `?v=2.3.0` to URL in `generate-email-html.js`

### On-Demand Builder Failed (Build74)
**Problem:** Attempted server-side rendering for SEO but builder never invoked.
**Root Cause:** On-Demand Builders are legacy. Netlify now recommends `durable` cache directive.
**Status:** Rolled back to Build73.1, research documented in BUILD74-ODB-RESEARCH.md
**Future Fix:** Use regular serverless functions with `Netlify-CDN-Cache-Control: durable` header

### Campaign Storage (Build57)
**Problem:** Netlify Blobs not working with Lambda v1 function format.
**Solution:** Migrated to Functions v2 format (ES modules with default export).

---

## 🔄 BUILD HISTORY SUMMARY

| Build | Date | Status | Key Changes |
|-------|------|--------|-------------|
| 73.2 | Feb 2 | ✅ CURRENT | QR code cache-busting fix |
| 73.1 | Feb 1 | ✅ Stable | Removed utility files, cleanup |
| 74.x | Feb 2 | ❌ Rolled Back | On-Demand Builder failed |
| 72 | Feb 1 | ✅ Stable | Self-hosted React, _redirects fix |
| 57 | Jan 30 | ✅ Stable | Campaign storage fixed |

---

## 📞 OWNER PREFERENCES

**Peter (Owner) Requirements:**
1. Zero tolerance for production issues
2. Every package needs unique version number
3. Comprehensive documentation required
4. Approval required before code changes
5. Test thoroughly before delivery
6. All times are Central US (Chicago) - no timezone conversions

---

## 🚨 IF SOMETHING BREAKS

1. **Check Netlify deploy logs** for function errors
2. **Check browser console** for JavaScript errors
3. **Verify file exists** at expected path
4. **Check for CDN caching** - may need cache-busting parameter
5. **Rollback option:** User has Build73.1 locally as stable fallback

---

## 📝 HANDOFF CHECKLIST

When starting a new session, verify:
- [ ] Read PROJECT-STANDARDS.md
- [ ] Read BUILD-VALIDATION-SOP.md
- [ ] Check current version in version.js
- [ ] Review recent entries in BUILD-HISTORY.md
- [ ] Ask user what they want to accomplish

---

*This document should be updated with each significant change to maintain continuity across chat sessions.*
