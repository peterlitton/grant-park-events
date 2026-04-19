# Console Logging Standard Operating Procedure (SOP)
## Grant Park Events - Established January 29, 2026

---

## 🎯 PURPOSE

Establish consistent, helpful console logging across all builds to:
- Enable quick debugging when issues are reported
- Track user actions and system behavior in real-time
- Catch errors before users report them
- Provide visibility into what's happening behind the scenes

---

## 📋 LOGGING CATEGORIES

All log messages MUST use a category prefix in square brackets:

### **[SIGNUP]** - Email Subscription Events
```javascript
console.log('[SIGNUP] User submitted signup form:', { email, source, timestamp });
console.log('[SIGNUP] ✅ Success - User subscribed via Page');
console.log('[SIGNUP] ❌ Error:', errorMessage);
```

**When to use:**
- User attempts to subscribe
- API request sent
- Success/failure response received

---

### **[API]** - External API Calls
```javascript
console.log('[API] Sending request to MailerLite:', { endpoint, method, payload });
console.log('[API] MailerLite response:', { status, statusText, data });
```

**When to use:**
- Making API calls to MailerLite, Google Analytics, etc.
- Receiving API responses
- API errors

---

### **[ADMIN]** - Admin Panel Actions
```javascript
console.log('[ADMIN] Event saved:', { eventId, title, action });
console.log('[ADMIN] Popup settings updated:', newSettings);
console.log('[ADMIN] Event deleted:', eventId);
```

**When to use:**
- Creating/updating/deleting events
- Changing settings
- Admin authentication
- Any admin-initiated action

---

### **[STORAGE]** - Blob Storage Operations
```javascript
console.log('[STORAGE] Saving to blob:', { key, dataSize });
console.log('[STORAGE] Retrieved from blob:', { key, found: true });
console.log('[STORAGE] Deleted blob:', key);
```

**When to use:**
- Reading from Netlify Blobs
- Writing to Netlify Blobs
- Deleting from Netlify Blobs
- Storage errors

---

### **[ERROR]** - Error Conditions
```javascript
console.log('[ERROR] Missing required fields:', { email: false, source: true });
console.log('[ERROR] Invalid email format:', email);
console.log('[ERROR] Function exception:', { message, stack });
```

**When to use:**
- Validation failures
- Caught exceptions
- Network errors
- Configuration errors
- Any error state

---

### **[DEBUG]** - Development/Debugging Info
```javascript
console.log('[DEBUG] Component rendered:', componentName);
console.log('[DEBUG] State updated:', newState);
console.log('[DEBUG] Environment check:', { hasApiKey, hasGroupId });
```

**When to use:**
- Development troubleshooting
- State changes (when debugging)
- Configuration verification
- Can be more verbose than production logs

---

## ✅ LOGGING BEST PRACTICES

### **1. Include Context**
**Bad:**
```javascript
console.log('Success');
```

**Good:**
```javascript
console.log('[SIGNUP] ✅ Success - User subscribed via Pop-Up');
```

---

### **2. Use Structured Data**
**Bad:**
```javascript
console.log('[API] Calling MailerLite with ' + email + ' and ' + source);
```

**Good:**
```javascript
console.log('[API] Calling MailerLite:', { email, source, timestamp });
```

---

### **3. Log Before and After Critical Operations**
```javascript
// Before
console.log('[API] Sending request to MailerLite:', payload);

// API call here

// After
console.log('[API] Response received:', { status, data });
```

---

### **4. Use Emojis for Quick Scanning**
```javascript
console.log('[SIGNUP] ✅ Success');
console.log('[SIGNUP] ❌ Error');
console.log('[DEBUG] 🔍 Checking condition');
console.log('[ADMIN] 💾 Saving data');
```

---

### **5. Include Timestamps for Long Operations**
```javascript
const startTime = Date.now();
console.log('[STORAGE] Starting bulk import:', { count: items.length });

// ... operation ...

console.log('[STORAGE] Import complete:', { 
  count: items.length, 
  duration: Date.now() - startTime + 'ms' 
});
```

---

## 🚫 WHAT NOT TO LOG

### **Never Log:**
1. **API Keys or Tokens**
   ```javascript
   // ❌ BAD
   console.log('[API] Using key:', MAILERLITE_API_KEY);
   
   // ✅ GOOD
   console.log('[API] API key present:', !!MAILERLITE_API_KEY);
   ```

2. **Full Credit Card Numbers or Sensitive PII**

3. **Passwords or Authentication Secrets**

4. **Full Stack Traces in Production** (unless in [ERROR] logs)

---

## 📝 IMPLEMENTATION CHECKLIST

When adding logging to a new feature:

- [ ] Identify critical user actions
- [ ] Add [CATEGORY] prefix to all logs
- [ ] Log before critical operations
- [ ] Log after critical operations with results
- [ ] Include structured data objects
- [ ] Add success/error indicators (✅/❌)
- [ ] Test that logs appear correctly
- [ ] Verify no sensitive data is logged
- [ ] Document in release notes

---

## 🎯 REQUIRED LOGGING POINTS

### **Email Signup (REQUIRED):**
1. User submission attempt
2. API request sent
3. API response received
4. Success/failure state

### **Admin Event Management (REQUIRED):**
1. Event create/update/delete initiation
2. Blob storage operation
3. Success/failure confirmation

### **API Calls (REQUIRED):**
1. Request being sent
2. Response received
3. Error conditions

---

## 📊 PRODUCTION VS DEVELOPMENT

### **Production Logs:**
- Focus on user actions and errors
- Keep logs concise
- Log all [ERROR] and [SIGNUP] events
- Log critical [API] and [STORAGE] events

### **Development Logs:**
- Can be more verbose
- Include [DEBUG] category
- Log state changes
- Log component lifecycle events

---

## 🔧 EXAMPLE: Complete Email Signup Flow

```javascript
// User submits form
console.log('[SIGNUP] User submitted signup form:', {
  email: email,
  source: 'Page',
  timestamp: new Date().toISOString()
});

// Validation
if (!email) {
  console.log('[ERROR] Missing email field');
  return;
}

// API call
console.log('[API] Sending request to MailerLite:', {
  endpoint: 'https://connect.mailerlite.com/api/subscribers',
  method: 'POST',
  payload: { email, fields, groups }
});

try {
  const response = await fetch(...);
  const data = await response.json();
  
  console.log('[API] MailerLite response:', {
    status: response.status,
    ok: response.ok,
    data: data
  });
  
  if (response.ok) {
    console.log('[SIGNUP] ✅ Success - User subscribed via Page');
  } else {
    console.log('[SIGNUP] ❌ Error:', data.error);
  }
} catch (error) {
  console.log('[ERROR] Exception during signup:', {
    message: error.message,
    stack: error.stack
  });
}
```

---

## 🎯 TESTING LOGS

After implementing logging:

1. Open browser console (F12)
2. Perform the action
3. Verify logs appear with correct [CATEGORY]
4. Check that data is structured and readable
5. Confirm no sensitive data is exposed

---

## 📋 RELEASE NOTES TEMPLATE

Include in every release:

```markdown
## 🔍 Logging Added:

- [SIGNUP] Email subscription flow
- [API] MailerLite requests and responses
- [ERROR] Validation and exception handling
- [ADMIN] Event management actions

Open browser console (F12) to see detailed logs.
```

---

## ✅ ADOPTION CHECKLIST

For build47 and beyond:

- [x] Logging SOP created
- [x] [SIGNUP] logging implemented in build47
- [x] [API] logging implemented in build47
- [x] [ERROR] logging implemented in build47
- [ ] [ADMIN] logging (for future builds)
- [ ] [STORAGE] logging (for future builds)
- [ ] [DEBUG] logging (development only)

---

## 📞 WHEN REPORTING ISSUES

Users/Peter should:
1. Open browser console (F12)
2. Reproduce the issue
3. Copy all relevant logs
4. Share logs with exact timestamps
5. Mention which [CATEGORY] showed errors

This enables quick diagnosis and fixes!

---

**This SOP is mandatory for all future builds.**  
**Last Updated:** January 29, 2026 - build47
