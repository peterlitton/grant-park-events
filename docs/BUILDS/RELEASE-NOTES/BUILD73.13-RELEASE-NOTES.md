# BUILD73.13 RELEASE NOTES

**Version:** v2.3.0-Build73.13  
**Build Date:** February 3, 2026  
**Type:** Visual Adjustment  
**Risk Level:** VERY LOW (CSS property change only)

---

## 📋 OVERVIEW

Build73.13 adjusts share icon vertical alignment from baseline to middle so the icon's center aligns with the X button's center.

---

## 🎨 CHANGE MADE

### Share Icon Vertical Alignment ✅

**Previous:** `verticalAlign: 'baseline'` - icon bottom sat on text baseline
**Current:** `verticalAlign: 'middle'` - icon center aligns with X button center

**Visual Result:**
- Share icon center now vertically centered with X button center
- Icon appears slightly higher than before (moved up from baseline)
- Horizontal alignment unchanged (right edge still at right-4)

---

## 🔧 TECHNICAL DETAILS

### ShareButton Component Change

**Single CSS property modified:**
```javascript
style: { 
  padding: '0',
  border: 'none',
  background: 'none',
  verticalAlign: 'middle',  // Changed from 'baseline'
  lineHeight: 0
}
```

**How vertical-align: middle works:**
- Aligns the vertical midpoint of the element with the baseline plus half the x-height of the parent
- Effectively centers the icon vertically relative to the line of text
- Works with inline and inline-block elements

---

## 🎯 FILES MODIFIED

### index.html
- Changed `verticalAlign: 'baseline'` to `verticalAlign: 'middle'` in ShareButton
- Updated version to v2.3.0-Build73.13

### version.js
- Updated BUILD_VERSION to 'v2.3.0-Build73.13'
- Updated BUILD_DATE to '2026-02-03'
- Updated BUILD_NOTES
- Added v2.3.0-Build73.13 to VERSION_HISTORY

**Total Changes**: 2 files modified (1 CSS property + version)

---

## ✅ VALIDATION COMPLETED

### Component Verification
- ✅ ShareButton: verticalAlign changed to 'middle'
- ✅ All other ShareButton properties unchanged
- ✅ 3 placements still present

### Version Consistency
- ✅ version.js: v2.3.0-Build73.13
- ✅ index.html: 2 instances

---

## 🧪 TESTING REQUIREMENTS

### Visual Verification
1. **Share icon vertical position** - center aligns with X button center
2. **Share icon horizontal position** - right edge still at right-4 (unchanged)
3. **Title text** - unaffected by change
4. **All 3 locations** - cards, modal, hero all show centered icon

### Functionality Tests
5. All share methods work (unchanged)
6. GA4 tracking fires (unchanged)
7. Hover states work (unchanged)

---

## 🔄 ROLLBACK PROCEDURE

**Option 1**: Feature flag `ENABLE_SHARE = false`  
**Option 2**: Deploy v2.3.0-Build73.12 (baseline alignment)  
**Option 3**: Deploy v2.3.0-Build73.8 (last stable before positioning iterations)

---

## 📝 NOTES

**Change Summary:**
- One CSS property: `verticalAlign: 'baseline'` → `verticalAlign: 'middle'`
- Visual effect: Share icon moves up slightly to center with X button
- Horizontal position: Unchanged (still at right-4)
- Functionality: Unchanged (all features work identically)

**Why middle alignment:**
- User requested share icon center align with X button center
- `vertical-align: middle` is the CSS property that achieves this
- Works consistently across all placements (cards, modal, hero)

---

**Build Status**: VALIDATED AND READY  
**Next Build**: TBD
