# BUILD6 RELEASE NOTES
## Grant Park Events v2.3.1-Build6

**Release Date:** February 5, 2026  
**Build Type:** Feature Release (renumbered from Build5.1)  
**Status:** Ready for Deployment

---

## BUILD NUMBER CHANGE DOCUMENTATION

### Previous Build: Build5.1
### Current Build: Build6

**Rationale for Renumbering:**
- Build5.1 contained substantial new features (not just refinements)
- Per PROJECT-STANDARDS.md: "New feature = Build## (increment)"
- Renumbered to Build6 for proper semantic versioning
- Maintains sequential numbering (no skipping)

**What Changed in Renumbering:**
1. version.js: Build5.1 → Build6
2. index.html: Build5.1 → Build6 (2 locations)
3. admin.html: Build5.1 → Build6 (2 locations)
4. sw.js: build5 → build6 (service worker cache)
5. PROJECT-STANDARDS.md: Build5 → Build6 (current stable)

**No Code Changes:** Only version number updates. All functionality identical to Build5.1.

---

## FEATURES IN BUILD6

### FEATURE 1: Image Field Auto-Prepend Directory ✓

**Issue:** Image reference fields required full path `/.netlify/functions/images/filename.jpg`

**Solution:** 
- Field now only accepts filename (e.g., `navy-pier-fireworks.jpg`)
- Directory path `/.netlify/functions/images/` is displayed as read-only prefix
- Label updated: "Hero Image (filename only - directory automatic)"
- Prefix styled with gray background to indicate it's automatic

**User Impact:**
- Easier image entry - just type filename
- Less typing, fewer errors
- Clearer UI indication that directory is automatic

**Location:** Email campaign creation, event editing

**Technical Implementation:**
```javascript
// admin.html Line ~2567
React.createElement('label', { className: '...' }, 
  'Hero Image',
  React.createElement('span', { className: '...' }, '(filename only - directory automatic)')
),
React.createElement('span', { 
  className: 'text-xs text-gray-500 bg-gray-100 px-3 py-3 rounded-lg border-2 border-gray-200' 
}, '/.netlify/functions/images/'),
```

---

### FEATURE 2: Build Metrics Load from CSV ✓

**Issue:** Build metrics showed hardcoded old data (January only)

**Solution:**
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

**Technical Implementation:**
```javascript
// admin.html Line ~356
const [buildMetricsData, setBuildMetricsData] = useState([]);
const [metricsLoading, setMetricsLoading] = useState(true);

useEffect(() => {
  fetch('/docs/METRICS/build-metrics-raw.csv')
    .then(response => response.text())
    .then(csvText => {
      // Parse CSV and aggregate by date
      const lines = csvText.split('\n').slice(1); // Skip header
      const metricsMap = {};
      
      lines.forEach(line => {
        if (!line.trim()) return;
        const [version, build, date, minutes] = line.split(',');
        if (!date || !minutes) return;
        
        // Aggregate minutes by date
        if (!metricsMap[date]) {
          metricsMap[date] = 0;
        }
        metricsMap[date] += parseInt(minutes) || 0;
      });
      
      // Convert to array and sort by date
      const metricsArray = Object.entries(metricsMap)
        .map(([date, minutes]) => ({ date, minutes }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));
      
      setBuildMetricsData(metricsArray);
      setMetricsLoading(false);
    })
    .catch(error => {
      console.error('Error loading metrics:', error);
      setMetricsError('Failed to load metrics data');
      setMetricsLoading(false);
    });
}, []);
```

---

## FILES MODIFIED

### Core Files:
- `admin.html` - Image field UI + metrics CSV fetch
- `index.html` - Version references updated
- `version.js` - Version updated to Build6
- `sw.js` - Cache version updated to build6

### Documentation Files:
- `PROJECT-STANDARDS.md` - Current stable updated to Build6
- `BUILD-VALIDATION-SOP.md` - Updated in Build5.1 (carried forward)

### Total Files Changed: 6

---

## VALIDATION STATUS

✅ **PHASE 1:** File structure complete  
✅ **PHASE 2:** All PWA icons present  
✅ **PHASE 3:** Version consistency verified  
   - version.js: v2.3.1-Build6 ✓
   - index.html: 2 references ✓
   - admin.html: 2 references ✓
   - sw.js: cache version build6 ✓
   - Old version comments preserved (historical context)
✅ **PHASE 4:** manifest.json valid JSON  
✅ **PHASE 5:** JavaScript syntax validated  
✅ **PHASE 6:** Documentation complete  
✅ **PHASE 7:** No breaking changes  

---

## DEPLOYMENT

**Process (unchanged):**
1. Download gpe20-v2.3.1-Build6.zip
2. Unzip
3. Drag to Netlify
4. Deploy (30 seconds)

**No user action required**  
**No breaking changes**  
**Fully backward compatible**

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

### Version Display Test:
1. Public site footer → Should show "Release: v2.3.1-Build6"
2. Admin header → Should show "Release: v2.3.1-Build6"
3. Admin footer → Should show "Release: v2.3.1-Build6"

---

## BACKWARD COMPATIBILITY

✅ Fully backward compatible with Build5  
✅ All Build5 PWA features intact  
✅ No breaking changes  
✅ No database migrations required  
✅ No user settings affected  

---

## VERSION HISTORY CONTEXT

- **Build6** (Current): Image field auto-prepend; metrics CSV fetch
- **Build5**: PWA implementation (icons, manifest, service worker, offline mode)
- **Build4**: Removed duplicate React load (~40KB savings)
- **Build3**: Image redirect, enhanced Images tab, location fix

---

**Release:** v2.3.1-Build6  
**Previous:** v2.3.1-Build5.1 (renumbered)  
**Files Changed:** 6  
**Features Added:** 2  
**Breaking Changes:** 0  
**Deployment Time:** 2 minutes  
**Risk Level:** LOW
