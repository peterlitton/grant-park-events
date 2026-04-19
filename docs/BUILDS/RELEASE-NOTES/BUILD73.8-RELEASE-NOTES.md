# BUILD73.8 RELEASE NOTES

**Version:** v2.3.0-Build73.8  
**Build Date:** February 2, 2026  
**Type:** Bug Fix  
**Risk Level:** LOW (Visual corrections only)

---

## 📋 OVERVIEW

Build73.8 fixes visual issues from Build73.7: removes double circle effect, adjusts icon sizing for proper baseline/topline alignment, and improves mobile display.

---

## 🐛 BUGS FIXED

### 1. Double Circle Issue ✅ FIXED
**Problem:** Button wrapper was adding a second border around the icon's circle  
**Solution:** Removed wrapper styling, applied hover states directly to icon's SVG circle

### 2. Card View Size Issue ✅ FIXED
**Problem:** Icon too large, breaking baseline/topline alignment with title text  
**Solution:** Reduced card icon size from 20px to 18px for proper text alignment

### 3. Mobile Display Issues ✅ FIXED  
**Problem:** Mobile layout was "a mess"  
**Solution:** Removed absolute positioning on mobile, icon now inline with proper sizing

---

## ✨ WHAT CHANGED

### ShareIcon Component
- Now accepts `isHovered` prop for state-aware rendering
- Hover states applied directly to circle (fill and stroke)
- Drop shadow applied to SVG via filter
- Single circle only (no wrapper border)
- Smooth transitions on hover

### ShareButton Component
- Removed all wrapper styling (bg, border, padding)
- Tracks hover state, passes to ShareIcon
- Icon sizes adjusted by placement:
  - **Card**: 18px (proper baseline alignment)
  - **Modal**: 20px (matches larger text)
  - **Hero**: 24px (matches largest text)
- Mobile: Inline positioning like desktop (removed absolute)
- Clean button with no visual styling

### Visual Result
- ✅ Single circle with blue icon
- ✅ Grey border, blue on hover
- ✅ Light blue fill on hover
- ✅ Drop shadow maintained
- ✅ Proper text alignment all locations
- ✅ Clean mobile display

---

## 🎯 FILES MODIFIED

### index.html
- Updated ShareIcon: Added isHovered prop, hover styling on circle
- Updated ShareButton: Removed wrapper styling, adjusted sizes, added hover tracking
- Updated version to v2.3.0-Build73.8

### version.js
- Updated BUILD_VERSION to 'v2.3.0-Build73.8'
- Updated BUILD_DATE to '2026-02-02'
- Updated BUILD_NOTES
- Added v2.3.0-Build73.8 to VERSION_HISTORY

**Total Changes**: 2 files modified

---

## ✅ VALIDATION COMPLETED

### Component Verification
- ✅ ShareIcon: Single circle, hover-aware
- ✅ ShareButton: Clean wrapper, proper sizes
- ✅ 3 placements present

### Version Consistency
- ✅ version.js: v2.3.0-Build73.8
- ✅ index.html: 2 instances

---

## 🧪 TESTING REQUIREMENTS

### Priority Tests
1. **Single Circle Check**: Verify no double border on icon
2. **Card View**: Icon aligns with title baseline/topline (18px)
3. **Modal View**: Icon proper size (20px) - should still be good
4. **Hero/Dedicated Page**: No changes needed (was approved)
5. **Mobile**: Icon displays inline, not absolute positioned
6. **Hover State**: Circle changes to light blue bg + blue border

### Functionality Tests
7. All share methods work (email, Facebook, X, copy, native)
8. GA4 tracking fires
9. Responsive behavior at all screen sizes

---

## 🔄 ROLLBACK PROCEDURE

**Option 1**: Feature flag `ENABLE_SHARE = false`  
**Option 2**: Deploy v2.3.0-Build73.5 (before styling issues)

---

## 📝 NOTES

**Issue Root Cause**: Build73.6/73.7 added button wrapper styling that created a second visual border around the icon's existing circle, causing the double-circle effect.

**Solution**: Moved all styling back to the icon itself - hover states change the SVG circle properties directly, no wrapper styling needed.

**Icon Sizing**: Reduced card size to 18px based on production feedback that 20px was too large for the text height.

**Mobile Fix**: Removed conditional absolute positioning - icon now behaves consistently across all screen sizes with inline positioning.

---

**Build Status**: VALIDATED AND READY  
**Next Build**: TBD
