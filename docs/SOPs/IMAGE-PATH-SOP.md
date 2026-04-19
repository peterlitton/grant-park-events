# IMAGE PATH HANDLING SOP

**Created:** January 28, 2026  
**Purpose:** Prevent image loading issues across different rendering contexts  
**Severity:** CRITICAL - Affects user experience directly

---

## 🎯 THE PROBLEM WE SOLVED

### **What Happened**
- Card images worked: `assets/events/image.jpg`
- Modal images failed: Same path, different context
- Newsletters would have same issue
- Email clients would have same issue

### **Root Cause**
**Relative paths resolve differently based on DOM/rendering context:**
- Normal page flow: Relative paths work
- Modal overlays/portals: Relative paths fail
- Email clients: Relative paths fail
- External contexts: Relative paths fail

### **The Fix**
Use **absolute URLs** for any content that renders outside normal page flow.

---

## 📋 MANDATORY RULES

### **RULE 1: Know Your Context**

**Normal Page Flow (Relative OK):**
- ✅ Main page content
- ✅ Cards in standard layout
- ✅ Navigation elements
- ✅ Footer content

**Outside Normal Flow (Absolute REQUIRED):**
- ❌ Modal overlays
- ❌ React portals
- ❌ Email newsletters
- ❌ External embeds
- ❌ Social media cards (og:image)
- ❌ PDF generation
- ❌ Print stylesheets
- ❌ iframes

---

### **RULE 2: Use Absolute Paths for External Contexts**

**When building content for:**
- Newsletters
- Email campaigns
- Social sharing
- Modal overlays
- Print views
- External embeds

**Always use:**
```javascript
window.location.origin + '/' + relativePath
// Result: https://grantparkevents.com/assets/events/image.jpg
```

**Or:**
```javascript
const getAbsoluteUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return window.location.origin + '/' + path;
};
```

---

### **RULE 3: Test in Target Context**

**Before deploying:**
1. Test images in normal page
2. Test images in modal/overlay
3. Test images in email preview
4. Test images in social media preview
5. Test images in all target contexts

**Don't assume:** If it works on page, it works everywhere

---

## 🔧 IMPLEMENTATION GUIDELINES

### **For Website Development**

**Pattern 1: Conditional Absolute Path**
```javascript
// Use for modals, overlays, portals
src: image.startsWith('http') 
  ? image 
  : window.location.origin + '/' + image
```

**Pattern 2: Helper Function**
```javascript
const getAbsoluteImageUrl = (imgPath) => {
  if (!imgPath) return '/assets/default.png';
  if (imgPath.startsWith('http') || imgPath.startsWith('data:')) return imgPath;
  return window.location.origin + '/' + imgPath;
};

// Use everywhere that might need absolute
<img src={getAbsoluteImageUrl(event.image)} />
```

**Pattern 3: Context-Aware Component**
```javascript
const EventImage = ({src, context = 'page'}) => {
  const absoluteContexts = ['modal', 'email', 'social'];
  const finalSrc = absoluteContexts.includes(context)
    ? getAbsoluteImageUrl(src)
    : src;
  
  return <img src={finalSrc} />;
};
```

---

### **For Newsletter/Email Development**

**CRITICAL: Email clients are extremely strict**

**Required approach:**
```html
<!-- WRONG - Will fail in most email clients -->
<img src="assets/events/image.jpg">

<!-- CORRECT - Absolute URL -->
<img src="https://grantparkevents.com/assets/events/image.jpg">
```

**Best practice:**
```javascript
// When generating newsletter HTML
const emailHtml = `
  <img src="${window.location.origin}/assets/events/${event.image}" 
       alt="${event.title}">
`;
```

**Email-specific rules:**
1. **ALWAYS** use absolute URLs
2. **NEVER** use relative paths
3. **ALWAYS** include full domain
4. **ALWAYS** test in email preview tools
5. **ALWAYS** test in multiple email clients (Gmail, Outlook, etc.)

---

### **For Social Media Metadata**

**Open Graph, Twitter Cards, etc.**

**Required approach:**
```html
<!-- WRONG -->
<meta property="og:image" content="assets/events/image.jpg">

<!-- CORRECT -->
<meta property="og:image" content="https://grantparkevents.com/assets/events/image.jpg">
```

**Implementation:**
```javascript
const getAbsoluteImageUrl = (imgPath) => {
  if (!imgPath) return window.location.origin + '/assets/star.png';
  if (imgPath.startsWith('http') || imgPath.startsWith('data:')) return imgPath;
  return window.location.origin + '/' + imgPath;
};

// For metadata
document.querySelector('meta[property="og:image"]')
  .setAttribute('content', getAbsoluteImageUrl(event.image));
```

---

## 🧪 TESTING CHECKLIST

### **Before Deployment**

- [ ] Images work on main page
- [ ] Images work in card view
- [ ] Images work in grid view
- [ ] Images work in calendar view
- [ ] **Images work in modal overlay**
- [ ] Images work in email preview
- [ ] Images work in social media preview tools
- [ ] Images work when shared to Slack/Discord/etc
- [ ] Images work in print preview
- [ ] Images work in mobile view

### **Testing Tools**

**For Social Media:**
- Facebook Sharing Debugger: https://developers.facebook.com/tools/debug/
- Twitter Card Validator: https://cards-dev.twitter.com/validator
- LinkedIn Post Inspector: https://www.linkedin.com/post-inspector/

**For Email:**
- Litmus: https://www.litmus.com/
- Email on Acid: https://www.emailonacid.com/
- Mailtrap: https://mailtrap.io/

**For Website:**
- Browser DevTools Network tab
- Console errors
- Visual inspection
- Incognito mode

---

## 🚨 WARNING SIGNS

**If you see these, check paths immediately:**

1. **"Image not found" in Network tab**
   - Check if path is relative vs absolute
   - Check DOM context

2. **Broken image icon**
   - Path resolution failed
   - Wrong context for relative path

3. **Works on page, fails in modal**
   - Classic relative path issue
   - Need absolute URL

4. **Works locally, fails in production**
   - Domain/origin mismatch
   - Check absolute URL construction

5. **Works in browser, fails in email**
   - Email clients require absolute
   - No relative paths allowed

---

## 📝 CODE REVIEW CHECKLIST

**When reviewing image-related code:**

- [ ] Are images used in modal/overlay? → Absolute paths required
- [ ] Are images used in email? → Absolute paths required
- [ ] Are images in metadata? → Absolute paths required
- [ ] Is there a helper function for absolute paths? → Should be
- [ ] Are all contexts tested? → Must be
- [ ] Is fallback image absolute? → Should be
- [ ] Are data URIs handled? → Should return as-is

---

## 🎯 FUTURE DEVELOPMENT GUIDELINES

### **When Building Newsletters**

**ALWAYS:**
1. Use absolute URLs for ALL assets
2. Test in email preview tools
3. Test in multiple email clients
4. Include alt text for all images
5. Have fallback text for image-disabled clients

**NEVER:**
1. Use relative paths
2. Assume email clients work like browsers
3. Skip email client testing
4. Forget mobile email clients

### **When Building Modals/Overlays**

**ALWAYS:**
1. Use absolute URLs or helper function
2. Test image loading
3. Add error handling
4. Test in incognito mode

**NEVER:**
1. Copy-paste code from page context without checking
2. Assume relative paths will work

### **When Building Social Sharing**

**ALWAYS:**
1. Use absolute URLs in metadata
2. Test with social media preview tools
3. Include proper dimensions
4. Test actual sharing in platforms

**NEVER:**
1. Use relative paths in og:image
2. Skip social media testing
3. Forget to test on mobile

---

## 🔍 DEBUGGING GUIDE

**If images don't load:**

### **Step 1: Check Console**
```javascript
// Add temporary debugging
<img 
  src={imagePath}
  onLoad={() => console.log('✓ Loaded:', imagePath)}
  onError={() => console.error('✗ Failed:', imagePath)}
/>
```

### **Step 2: Check Network Tab**
- Look for 404 errors
- Check actual URL being requested
- Compare to expected URL

### **Step 3: Check Path Resolution**
```javascript
// Log what path is actually used
console.log('Image path:', imagePath);
console.log('Is absolute?', imagePath.startsWith('http'));
console.log('Final URL:', /* computed URL */);
```

### **Step 4: Check DOM Context**
- Is this in a modal?
- Is this in a portal?
- Is this in an iframe?
- Is this in email HTML?

### **Step 5: Fix Based on Context**
- Modal/overlay → Use absolute URL
- Email → Use absolute URL
- Social media → Use absolute URL
- Normal page → Relative OK (but absolute safer)

---

## 💡 BEST PRACTICES

### **General Approach**

**Option A: Always Absolute (Safest)**
```javascript
// Use absolute URLs everywhere
// Pros: Always works, consistent
// Cons: Slightly longer code

const imageSrc = image.startsWith('http')
  ? image
  : `${window.location.origin}/${image}`;
```

**Option B: Context-Aware (Efficient)**
```javascript
// Use relative for page, absolute for special contexts
// Pros: Efficient, minimal changes
// Cons: Need to track context

const getImageSrc = (image, context = 'page') => {
  const needsAbsolute = ['modal', 'email', 'social'].includes(context);
  if (needsAbsolute && !image.startsWith('http')) {
    return `${window.location.origin}/${image}`;
  }
  return image;
};
```

**Recommendation:** Start with Option B, migrate to Option A for consistency.

---

## 📚 LEARNING FROM THIS INCIDENT

### **What We Learned**

1. **Relative paths are context-dependent**
   - Work in some contexts, fail in others
   - Can't assume "if it works here, it works everywhere"

2. **Modal overlays are different**
   - Rendered outside normal DOM flow
   - Path resolution different from cards

3. **Testing must be comprehensive**
   - Can't just test on page
   - Must test in all target contexts

4. **Debugging needs tools**
   - onError handlers reveal issues
   - Visual indicators (borders) help debug
   - Console logging shows what's happening

5. **Email will be harder**
   - Stricter than modals
   - Must use absolute from start
   - Can't fix after sending

---

## 🎯 ACTION ITEMS FOR FUTURE

### **Before Starting Newsletter Work**

1. **Review this SOP** ✓
2. **Set up email testing tools** (Litmus, Mailtrap, etc.)
3. **Create helper functions for absolute URLs**
4. **Set up test email accounts** (Gmail, Outlook, Yahoo, etc.)
5. **Create email preview workflow**

### **During Newsletter Development**

1. **Use absolute URLs from start**
2. **Test in email preview tools early**
3. **Test in real email clients often**
4. **Keep mobile email clients in mind**
5. **Document any email-specific quirks**

### **Before Newsletter Send**

1. **Final test in all major email clients**
2. **Check images load in Gmail**
3. **Check images load in Outlook**
4. **Check on mobile email apps**
5. **Send test to yourself first**

---

## 📋 QUICK REFERENCE

### **Image Path Decision Tree**

```
Is this for email/newsletter?
├─ YES → Use absolute URL (REQUIRED)
└─ NO
    └─ Is this in modal/overlay/portal?
        ├─ YES → Use absolute URL (RECOMMENDED)
        └─ NO
            └─ Is this in metadata (og:image)?
                ├─ YES → Use absolute URL (REQUIRED)
                └─ NO → Relative OK (but absolute safer)
```

### **Quick Code Snippets**

**Absolute URL Helper:**
```javascript
const abs = (path) => path?.startsWith('http') 
  ? path 
  : `${window.location.origin}/${path}`;
```

**Image with Error Handling:**
```javascript
<img 
  src={abs(image)} 
  alt={title}
  onError={(e) => e.target.src = '/assets/fallback.png'}
/>
```

**Email Image:**
```html
<img src="https://grantparkevents.com/assets/events/image.jpg" 
     alt="Event" 
     style="max-width:100%;">
```

---

## ✅ SIGN-OFF CHECKLIST

**Before marking image work complete:**

- [ ] All images use appropriate paths (relative/absolute)
- [ ] Tested in all target contexts
- [ ] Error handling in place
- [ ] Fallback images configured
- [ ] Documentation updated
- [ ] Code reviewed for path issues
- [ ] No hardcoded domains (use window.location.origin)
- [ ] Works in incognito mode
- [ ] Works on mobile
- [ ] Ready for production

---

**This SOP prevents the modal image issue from recurring in any form.**

*Last Updated: January 28, 2026*  
*Next Review: Before newsletter development begins*
