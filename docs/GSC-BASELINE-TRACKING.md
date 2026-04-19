# GOOGLE SEARCH CONSOLE - DUPLICATE URL BASELINE & TRACKING

**Project:** Grant Park Events - Domain Consolidation  
**Baseline Date:** February 9, 2026  
**Redirect Activated:** February 9, 2026 (Netlify Domain Settings UI)  
**Solution:** Option 1 - Netlify Primary Domain Configuration

---

## BASELINE DATA (Pre-Redirect)

**Data Source:** Google Search Console Export  
**Export Date:** February 7-9, 2026  
**Last Crawl Dates:** February 5-7, 2026 (before redirect activation)

### Summary Statistics

```
Total Indexed URLs:          99
Naked Domain URLs:           36  (grantparkevents.com)
WWW Domain URLs:             64  (www.grantparkevents.com)
Duplicate Events:            25  (events indexed on BOTH domains)

Duplicate Impact:
  - Duplicate URLs:          50  (25 events × 2 domains)
  - Duplicate Rate:          51% (50 duplicate URLs / 99 total URLs)
  - Wasted Index Slots:      25  (duplicate entries)
```

### Breakdown by Domain

**Naked Domain (grantparkevents.com): 36 URLs**
- Event pages: ~35 URLs
- Static pages: ~1 URL
- Status: Should redirect to www starting Feb 9

**WWW Domain (www.grantparkevents.com): 64 URLs**
- Event pages: ~62 URLs
- Static pages: ~2 URLs
- Status: Primary domain (correct)

**Duplicate Events: 25 Events**
These events appear on BOTH domains, creating duplicate index entries:
- Navy Pier Summer Fireworks (multiple dates)
- Lollapalooza (multiple dates)
- Chicago Jazz Festival
- Chicago Air and Water Show
- Grant Park Music Festival concerts
- Chicago Blues Festival
- And others

---

## REDIRECT IMPLEMENTATION

**Method:** Netlify Domain Settings UI (Option 1)  
**Configuration Date:** February 9, 2026, 8:34 AM CST  
**Redirect Type:** 301 Permanent Redirect  
**Direction:** `grantparkevents.com` → `www.grantparkevents.com`

### Netlify Configuration

**Primary Domain:** `www.grantparkevents.com`  
**Domain Alias:** `grantparkevents.com` (Redirects automatically to primary domain)  
**SSL Certificate:** Let's Encrypt (Updated Feb 9, 2026)  
**HTTPS:** Enabled and enforced on both domains

### Redirect Validation

**Test Date:** February 9, 2026  
**Method:** httpstatus.io + Browser testing

```
Request:  https://grantparkevents.com
Status:   301 (Permanent Redirect)
Target:   https://www.grantparkevents.com/
Result:   200 (Success)
```

**Path Preservation:** ✅ Confirmed  
**HTTPS Enforcement:** ✅ Confirmed  
**No Redirect Loops:** ✅ Confirmed

---

## EXPECTED DEINDEXING TIMELINE

### Week 1: Feb 9-15, 2026
**Expected Behavior:**
- Google re-crawls naked domain URLs
- Discovers 301 redirects
- Begins marking URLs as redirects in GSC
- Some URLs still indexed (Google hasn't processed yet)

**Expected Metrics:**
```
Naked Domain URLs:  30-36  (no change yet, normal)
Reduction:          0-17%
Status:             Redirects being detected
```

---

### Week 2: Feb 16-22, 2026
**Expected Behavior:**
- More URLs marked as redirects
- Google begins deindexing naked URLs
- Noticeable reduction in duplicate count
- GSC URL Inspection shows redirect status

**Expected Metrics:**
```
Naked Domain URLs:  15-25  (40-60% reduction from baseline)
Reduction:          30-60%
Status:             Active deindexing in progress
```

---

### Week 3: Feb 23 - Mar 1, 2026
**Expected Behavior:**
- Accelerated deindexing
- Most redirects fully processed
- Significant visible reduction
- site: search shows fewer results

**Expected Metrics:**
```
Naked Domain URLs:  5-10   (70-85% reduction from baseline)
Reduction:          70-85%
Status:             Majority deindexed
```

---

### Week 4: Mar 2-8, 2026
**Expected Behavior:**
- Final stragglers removed
- Transition substantially complete
- Duplicate rate at target level
- Index reflects actual content

**Expected Metrics:**
```
Naked Domain URLs:  0-3    (90-95% reduction from baseline)
Reduction:          90-95%
Status:             TARGET ACHIEVED
```

---

### Final State (Week 4+)
**Expected Index State:**
```
Total Indexed URLs:     70-75  (reduced from 99)
Naked Domain URLs:      0-3    (reduced from 36)
WWW Domain URLs:        70-75  (maintained)
Duplicate Rate:         <5%    (reduced from 51%)

URLs Removed:           25-30  (duplicate entries eliminated)
Indexing Efficiency:    95%+   (vs 51% before)
```

---

## MONITORING PROCEDURES

### Weekly Checks (First 4 Weeks)

**Method 1: Google Search Console Export (RECOMMENDED)**

1. Go to Google Search Console
2. Navigate to "Pages" or "Performance" → "Search results"
3. Export indexed URLs list
4. Count URLs by domain:
   ```bash
   # Count naked domain
   grep -c "^https://grantparkevents.com/" exported-file.csv
   
   # Count www domain
   grep -c "^https://www.grantparkevents.com/" exported-file.csv
   ```
5. Record counts in tracking table below

**Method 2: Google Search Query**

1. Open Google.com
2. Search: `site:grantparkevents.com -site:www.grantparkevents.com`
3. Count pages of results (each page ≈ 10 URLs)
4. Record approximate count

**Method 3: GSC URL Inspection Tool**

1. Go to GSC → URL Inspection
2. Test sample naked URLs:
   - `https://grantparkevents.com/about`
   - `https://grantparkevents.com/events/[sample-event]`
3. Verify status shows "URL is a redirect"
4. Check redirect target is www domain

---

## TRACKING TABLE

**Instructions:** Update weekly with GSC export or search count

| Week | Date | Naked URLs | WWW URLs | Total | Reduction | Status |
|------|------|------------|----------|-------|-----------|--------|
| Baseline | Feb 9 | 36 | 64 | 99 | 0% | Redirect activated |
| Week 1 | Feb 15 | ___ | ___ | ___ | ___% | |
| Week 2 | Feb 22 | ___ | ___ | ___ | ___% | |
| Week 3 | Mar 1 | ___ | ___ | ___ | ___% | |
| Week 4 | Mar 8 | ___ | ___ | ___ | ___% | **TARGET** |
| Month 2 | Apr 9 | ___ | ___ | ___ | ___% | |
| Month 3 | May 9 | ___ | ___ | ___ | ___% | Final check |

**Formula for Reduction:**
```
Reduction % = ((Baseline - Current) / Baseline) × 100
Reduction % = ((36 - Current) / 36) × 100
```

**Example:**
- Week 2: 20 naked URLs remaining
- Reduction = ((36 - 20) / 36) × 100 = 44.4%

---

## SUCCESS CRITERIA

**Target:** 90%+ reduction in naked domain URLs by Week 4

**Criteria Met When:**
- ✅ Naked domain URLs ≤ 3 (from 36 baseline)
- ✅ Reduction ≥ 90%
- ✅ Duplicate rate < 5%
- ✅ GSC URL Inspection shows redirect status on naked URLs
- ✅ No redirect loops or errors

**Current Status:** 🟡 In Progress (as of Feb 9, 2026)

---

## TROUBLESHOOTING

### If Naked URLs Not Decreasing by Week 2

**Possible Causes:**
1. Google hasn't re-crawled yet (normal delay)
2. Redirect not working correctly
3. Sitemap still listing naked URLs
4. Canonical tags pointing to naked domain

**Actions:**
1. Verify redirect still working (httpstatus.io test)
2. Check sitemap URLs use www domain
3. Use GSC "Request Indexing" on sample naked URLs
4. Wait 1 more week (Google can be slow)

### If Redirect Loop Detected

**Symptoms:**
- Browser shows "too many redirects" error
- Site inaccessible on naked domain

**Actions:**
1. Check Netlify Domain Settings
2. Verify primary domain is still `www.grantparkevents.com`
3. Verify domain alias is `grantparkevents.com`
4. Contact Netlify support if configuration looks correct

### If SEO Traffic Drops >20%

**Expected:** 5-10% temporary fluctuation is normal  
**Concerning:** >20% sustained drop for 7+ days

**Actions:**
1. Check GSC for crawl errors
2. Verify redirects working (no 404s)
3. Check for manual actions in GSC
4. Review internal links (should use www)
5. Wait 2 weeks before major concern (temporary fluctuations normal)

---

## CODE CHANGES SUMMARY

**Build10.14.1 Code Fixes (Completed):**
- ✅ `netlify/functions/generate-email-html.js` - 4 instances fixed
- ✅ `admin.html` - 1 instance fixed
- ✅ All code now uses `www.grantparkevents.com`
- ✅ Sitemaps use www domain
- ✅ Canonical tags point to www

**Infrastructure Changes:**
- ✅ Netlify primary domain: `www.grantparkevents.com`
- ✅ Netlify domain alias: `grantparkevents.com` (redirects to primary)
- ✅ SSL certificate: Updated Feb 9, 2026
- ✅ No code deployment required (UI configuration only)

**No Additional Builds Needed:**
- Build10.14.2 (netlify.toml approach) was NOT required
- Option 1 (Netlify UI) solved the problem
- Build10.14.1 remains deployed with code fixes

---

## RELATED DOCUMENTATION

**Project Documentation:**
- `/docs/DOMAIN-CONSOLIDATION-WWW.md` - Complete technical specification
- `/docs/BUILD-VALIDATION-Build10.14.1.md` - Build validation summary

**Build History:**
- Build10.14.1 - Code consolidation (all URLs → www)
- Netlify UI Configuration - Domain redirect (Feb 9, 2026)

**GSC Resources:**
- URL Inspection: https://search.google.com/search-console
- Performance Report: Shows indexed URLs and traffic
- Pages Report: Shows indexing status by URL

---

## NOTES & OBSERVATIONS

**Why 51% Duplicate Rate is High:**
- 25 events indexed twice = 50 URLs
- Only 49 unique content pieces
- Wastes half of Google's crawl budget
- Splits page authority across duplicate URLs
- Confuses users (which URL is correct?)

**Why This Matters for SEO:**
- Consolidated authority on single URL per event
- Cleaner index (70-75 URLs vs 99 URLs)
- Better crawl efficiency
- Improved user experience (consistent URLs)
- No mixed canonical signals

**Expected After Transition:**
- One URL per event (no duplicates)
- All URLs use www subdomain
- Cleaner Google index
- Better SEO performance
- Professional URL structure

---

## WEEKLY UPDATE LOG

**Week of Feb 9, 2026:**
- ✅ Baseline established (36 naked URLs)
- ✅ Redirect activated via Netlify UI
- ✅ Redirect validated (301 working correctly)
- 🟡 Awaiting Google re-crawl

**Week of Feb 16, 2026:**
- [ ] GSC export collected
- [ ] Naked URL count recorded
- [ ] Reduction % calculated
- [ ] Notes:

**Week of Feb 23, 2026:**
- [ ] GSC export collected
- [ ] Naked URL count recorded
- [ ] Reduction % calculated
- [ ] Notes:

**Week of Mar 2, 2026:**
- [ ] GSC export collected
- [ ] Naked URL count recorded
- [ ] Reduction % calculated
- [ ] Success criteria check
- [ ] Notes:

---

**Document Version:** 1.0  
**Created:** February 9, 2026  
**Last Updated:** February 9, 2026  
**Next Update:** February 15, 2026 (Week 1 check)  
**Monitoring Frequency:** Weekly for 4 weeks, then monthly for 3 months
