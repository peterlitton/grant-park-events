# REGRESSION TEST CHECKLIST - v2.3.0-build16

**Test Date:** __________  
**Tester:** __________  
**Environment:** Production / Staging  

---

## ✅ PRE-DEPLOYMENT VERIFICATION

- [ ] Package extracted successfully
- [ ] No nested builds found
- [ ] Version shows v2.3.0-build16 in files
- [ ] File sizes reasonable (admin ~76KB, index ~73KB)

---

## 🔧 ISSUE 1: BULLETS AND NUMBERING

**Test: Rich text formatting - Lists**

1. [ ] Open Admin panel
2. [ ] Click "Add New Event"
3. [ ] In Description field:
   - [ ] Type some text
   - [ ] Select the text
   - [ ] Click "• List" button
   - [ ] **VERIFY:** Text becomes bullet list ✅
   
4. [ ] Type more text
   - [ ] Select the text
   - [ ] Click "1. List" button
   - [ ] **VERIFY:** Text becomes numbered list ✅

5. [ ] Repeat for Featuring field:
   - [ ] Bullet list works ✅
   - [ ] Numbered list works ✅

6. [ ] Repeat for Program field:
   - [ ] Bullet list works ✅
   - [ ] Numbered list works ✅

**RESULT:** ✅ PASS / ❌ FAIL

---

## 🔧 ISSUE 2: IMAGE URL RELATIVE PATHS

**Test: Image URL field accepts both URLs and relative paths**

1. [ ] In Add Event modal, Image URL field
2. [ ] Enter: `assets/events/test.jpg`
   - [ ] **VERIFY:** No validation error ✅
   - [ ] **VERIFY:** Field accepts value ✅

3. [ ] Clear field
4. [ ] Enter: `https://example.com/image.jpg`
   - [ ] **VERIFY:** Field accepts value ✅

5. [ ] Open existing event with relative path image
   - [ ] **VERIFY:** Image displays correctly ✅
   - [ ] **VERIFY:** Can save without changing image ✅

**RESULT:** ✅ PASS / ❌ FAIL

---

## 🔧 ISSUE 3: MODAL STAYS OPEN

**Test: Modal doesn't close when clicking outside**

1. [ ] Open "Add New Event" modal
2. [ ] Type some text in Title field
3. [ ] Click on dark backdrop area (outside modal)
   - [ ] **VERIFY:** Modal STAYS OPEN ✅
   - [ ] **VERIFY:** Text is still there ✅

4. [ ] Move cursor completely off modal window
   - [ ] **VERIFY:** Modal STAYS OPEN ✅

5. [ ] Click "Cancel" button
   - [ ] **VERIFY:** Modal closes ✅

6. [ ] Open modal again, type text
7. [ ] Click "Save Event" button
   - [ ] **VERIFY:** Modal closes ✅
   - [ ] **VERIFY:** Event saved ✅

**RESULT:** ✅ PASS / ❌ FAIL

---

## 🔧 ISSUE 4: PAGE SCROLL LOCK

**Test: Page doesn't scroll when modal is open**

1. [ ] Ensure page has scrollable content (add events if needed)
2. [ ] Open "Add New Event" modal
3. [ ] Use mouse wheel to scroll
   - [ ] **VERIFY:** Page behind modal does NOT scroll ✅
   - [ ] **VERIFY:** Modal content scrolls if applicable ✅

4. [ ] Close modal
5. [ ] Use mouse wheel to scroll
   - [ ] **VERIFY:** Page scrolls normally ✅

**RESULT:** ✅ PASS / ❌ FAIL

---

## 🔧 ISSUE 5 & 6: VERSION DISPLAY

**Test: Version consistency across pages**

1. [ ] Open Index page (homepage)
2. [ ] Scroll to footer
   - [ ] **VERIFY:** Shows "Release: v2.3.0-build16" ✅
   - [ ] Record exact text: ____________________

3. [ ] Open Admin panel
4. [ ] Check header area
   - [ ] **VERIFY:** Shows "Release: v2.3.0-build16" ✅
   - [ ] Record exact text: ____________________

5. [ ] Scroll to footer in Admin
   - [ ] **VERIFY:** Shows "Release: v2.3.0-build16" ✅
   - [ ] Record exact text: ____________________

6. [ ] **VERIFY:** All three match exactly ✅

**RESULT:** ✅ PASS / ❌ FAIL

---

## 📋 FULL RICH TEXT EDITOR TEST

**Test: All formatting options work**

1. [ ] Open Add Event modal
2. [ ] In Description field:
   - [ ] Type text, select it, click **B** → Bold works ✅
   - [ ] Type text, select it, click *I* → Italic works ✅
   - [ ] Type text, select it, click **B** then *I* → Bold italic works ✅
   - [ ] Type multiple lines, select, click • List → Bullets work ✅
   - [ ] Type multiple lines, select, click 1. List → Numbers work ✅

3. [ ] Copy formatted text from Microsoft Word:
   - [ ] Bold text → **VERIFY:** Stays bold ✅
   - [ ] Italic text → **VERIFY:** Stays italic ✅
   - [ ] Bullet list → **VERIFY:** Stays bulleted ✅
   - [ ] Numbered list → **VERIFY:** Stays numbered ✅

4. [ ] Repeat for Featuring field ✅
5. [ ] Repeat for Program field ✅

**RESULT:** ✅ PASS / ❌ FAIL

---

## 📋 BASIC FUNCTIONALITY REGRESSION

**Test: Core features still work**

**Add Event:**
- [ ] Click "Add New Event"
- [ ] Fill all required fields
- [ ] Click "Save Event"
- [ ] **VERIFY:** Event appears in list ✅
- [ ] **VERIFY:** Event displays on index page ✅

**Edit Event:**
- [ ] Click edit button on existing event
- [ ] Change title
- [ ] Change description
- [ ] Click "Save Changes"
- [ ] **VERIFY:** Changes saved ✅
- [ ] **VERIFY:** Changes show on index page ✅

**Delete Event:**
- [ ] Click delete button
- [ ] Confirm deletion
- [ ] **VERIFY:** Event removed from list ✅
- [ ] **VERIFY:** Event removed from index page ✅

**Image Upload:**
- [ ] Upload image file (JPG/PNG)
- [ ] **VERIFY:** Preview shows ✅
- [ ] Save event
- [ ] **VERIFY:** Image displays on index ✅

**Image URL:**
- [ ] Enter image URL: `https://picsum.photos/800/600`
- [ ] **VERIFY:** Preview shows ✅
- [ ] Save event
- [ ] **VERIFY:** Image displays on index ✅

**Image Relative Path:**
- [ ] Enter: `assets/events/image.jpg` (if file exists)
- [ ] **VERIFY:** Preview shows ✅
- [ ] Save event
- [ ] **VERIFY:** Image displays on index ✅

**RESULT:** ✅ PASS / ❌ FAIL

---

## 📋 BROWSER TESTING

**Test in multiple browsers:**

**Chrome:**
- [ ] All features work ✅
- [ ] Rich text editor works ✅
- [ ] Modal behavior correct ✅

**Firefox:**
- [ ] All features work ✅
- [ ] Rich text editor works ✅
- [ ] Modal behavior correct ✅

**Safari (if available):**
- [ ] All features work ✅
- [ ] Rich text editor works ✅
- [ ] Modal behavior correct ✅

**Edge:**
- [ ] All features work ✅
- [ ] Rich text editor works ✅
- [ ] Modal behavior correct ✅

**RESULT:** ✅ PASS / ❌ FAIL

---

## 📋 MOBILE TESTING (if applicable)

**Test on mobile device or responsive mode:**

- [ ] Admin panel loads ✅
- [ ] Can add event ✅
- [ ] Rich text editor works ✅
- [ ] Modal behavior correct ✅
- [ ] Version displays correctly ✅

**RESULT:** ✅ PASS / ❌ FAIL

---

## ✅ FINAL SIGN-OFF

**Critical Issues Fixed:**
- [ ] Issue 1: Bullets/numbering work
- [ ] Issue 2: Image URL accepts relative paths
- [ ] Issue 3: Modal doesn't close on outside click
- [ ] Issue 4: Page doesn't scroll behind modal
- [ ] Issue 5: Admin version correct
- [ ] Issue 6: Versions match across pages

**Regressions Found:** (list any)
- ___________________________________________
- ___________________________________________

**Overall Result:** ✅ PASS / ❌ FAIL

**Ready for Production:** YES / NO

**Tested By:** ____________________  
**Date:** ____________________  
**Signature:** ____________________

---

## 📝 NOTES

(Add any observations, issues, or recommendations)

___________________________________________
___________________________________________
___________________________________________

