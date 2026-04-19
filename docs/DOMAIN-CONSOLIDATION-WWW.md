# Domain Consolidation: WWW Standardization
**Grant Park Events - Technical Documentation**

**Date:** February 8, 2026  
**Build:** v2.3.1-Build10.14.2 (Revised)  
**Author:** Claude (AI Assistant)  
**Status:** ✅ RESOLVED - Option 1 Successful (Feb 9, 2026)  
**Last Updated:** February 9, 2026 - Post-Implementation Success

---

## ✅ RESOLUTION SUMMARY

**Status:** **SUCCESSFULLY RESOLVED** using Option 1 (Netlify Domain Settings UI)

**Implementation Date:** February 9, 2026, 8:34 AM CST  
**Method:** Netlify Domain Settings UI (5 minutes, zero code changes)  
**Result:** Naked domain now redirects to www with 301 status

**What Worked:**
- ✅ Option 1 (Netlify UI) - 90% confidence was accurate
- ✅ No Build10.14.2 needed (netlify.toml approach not required)
- ✅ Zero risk of redirect loops (CDN-level redirect)
- ✅ Instant activation and validation

**Current Configuration:**
- Primary Domain: `www.grantparkevents.com`
- Domain Alias: `grantparkevents.com` (redirects automatically)
- Redirect Type: 301 Permanent Redirect
- Validation: ✅ Confirmed working via httpstatus.io and browser testing

**Baseline Established:**
- Pre-redirect: 36 naked domain URLs indexed (51% duplicate rate)
- Target: ≤3 naked domain URLs by Week 4 (90%+ reduction)
- Monitoring: Weekly GSC tracking for 4 weeks
- Documentation: See `/docs/GSC-BASELINE-TRACKING.md`

**Next Steps:**
- 🟡 Monitor Google deindexing progress (automatic, no action needed)
- 🟡 Weekly GSC checks for 4 weeks
- 🟢 Celebrate success in Week 4 when duplicates are gone!

---

## ⚠️ CRITICAL UPDATE - BUILD10.14.1 FAILURE (Historical Record)

**Status:** Build10.14.1 was deployed and caused a redirect loop on the naked domain.

**Root Cause:** Domain-level redirects were placed in `_redirects` file, which operates at the APPLICATION level (after page load starts), not at DNS/CDN level. This caused conflicts with:
- Service Worker registration from naked domain
- manifest.json loading from naked domain  
- CORS errors when resources redirected mid-load
- Redirect loop between SW and redirect rules

**Current State:**
- ✅ Code fixes implemented (email functions, admin panel - all use www)
- ❌ Domain redirect NOT working (redirect loop on naked domain)
- ⚠️ Rollback required or alternative solution needed

**Lesson Learned:** Netlify's `_redirects` file is designed for PATH-based redirects within the same domain, NOT for domain-to-domain redirects. Domain redirects require `netlify.toml` configuration or Netlify Domain Settings UI.

This document has been updated with corrected approaches and confidence levels.

---

## Executive Summary

Grant Park Events is experiencing duplicate URL indexing in Google Search Console due to inconsistent domain configuration. Both `www.grantparkevents.com` and `grantparkevents.com` (naked domain) are being crawled and indexed separately, resulting in:
- Doubled indexed page counts
- Split page authority across duplicate URLs
- Potential SEO ranking dilution
- Confused canonical signals

This document outlines the consolidation strategy to standardize on `www.grantparkevents.com` as the primary domain.

---

## 1. User Needs

### Primary Need
**Unified domain presence in search engines with accurate indexed page counts and consolidated page authority.**

### Specific Requirements
1. **Single canonical URL structure** - All pages accessible via one consistent domain format
2. **Accurate GSC reporting** - Index status reflects actual unique pages, not duplicates
3. **SEO preservation** - No loss of existing search rankings during transition
4. **Automated enforcement** - Server-level redirects prevent future duplicate indexing
5. **Code consistency** - All internal references use the same domain format

### Business Impact
- **Current:** ~2x inflated indexed page count in GSC (e.g., 40 pages showing as 80)
- **Desired:** Accurate page count matching actual content (e.g., 40 pages = 40 indexed)
- **SEO Benefit:** Consolidated page authority on single URL per content piece

---

## 2. Assessed Problems

### Problem 1: Inconsistent Domain Usage in Codebase
**Severity:** Medium  
**Impact:** Mixed canonical signals to search engines

**Current State Audit:**

**WWW Domain (`https://www.grantparkevents.com`) - 95% of code:**
- ✅ `index.html` - canonical tag, OG tags, schema.org JSON-LD
- ✅ `sitemap.xml` - sitemap index
- ✅ `sitemap-pages.xml` - static page sitemap
- ✅ `netlify/functions/sitemap-events.js` - dynamic event sitemap
- ✅ `netlify/functions/rss-feed.js` - RSS feed URLs
- ✅ `netlify/functions/gsc-index-status.js` - GSC integration
- ✅ `netlify/functions/gsc-midnight-batch.js` - batch indexing
- ✅ `admin-index-report.html` - admin interface

**Naked Domain (`https://grantparkevents.com`) - 5% of code:**
- ❌ `netlify/functions/generate-email-html.js` - email campaign URLs (4 instances)
- ❌ `admin.html` - event URL generation (1 instance)

**Analysis:** The codebase is 95% standardized on WWW, making it the logical choice for consolidation.

---

### Problem 2: No Server-Level Redirect
**Severity:** High  
**Impact:** Both domains remain accessible, causing duplicate indexing

**Current Behavior:**
- User enters `grantparkevents.com` → Site loads successfully
- User enters `www.grantparkevents.com` → Site loads successfully
- Both URLs are crawlable by search engines
- No 301 redirect present

**Result:**
- Google crawls and indexes both versions
- Canonical tags are advisory, not enforced
- Domain property in GSC aggregates data but doesn't prevent duplicate indexing

**Missing Infrastructure:**
- No `_redirects` file in repository
- No Netlify domain redirect configuration
- No `netlify.toml` redirect rules for domain consolidation

---

### Problem 3: Google Search Console Domain Property Misunderstanding
**Severity:** Low (Educational)  
**Impact:** User expectations vs actual GSC behavior

**Common Misconception:**
- Domain properties (`sc-domain:grantparkevents.com`) are often assumed to prevent duplicate indexing
- In reality, they only **aggregate reporting data** from www and naked variants

**Actual Behavior:**
- Domain property combines metrics from both www and naked URLs
- Does NOT prevent Google from crawling and indexing both versions
- Does NOT enforce canonical preference without proper redirects

**Documentation Gap:** This behavior isn't well-explained in Google's documentation, leading to confusion.

---

### Problem 4: Build10.14.1 Redirect Loop (Post-Deployment Discovery)
**Severity:** Critical  
**Impact:** Naked domain inaccessible to users

**What Happened:**
Build10.14.1 was deployed with domain redirects in the `_redirects` file. This caused a redirect loop on `grantparkevents.com` with the following error:
```
ERR_TOO_MANY_REDIRECTS
Access to fetch at 'https://www.grantparkevents.com/manifest.json' 
(redirected from 'https://grantparkevents.com/manifest.json') from origin 
'https://grantparkevents.com' has been blocked by CORS policy
```

**Root Cause Analysis:**

**The Technical Issue:**
The `_redirects` file in Netlify operates at the **application level** (after page load begins), not at the DNS/CDN level. Here's the sequence of events that caused the loop:

1. Browser requests `grantparkevents.com`
2. Page starts loading from naked domain
3. Service Worker attempts to register from `grantparkevents.com`
4. `manifest.json` starts loading from `grantparkevents.com`
5. `_redirects` rule processes (too late)
6. Page redirects to `www.grantparkevents.com` mid-load
7. Resources already requested from naked domain
8. Those resource requests ALSO trigger redirect
9. Service Worker intercepts requests
10. **Result:** Infinite loop between SW and redirect rules
11. **CORS Error:** Resources from different origin than page

**Why _redirects File Failed:**
- `_redirects` processes at APPLICATION level (after HTML starts parsing)
- Service Worker loads BEFORE redirects process
- manifest.json, CSS, JS all start loading from naked domain
- Mid-load redirect causes CORS errors
- Service Worker + redirects create circular dependency

**What Should Have Been Used:**
- **Netlify Domain Settings UI:** DNS/CDN level redirect (before page load)
- **netlify.toml [[redirects]]:** Configuration level (earlier processing)
- **DNS-level forwarding:** Domain registrar level (earliest possible)

**Key Lesson:** Not all redirect mechanisms are equal. Domain-to-domain redirects require infrastructure-level handling, not application-level files.

---

## 2.5 Lessons Learned from Build10.14.1 Failure

### Lesson 1: Netlify _redirects File Limitations
**What we thought:** `_redirects` works like Apache .htaccess or Nginx config  
**Reality:** `_redirects` is for PATH redirects within same domain, not domain-to-domain

**Wrong Use Cases:**
- ❌ `domain1.com → domain2.com`
- ❌ `naked.com → www.naked.com`
- ❌ `old-domain.com → new-domain.com`

**Correct Use Cases:**
- ✅ `/old-page → /new-page`
- ✅ `/blog/* → /articles/:splat`
- ✅ SPA routing: `/* → /index.html`

### Lesson 2: Service Worker Interactions
Service Workers complicate domain redirects because they:
- Register before redirects can process
- Intercept network requests
- Create CORS issues when domain changes mid-load
- Cache resources from original domain

**Solution:** Redirects must happen BEFORE Service Worker loads, requiring DNS/CDN level handling.

### Lesson 3: Redirect Processing Order
**Netlify Redirect Processing Pipeline:**
```
1. DNS Level (Domain Settings UI)
2. CDN Level (Netlify Edge)
3. Configuration Level (netlify.toml [[redirects]])
4. Application Level (_redirects file)
5. Service Worker Intercepts
```

**Domain redirects must happen at levels 1-3, not level 4.**

### Lesson 4: Testing Assumptions
**Mistake:** Deployed without testing redirect loops  
**Should have:** Tested in staging or checked Netlify docs more thoroughly  
**Going forward:** Validate redirect approaches before deployment, especially with Service Workers

### Lesson 5: Confidence Calibration
**Initial confidence:** 85% (_redirects approach)  
**Actual result:** Complete failure (redirect loop)  
**Revised confidence:** 70% (netlify.toml), 90% (Netlify UI)  

**Learning:** When working with infrastructure features, consult platform documentation and test thoroughly before claiming high confidence.

---

## 3. Solution Options & Action Plans

**⚠️ IMPORTANT:** Build10.14.1 attempted to use `_redirects` file for domain redirects, which caused a redirect loop. The corrected approaches are documented below.

---

### ✅ Code Consolidation (COMPLETED in Build10.14.1)

**Status:** ✅ Successfully implemented  
**Files Modified:** 5 files (email function, admin panel, version files)

**What was fixed:**
- ✅ `netlify/functions/generate-email-html.js` - 4 instances (event URLs, logo, QR code, hero image)
- ✅ `admin.html` - 1 instance (event URL generation)
- ✅ Version metadata updated across all files

**Result:** All code now consistently uses `https://www.grantparkevents.com`

**This part is DONE and does NOT need to be redone.**

---

### 🔀 Domain Redirect Solutions (CHOOSE ONE)

The following options are ranked by **reliability and confidence level**. Choose the approach that best fits your comfort level and infrastructure access.

---

## OPTION 1: Netlify Domain Settings UI ⭐⭐⭐⭐⭐
**Confidence Level:** 90%  
**Difficulty:** Very Easy  
**Time to Implement:** 5 minutes  
**Risk Level:** Very Low  
**RECOMMENDED: START HERE**

### How It Works
Netlify has a built-in domain management feature that handles redirects at the DNS/CDN level (before page load). This is the cleanest, most reliable approach.

### Implementation Steps

**Step 1: Access Domain Settings**
1. Go to https://app.netlify.com
2. Click your Grant Park Events site
3. Click "Domain management" in left sidebar
4. Click "Domains" section

**Step 2: Configure Primary Domain**
1. Look for "Primary domain" setting
2. If not set, click "Set as primary domain" next to `www.grantparkevents.com`
3. If already set to naked domain, change it to `www.grantparkevents.com`

**Step 3: Add Domain Alias**
1. In "Domain aliases" section
2. Ensure `grantparkevents.com` is listed
3. It should show "Redirects to primary domain" status

**Step 4: Verify HTTPS**
1. Both domains should have valid SSL certificates
2. "Force HTTPS" should be enabled
3. Netlify handles HTTPS redirect automatically

### Expected Behavior
- User visits `grantparkevents.com` → Instantly redirects to `www.grantparkevents.com`
- User visits `www.grantparkevents.com` → Loads directly (no redirect)
- Redirect happens at CDN level (before page load)
- No service worker conflicts
- No CORS errors

### Validation
```bash
# Test redirect
curl -I https://grantparkevents.com

# Expected output:
HTTP/2 301
location: https://www.grantparkevents.com/
```

**Browser test:** Visit `grantparkevents.com` → Address bar should change to `www.grantparkevents.com`

### Pros
- ✅ Built-in Netlify feature (designed for this)
- ✅ Most reliable (DNS/CDN level)
- ✅ No code changes needed
- ✅ Zero risk of redirect loops
- ✅ No service worker conflicts
- ✅ Instant rollback (just change setting back)
- ✅ Works independently of code

### Cons
- ⚠️ Not visible in version control (UI configuration)
- ⚠️ Requires Netlify dashboard access
- ⚠️ Must be documented separately

### Rollback Plan
If it doesn't work:
1. Netlify Dashboard → Domain Settings
2. Click "Options" → "Remove domain alias"
3. Both domains work independently again (but duplicates remain)

---

## OPTION 2: netlify.toml Configuration ⭐⭐⭐⭐
**Confidence Level:** 75%  
**Difficulty:** Medium  
**Time to Implement:** Build10.14.2 (30 minutes)  
**Risk Level:** Medium  
**Use if Option 1 doesn't work or you prefer version-controlled config**

### How It Works
Domain redirects configured in `netlify.toml` are processed earlier in Netlify's request pipeline than `_redirects` file. This should avoid service worker conflicts.

### Implementation Steps (Build10.14.2)

**File: netlify.toml** (modify existing file)

**Current content:**
```toml
[build]
  functions = "netlify/functions"

[functions]
  node_bundler = "esbuild"
  
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Updated content:**
```toml
[build]
  functions = "netlify/functions"

[functions]
  node_bundler = "esbuild"

# Domain consolidation: naked → www (MUST come first)
[[redirects]]
  from = "https://grantparkevents.com/*"
  to = "https://www.grantparkevents.com/:splat"
  status = 301
  force = true

[[redirects]]
  from = "http://grantparkevents.com/*"
  to = "https://www.grantparkevents.com/:splat"
  status = 301
  force = true

# SPA routing (catch-all for www domain)
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**File: _redirects** (keep existing, REMOVE domain redirects)

**Current (Build10.14.1 - BROKEN):**
```
# Domain redirects
https://grantparkevents.com/* https://www.grantparkevents.com/:splat 301!

# SPA routing
/* /index.html 200
```

**Updated (Build10.14.2):**
```
# SPA routing only - domain redirects moved to netlify.toml
/assets/*  /assets/:splat  200
/events/*  /index.html     200
/*         /index.html     200
```

### Order Matters
**Critical:** Domain redirects in `netlify.toml` MUST come BEFORE the SPA catch-all rule. Netlify processes redirects in order.

### Validation
Same as Option 1 - test with curl or browser.

### Pros
- ✅ Version controlled (in code)
- ✅ Processed earlier than _redirects
- ✅ Should avoid SW conflicts
- ✅ Documented in repository

### Cons
- ⚠️ More complex than UI approach
- ⚠️ Requires code deployment
- ⚠️ Medium confidence (not 100% tested)
- ⚠️ Rollback requires redeployment

### Why This Is Better Than _redirects
- `netlify.toml` redirects process at **configuration level**
- `_redirects` file processes at **application level** (too late)
- Service Worker loads before `_redirects` processes → loop
- `netlify.toml` processes before SW → no loop

### Rollback Plan
If redirect loop occurs:
1. Netlify Dashboard → Deploys
2. Publish previous deploy (Build10.14.1 or earlier)
3. Site back to previous state in 30 seconds

---

## OPTION 3: DNS-Level Redirect ⭐⭐⭐⭐⭐
**Confidence Level:** 95%  
**Difficulty:** Hard  
**Time to Implement:** 1-2 days (DNS propagation)  
**Risk Level:** Very Low  
**Use as last resort or for maximum reliability**

### How It Works
Configure redirect at your domain registrar (where you purchased grantparkevents.com). This happens BEFORE the request even reaches Netlify.

### Implementation Steps

**Requirements:**
- Access to domain registrar account (GoDaddy, Namecheap, etc.)
- Knowledge of DNS management

**Step 1: Access DNS Settings**
1. Log into domain registrar
2. Find DNS settings for `grantparkevents.com`

**Step 2: Configure Redirect/Forwarding**

**Option A: URL Forwarding (if available)**
1. Look for "Forwarding" or "URL Redirect" option
2. Set: `grantparkevents.com` → `https://www.grantparkevents.com`
3. Choose "301 Permanent Redirect"
4. Enable "Forward path" (preserve /about, /events, etc.)

**Option B: CNAME Flattening (advanced)**
1. Set @ (root) record to ALIAS or ANAME pointing to `www.grantparkevents.com`
2. Requires registrar support for ALIAS/ANAME records
3. Not all registrars support this

**Step 3: Wait for Propagation**
- DNS changes take 24-48 hours to propagate worldwide
- Test with `dig grantparkevents.com` to check

### Pros
- ✅ Most reliable (happens before Netlify)
- ✅ Works regardless of hosting platform
- ✅ Permanent infrastructure solution
- ✅ No code changes needed

### Cons
- ⚠️ Requires domain registrar access
- ⚠️ 24-48 hour propagation delay
- ⚠️ More complex to configure
- ⚠️ Two places to manage (DNS + Netlify)

### Rollback Plan
Revert DNS settings at registrar (another 24-48 hours to propagate).

---

## OPTION 4: Hybrid - Code Only (No Redirect) ⭐⭐
**Confidence Level:** 100% (but doesn't solve the problem)  
**Difficulty:** Already Done  
**Time to Implement:** Complete  
**Risk Level:** Zero  
**Accept duplicates, prevent future issues**

### What This Means
Keep Build10.14.1's code fixes (all URLs use www), but DON'T implement any redirect. Both domains remain accessible.

### Current State
- ✅ All code uses www domain
- ✅ Email campaigns use www
- ✅ Sitemaps point to www
- ✅ Canonical tags prefer www
- ❌ Naked domain still accessible
- ❌ Google still indexes both

### Result
- Google SHOULD eventually prefer www based on canonicals
- But may still index some naked domain URLs
- Duplicate count reduction: 50-70% (not 90%+)
- No technical risk whatsoever

### When to Choose This
- If all redirect approaches fail
- If willing to accept partial duplicate reduction
- If zero-risk is highest priority
- Temporary measure while researching better solution

---

## 📊 RECOMMENDATION SEQUENCE

**Phase 1: Try Netlify UI First** (Option 1)
1. ✅ Takes 5 minutes
2. ✅ Zero code changes
3. ✅ 90% confidence
4. ✅ Instant rollback if issues
5. ✅ Test immediately

**If Option 1 works → DONE. Stop here.**

---

**Phase 2: If UI Doesn't Work** (Option 2)
1. ✅ Build10.14.2 with netlify.toml
2. ✅ Keep all code fixes from 10.14.1
3. ✅ 75% confidence
4. ✅ Rollback via Netlify dashboard

**If Option 2 works → DONE. Stop here.**

---

**Phase 3: Nuclear Option** (Option 3)
1. ✅ DNS-level redirect
2. ✅ 95% confidence
3. ⚠️ 24-48 hour delay
4. ✅ Use only if Options 1 & 2 both fail

---

**Fallback: Accept Partial Solution** (Option 4)
1. ✅ Keep code fixes from Build10.14.1
2. ✅ Don't implement redirect
3. ✅ Accept ~50-70% duplicate reduction
4. ✅ Zero technical risk

---

### Phase 2: Deployment Strategy (For Option 2 - netlify.toml)
### Phase 2: Deployment Strategy (For Option 2 - netlify.toml)

**Only needed if Option 1 (Netlify UI) doesn't work.**

#### Step 1: Build Preparation
1. Start with Build10.14.1 codebase (code fixes already done)
2. Modify `netlify.toml` (add domain redirects)
3. Modify `_redirects` (remove domain redirects, keep SPA routing)
4. Update version to Build10.14.2
5. Package and test locally if possible

#### Step 2: Deploy to Netlify
1. Upload Build10.14.2 package
2. Monitor deployment logs for errors
3. Look for redirect rule parsing confirmation

#### Step 3: Immediate Testing (Within 5 minutes)
```bash
# Test 1: Redirect works
curl -I https://grantparkevents.com
# Expected: HTTP 301, location: https://www.grantparkevents.com/

# Test 2: No loop on www
curl -I https://www.grantparkevents.com
# Expected: HTTP 200 (loads directly)

# Test 3: Path preservation
curl -I https://grantparkevents.com/about
# Expected: HTTP 301, location: https://www.grantparkevents.com/about
```

#### Step 4: Browser Validation
1. Open browser (private/incognito mode)
2. Visit `grantparkevents.com`
3. Watch address bar - should change to `www.grantparkevents.com`
4. Check Developer Tools → Network tab
5. First request should show 301 status

#### Step 5: Service Worker Check
1. Visit `www.grantparkevents.com`
2. Open Console (F12)
3. Should NOT see CORS errors
4. Should NOT see "too many redirects"
5. Service Worker should register from www domain only

---

### Phase 3: Google Search Console Transition

#### Action 3.1: Monitor Redirect Implementation
**Timeline:** Days 1-7 after deployment

**Tasks:**
1. Use GSC URL Inspection tool on sample naked URLs
2. Verify redirect status appears in inspection results
3. Check "Page indexing" report for redirect counts
4. Monitor "Coverage" report for changes

**Expected Behavior:**
- Naked URLs should show as "Redirect" in URL Inspection
- Target URL should point to www version
- May take 3-7 days for Google to detect redirect

---

#### Action 3.2: Request Re-Indexing (Optional Acceleration)
**Timeline:** Week 1

For high-priority pages:
1. Use URL Inspection tool
2. Test naked URL (e.g., `grantparkevents.com/about`)
3. Click "Request Indexing" if redirect isn't detected
4. Google will re-crawl and discover redirect faster

**Note:** This is optional - Google will eventually discover redirects organically.

---

#### Action 3.3: Monitor Deindexing Progress
**Timeline:** Weeks 2-4

**Expected Pattern:**
- Week 1: Redirects detected, some naked URLs marked as redirects
- Week 2: Naked URLs begin dropping from index
- Week 3: Significant reduction in duplicate URLs
- Week 4: Most/all naked URLs removed from index

**Monitoring Method:**
```
site:grantparkevents.com -site:www.grantparkevents.com
```
Search query shows naked domain pages only. Count should decrease weekly.

---

## 4. Validation & Acceptance Criteria

### AC1: Code Consistency
**Requirement:** All hardcoded domain references use `www.grantparkevents.com`

**Validation Method:**
```bash
# Run in project root
grep -r "https://grantparkevents.com[^w]" --include="*.html" --include="*.js" . | \
  grep -v node_modules | grep -v ".git"
```

**Expected Result:** Zero matches (excludes www.grantparkevents.com from search)

**Pass Criteria:** No naked domain references found in code

---

### AC2: Redirect Functionality
**Requirement:** Naked domain redirects to www with 301 status

**Validation Method 1 - Command Line:**
```bash
curl -I https://grantparkevents.com
```

**Expected Output:**
```
HTTP/2 301
location: https://www.grantparkevents.com/
```

**Validation Method 2 - Browser DevTools:**
1. Open browser DevTools (F12)
2. Go to Network tab
3. Navigate to `https://grantparkevents.com`
4. Check first request
5. Status should be `301 Moved Permanently`
6. Location header should point to `https://www.grantparkevents.com/`

**Validation Method 3 - Online Tool:**
- Use: https://httpstatus.io
- Enter: `https://grantparkevents.com`
- Should show 301 redirect to www version

**Pass Criteria:** All three validation methods confirm 301 redirect

---

### AC3: Path Preservation
**Requirement:** Redirect preserves full URL path and query parameters

**Test Cases:**

| Input URL | Expected Redirect Target | Pass/Fail |
|-----------|-------------------------|-----------|
| `https://grantparkevents.com/` | `https://www.grantparkevents.com/` | |
| `https://grantparkevents.com/about` | `https://www.grantparkevents.com/about` | |
| `https://grantparkevents.com/signup` | `https://www.grantparkevents.com/signup` | |
| `https://grantparkevents.com/events/2026-05-15-concert-123` | `https://www.grantparkevents.com/events/2026-05-15-concert-123` | |
| `http://grantparkevents.com/about` | `https://www.grantparkevents.com/about` | |

**Validation Method:**
```bash
# Test each URL
curl -L -I https://grantparkevents.com/about 2>&1 | grep -E "(HTTP|location:)"
```

**Pass Criteria:** All 5 test cases redirect correctly with path intact

---

### AC4: Email Campaign URL Consistency
**Requirement:** Generated email campaigns use www domain in all links

**Validation Method:**
1. Admin Panel → Email Campaigns tab
2. Create test campaign with events
3. Click "📄 Preview HTML"
4. Right-click → View Page Source
5. Search for `https://grantparkevents.com` (without www)

**Expected Result:** Zero matches

**Pass Criteria:** All event links, images, and assets use www domain

---

### AC5: Google Search Console Detection
**Requirement:** GSC recognizes naked URLs as redirects within 7 days

**Validation Method:**
1. Open Google Search Console
2. Use URL Inspection tool
3. Test URL: `https://grantparkevents.com/about`
4. Check "Coverage" section

**Expected Result:**
```
URL is a redirect
Redirect target: https://www.grantparkevents.com/about
```

**Timeline:** May take 3-7 days after deployment

**Pass Criteria:** At least 3 sample naked URLs show redirect status in GSC

---

### AC6: Indexed Page Count Reduction
**Requirement:** Duplicate page count in GSC decreases over 2-4 weeks

**Baseline Measurement (Before Deployment):**
- Record current total indexed pages from GSC
- Record results from: `site:grantparkevents.com -site:www.grantparkevents.com`

**Validation Method:**
**Week 1:**
```
site:grantparkevents.com -site:www.grantparkevents.com
```
Expect: ~75-90% of original count (redirects being detected)

**Week 2:**
```
site:grantparkevents.com -site:www.grantparkevents.com
```
Expect: ~40-60% of original count (deindexing in progress)

**Week 4:**
```
site:grantparkevents.com -site:www.grantparkevents.com
```
Expect: <10% of original count (mostly complete)

**Pass Criteria:** 90%+ reduction in naked domain indexed pages by Week 4

---

### AC7: No Redirect Loops
**Requirement:** WWW URLs load directly without redirect chains

**Validation Method:**
```bash
curl -L -I https://www.grantparkevents.com/about 2>&1 | grep -c "HTTP"
```

**Expected Result:** `2` (initial request + 200 OK response, no redirects)

**Test Cases:**
- `https://www.grantparkevents.com/`
- `https://www.grantparkevents.com/about`
- `https://www.grantparkevents.com/signup`

**Pass Criteria:** All www URLs return HTTP 200 without any 3xx redirects

---

### AC8: Sitemap Consistency Check
**Requirement:** All sitemap URLs use www domain

**Validation Method:**
```bash
# Check static sitemap
curl https://www.grantparkevents.com/sitemap-pages.xml | grep -o "https://grantparkevents.com[^<]*" | grep -v "www"

# Check dynamic sitemap
curl https://www.grantparkevents.com/.netlify/functions/sitemap-events | grep -o "https://grantparkevents.com[^<]*" | grep -v "www"
```

**Expected Result:** Zero matches for both commands

**Pass Criteria:** All sitemap URLs use www domain exclusively

---

## 5. Rollback Plan

### Scenario 1: Redirect Causes Site Issues
**Symptoms:** Site inaccessible, redirect loops, 500 errors

**Immediate Action:**
1. Access Netlify Dashboard
2. Rollback to previous deployment (Build10.14)
3. Site returns to previous state (no redirects, but duplicates remain)

**Investigation:**
- Check Netlify deploy logs for redirect rule errors
- Verify `_redirects` file syntax
- Test redirect rules in isolation

**Resolution:**
- Fix redirect syntax if malformed
- Redeploy corrected version

---

### Scenario 2: SEO Ranking Drop Detected
**Symptoms:** Significant traffic decrease in Google Analytics

**Timeline:** Monitor first 2 weeks post-deployment

**Expected vs Concerning:**
- **Expected:** 5-10% temporary fluctuation as Google recrawls
- **Concerning:** >20% sustained drop for 7+ days

**Action Plan:**
1. Check GSC for crawl errors or manual actions
2. Verify redirects working correctly (AC2)
3. Check for broken internal links
4. If severe (>30% drop), consider temporary rollback while investigating
5. Consult SEO specialist if drop persists beyond 14 days

**Note:** Minor ranking fluctuations are normal during domain consolidation.

---

### Scenario 3: Email Campaigns Show Broken Links
**Symptoms:** Recipients report 404 errors in email links

**Immediate Action:**
1. Check email campaign preview in admin panel
2. Verify all links use www domain (AC4)
3. Test sample links manually

**If Links Broken:**
- Check if redirect is functioning (AC2)
- Verify generate-email-html.js changes deployed correctly
- Send test campaign to internal email for validation

**Mitigation:**
- Previous email campaigns already sent cannot be fixed
- New campaigns use corrected www domain
- Redirects handle old naked domain links gracefully

---

## 6. Long-Term Monitoring

### Monthly Checks (First 3 Months)

**Google Search Console:**
- Review "Pages" report for redirect count trends
- Check for new indexing issues
- Monitor "Coverage" report for errors

**Site Search Test:**
```
site:grantparkevents.com -site:www.grantparkevents.com
```
- Should show decreasing results over time
- Target: <5 results by Month 3

**Analytics Review:**
- Compare organic traffic month-over-month
- Check for URL parameter issues
- Verify no significant ranking drops

---

### Quarterly Audits

**Code Consistency Scan:**
```bash
# Run quarterly to catch any new naked domain references
grep -r "https://grantparkevents.com[^w]" --include="*.html" --include="*.js" . | \
  grep -v node_modules | grep -v ".git"
```

**Redirect Validation:**
- Test redirect functionality quarterly
- Verify 301 status still correct
- Check for redirect chain introduction

---

## 7. Reference Information

### Netlify Redirect Documentation
- Redirects & Rewrites: https://docs.netlify.com/routing/redirects/
- Redirect Options: https://docs.netlify.com/routing/redirects/redirect-options/

### Google Search Console Resources
- URL Inspection Tool: https://support.google.com/webmasters/answer/9012289
- Duplicate Content: https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
- 301 Redirects: https://developers.google.com/search/docs/crawling-indexing/301-redirects

### Testing Tools
- HTTP Status Checker: https://httpstatus.io
- Redirect Checker: https://www.redirect-checker.org
- Screaming Frog (for site-wide audits): https://www.screamingfrogseoseo.com

---

## 8. Related Documentation

**Internal References:**
- `BUILD-VALIDATION-SOP.md` - Standard operating procedures for builds
- `PROJECT-STANDARDS.md` - Overall project standards and guidelines
- Build10.14.1 Release Notes - Specific implementation details

**External Dependencies:**
- Netlify hosting platform
- Google Search Console (GSC)
- Domain registrar (for DNS settings if needed)

---

## Appendix A: File Modification Summary

### Files Modified (5 total)

1. **netlify/functions/generate-email-html.js**
   - Line ~66: Event URL generation
   - Line ~130: Logo image URL
   - Line ~135: QR code image URL
   - Line ~180: Hero image URL
   - Change: naked → www (4 instances)

2. **admin.html**
   - Line ~2450: Email campaign preview URL generation
   - Change: naked → www (1 instance)

3. **_redirects** (NEW FILE)
   - Location: Project root
   - Purpose: 301 redirect naked → www
   - Lines: 5 (includes comments)

4. **version.js**
   - BUILD_VERSION: Update to v2.3.1-Build10.14.1
   - BUILD_NOTES: Document domain consolidation

5. **index.html, admin.html, sw.js**
   - BUILD_VERSION constant updates
   - CACHE_VERSION updates (sw.js only)

### Files NOT Modified (Already Correct)

- ✅ sitemap.xml
- ✅ sitemap-pages.xml
- ✅ netlify/functions/sitemap-events.js
- ✅ netlify/functions/rss-feed.js
- ✅ netlify/functions/gsc-index-status.js
- ✅ admin-index-report.html
- ✅ All other Netlify functions

**Total LOC Changed:** ~15 lines across 5 files

---

## Appendix B: Timeline & Milestones

**Day 0 (Deployment):**
- ✅ Build10.14.1 deployed
- ✅ Redirects active
- ✅ Code consistency achieved

**Day 1-3:**
- 🔄 Initial redirect testing (AC2, AC3, AC7)
- 🔄 Code validation (AC1, AC4, AC8)
- 🔄 Email campaign testing

**Day 3-7:**
- 🔄 Google begins detecting redirects
- 🔄 First GSC redirect signals (AC5)
- 🔄 Monitor for crawl errors

**Week 2:**
- 🔄 GSC shows redirect coverage increasing
- 🔄 Naked URLs begin deindexing
- 🔄 Site search shows reduced duplicates

**Week 3-4:**
- 🔄 Majority of naked URLs deindexed
- 🔄 Indexed page count approaching target
- 🔄 Traffic patterns stabilized

**Month 2:**
- 🔄 90%+ duplicate reduction achieved (AC6)
- 🔄 SEO metrics return to baseline or improve
- 🔄 Transition substantially complete

**Month 3:**
- ✅ Final validation
- ✅ Document lessons learned
- ✅ Update monitoring to quarterly schedule

---

## Appendix C: Common Questions

**Q: Will this affect our current search rankings?**  
A: Minimal impact expected. 301 redirects preserve SEO value. Temporary 5-10% fluctuation is normal during transition. Rankings typically stabilize within 2-4 weeks.

**Q: What about old backlinks pointing to naked domain?**  
A: The 301 redirect handles all old backlinks automatically. They redirect to www version and pass link equity. No action needed.

**Q: Do users need to update bookmarks?**  
A: No. Redirects are transparent. Bookmarks to naked domain automatically redirect to www version.

**Q: How long until Google fully deindexes naked URLs?**  
A: Typically 2-4 weeks for most URLs. Some low-priority pages may take 6-8 weeks. Complete deindexing can take up to 3 months.

**Q: Can we switch back to naked domain later if needed?**  
A: Yes, but discouraged. Each switch causes another 2-4 week transition period. Choose carefully now to avoid future churn.

**Q: Will email campaigns already sent be affected?**  
A: Old campaigns have naked domain links, but redirects handle them gracefully. Recipients clicking old links will be redirected to www version correctly.

**Q: Do we need to notify Google of the change?**  
A: No. Google discovers redirects automatically through crawling. Optional: Use URL Inspection tool to accelerate discovery of specific important pages.

---

## EXECUTIVE SUMMARY & NEXT STEPS

### Current Status (Post-Build10.14.1)

**✅ COMPLETED:**
- Code consolidation: All URLs use `www.grantparkevents.com`
- Email campaign function fixed (4 instances)
- Admin panel fixed (1 instance)  
- Sitemaps, canonicals, OG tags all point to www

**❌ INCOMPLETE:**
- Domain redirect NOT working (Build10.14.1 caused redirect loop)
- Naked domain still accessible (duplicates remain)
- Google still indexes both www and naked URLs

**⚠️ CURRENT STATE:**
- `www.grantparkevents.com` → Works perfectly
- `grantparkevents.com` → May show redirect loop error (depends on rollback status)

---

### Recommended Action Plan

**PHASE 1: Try Netlify Domain Settings UI (RECOMMENDED)**

**Confidence:** 90%  
**Time:** 5 minutes  
**Risk:** Very Low

**Steps:**
1. Go to Netlify Dashboard → Domain Settings
2. Set `www.grantparkevents.com` as Primary Domain
3. Add `grantparkevents.com` as Domain Alias
4. Netlify handles redirect automatically at CDN level
5. Test: Visit `grantparkevents.com` → should redirect to www

**If this works → DONE. No code changes needed.**

---

**PHASE 2: If UI Fails, Build10.14.2 with netlify.toml**

**Confidence:** 75%  
**Time:** 30 minutes + deployment  
**Risk:** Medium

**Changes:**
1. Move domain redirects from `_redirects` to `netlify.toml`
2. Keep all code fixes from Build10.14.1
3. Deploy and test thoroughly
4. Rollback immediately if redirect loop occurs

**If this works → DONE.**

---

**PHASE 3: Nuclear Option - DNS-Level Redirect**

**Confidence:** 95%  
**Time:** 1-2 days (DNS propagation)  
**Risk:** Very Low

**When to use:** Both Phase 1 and Phase 2 fail

**Steps:**
1. Access domain registrar
2. Configure URL forwarding: naked → www
3. Wait 24-48 hours for DNS propagation
4. Most reliable but slowest solution

---

**FALLBACK: Accept Partial Solution**

**If all redirect approaches fail:**
- Keep code fixes from Build10.14.1 (done)
- Accept that both domains remain accessible
- Rely on canonicals for Google preference (50-70% effective)
- Zero technical risk, partial duplicate reduction

---

### Decision Point

**Question for User:**
Which approach do you want to try first?

**Option A:** Netlify UI (5 minutes, 90% confidence)  
**Option B:** Build10.14.2 code changes (30 min, 75% confidence)  
**Option C:** Wait and research DNS-level approach (1-2 days, 95% confidence)  
**Option D:** Accept partial solution (done, 100% safe, 50-70% effective)

**My Recommendation:** Start with Option A (Netlify UI). Easiest, safest, highest confidence.

---

### What Was Learned

1. **_redirects file is NOT for domain-to-domain redirects** - Use netlify.toml or Netlify UI
2. **Service Workers complicate mid-load redirects** - Redirects must happen before page load
3. **Infrastructure-level solutions are more reliable** - DNS/CDN level beats application level
4. **Test assumptions before deploying** - Especially with Service Workers and redirects
5. **Be conservative with confidence levels** - When dealing with infrastructure, 70% is honest

---

**Document Version:** 2.0 (Revised Post-Build10.14.1 Failure)  
**Last Updated:** February 8, 2026  
**Next Review:** After successful redirect implementation
