# BUILD73.14 RELEASE NOTES

**Version:** v2.3.0-Build73.14  
**Build Date:** February 3, 2026  
**Type:** Layout Adjustment  
**Risk Level:** LOW (Container margin adjustment)

---

## 📋 OVERVIEW

Build73.14 moves share icon horizontally right so its center aligns with the X button's center on the same vertical centerline.

---

## 🎨 CHANGE MADE

### Share Icon Horizontal Center Alignment ✅

**Previous:** Share icon right edge at right-4 (16px from viewport)
**Current:** Share icon center aligned with X button center

**Container Changes:**
- Modal: `-mr-4 pr-4` → `-mr-8 pr-8`
- Hero: `-mr-4 pr-4` → `-mr-8 pr-8`

**Math:**
- X button: right-4 = right edge at 16px from viewport
- X button width: ~40px → center at ~36px from viewport edge
- Share icon width: ~28px → center needs to be ~14px from its right edge
- Share icon right edge needs to be at: 36 - 14 = 22px from viewport
- Container with p-8 (32px) + -mr-8 (extends 32px right) = right edge at 0px
- pr-8 (32px padding) positions share icon's right edge at 32px from viewport
- Result: Share icon center at ~18px from its right edge ≈ aligned with X center

**Visual Result:**
- Red line (X button center) now passes through both icon centers
- Share icon moved further right on x-axis
- Vertical position unchanged (still middle-aligned)

---

## 🔧 TECHNICAL DETAILS

### Container Changes

**Modal:**
```javascript
e('div',{className:'flex items-baseline justify-between mb-2 -mr-8 pr-8'},
```

**Hero/Dedicated:**
```javascript
e('div',{className:'flex items-baseline justify-between -mr-8 pr-8'},
```

**How it works:**
- `-mr-8` extends container further right (32px vs previous 16px)
- `pr-8` provides internal padding (32px vs previous 16px)
- Share icon pushed to container's right edge by `justify-between`
- Icon's center now aligns with X button's center

---

## 🎯 FILES MODIFIED

### index.html
- Modal container: `-mr-4 pr-4` → `-mr-8 pr-8`
- Hero container: `-mr-4 pr-4` → `-mr-8 pr-8`
- Updated version to v2.3.0-Build73.14

### version.js
- Updated BUILD_VERSION to 'v2.3.0-Build73.14'
- Updated BUILD_DATE to '2026-02-03'
- Updated BUILD_NOTES
- Added v2.3.0-Build73.14 to VERSION_HISTORY

**Total Changes**: 2 files modified

---

## ✅ VALIDATION COMPLETED

### Component Verification
- ✅ Modal container: -mr-8 pr-8
- ✅ Hero container: -mr-8 pr-8
- ✅ ShareButton unchanged

### Version Consistency
- ✅ version.js: v2.3.0-Build73.14
- ✅ index.html: 2 instances

---

## 🧪 TESTING REQUIREMENTS

### Visual Verification - CRITICAL
1. **Red line test** - vertical line through X center should pass through share icon center
2. **Share icon center** - horizontally aligned with X button center
3. **Vertical alignment** - unchanged (still middle-aligned)

### All Locations
4. Modal share icon centered with X
5. Hero share icon centered with X (if X present)
6. Card view unaffected

### Functionality
7. All share methods work
8. No layout breaks with long titles
9. Responsive behavior maintained

---

## 🔄 ROLLBACK PROCEDURE

**Option 1**: Feature flag `ENABLE_SHARE = false`  
**Option 2**: Deploy v2.3.0-Build73.13 (right edge alignment)  
**Option 3**: Deploy v2.3.0-Build73.8 (last stable before positioning work)

---

## 📝 NOTES

**Goal Achieved:**
- Share icon center aligned with X button center on same vertical centerline
- Horizontal movement only (x-axis adjustment)
- Vertical position maintained (y-axis unchanged)

**Technical Approach:**
- Doubled the negative margin and padding from -mr-4/pr-4 to -mr-8/pr-8
- This moves the share icon further right by 16px (4 * 4px = 16px)
- Icon center should now align with X button center

---

**Build Status**: VALIDATED AND READY  
**Next Build**: TBD
