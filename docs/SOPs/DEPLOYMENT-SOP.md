# Deployment SOP

**Standard Operating Procedure for Deploying Grant Park Events**

**Last Updated:** January 29, 2026  
**Current Platform:** Netlify  
**Domain:** grantparkevents.com

---

## 📋 PRE-DEPLOYMENT CHECKLIST

### **1. Build Verification**
- [ ] Build number updated in all files (admin.html, index.html, reset-storage.html)
- [ ] All version numbers consistent
- [ ] BUILD-SOP-VERIFICATION.md checks passed (parentheses balanced)
- [ ] No syntax errors
- [ ] Release notes created
- [ ] Documentation updated

### **2. Testing Completed**
- [ ] Local testing done (if applicable)
- [ ] All features tested
- [ ] Bug fixes verified
- [ ] No regression issues
- [ ] Cross-browser testing (if UI changes)

### **3. Package Preparation**
- [ ] Complete deployment package created
- [ ] ZIP file named: `gpe20-deploy-v2.3.0-buildXX-DEPLOY.zip`
- [ ] Files at root level (not in subfolder)
- [ ] All assets included
- [ ] Documentation included in `/docs/` folder

---

## 🚀 DEPLOYMENT STEPS

### **Step 1: Access Netlify**
1. Go to https://app.netlify.com
2. Log in with credentials
3. Select "Grant Park Events" site

### **Step 2: Prepare Package**
1. Download deployment ZIP file
2. **IMPORTANT:** Extract ZIP first
3. Verify `index.html` is visible at root level
4. Do NOT upload the ZIP directly (causes folder nesting issue)

### **Step 3: Deploy**

**Option A: Drag and Drop (Recommended)**
1. Go to Netlify site → "Deploys" tab
2. Drag ALL FILES from extracted folder to deploy area
3. **Do NOT drag the parent folder**
4. Drag individual files: index.html, admin.html, assets/, netlify/, etc.

**Option B: Manual Upload**
1. Click "Deploy manually"
2. Select extracted folder contents
3. Upload all files

### **Step 4: Monitor Deployment**
1. Watch deployment progress in Netlify
2. Wait for "Published" status
3. Note deployment URL

---

## ✅ POST-DEPLOYMENT VERIFICATION

### **Immediate Checks (5 minutes):**

#### **1. Site Loads**
- [ ] Visit https://grantparkevents.com
- [ ] Homepage displays correctly
- [ ] No JavaScript errors in console
- [ ] Images load

#### **2. Navigation Works**
- [ ] Click logo → Returns to home
- [ ] Click "ABOUT" → About page loads
- [ ] Click "SIGNUP" → Signup page loads
- [ ] Navigate to dedicated event page
- [ ] Return to home from dedicated page
- [ ] Verify logo displays on all pages

#### **3. Core Features**
- [ ] Event cards display with images
- [ ] Click event → Modal opens
- [ ] Modal images display
- [ ] Dedicated event pages work
- [ ] Calendar displays correctly

#### **4. Admin Panel**
- [ ] Access /admin.html
- [ ] Admin loads without errors
- [ ] Version number displays correctly
- [ ] Can view events
- [ ] Can edit events (test in non-production if needed)

#### **5. Email Features**
- [ ] Popup appears after delay (if enabled)
- [ ] Popup displays correctly
- [ ] Email submission works
- [ ] Dedicated signup page works
- [ ] Verify submissions in EmailOctopus

---

## 🧪 COMPREHENSIVE TESTING (Optional - 15 minutes)

### **Navigation Testing:**
1. Test all navigation paths
2. Verify logo on every page
3. Test back/forward browser buttons
4. Check direct URL access to event pages

### **Email Popup Testing:**
1. Clear cookies
2. Wait for popup
3. Submit test email
4. Verify cookie set (no repeat popup)
5. Enable testing mode in admin
6. Verify popup appears despite cookie

### **EmailOctopus Verification:**
1. Submit test email via popup
2. Submit test email via dedicated page
3. Check EmailOctopus for both entries
4. Verify OriginalSource field: "POPUP" or "DEDICATED"
5. Verify DateAdded field: YYYY-MM-DD format

---

## 🔄 DNS VERIFICATION (If Applicable)

### **When DNS Changes Made:**
1. Wait 24-48 hours for propagation
2. Use `nslookup grantparkevents.com`
3. Verify A records point to Netlify
4. Check SSL certificate status
5. Test both www and non-www versions

### **Current DNS Setup:**
- **Registrar:** Network Solutions
- **Nameservers:** Network Solutions defaults
- **Pointing to:** Netlify

---

## ⚠️ COMMON ISSUES & FIXES

### **Issue: Netlify Upload Error "Please drop a folder containing index.html"**
**Cause:** ZIP file uploaded directly or folder structure wrong  
**Fix:** Extract ZIP first, drag CONTENTS (not folder) to Netlify

### **Issue: Logo not displaying after deployment**
**Cause:** Path issues  
**Fix:** Verify logo uses absolute path `/assets/logo.png`

### **Issue: Images blank on event cards**
**Cause:** Image path conversion missing  
**Fix:** Verify absolute URL conversion in place (build22 fix)

### **Issue: Popup not appearing**
**Cause:** Multiple possibilities  
**Fix:** Check:
- Popup enabled in admin settings
- Cookie cleared or testing mode on
- Delay setting (default 10 seconds)
- Console for JavaScript errors

### **Issue: EmailOctopus fields not populating**
**Cause:** Field name mismatch or format issue  
**Fix:** Verify:
- Field names match exactly (OriginalSource, DateAdded)
- DateAdded format is YYYY-MM-DD
- Netlify function forwarding fields correctly

---

## 🔙 ROLLBACK PROCEDURE

### **If Issues Detected Post-Deployment:**

#### **Quick Rollback (Immediate):**
1. Go to Netlify → "Deploys" tab
2. Find previous stable deployment
3. Click "Publish deploy"
4. Site reverts to previous version immediately

#### **Previous Stable Versions:**
- build27 (current stable)
- build22 (navigation fixes)
- build20 (rich text + UI polish)

#### **After Rollback:**
1. Notify team of rollback
2. Document issue
3. Create bug log
4. Fix in new build
5. Re-test before deploying again

---

## 📝 DEPLOYMENT LOG

### **Template for Logging Deployments:**

```
Date: YYYY-MM-DD
Build: v2.3.0-buildXX
Deployed By: [Name]
Status: Success/Failed/Rolled Back
Issues: None / [Description]
Verification: Complete / Partial
Notes: [Any relevant notes]
```

### **Recent Deployments:**
*Update this section with each deployment*

**2026-01-29:** build27 deployed - Email popup Step 1 complete  
**2026-01-28:** build22 deployed - Navigation fixes stable  
**2026-01-28:** build20 deployed - Rich text + UI polish stable

---

## ✅ SUCCESS CRITERIA

**Deployment considered successful when:**
- ✅ Site loads without errors
- ✅ All pages accessible
- ✅ Navigation working (logo, links, back button)
- ✅ Images display (cards, modals, dedicated pages)
- ✅ Email popup working (if enabled)
- ✅ EmailOctopus integration working
- ✅ Admin panel accessible and functional
- ✅ No console errors
- ✅ Version number correct

---

## 🎯 BEST PRACTICES

1. **Always deploy from stable builds**
2. **Test locally before deploying** (when possible)
3. **Deploy during low-traffic periods** (if applicable)
4. **Keep previous stable version ready for rollback**
5. **Verify all features after deployment**
6. **Document any issues immediately**
7. **Update PROJECT-STATUS.md after successful deployment**

---

## 📞 TROUBLESHOOTING CONTACTS

**Platform Support:**
- Netlify Support: https://www.netlify.com/support/
- Network Solutions: Domain registrar

**Documentation:**
- Netlify Docs: https://docs.netlify.com
- EmailOctopus API: https://emailoctopus.com/api-documentation

---

*Follow this SOP for every deployment to ensure consistency and reliability.*
