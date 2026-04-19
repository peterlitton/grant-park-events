# Testing SOP

**Standard Operating Procedure for Testing Grant Park Events**

**Last Updated:** January 29, 2026

---

## 🎯 TESTING PHILOSOPHY

**Zero tolerance for production issues** means comprehensive testing before deployment.

### **Testing Levels:**
1. **Unit Testing** - Individual features work
2. **Integration Testing** - Features work together
3. **Regression Testing** - Old features still work
4. **User Acceptance Testing** - Meets requirements

---

## 📋 PRE-DEPLOYMENT TESTING CHECKLIST

### **CRITICAL - Test Before Every Deployment:**

#### **✅ Core Functionality**
- [ ] Homepage loads
- [ ] Event cards display with images
- [ ] Event modal opens and displays correctly
- [ ] Dedicated event pages work
- [ ] Navigation works (all links)
- [ ] Logo displays on all pages
- [ ] Admin panel accessible
- [ ] No console errors

#### **✅ Navigation Flow**
- [ ] Home → Event → Back to Home
- [ ] Home → About → Home
- [ ] Home → Signup → Home
- [ ] Event → About → Event
- [ ] Event → Signup → Event
- [ ] Direct URL to event page works

#### **✅ Images**
- [ ] Event card images display
- [ ] Modal images display
- [ ] Dedicated page images display
- [ ] Logo displays everywhere
- [ ] No broken image icons

#### **✅ Email Features** (if changed)
- [ ] Popup appears after delay
- [ ] Popup displays correctly
- [ ] Email submission works
- [ ] Success message displays
- [ ] Cookie prevents repeat popup
- [ ] Dedicated signup page works
- [ ] EmailOctopus receives submissions

---

## 🔍 DETAILED TESTING PROCEDURES

### **1. Homepage Testing**

**Steps:**
1. Load https://grantparkevents.com
2. Verify logo displays
3. Verify navigation menu visible
4. Scroll through event cards
5. Verify all images load
6. Check calendar view
7. Verify no console errors

**Pass Criteria:**
- All elements visible
- Images load
- No JavaScript errors
- Layout looks correct

---

### **2. Event Modal Testing**

**Steps:**
1. Click any event card
2. Verify modal opens
3. Check image displays
4. Verify event details present
5. Check formatting (bold, italic, lists)
6. Click X to close
7. Verify modal closes

**Pass Criteria:**
- Modal opens smoothly
- Image displays
- Text formatted correctly
- Close button works

---

### **3. Dedicated Page Testing**

**Steps:**
1. Click "View Details" on event modal
2. Verify dedicated page loads
3. Check URL structure
4. Verify image displays
5. Check all event details
6. Test navigation from dedicated page
7. Return to home

**Pass Criteria:**
- Page loads correctly
- Image displays
- Navigation works
- Can return to home

---

### **4. Navigation Testing**

**Test All Paths:**
```
Home → About → Home ✓
Home → Signup → Home ✓
Home → Event → Home ✓
Event → About → Event ✓
Event → Signup → Event ✓
Direct URL → Event Page ✓
Browser Back/Forward ✓
Logo Click from Any Page ✓
```

**Pass Criteria:**
- All paths work
- Logo always displays
- No broken links
- Back button works

---

### **5. Email Popup Testing**

**Basic Test:**
1. Clear cookies
2. Load site
3. Wait [delay] seconds (default 10)
4. Verify popup appears
5. Check popup styling
6. Enter email
7. Submit
8. Verify success message
9. Refresh page
10. Verify popup does NOT appear (cookie)

**Advanced Test:**
1. Admin → Enable "Testing Mode"
2. Refresh site
3. Verify popup appears despite cookie
4. Admin → Disable popup
5. Refresh site
6. Verify popup does NOT appear

**Pass Criteria:**
- Popup appears on schedule
- Cookie works
- Testing mode works
- Disable works
- Email submission works

---

### **6. EmailOctopus Integration Testing**

**Test Both Sources:**

**Popup Test:**
1. Submit email via popup
2. Go to EmailOctopus
3. Find contact
4. Verify OriginalSource = "POPUP"
5. Verify DateAdded = YYYY-MM-DD format

**Dedicated Page Test:**
1. Go to signup page
2. Submit email
3. Go to EmailOctopus
4. Find contact
5. Verify OriginalSource = "DEDICATED"
6. Verify DateAdded = YYYY-MM-DD format

**Pass Criteria:**
- Both sources work
- Fields populate correctly
- Date format correct

---

### **7. Admin Panel Testing**

**Basic Test:**
1. Access /admin.html
2. Verify version number correct
3. Check events list loads
4. Test popup settings
5. Verify no console errors

**Edit Test** (if safe to do):
1. Edit test event
2. Save changes
3. Verify changes persist
4. Check frontend reflects changes

**Pass Criteria:**
- Admin loads
- Version correct
- Functions work
- No errors

---

### **8. Cross-Browser Testing** (when UI changes)

**Test in:**
- [ ] Chrome (desktop)
- [ ] Safari (desktop)
- [ ] Firefox (desktop)
- [ ] Chrome (mobile)
- [ ] Safari (iOS)

**Quick Test:**
- Load homepage
- Click one event
- Test navigation
- Submit email (if safe)

**Pass Criteria:**
- Works in all browsers
- No layout issues
- Features functional

---

### **9. Mobile Testing** (when applicable)

**Test on Real Device:**
- [ ] iPhone
- [ ] Android

**Or Use Browser DevTools:**
- [ ] iPhone viewport
- [ ] Android viewport

**Mobile-Specific Tests:**
- Touch interactions work
- Popup displays correctly
- Navigation works
- Images load
- Text readable

---

## 🐛 REGRESSION TESTING

**After Bug Fixes, Verify:**

### **Build15-20 Fixes:**
- [ ] Rich text editor works (bold, italic, lists)
- [ ] Paste filter strips formatting
- [ ] Lists display correctly
- [ ] Modal stays open when clicked
- [ ] Page scroll locks with modal
- [ ] Admin snippets don't show HTML

### **Build21-22 Fixes:**
- [ ] Logo displays on all pages
- [ ] Event card images display
- [ ] Navigation works from dedicated pages

### **Build23-27 Fixes:**
- [ ] Email popup displays
- [ ] Cookie management works
- [ ] Star displays at top
- [ ] Headline centered
- [ ] Manual close only
- [ ] EmailOctopus fields populate

---

## ✅ BUILD VERIFICATION (Every Build)

**Use BUILD-SOP-VERIFICATION.md:**
- [ ] Parentheses balanced
- [ ] No syntax errors
- [ ] Versions consistent
- [ ] File structure correct

---

## 📝 TEST REPORTING

### **If Tests Pass:**
Document in release notes:
```
✅ All tests passed
- Core functionality: ✓
- Navigation: ✓
- Images: ✓
- Email features: ✓
- Admin panel: ✓
```

### **If Tests Fail:**
1. Document the failure
2. Create bug log
3. DO NOT DEPLOY
4. Fix issue
5. Re-test
6. Only deploy when all tests pass

---

## 🎯 ACCEPTANCE CRITERIA

**Build is ready for deployment when:**
- ✅ All critical tests pass
- ✅ No console errors
- ✅ Regression tests pass
- ✅ User acceptance criteria met
- ✅ No known blocking bugs

---

*Follow this SOP to ensure quality and prevent production issues.*
