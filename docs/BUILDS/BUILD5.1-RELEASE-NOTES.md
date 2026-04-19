# BUILD5.1 RELEASE NOTES
## Grant Park Events v2.3.1-Build5.1

**Release Date:** February 5, 2026  
**Build Type:** Minor Refinements  
**Status:** Ready for Deployment

---

## CHANGES IN BUILD5.1

### FIX 1: Image Field Auto-Prepend Directory ✓

**Issue:** Image reference fields required full path `/.netlify/functions/images/filename.jpg`

**Fix:** 
- Field now only accepts filename (e.g., `navy-pier-fireworks.jpg`)
- Directory path `/.netlify/functions/images/` is displayed as read-only prefix
- Label updated: "Hero Image (filename only - directory automatic)"
- Prefix styled with gray background to indicate it's automatic

**User Impact:**
- Easier image entry - just type filename
- Less typing, fewer errors
- Clearer UI indication that directory is automatic

**Location:** Email campaign creation, event editing

---

### FIX 2: Build Metrics Load from CSV ✓

**Issue:** Build metrics showed hardcoded old data (January only)

**Fix:**
- Now fetches data from `/docs/METRICS/build-metrics-raw.csv`
- Metrics update automatically when CSV is updated
- Shows current data (all builds through today)
- Added loading state while fetching data
- Added error handling if CSV fails to load
- Summary stats calculated from actual data (total days, hours, avg per day)

**User Impact:**
- Always shows current metrics
- No need to manually update admin.html
- Click Build Metrics tab → See 100% current data

---

## TECHNICAL DETAILS

### Files Modified:
- `admin.html` (2 fixes)
- `version.js` (version update)

### Changes Made:

**admin.html Line ~2567:**
```javascript
// Before:
React.createElement('label', { className: '...' }, 'Hero Image'),
React.createElement('span', { className: '...' }, '/.netlify/functions/images/'),

// After:
React.createElement('label', { className: '...' }, 
  'Hero Image',
  React.createElement('span', { className: '...' }, '(filename only - directory automatic)')
),
React.createElement('span', { 
  className: 'text-xs text-gray-500 bg-gray-100 px-3 py-3 rounded-lg border-2 border-gray-200' 
}, '/.netlify/functions/images/'),
```

**admin.html Line ~356:**
```javascript
// Before:
const buildMetricsData = [
  {date: '2026-01-22', minutes: 20},
  // ... hardcoded data
];

// After:
const [buildMetricsData, setBuildMetricsData] = useState([]);
const [metricsLoading, setMetricsLoading] = useState(true);

useEffect(() => {
  fetch('/docs/METRICS/build-metrics-raw.csv')
    .then(response => response.text())
    .then(csvText => {
      // Parse CSV and aggregate by date
      // ...
      setBuildMetricsData(metricsArray);
      setMetricsLoading(false);
    });
}, []);
```

---

## VALIDATION STATUS

✓ Version consistency verified  
✓ No old Build5 references (except comments)  
✓ Image field implementation correct  
✓ Metrics CSV fetch implemented  
✓ Loading states added  
✓ Error handling added  

---

## DEPLOYMENT

**Same process as always:**
1. Download zip
2. Unzip
3. Drag to Netlify
4. Deploy (30 seconds)

**No breaking changes**  
**No user action required**

---

## TESTING AFTER DEPLOYMENT

### Image Field Test:
1. Go to Admin → Email Campaigns
2. Create new campaign
3. Hero Image field should show:
   - Label: "Hero Image (filename only - directory automatic)"
   - Gray box prefix: "/.netlify/functions/images/"
   - Input field: Just enter filename
4. Enter just `navy-pier.jpg`
5. Preview should load automatically

### Metrics Test:
1. Go to Admin → Build Metrics
2. Should show loading state briefly
3. Should display current data from CSV
4. Total days/hours should be up to date
5. Chart should show all data through today

---

## BACKWARD COMPATIBILITY

✓ Fully backward compatible with Build5  
✓ All Build5 features intact  
✓ PWA features unchanged  
✓ No breaking changes

---

**Release:** v2.3.1-Build5.1  
**Files Changed:** 2  
**Issues Fixed:** 2  
**Deployment Time:** 2 minutes  
**Risk Level:** LOW
