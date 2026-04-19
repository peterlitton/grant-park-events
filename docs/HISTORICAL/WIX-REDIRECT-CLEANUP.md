# WIX REDIRECT CLEANUP INSTRUCTIONS

**Date:** February 1, 2026  
**Build:** v2.3.0-Build70.3  
**Purpose:** Clean up old 2025 redirects in Wix

---

## 🎯 OVERVIEW

Your Wix site currently has 128 redirects pointing to 2025 event URLs that no longer exist on your new Netlify site. These need to be replaced with a simple catch-all redirect.

---

## 📋 STEP-BY-STEP INSTRUCTIONS

### **STEP 1: Access Wix URL Redirect Manager**

1. Log into your Wix account
2. Select your Grant Park Events site
3. Go to: **Settings** → **SEO Tools** → **URL Redirect Manager**

---

### **STEP 2: Delete All Existing Redirects**

**Current redirects (128 total):**
- All redirect to 2025 event URLs
- These URLs don't exist on new site
- Result in 404 errors for users

**How to delete:**
1. In URL Redirect Manager, you should see 128 redirects
2. Select all redirects (checkbox at top)
3. Click "Delete" or trash icon
4. Confirm deletion

**Why:** These redirects are broken and no longer useful

---

### **STEP 3: Add New Catch-All Redirect**

**Add ONE new redirect:**

```
Old URL:  /*
New URL:  https://www.grantparkevents.com/
Type:     301 (Permanent)
```

**Settings in Wix:**
- **Old URL:** `/*` (asterisk means "any path")
- **New URL:** `https://www.grantparkevents.com/`
- **Redirect Type:** 301 Permanent Redirect
- **Status:** Active

**What this does:**
- ANY old Wix URL → New site homepage
- Simple, clean, effective
- Users land on current 2026 events

---

### **STEP 4: Save and Publish**

1. Click "Save" or "Add Redirect"
2. Publish changes to your Wix site
3. Wait 5-10 minutes for changes to propagate

---

## ✅ VERIFICATION

### **Test the Redirect:**

**Try these old URLs** (they should all redirect to homepage):

1. `https://www.grantparkevents.com/event-details/grant-park-music-festival-xyz-2025`
2. `https://www.grantparkevents.com/events/chicago-blues-festival-1-4`
3. `https://www.grantparkevents.com/published-events`

**Expected result:**
- Browser redirects to: `https://www.grantparkevents.com/`
- Homepage loads with 2026 events
- No 404 error

---

## 🔍 TROUBLESHOOTING

### **If redirect doesn't work:**

**Check:**
1. Did you save and publish in Wix?
2. Is redirect status "Active"?
3. Is redirect type "301"?
4. Did you wait 5-10 minutes?

**Try:**
- Clear browser cache
- Try in incognito/private window
- Wait 30 minutes and try again

### **If you can't delete all redirects:**

**Option A:** Delete in batches
- Select 10-20 at a time
- Delete, save, repeat

**Option B:** Leave them
- Add catch-all anyway
- Wix will use catch-all for unmatched URLs
- Old redirects become harmless

---

## 📊 WHAT HAPPENS NEXT

### **User Journey (After Cleanup):**

**Old bookmark or Google result:**
```
User has: grantparkevents.com/event-details/xyz-2025
  ↓
Clicks link
  ↓
Wix: "This URL doesn't exist, use catch-all redirect"
  ↓
Redirect: 301 → grantparkevents.com/
  ↓
User lands on: Homepage with 2026 events ✅
```

### **Google Search Results:**

**Week 1:**
- Google sees 301 redirects
- Begins updating search results
- Old URLs slowly replaced with new

**Month 1:**
- Most old 2025 URLs removed from Google
- New 2026 event pages indexed
- Clean search results

---

## 🎯 ADDITIONAL STEPS (OPTIONAL)

### **In Google Search Console (Old Wix Property):**

**If you still have access:**

1. **Request URL Removals:**
   - Go to: Removals section
   - Add: Old 2025 event URLs showing in search
   - Speeds up removal from Google

2. **Use Change of Address:**
   - Settings → Change of Address
   - Point to: New Netlify site
   - Tells Google about migration

---

## ✅ COMPLETION CHECKLIST

After completing these steps:

- [ ] Deleted all 128 old redirects in Wix
- [ ] Added new catch-all redirect (`/*` → homepage)
- [ ] Saved and published in Wix
- [ ] Tested 2-3 old URLs (they redirect to homepage)
- [ ] Deployed Build70.3 to Netlify (Netlify-side redirects)
- [ ] Verified no 404 errors

---

## 📞 NEED HELP?

If you encounter issues:

1. Check Wix documentation on URL redirects
2. Contact Wix support
3. Come back to this chat for assistance

---

**Once completed, your migration from Wix 2025 to Netlify 2026 will be complete!** 🎉

---

END OF INSTRUCTIONS
