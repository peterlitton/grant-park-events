# BUILD6 STAGING SUMMARY
## Grant Park Events v2.3.1-Build6

**Deployment Checklist**

---

## PRE-DEPLOYMENT

### 1. Package Verification
- [ ] Downloaded gpe20-v2.3.1-Build6.zip
- [ ] Unzipped successfully
- [ ] All files present

### 2. Version Verification
- [ ] version.js shows v2.3.1-Build6
- [ ] index.html shows Build6 (2 locations)
- [ ] admin.html shows Build6 (2 locations)
- [ ] sw.js shows build6 cache

### 3. Documentation Review
- [ ] BUILD6-RELEASE-NOTES.md reviewed
- [ ] BUILD6-VALIDATION-REPORT.md reviewed
- [ ] Build number change rationale understood

---

## DEPLOYMENT

### 4. Netlify Upload
- [ ] Drag build folder to Netlify
- [ ] Wait for deployment (30 seconds)
- [ ] Deployment successful

---

## POST-DEPLOYMENT TESTING

### 5. Version Display
- [ ] Public site footer shows "v2.3.1-Build6"
- [ ] Admin header shows "v2.3.1-Build6"
- [ ] Admin footer shows "v2.3.1-Build6"

### 6. Image Field Functionality
- [ ] Admin → Email Campaigns → Create
- [ ] Hero Image field shows "(filename only - directory automatic)"
- [ ] Directory prefix shows in gray box: "/.netlify/functions/images/"
- [ ] Enter filename only (e.g., "navy-pier.jpg")
- [ ] Preview loads correctly

### 7. Build Metrics Functionality
- [ ] Admin → Build Metrics tab
- [ ] Shows loading state briefly
- [ ] Displays current data from CSV
- [ ] Total days/hours up to date
- [ ] Chart shows all historical data
- [ ] No errors in console

### 8. PWA Features (from Build5)
- [ ] Install prompt appears (if not installed)
- [ ] Icons display correctly
- [ ] Service worker active
- [ ] Offline mode works
- [ ] Chicago star icon shows when bookmarked

### 9. Core Functionality
- [ ] Homepage loads
- [ ] Events display
- [ ] Calendar view works
- [ ] Event details open
- [ ] Admin panel accessible
- [ ] Event creation works
- [ ] Email campaigns work
- [ ] Images tab works

### 10. Mobile Testing
- [ ] Test on iPhone
- [ ] Test on Android
- [ ] Version displays correctly
- [ ] All features work

---

## ROLLBACK PLAN

If issues found:
1. Note specific issue
2. Download previous Build5 package
3. Deploy Build5
4. Report issue for fix in Build7

**Previous Stable:** v2.3.1-Build5

---

## COMPLETION

- [ ] All tests passed
- [ ] No errors in console
- [ ] Performance acceptable
- [ ] Build6 confirmed stable

**Signed off by:** _________________  
**Date:** _________________  
**Time:** _________________

---

## NOTES

Space for deployment notes, observations, or issues:

_______________________________________

_______________________________________

_______________________________________

_______________________________________

---

**Build:** v2.3.1-Build6  
**Deployment Time:** ~2 minutes  
**Risk Level:** LOW  
**Breaking Changes:** None
