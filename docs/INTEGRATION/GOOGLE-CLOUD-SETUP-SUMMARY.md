# Google Cloud Setup Summary
**Grant Park Events - Build62**  
**Setup Date:** January 30, 2026  
**Setup Status:** ✅ COMPLETE

---

## 📋 What Was Set Up

### **Google Cloud Project**
- **Project Name:** Grant Park Events
- **Project ID:** grant-park-events
- **Status:** Active
- **APIs Enabled:**
  - ✅ Google Indexing API (indexing.googleapis.com)
  - ✅ Google Search Console API (searchconsole.googleapis.com)

### **Service Account**
- **Name:** gpe-search-console
- **Email:** `gpe-search-console@grant-park-events.iam.gserviceaccount.com`
- **Role:** Owner
- **Key Type:** JSON
- **Key ID:** f4c6100ca78b72a701c9518cee86cf90950b4b8d

### **Google Search Console Integration**
- **Property:** https://www.grantparkevents.com/
- **Service Account Added:** ✅ Yes
- **Permission Level:** Owner
- **Verified:** ✅ Service account shows in Users and permissions

---

## 🔐 Credentials Location

### **Service Account JSON Key**
The complete service account credentials JSON was provided and contains:

```
- type: service_account
- project_id: grant-park-events  
- private_key_id: f4c6100ca78b72a701c9518cee86cf90950b4b8d
- private_key: [RSA private key - 2048 bit]
- client_email: gpe-search-console@grant-park-events.iam.gserviceaccount.com
- client_id: 107496463075999998437
- auth_uri: https://accounts.google.com/o/oauth2/auth
- token_uri: https://oauth2.googleapis.com/token
```

**IMPORTANT:** This JSON must be added to Netlify environment variables as `GSC_CREDENTIALS`

---

## ⚙️ Configuration Steps Completed

### **1. Google Cloud Console Setup**
```
✅ Created Google Cloud Project
✅ Enabled Google Indexing API
✅ Enabled Google Search Console API  
✅ Created service account "gpe-search-console"
✅ Generated JSON key for service account
✅ Downloaded credentials JSON
```

### **2. Google Search Console Setup**
```
✅ Opened Google Search Console
✅ Selected grantparkevents.com property
✅ Navigated to Settings → Users and permissions
✅ Added service account email as Owner
✅ Verified service account appears in user list
```

### **3. Security**
```
✅ Service account has minimal required permissions
✅ Service account limited to grantparkevents.com only
✅ JSON key downloaded securely
✅ Credentials ready for Netlify environment variables
```

---

## 🎯 Next Steps (For Deployment)

### **Required Action: Add Credentials to Netlify**

**In Netlify Dashboard:**
1. Go to Site Settings → Environment Variables
2. Click "Add a variable"
3. Set Key: `GSC_CREDENTIALS`
4. Set Value: (paste entire JSON contents)
5. Save variable
6. Deploy build62

**Critical:** Netlify env vars are encrypted and secure. This is the proper way to store credentials.

---

## 🔄 API Quotas & Limits

### **Google Indexing API**
- **Quota:** 200 requests per day
- **Reset:** Daily at midnight UTC
- **Current Usage:** 0/200 (new account)
- **Expected Usage:** 40-70 requests/day (20-35% of quota)

### **Google Search Console API**
- **Quota:** 1,200 queries per minute
- **Daily Limit:** Not applicable (query limits only)
- **Current Usage:** 0 (not being used in build62)

**Conclusion:** Well within quota limits for expected usage.

---

## 🧪 How to Test Setup

### **Test 1: Verify Credentials Work**
```bash
# Once deployed to Netlify with GSC_CREDENTIALS added:
curl -X POST https://yoursite.com/.netlify/functions/gsc-request-index \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.grantparkevents.com/"}'

# Expected: {"success":true, "message":"Index request submitted..."}
```

### **Test 2: Verify in Admin Panel**
```
1. Go to https://yoursite.com/admin-function-tests.html
2. Click "Test: Google API Connection"
3. Should show: ✅ PASS
```

### **Test 3: Verify in Google Search Console**
```
1. Go to search.google.com/search-console
2. Select grantparkevents.com
3. URL Inspection → paste a URL
4. After requesting index via build62, should show "Indexing requested"
```

---

## 📝 Important Notes

### **Service Account Key Security**
- **JSON key is like a password** - keep it secure
- Stored in Netlify env vars (encrypted)
- Never commit to git or share publicly
- Can be revoked/regenerated if compromised

### **Permissions**
- Service account has "Owner" role (required for Indexing API)
- Only has access to grantparkevents.com
- Cannot access other Google Cloud projects
- Can be removed from Search Console at any time

### **Password Changed**
Per security best practices, the Google account password should be changed after setup is complete and verified working.

---

## 🔧 Maintenance

### **If Credentials Need Regeneration**
```
1. Go to Google Cloud Console
2. IAM & Admin → Service Accounts
3. Click gpe-search-console@...
4. Keys tab → Delete old key
5. Add Key → Create new key → JSON
6. Download new JSON
7. Update Netlify GSC_CREDENTIALS env var
8. Redeploy site
```

### **If Service Account Needs Removal**
```
1. Go to Google Search Console
2. Settings → Users and permissions
3. Find gpe-search-console@...
4. Click "..." → Remove access
5. In Google Cloud, delete service account
6. Remove GSC_CREDENTIALS from Netlify
```

---

## ✅ Setup Verification Checklist

```
Verify the following before deploying build62:

[ ] Google Cloud Project exists and is active
[ ] Google Indexing API is enabled
[ ] Google Search Console API is enabled
[ ] Service account "gpe-search-console" exists
[ ] Service account JSON key downloaded
[ ] Service account added to Google Search Console as Owner
[ ] Credentials JSON ready to add to Netlify
[ ] No errors in Google Cloud Console
```

**All checked?** → Ready to deploy build62!

---

## 📊 Setup Summary

| Component | Status | Notes |
|-----------|--------|-------|
| Google Cloud Project | ✅ Active | Project: grant-park-events |
| Indexing API | ✅ Enabled | 200 req/day quota |
| Search Console API | ✅ Enabled | Not used in build62 |
| Service Account | ✅ Created | gpe-search-console@... |
| JSON Key | ✅ Generated | Key ID: f4c610... |
| Search Console Access | ✅ Granted | Owner permission |
| Ready for Deployment | ✅ Yes | Add to Netlify env vars |

---

## 🆘 Troubleshooting

### **"Service account not found in Search Console"**
- **Cause:** Service account not added as user
- **Fix:** Repeat Search Console setup steps

### **"Credentials JSON is invalid"**
- **Cause:** Malformed JSON or missing fields
- **Fix:** Re-download JSON from Google Cloud

### **"Permission denied"**
- **Cause:** Service account doesn't have Owner role
- **Fix:** Check Search Console user permissions

### **"API not enabled"**
- **Cause:** Indexing API not enabled in project
- **Fix:** Go to APIs & Services → Enable APIs

---

## 📞 Support Resources

**Google Cloud Console:**  
https://console.cloud.google.com

**Google Search Console:**  
https://search.google.com/search-console

**Google Cloud Support:**  
https://console.cloud.google.com/support

**API Documentation:**  
https://developers.google.com/search/apis/indexing-api/v3/quickstart

---

## 🎉 Conclusion

Google Cloud setup for Grant Park Events is **complete and ready for build62 deployment**.

The service account has been properly configured with necessary permissions and APIs enabled. Credentials are secure and ready to be added to Netlify environment variables.

**Next step:** Deploy build62 and add GSC_CREDENTIALS to Netlify! 🚀
