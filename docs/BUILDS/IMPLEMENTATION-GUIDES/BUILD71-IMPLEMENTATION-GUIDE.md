# BUILD71 - SOCIAL MEDIA AUTOMATION SUITE

**Version:** v2.3.0-Build71  
**Release Date:** February 1, 2026  
**Build Type:** Major Feature Release  
**Previous Version:** v2.3.0-Build70.3

---

## 🎯 OVERVIEW

Build71 adds comprehensive social media automation capabilities to Grant Park Events, enabling automated content generation, RSS feeds for social platforms, and analytics tracking with minimal manual effort.

---

## 🆕 WHAT'S INCLUDED

### **1. RSS Feed Generator** ✅
**File:** `/netlify/functions/rss-feed.js`

**Features:**
- Dynamic RSS 2.0 feed of upcoming events
- Auto-updates when events change in Blobs
- Includes event images (media enclosures)
- 1-hour cache for performance
- Filters for published, future events only
- Limits to 50 most recent events

**Access:**
```
https://www.grantparkevents.com/.netlify/functions/rss-feed
```

**Use Cases:**
- IFTTT automation (RSS → Facebook/Instagram)
- Zapier workflows
- Newsletter integrations
- Third-party event aggregators

---

### **2. Social Post Generator** ✅
**File:** `/netlify/functions/social-posts.js`

**Endpoints:**

**A. Generate Weekly Posts:**
```
/.netlify/functions/social-posts?action=generate&days=7
```
Returns array of ready-to-post content for next 7 days

**B. Single Event Post:**
```
/.netlify/functions/social-posts?action=event&id=[EVENT_ID]
```
Generates optimized post for specific event

**C. Weekend Roundup:**
```
/.netlify/functions/social-posts?action=roundup
```
Generates this weekend's events summary

**D. Week Preview:**
```
/.netlify/functions/social-posts?action=preview
```
Generates upcoming week overview

**Post Format:**
```json
{
  "type": "event_announcement",
  "eventId": "12345",
  "eventTitle": "Beethoven Symphony No. 9",
  "text": "[Full formatted post text with emojis and hashtags]",
  "url": "https://www.grantparkevents.com/events/...",
  "imageUrl": "[event image URL]",
  "scheduledFor": "2026-08-15",
  "platform": "facebook,instagram",
  "characterCount": 285
}
```

---

## 📱 ADMIN PANEL INTEGRATION

### **NOTE: Admin UI Not Included in This Build**

Due to the complexity of the admin panel and time constraints, Build71 includes the **backend functions** but **not** the admin UI integration.

**What's Ready:**
- ✅ RSS feed endpoint (fully functional)
- ✅ Social post generation API (fully functional)
- ✅ Post templates (4 different types)
- ✅ Hashtag generation
- ✅ URL generation

**What Needs to Be Built (Build71.1):**
- ⏳ Admin tab "Social Media"
- ⏳ Post preview interface
- ⏳ Batch generation UI
- ⏳ Copy-to-clipboard buttons
- ⏳ Social analytics dashboard

---

## 🔧 HOW TO USE (CURRENT BUILD)

### **Option 1: Direct API Access**

**Test RSS Feed:**
```bash
curl https://www.grantparkevents.com/.netlify/functions/rss-feed
```

**Generate Posts for Next Week:**
```bash
curl "https://www.grantparkevents.com/.netlify/functions/social-posts?action=generate&days=7"
```

**Get Weekend Roundup:**
```bash
curl "https://www.grantparkevents.com/.netlify/functions/social-posts?action=roundup"
```

---

### **Option 2: IFTTT Automation (Recommended for Now)**

**Setup Steps:**

**1. Create IFTTT Account**
- Go to: https://ifttt.com/join
- Sign up (free tier available)

**2. Connect RSS Feed**
- New Applet → If This: "RSS Feed"
- Feed URL: `https://www.grantparkevents.com/.netlify/functions/rss-feed`

**3. Connect Facebook/Instagram**
- Then That: "Facebook Pages" or "Instagram Business"
- Authorize IFTTT to post

**4. Configure Post Format**
```
{{EntryTitle}}

{{EntryContent}}

{{EntryUrl}}
```

**5. Set Posting Schedule**
- Check for new items: Every hour
- Post immediately when new event detected

**Done!** Events now auto-post to social media

---

### **Option 3: Manual Use (Until Admin UI is Built)**

**Weekly Workflow:**

**Monday Morning (10 minutes):**

1. **Get posts for the week:**
   - Open browser console
   - Paste:
   ```javascript
   fetch('/.netlify/functions/social-posts?action=generate&days=7')
     .then(r => r.json())
     .then(data => {
       data.posts.forEach((post, i) => {
         console.log(`--- POST ${i+1} ---`);
         console.log(post.text);
         console.log(`Image: ${post.imageUrl}`);
         console.log('---\n');
       });
     });
   ```

2. **Copy posts** from console output

3. **Paste into Meta Business Suite:**
   - Go to: https://business.facebook.com/latest/composer
   - Schedule each post
   - Done for the week!

---

## 📋 POST TEMPLATES

### **Template 1: Event Announcement**
```
🎵 Beethoven Symphony No. 9
📅 Friday, August 15 at 6:30 PM
📍 Jay Pritzker Pavilion

The Grant Park Music Festival presents Beethoven's iconic 
9th Symphony featuring the "Ode to Joy"...

FREE admission 🎟️
https://www.grantparkevents.com/events/2026-08-15-beethoven-symphony-no-9-20

#GrantPark #ChicagoEvents #FreeEvents #ClassicalMusic #Chicago #DowntownChicago
```

### **Template 2: Weekend Roundup**
```
✨ YOUR WEEKEND IN GRANT PARK ✨

This weekend's FREE events:

📅 Aug 15: Beethoven Symphony No. 9
📅 Aug 16: Navy Pier Fireworks
📅 Aug 17: Chicago Jazz Festival

Full calendar → grantparkevents.com

#ChicagoEvents #GrantPark #FreeEvents #ChicagoWeekend
```

### **Template 3: Week Preview**
```
🌟 THIS WEEK IN GRANT PARK 🌟

Upcoming FREE events:

📅 Aug 12: Mozart Requiem
📅 Aug 14: Air & Water Show
📅 Aug 15: Beethoven Symphony
📅 Aug 17: Jazz Festival

See full schedule → grantparkevents.com

#GrantPark #ChicagoEvents #FreeChicago
```

---

## 🏷️ HASHTAG STRATEGY

### **Auto-Generated Hashtags:**

**Base (Always Included):**
- `#GrantPark`
- `#ChicagoEvents`
- `#FreeEvents`
- `#Chicago`
- `#DowntownChicago`

**Event-Type Specific:**
- Classical music → `#ClassicalMusic`
- Jazz → `#JazzMusic`
- Blues → `#BluesMusic`
- Movies → `#OutdoorMovies`
- Fireworks → `#Fireworks`
- Festivals → `#ChicagoFestival`
- Dance → `#DancePerformance`

**Venue-Specific:**
- Millennium Park events → `#MillenniumPark`

---

## 📊 ANALYTICS (Future Build71.1)

**Planned Dashboard Metrics:**

**Website Traffic from Social:**
- Facebook referrals (real-time from GA)
- Instagram bio clicks
- Click-through rates
- Top-performing posts

**Social Performance:**
- Posts published per week
- Follower growth (manual entry)
- Engagement rates (manual entry)
- Reach estimates

**Content Calendar:**
- Visual calendar of scheduled posts
- Coverage gaps
- Upcoming events without posts

---

## 🔮 FUTURE ENHANCEMENTS (Build71.1+)

### **Build71.1: Admin UI**
- Social Media tab in admin panel
- Post preview interface
- Batch generation
- Copy-to-clipboard
- Image download for posts

### **Build71.2: Analytics Dashboard**
- GA integration for social traffic
- Performance charts
- Manual entry forms for Meta metrics
- ROI calculations

### **Build71.3: Image Generation**
- Auto-generate social media images
- Event-specific graphics
- Branded templates
- Text overlays

---

## 🧪 TESTING

### **Test RSS Feed:**
```bash
curl -I https://www.grantparkevents.com/.netlify/functions/rss-feed
```
**Expected:** 200 OK, Content-Type: application/xml

### **Test Post Generation:**
```bash
curl "https://www.grantparkevents.com/.netlify/functions/social-posts?action=generate&days=7" | jq '.count'
```
**Expected:** Number of posts generated (1-7)

### **Validate RSS in Feed Validator:**
- URL: https://validator.w3.org/feed/
- Enter: `https://www.grantparkevents.com/.netlify/functions/rss-feed`
- **Expected:** Valid RSS 2.0

---

## 📖 SETUP GUIDES

### **IFTTT Setup (Detailed)**

**Step 1: Create Account**
1. Go to https://ifttt.com/join
2. Sign up with email or Google
3. Verify email

**Step 2: Create Applet**
1. Click "+ Create"
2. Click "If This"
3. Search "RSS Feed"
4. Click "New feed item"
5. Enter feed URL: `https://www.grantparkevents.com/.netlify/functions/rss-feed`
6. Click "Create trigger"

**Step 3: Connect Social**
1. Click "Then That"
2. Search "Facebook Pages" (or "Instagram Business")
3. Click "Create a link post" (Facebook) or "Post a photo" (Instagram)
4. Authorize IFTTT

**Step 4: Configure Post**
**Facebook:**
```
Message: {{EntryTitle}}

{{EntryContent}}

Link URL: {{EntryUrl}}
```

**Instagram (if image available):**
```
Caption: {{EntryTitle}}

{{EntryContent}}

{{EntryUrl}}

#GrantPark #ChicagoEvents
```

**Step 5: Activate**
1. Click "Continue"
2. Review settings
3. Click "Finish"

**Done!** IFTTT will check RSS every hour and post new events

---

### **Buffer Setup (Alternative)**

**Cost:** $6/month (Essentials plan)

**Step 1: Create Account**
1. Go to https://buffer.com
2. Sign up for Essentials plan
3. Connect Facebook/Instagram

**Step 2: Add RSS Feed**
1. Click "Content" → "Feed"
2. Click "+ Add Feed"
3. Enter: `https://www.grantparkevents.com/.netlify/functions/rss-feed`
4. Select posting schedule
5. Customize post template

**Step 3: Configure Schedule**
- Mon/Wed/Fri at 10 AM
- Tue/Thu at 2 PM
- Sun at 6 PM

**Benefits over IFTTT:**
- Better scheduling control
- Analytics included
- Queue management
- Multiple profiles

---

## 🎯 RECOMMENDED WORKFLOW (CURRENT)

**Until Build71.1 Admin UI is complete:**

### **Option A: Fully Automated (IFTTT)**
- **Setup:** 30 minutes (one-time)
- **Ongoing:** 0 minutes/week
- **Quality:** Basic (auto-posts all events)
- **Cost:** Free

### **Option B: Semi-Automated (Browser Console + Meta)**
- **Setup:** 5 minutes
- **Ongoing:** 10 minutes/week
- **Quality:** High (you review before posting)
- **Cost:** Free

### **Option C: Hybrid (Recommended)**
- **Setup:** 30 minutes (IFTTT) + 5 minutes (console)
- **Ongoing:** 20 minutes/week (2-3 special posts)
- **Quality:** Mix of automated + curated
- **Cost:** Free

---

## ✅ WHAT'S READY TO USE NOW

**Fully Functional:**
- ✅ RSS feed generation
- ✅ Automatic event filtering (future, published only)
- ✅ Post text generation (4 templates)
- ✅ Hashtag generation
- ✅ URL generation
- ✅ Image enclosures in RSS

**Can Be Used With:**
- ✅ IFTTT (free automation)
- ✅ Zapier (paid automation)
- ✅ Buffer (paid scheduling)
- ✅ Hootsuite (paid scheduling)
- ✅ Browser console (manual)

---

## ⏳ WHAT NEEDS BUILD71.1

**Admin UI Components:**
- Social Media tab
- Post preview cards
- "Generate Week" button
- "Copy All" button
- Individual post edit
- Image preview
- Platform selector (FB/IG/both)
- Schedule helper
- Analytics dashboard

**Estimated effort:** 4-6 hours development

---

## 💡 RECOMMENDATION

**For immediate use:**
1. ✅ Deploy Build71 (backend ready)
2. ✅ Set up IFTTT with RSS feed (30 min)
3. ✅ Test automated posting (1 week)
4. ⏳ Build 71.1 admin UI if you want more control

**This gets you 80% automation right now!**

---

END OF BUILD71 SUMMARY
