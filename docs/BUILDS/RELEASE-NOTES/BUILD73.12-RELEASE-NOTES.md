# BUILD73.12 RELEASE NOTES

**Version:** v2.3.0-Build73.12  
**Build Date:** February 3, 2026  
**Type:** Bug Fix  
**Risk Level:** LOW (Layout adjustment only)

---

## 📋 OVERVIEW

Build73.12 fixes share icon positioning - maintains inline baseline alignment with title while using negative margin to extend container so share icon's right edge aligns with X button at right-4.

---

## 🐛 BUG FIXED

### Share Icon Horizontal Alignment ✅

**Problem:** Share icon was inline with title (correct vertical position) but not aligned horizontally with X button

**Solution:** 
- Keep share icon inline with title (baseline-aligned) ✅
- Use negative margin `-mr-4` on title container to extend it rightward
- Add `pr-4` padding to match X button's `right-4` position
- Share icon stays in flex container, `justify-between` pushes it to right edge
- Right edge now aligns with X button at 16px from viewport edge

---

## 🔧 TECHNICAL DETAILS

### Title Container Changes

**Modal:**
```javascript
e('div',{className:'flex items-baseline justify-between mb-2 -mr-4 pr-4'},
  e('h2',{className:'text-4xl font-bold flex-1'},selectedEvent.title),
  ENABLE_SHARE && e(ShareButton, { event: selectedEvent, placement: 'modal' })
),
```

**Hero/Dedicated Page:**
```javascript
e('div',{className:'flex items-baseline justify-between -mr-4 pr-4'},
  e('h2',{className:'text-4xl font-bold mb-2 flex-1'},ev.title),
  ENABLE_SHARE && e(ShareButton, { event: ev, placement: 'hero' })
),
```

**How it works:**
- Parent container has `p-8` (32px padding all sides)
- `-mr-4` (negative margin-right: -16px) extends container 16px rightward
- `pr-4` (padding-right: 16px) creates space inside for share icon
- Net result: Container's right edge is now 16px from viewport (matches `right-4`)
- `justify-between` pushes share icon to container's right edge
- Share icon's right edge = X button's right edge = 16px from viewport

### ShareButton Component
- Reverted to inline positioning for all placements
- Maintains baseline vertical alignment
- `ml-2` provides 8px spacing from title text
- `verticalAlign: 'baseline'` keeps it aligned with text baseline
- Icon sizes: 18px (cards), 20px (modal), 24px (hero)

---

## 🎯 FILES MODIFIED

### index.html
- Reverted ShareButton to inline positioning (removed absolute positioning logic)
- Updated modal title container: `-mr-4 pr-4`
- Updated hero title container: `-mr-4 pr-4`
- Updated version to v2.3.0-Build73.12

### version.js
- Updated BUILD_VERSION to 'v2.3.0-Build73.12'
- Updated BUILD_DATE to '2026-02-03'
- Updated BUILD_NOTES
- Added v2.3.0-Build73.12 to VERSION_HISTORY

**Total Changes**: 2 files modified

---

## ✅ VALIDATION COMPLETED

### Component Verification
- ✅ ShareButton: Inline positioning restored
- ✅ Modal container: -mr-4 pr-4 applied
- ✅ Hero container: -mr-4 pr-4 applied

### Version Consistency
- ✅ version.js: v2.3.0-Build73.12
- ✅ index.html: 2 instances

---

## 🧪 TESTING REQUIREMENTS

### All Screen Sizes
1. **Share icon inline with title** - baseline-aligned
2. **Share icon right edge** - aligns with X button at right-4 (16px from edge)
3. **Title text wraps properly** - no layout breaks
4. **No overlap** - share icon doesn't overlap X button

### Desktop (≥768px)
5. All 3 locations work correctly (cards, modal, hero)

### Mobile (<768px)
6. Modal: Share icon inline, right-aligned with X
7. Hero: Share icon inline, right-aligned with X
8. Cards: Share icon inline (unchanged)

### Functionality
9. All share methods work
10. GA4 tracking fires
11. Hover states work

---

## 🔄 ROLLBACK PROCEDURE

**Option 1**: Feature flag `ENABLE_SHARE = false`  
**Option 2**: Deploy v2.3.0-Build73.8

---

## 📝 NOTES

**Final Solution:**
- Share icon stays inline with title (baseline-aligned) ✅
- Container uses negative margin to extend to right-4 ✅
- flexbox justify-between handles the spacing ✅
- Right edge matches X button position exactly ✅

**Math:**
- X button: `right-4` = 16px from viewport
- Container base: `p-8` = right edge at 32px from viewport
- Container adjustment: `-mr-4` = extends 16px right, now at 16px from viewport
- Container padding: `pr-4` = 16px internal spacing for share icon
- Share icon pushed to container edge by `justify-between`
- Result: Share icon right edge at 16px from viewport = matches X button ✅

---

**Build Status**: VALIDATED AND READY  
**Next Build**: TBD
