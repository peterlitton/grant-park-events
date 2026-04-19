# BUILD6.1 RELEASE NOTES
## Grant Park Events v2.3.1-Build6.1

**Release Date:** February 5, 2026  
**Build Type:** Minor Refinements  
**Status:** Ready for Deployment

---

## CHANGES IN BUILD6.1

### FIX 1: Service Worker Version Display ✓

**Issue:** Service worker console log showed "Build5" instead of "Build6"

**Root Cause:** Comment in sw.js not updated during Build5 → Build6 renumbering

**Fix:** 
- Updated sw.js comment: `// Build6.1 - v2.3.1`
- Cache version already correct: `gpe-v2.3.1-build6.1`
- Console now shows: `[Service Worker] Loaded: gpe-v2.3.1-build6.1`

**Impact:** Cosmetic fix - helps with debugging and version tracking

---

### FIX 2: Hide Past Events by Default ✓

**Issue:** Past events cluttering "My Events" tab in admin panel

**Requirements:**
- Hide past events by default
- Add toggle to show/hide
- Show count of hidden past events
- Make toggle easy to find

**Implementation:**

**1. Past Event Detection:**
```javascript
const isEventPast = (event) => {
  // Uses event.date + event.endTime (or event.time if no endTime)
  // Compares to current date/time
  // Returns true if event has ended
}
```

**2. Filter Logic:**
```javascript
const filteredEvents = events
  .filter(e => {
    // Search filter
    if (!e.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    // Past events filter (hide by default unless toggle is on)
    if (!showPastEvents && isEventPast(e)) {
      return false;
    }
    return true;
  })
  .sort(...);

// Calculate past events count
const pastEventsCount = events.filter(e => isEventPast(e)).length;
```

**3. Toggle in Total Events Block:**
- Block is now clickable
- Shows blue ring when past events visible
- Displays count of hidden past events
- One-click toggle to show/hide

**UI States:**
```
Default (past hidden):
  "X past events hidden (click to show)"
  
Active (past shown):
  "✓ Showing X past events"
  [Blue ring around block]
```

**Benefits:**
- Cleaner default view (only upcoming/current events)
- Easy access to past events when needed
- Visual indicator when past events are shown
- No past events lost - just hidden by default

---

### ADDITION: Subscribers Tab Placeholder ✓

**Added:** New tab button "👥 Subscribers" after "📨 Email Campaigns"

**Content:** Placeholder page for future MailerLite integration
```
👥
Subscribers Dashboard
MailerLite subscriber analytics and activity tracking

🔧 Coming in future build: Subscriber growth charts, 
   activity tracking, and campaign engagement metrics
```

**Purpose:** Reserve UI space for future MailerLite dashboard feature

**Note:** Peter confirmed MailerLite integration is possible and will be implemented in future build

---

## TECHNICAL DETAILS

### Files Modified:
- `admin.html` (3 changes)
- `version.js` (version update)
- `sw.js` (comment fix)
- `index.html` (version update)
- `PROJECT-STANDARDS.md` (version update)

### Code Changes:

**admin.html:**

**1. Added state:**
```javascript
const [showPastEvents, setShowPastEvents] = useState(false);
```

**2. Updated filteredEvents:**
```javascript
.filter(e => {
  // Search filter
  if (!e.title.toLowerCase().includes(searchTerm.toLowerCase())) {
    return false;
  }
  // Past events filter
  if (!showPastEvents && isEventPast(e)) {
    return false;
  }
  return true;
})
```

**3. Added past events counter:**
```javascript
const pastEventsCount = events.filter(e => isEventPast(e)).length;
```

**4. Made Total Events block clickable:**
```javascript
React.createElement('div', {
  onClick: () => setShowPastEvents(!showPastEvents),
  className: `...cursor-pointer hover:... ${showPastEvents ? 'ring-2 ring-blue-500' : ''}`
},
  // ... existing content ...
  pastEventsCount > 0 && React.createElement('div', { className: 'text-sm mt-2 font-semibold' }, 
    React.createElement('span', { className: showPastEvents ? 'text-blue-600' : 'text-gray-500' },
      showPastEvents ? `✓ Showing ${pastEventsCount} past events` : 
                      `${pastEventsCount} past events hidden (click to show)`
    )
  )
)
```

**5. Added Subscribers tab:**
- New tab button in navigation
- Placeholder content page
- Reserved for future MailerLite integration

---

## VALIDATION STATUS

✓ Version consistency verified  
✓ No old Build6 references (except Build6.1)  
✓ Service worker version correct  
✓ Past events filter working  
✓ Toggle functionality tested  
✓ No breaking changes  

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

### Admin Panel Tests:

**1. Past Events Toggle (2 minutes):**
1. Go to Admin → My Events
2. Check Total Events block
3. Should show: "X past events hidden (click to show)"
4. Click the block
5. Block should get blue ring
6. Past events should appear in list (grayed out)
7. Text should change to: "✓ Showing X past events"
8. Click again to hide

**2. Service Worker Version (30 seconds):**
1. Open Admin page
2. Open browser console (F12)
3. Look for: `[Service Worker] Loaded: gpe-v2.3.1-build6.1`
4. Should NOT show "build5"

**3. Subscribers Tab (30 seconds):**
1. Click "👥 Subscribers" tab
2. Should show placeholder page
3. Message: "Coming in future build..."

### Public Site:
- No changes - all PWA features from Build6 intact
- Footer still shows: "Release: v2.3.1-Build6.1"

---

## USER EXPERIENCE

### Admin Users See:

**Before Build6.1:**
- All events visible (including past)
- Past events clutter the list
- Hard to find upcoming events
- Service worker console showed "Build5"

**After Build6.1:**
- Only upcoming events by default ✓
- Clean, focused event list ✓
- Past events accessible with one click ✓
- Count of hidden past events visible ✓
- Service worker shows correct version ✓
- New Subscribers tab (placeholder) ✓

**Benefits:**
- Cleaner admin interface
- Faster to find upcoming events
- Past events not lost - just hidden
- Clear visual feedback

---

## BACKWARD COMPATIBILITY

✓ Fully backward compatible with Build6  
✓ All Build6 features intact  
✓ PWA features unchanged  
✓ Default behavior better (hides past events)  
✓ No breaking changes  

---

## WHAT'S NEXT

**Future Build - MailerLite Integration:**
Peter confirmed MailerLite subscriber dashboard is possible. Future build will include:
- Subscriber count and growth charts
- Recent signups list
- Campaign engagement metrics
- Activity tracking
- Subscriber source breakdown

Requires:
- Netlify Function: `/functions/get-mailerlite-subscribers`
- MailerLite API key configuration
- Data visualization (charts)

---

## KNOWN ISSUES RESOLVED

1. ✅ Service worker showing "Build5" → Fixed (now shows Build6.1)
2. ✅ Past events cluttering admin → Fixed (hidden by default with toggle)
3. ✅ No past events counter → Fixed (shows in Total Events block)

---

**Release:** v2.3.1-Build6.1  
**Files Changed:** 5  
**Features Added:** 1 (past events toggle)  
**Bugs Fixed:** 1 (sw.js version display)  
**Risk Level:** LOW  
**Deployment Time:** 2 minutes
