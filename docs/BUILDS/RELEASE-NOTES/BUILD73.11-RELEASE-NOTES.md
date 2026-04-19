# BUILD73.11 RELEASE NOTES

**Version:** v2.3.0-Build73.11  
**Build Date:** February 3, 2026  
**Type:** Bug Fix  
**Risk Level:** LOW (Mobile positioning only)

---

## 📋 OVERVIEW

Build73.11 fixes mobile positioning for modal and hero share icons - positioned absolutely below X button with proper right alignment.

---

## 🐛 BUG FIXED

### Mobile Positioning - Final Fix ✅

**Problem:** Share icon was inline with title, too far left, not aligned with X button

**Root Cause:** Inline positioning with padding wasn't pushing icon far enough right on mobile

**Solution:** 
- On mobile (<768px) for modal AND hero: Position absolute `top-16 right-4`
- Places share icon BELOW the X button (which is at `top-4 right-4`)
- Right edges align (both at `right-4`)
- No overlap with X button
- Card placement unchanged (inline, approved in Build73.8)

---

## 🔧 TECHNICAL DETAILS

### ShareButton Component Changes

Added mobile-specific absolute positioning logic:

```javascript
const isMobileWidth = typeof window !== 'undefined' && window.innerWidth < 768;
const needsAbsolute = isMobileWidth && (placement === 'modal' || placement === 'hero');

if (needsAbsolute) {
  return e('div', {
    className: 'absolute top-16 right-4 z-20'
  }, ...button...);
}

// Otherwise inline
return e('span', { className: 'inline-block ml-2', ...
```

**Positioning:**
- X button: `top-4 right-4` (16px from top, 16px from right)
- Share icon: `top-16 right-4` (64px from top, 16px from right)
- Result: Share icon 48px below X, same right alignment

---

## 🎯 FILES MODIFIED

### index.html
- Updated ShareButton: Added mobile absolute positioning for modal/hero
- Removed pr-12 padding (no longer needed)
- Updated version to v2.3.0-Build73.11

### version.js
- Updated BUILD_VERSION to 'v2.3.0-Build73.11'
- Updated BUILD_DATE to '2026-02-03'
- Updated BUILD_NOTES
- Added v2.3.0-Build73.11 to VERSION_HISTORY

**Total Changes**: 2 files modified

---

## ✅ VALIDATION COMPLETED

### Component Verification
- ✅ ShareButton: Mobile absolute positioning added
- ✅ Conditional rendering based on screen width + placement
- ✅ 3 placements present

### Version Consistency
- ✅ version.js: v2.3.0-Build73.11
- ✅ index.html: 2 instances

---

## 🧪 TESTING REQUIREMENTS

### Mobile Tests (<768px) - PRIORITY
1. **Modal**: Share icon positioned below X button, right-aligned
2. **Dedicated Page**: Share icon positioned below X button (below hero image), right-aligned
3. **Card**: Share icon inline with title (unchanged, approved)
4. **No Overlap**: Share icon does NOT overlap X button
5. **Right Alignment**: Share icon right edge aligns with X button right edge

### Desktop Tests (≥768px)
6. **All Locations**: Share icons inline with titles (unchanged)

### Functionality Tests
7. All share methods work
8. GA4 tracking fires
9. Hover states work

---

## 🔄 ROLLBACK PROCEDURE

**Option 1**: Feature flag `ENABLE_SHARE = false`  
**Option 2**: Deploy v2.3.0-Build73.8 (last stable before mobile positioning attempts)

---

## 📝 NOTES

**Final Positioning Solution:**
- Mobile modal/hero: Absolute `top-16 right-4` (below X button)
- Desktop all: Inline with titles
- Mobile cards: Inline with title (approved)

**Why top-16:**
- X button at `top-4` (16px from top)
- X button height ~40px
- top-16 = 64px from top
- Result: Share icon starts 48px below X button top
- Provides visual separation and alignment

**Why right-4:**
- Matches X button `right-4` position
- Right edges aligned perfectly

---

**Build Status**: VALIDATED AND READY  
**Next Build**: TBD
