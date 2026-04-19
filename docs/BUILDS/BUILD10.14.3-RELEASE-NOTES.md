# BUILD10.14.3 - ROBUST URL PARSING FIX

**Build Date:** February 9, 2026  
**Build Type:** 🔧 PATCH - Incremental fix  
**Previous Build:** v2.3.1-Build10.14.2  
**New Version:** v2.3.1-Build10.14.3  

---

## 🎯 WHAT THIS FIXES

**Problem:** URLs in Monitor settings were being concatenated incorrectly

**User reported:**
- URLs displayed on separate lines in textarea
- But function only saw 2 "URLs" (each containing multiple space-separated URLs)
- Result: Checked only 2 URLs instead of 12

**Root cause:** URL parser only split on newlines (`\n`), not handling:
- Copy/paste formatting differences
- Mixed newlines and spaces
- Browser textarea behavior differences

---

## ✅ THE FIX

**Modified:** `netlify/functions/save-monitor-settings.js`

**Changed URL parsing logic:**

**Before:**
```javascript
const urlList = (urls || '')
  .split('\n')              // Only split on newlines
  .map(url => url.trim())
  .filter(url => url.length > 0);
```

**After:**
```javascript
const urlList = (urls || '')
  .split(/[\s,]+/)          // Split on ANY whitespace OR commas
  .map(url => url.trim())
  .filter(url => {
    if (url.length === 0) return false;
    // Validate it's actually a URL
    return url.startsWith('http://') || url.startsWith('https://');
  });
```

---

## 🎯 WHAT IT NOW HANDLES

The parser now correctly handles URLs separated by:
- ✅ Newlines (pressing Enter)
- ✅ Spaces
- ✅ Tabs
- ✅ Commas
- ✅ Any combination of the above

**And validates each one is actually a URL (starts with http:// or https://)**

---

## 📋 TESTING

**After deploying:**

1. **Go to admin panel → Monitor tab**
2. **Paste your 12 URLs** (any format works now)
3. **Click "💾 Save Settings"**
4. **Go to:** `https://www.grantparkevents.com/.netlify/functions/get-monitor-settings`
5. **Verify:** Should show 12 separate URLs in the `urls` array

**Expected result:**
```json
{
  "success": true,
  "settings": {
    "urls": [
      "https://www.chicago.gov/city/en/depts/dca/supp_info/chicago_blues_festival.html",
      "https://www.chicago.gov/content/city/en/depts/dca/supp_info/millennium_park9.html",
      ... (12 total)
    ],
    "checkTime": "09:00",
    "email": "peter@peterlitton.com"
  }
}
```

---

## 📦 DEPLOYMENT STEPS

1. Download `gpe20-v2.3.1-Build10.14.3.zip`
2. Extract locally
3. Drag/drop to Netlify
4. Wait 2-3 minutes
5. Go to admin panel → Monitor tab
6. **RE-SAVE your settings** (important!)
7. Click "▶️ Run Check Now"
8. Verify all 12 URLs are checked

---

## ⚠️ IMPORTANT: RE-SAVE SETTINGS

**After deploying, you MUST re-save your monitor settings:**

1. Go to Monitor tab
2. Settings should still be visible in the form
3. Click "💾 Save Settings"
4. This will re-process the URLs with the new parser
5. The old corrupted data (2 concatenated "URLs") will be replaced with 12 clean URLs

---

## 📊 EXPECTED RESULTS

**Before (Build10.14.2):**
- urlsChecked: 2
- Monitor Status: 2 entries (each with multiple URLs concatenated)

**After (Build10.14.3 + re-save):**
- urlsChecked: 12
- Monitor Status: 12 separate entries (one per URL)
- Execution History: "Checked 12 URLs"

---

## FILES MODIFIED

1. **netlify/functions/save-monitor-settings.js** - Robust URL parsing
2. **version.js** - Updated to v2.3.1-Build10.14.3
3. **index.html** - Version reference
4. **sw.js** - Version reference
5. **admin.html** - Version reference

---

## VALIDATION

✅ Syntax validated  
✅ Handles newlines  
✅ Handles spaces  
✅ Handles commas  
✅ Validates URLs (must start with http:// or https://)  
✅ Filters empty strings  

---

**PRIORITY:** 🟡 MEDIUM - Deploy when convenient, then re-save settings

**RISK:** 🟢 LOW - Only changes URL parsing logic, no breaking changes

---

**After deploying: RE-SAVE your Monitor settings to reprocess the URLs correctly!**
