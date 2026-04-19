# COMPREHENSIVE HANDOFF DOCUMENT
# Grant Park Events Project - Build79 Stable Release
# For: Next Claude Sonnet Session
# From: Claude Sonnet (Build73.21-79 Development Session)
# Date: February 3, 2026

---

## 🎯 EXECUTIVE SUMMARY

**Current State:** v2.3.0-Build79 (STABLE - Production Ready)  
**Last Stable Build:** `/home/claude/gpe20-v2.3.0-build79`  
**Project:** Grant Park Events - Chicago event calendar (grantparkevents.com)  
**Platform:** Netlify (React without JSX, Tailwind CSS)  
**Status:** All major mobile modal issues resolved, cross-browser compatible

**THIS DOCUMENT PURPOSE:**
This is your complete orientation to the Grant Park Events project. Read this ENTIRE document before beginning any work. It contains zero ambiguity and exhaustive detail to ensure you can maintain the project's quality standards and build processes without gaps in understanding.

---

## 📚 TABLE OF CONTENTS

1. **CRITICAL INFORMATION YOU MUST KNOW FIRST**
2. **PROJECT CONTEXT & STANDARDS**
3. **CURRENT STATE - BUILD79 DETAILS**
4. **BUILD PROGRESSION HISTORY (Build73.21-79)**
5. **KEY LEARNINGS & PATTERNS**
6. **PROCESSES & WORKFLOWS**
7. **DOCUMENTATION LOCATIONS**
8. **TECHNICAL STACK & CONSTRAINTS**
9. **PETER'S EXPECTATIONS & WORK STYLE**
10. **HOW TO PROCEED WITH BUILD80+**
11. **TROUBLESHOOTING & DECISION TREES**
12. **APPENDICES & QUICK REFERENCES**

---

## 1. CRITICAL INFORMATION YOU MUST KNOW FIRST

### 🚨 **MANDATORY FIRST ACTION BEFORE ANY WORK**

**BEFORE you write any code, create any file, or make any changes:**

```bash
# Execute this command:
view /home/claude/gpe20-v2.3.0-build79/docs/SOPs/PROJECT-STANDARDS.md
```

**WHY THIS IS NON-NEGOTIABLE:**
- Contains current project conventions
- Lists active standards and patterns
- Documents Peter's requirements
- Updated with each major build
- **NOT reading this = immediate quality issues**

### 🚨 **ZERO TOLERANCE FOR PRODUCTION ISSUES**

**Peter's Standard:** Every build must be gold-standard quality before delivery.

**What this means:**
- No "try it and see" deployments
- No partially tested builds
- No syntax errors ever reach production
- No regressions from previous builds
- Complete validation before marking "VALIDATED"

**Consequence of violation:** Loss of trust, project delays, frustration

### 🚨 **BUILD VALIDATION IS MANDATORY**

**Every single build must pass:**

```bash
# This is your bible:
view /home/claude/gpe20-v2.3.0-build79/docs/SOPs/BUILD-VALIDATION-SOP.md
```

**What validation includes:**
1. Syntax validation (no errors)
2. Version consistency check (version.js matches index.html)
3. Regression testing (previous features still work)
4. New feature verification (implemented correctly)
5. Documentation completeness (release notes exist)
6. File organization (proper directory structure)

**If you skip validation:** You will create production issues.

### 🚨 **FILE LOCATIONS - WHERE EVERYTHING IS**

**Current Stable Build:**
```
/home/claude/gpe20-v2.3.0-build79/
```

**Always work from the stable build directory. Never work from nested subdirectories (gpe20-v2.3.0-build73.5, etc.) - those are historical artifacts.**

**Documentation Structure:**
```
/home/claude/gpe20-v2.3.0-build79/
├── docs/
│   ├── SOPs/                          ← Process documents (READ FIRST)
│   │   ├── PROJECT-STANDARDS.md       ← READ BEFORE ANY WORK
│   │   ├── BUILD-VALIDATION-SOP.md    ← Validation requirements
│   │   └── MOBILE-POSITIONING-GUIDELINES.md
│   ├── BUILDS/
│   │   ├── RELEASE-NOTES/             ← All build release notes
│   │   ├── STABLE-DECLARATIONS/       ← Stable build declarations
│   │   └── VALIDATION-REPORTS/        ← Historical validation reports
│   ├── CASE-STUDIES/                  ← Problem-solving documentation
│   └── ROADMAP/                       ← Future features
├── index.html                         ← Main application file
├── version.js                         ← Version tracking
└── BUILD79-RELEASE-NOTES.md          ← Current build notes (root level too)
```

### 🚨 **OPUS CONSULTATION PATTERN**

**When you get stuck (more than 3 failed attempts):**

1. **DON'T continue trial-and-error**
2. **DO create an Opus consultation package:**
   - Problem statement
   - What you've tried
   - Code samples
   - Specific questions
3. **Hand to user** who will send to Opus
4. **Implement Opus's solution exactly as specified**

**Proven Example:** Build74-74.3 sticky X button issue → Opus identified solution in our own codebase (nav arrows) → Build75 success

**This pattern works. Use it.**

---

## 2. PROJECT CONTEXT & STANDARDS

### **Project Overview**

**Name:** Grant Park Events  
**URL:** https://grantparkevents.com  
**Purpose:** Comprehensive event calendar for Chicago's Grant Park area

**Target Users:**
- Event-goers (50% mobile, 50% desktop)
- Event organizers
- Chicago community

**Core Functionality:**
- Browse events by date (calendar view, list view)
- Search and filter events
- View event details (modal on desktop/tablet, dedicated page on mobile)
- Share events (native share + social links)
- Add to calendar (Apple, Google, Outlook)
- SEO optimized (Google Event schema)

### **Technical Stack**

**Hosting:** Netlify
- All code must comply with Netlify documentation
- Netlify Functions for serverless operations
- Netlify Blobs for data storage
- Netlify deployment pipeline

**Frontend:**
- React (without JSX - uses `React.createElement`)
- Tailwind CSS for styling
- No build step for React (CDN imports)
- Lucide React for icons

**Why React without JSX:**
- Simplicity (no build step)
- Direct manipulation
- Peter's preference for this project

**Key Libraries:**
- Plotly.js (analytics dashboards)
- EmailOctopus/MailerLite (email campaigns)
- Papaparse (CSV processing)
- SheetJS (Excel processing)

### **Critical Constraints**

**NEVER:**
- Use localStorage/sessionStorage in artifacts (not supported in Claude.ai environment)
- Ignore Netlify documentation when using Netlify features
- Skip PROJECT-STANDARDS.md before starting work
- Deploy untested code
- Create builds without complete release notes

**ALWAYS:**
- Read relevant SKILL.md files before creating docx/pptx/xlsx/pdf files
- Follow BUILD-VALIDATION-SOP.md for every build
- Use Tailwind classes when possible (avoid custom CSS unless necessary)
- Preserve scroll position when locking body scroll
- Test on multiple browsers (especially Safari iOS, Chrome iOS, Edge iOS)

### **Peter's Work Style & Expectations**

**Communication Preferences:**
- Clear, concise explanations
- Evidence-based recommendations
- Systematic investigation over trial-and-error
- Honest assessment of complexity/risk

**Quality Standards:**
- Zero tolerance for production issues
- Complete testing before delivery
- Comprehensive documentation
- Professional release notes

**Decision-Making:**
- Provide options with recommendations
- Explain trade-offs clearly
- Ask clarifying questions before implementation
- Confirm approach before proceeding on complex tasks

**Frustration Triggers:**
- Repeated simple mistakes
- Lack of systematic debugging
- Missing context in responses
- Excessive iterations for simple tasks

**What Peter Values:**
- Thoroughness over speed
- Learning from failures
- Pattern recognition
- Professional execution

---

## 3. CURRENT STATE - BUILD79 DETAILS

### **Build79 Status**

**Version:** v2.3.0-Build79  
**Status:** ✅ FINAL AND STABLE  
**Declared:** February 3, 2026  
**Release Notes:** `/home/claude/gpe20-v2.3.0-build79/docs/BUILDS/RELEASE-NOTES/BUILD79-RELEASE-NOTES.md`

**What Build79 Solved:**
Chrome mobile viewport issue - modal was extending past visible screen area (top and bottom). Reduced modal max-height from 90vh to 85vh to fit within viewport accounting for padding.

**Why It's Stable:**
- User confirmed "Solved"
- Works on Safari iOS (perfect)
- Works on Chrome iOS (fixed)
- Works on Edge iOS (perfect)
- Works on desktop (all browsers)
- Single property change (low risk)
- No regressions from Build78

### **Complete Feature Set in Build79**

**From Build75 (Sticky X Button):**
- X button stays visible during scroll
- Uses sticky wrapper pattern from navigation arrows
- Positioned 16px from top/right of modal content
- No white gap issues
- Fully clickable and functional

**From Build76.1 (Modal Spacing & Safari Scroll):**
- 40px top padding on modal container (`pt-10`)
- Grey backdrop covers entire viewport (`inset-0`)
- Webkit overflow scrolling for iOS (`WebkitOverflowScrolling:'touch'`)
- Smooth momentum scrolling on Safari

**From Build77 (Mobile Title Size):**
- Event titles: 24px on mobile (`text-2xl`), 36px on desktop (`text-4xl`)
- 33% size reduction on mobile (requested 30%, using Tailwind scale)
- Improves readability and reduces visual clutter

**From Build78 (Backdrop & Scroll Lock):**
- Full viewport backdrop coverage (no gaps)
- Aggressive body scroll lock (`position: fixed`)
- Scroll position preservation on modal close
- Prevents page scrolling behind modal

**From Build79 (Chrome Mobile Viewport):**
- Modal max-height: 85vh (was 90vh)
- Fits within viewport with padding
- Consistent appearance across all mobile browsers

### **Current File Structure**

```
/home/claude/gpe20-v2.3.0-build79/
├── index.html (2,311 lines)
├── version.js
├── style.css
├── admin.html
├── analytics.js
├── functions.js
├── netlify/
│   └── functions/
│       ├── scrape-event.js
│       └── [other functions]
├── docs/
│   ├── SOPs/
│   │   ├── PROJECT-STANDARDS.md
│   │   ├── BUILD-VALIDATION-SOP.md
│   │   └── MOBILE-POSITIONING-GUIDELINES.md
│   ├── BUILDS/
│   │   ├── RELEASE-NOTES/
│   │   │   ├── BUILD73.21-RELEASE-NOTES.md
│   │   │   ├── BUILD75-RELEASE-NOTES.md
│   │   │   ├── BUILD76-RELEASE-NOTES.md
│   │   │   ├── BUILD76.1-RELEASE-NOTES.md
│   │   │   ├── BUILD77-RELEASE-NOTES.md
│   │   │   ├── BUILD78-RELEASE-NOTES.md
│   │   │   └── BUILD79-RELEASE-NOTES.md
│   │   └── STABLE-DECLARATIONS/
│   │       ├── BUILD75-STABLE-RELEASE-DECLARATION.md
│   │       ├── BUILD76.1-STABLE-RELEASE-DECLARATION.md
│   │       ├── BUILD78-STABLE-RELEASE-DECLARATION.md
│   │       └── BUILD79-STABLE-RELEASE-DECLARATION.md
│   └── CASE-STUDIES/
│       └── mobile-icon-positioning-flexbox-constraints.md
└── [76+ published events in Netlify Blobs]
```

### **Critical Code Locations in Build79**

**Modal Container (Line ~1847):**
```javascript
e('div',{
  className:'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 pt-10 z-50',
  onClick:()=>closeEventModal(true,'background_click')
},
```
- `inset-0`: Full viewport coverage
- `pt-10`: 40px top padding for spacing
- `p-4`: 16px padding on other sides

**Modal Inner Container (Line ~1849):**
```javascript
e('div',{
  className:'bg-white rounded-2xl max-w-4xl w-full max-h-[85vh] overflow-y-auto relative overflow-hidden',
  style:{WebkitOverflowScrolling:'touch'},
  onClick:(ev)=>ev.stopPropagation(),
```
- `max-h-[85vh]`: 85% of viewport height (Build79 change)
- `WebkitOverflowScrolling:'touch'`: iOS momentum scrolling

**Sticky X Button (Line ~1875):**
```javascript
e('div',{
  className:'sticky z-50',
  style:{
    top:'16px',
    height:'0',
    pointerEvents:'none'
  }
},
  e('button',{
    onClick:()=>closeEventModal(true,'close_button'),
    className:'absolute top-0 right-4 bg-white rounded-full p-2 hover:bg-gray-200',
    style:{
      boxShadow:'0 4px 12px rgba(0,0,0,0.3)',
      pointerEvents:'auto'
    }
  },
    e(X,{size:24})
  )
)
```
- Wrapper: sticky with height:0 (removes from flow)
- Button: absolute positioned inside wrapper

**Event Title - Modal (Line ~1973):**
```javascript
e('h2',{
  className:'text-2xl sm:text-4xl font-bold flex-1'
},selectedEvent.title)
```
- Mobile (<640px): 24px (`text-2xl`)
- Desktop (≥640px): 36px (`text-4xl`)

**Body Scroll Lock - Open (Line ~1074):**
```javascript
const scrollY = window.scrollY;
document.body.style.overflow = 'hidden';
document.body.style.position = 'fixed';
document.body.style.width = '100%';
document.body.style.top = `-${scrollY}px`;
```

**Body Scroll Lock - Close (Line ~1093):**
```javascript
const scrollY = document.body.style.top;
document.body.style.overflow = '';
document.body.style.position = '';
document.body.style.width = '';
document.body.style.top = '';
if(scrollY){
  window.scrollTo(0, parseInt(scrollY || '0') * -1);
}
```

---

## 4. BUILD PROGRESSION HISTORY (Build73.21-79)

### **Why This History Matters**

Understanding how we got to Build79 prevents repeating mistakes and reveals proven patterns. Each build solved a specific problem and taught us something valuable.

### **Build73.21 - Starting Point**
**Status:** Previous stable (before this session)  
**Key Features:**
- Event modal working
- Share icons functional
- Mobile positioning solved (after 73.13-73.20 iterations)

**Known Issues:**
- X button not sticky (scrolled away)
- Modal frame too high on mobile

### **Build74 Series - Sticky X Button Attempts (FAILED)**

**Build74 (FAILED):**
- **Attempt:** Added `float: right` + `position: sticky` to X button
- **Result:** White gap appeared above hero image
- **Why it failed:** `float: right` put button in document flow, pushing content down

**Build74.1 (FAILED - Syntax Error):**
- **Attempt:** Zero-height wrapper + `left: calc(100% - 56px)`
- **Result:** Syntax error - page wouldn't load
- **Why it failed:** Trailing comma in React.createElement after className

**Build74.2 (FAILED):**
- **Attempt:** Fixed syntax error
- **Result:** Button didn't float to right edge, too close to top
- **Why it failed:** `left: calc()` calculation unreliable

**Build74.3 (FAILED - Untested):**
- **Attempt:** Flexbox approach with `justify-content: flex-end`
- **Result:** Never tested in production
- **Why it failed:** Put sticky on button inside height:0 container (breaks sticky behavior)

**Key Learning:** Trial-and-error wasn't working. Needed expert consultation.

### **Opus Consultation - The Breakthrough**

**Action Taken:** Created comprehensive consultation package for Claude Opus with:
- All 4 failed attempts documented
- Specific technical questions
- Code samples from failed builds
- Request for step-by-step solution

**Opus's Key Insight:**
> "The navigation arrows (lines 1873-1897) already implement exactly what you need - a sticky element with height: 0 that doesn't push content."

**The Solution Was In Our Own Codebase:**
- Nav arrows use sticky wrapper + absolute button pattern
- Pattern already proven to work
- Just needed to adapt for top-right positioning

**Lesson:** Check your own codebase first. Don't reinvent the wheel.

### **Build75 - STABLE (Opus Solution)**
**Status:** ✅ STABLE  
**Date:** February 3, 2026

**What Changed:**
- Implemented Opus's solution: sticky wrapper + absolute button
- Copied pattern from navigation arrows (lines 1873-1897)

**Code:**
```javascript
e('div',{
  className:'sticky z-50',
  style:{top:'16px', height:'0', pointerEvents:'none'}
},
  e('button',{
    className:'absolute top-0 right-4 bg-white rounded-full p-2 hover:bg-gray-200',
    style:{boxShadow:'0 4px 12px rgba(0,0,0,0.3)', pointerEvents:'auto'}
  },
    e(X,{size:24})
  )
)
```

**Why It Worked:**
- Wrapper is sticky (not button)
- height:0 removes from document flow (no white gap)
- Absolute positioned button inside sticky wrapper
- pointerEvents configured correctly

**Result:** X button stays visible on scroll, no white gap, perfect positioning

**Key Learning:** Systematic investigation + expert consultation > trial-and-error

### **Build76 - Modal Spacing (20px)**
**Status:** Intermediate (improved but not enough)

**Problem:** Modal frame too high on mobile, cutting off top of image

**Solution:** Changed backdrop from `inset-0` to `left-0 right-0 bottom-0 top-5`
- Added 20px grey space at top
- Revealed more of hero image

**Result:** Better but Chrome still hid top few pixels

### **Build76.1 - STABLE (More Spacing + Safari Scroll)**
**Status:** ✅ STABLE  
**Date:** February 3, 2026

**What Changed:**
1. Increased top spacing from 20px to 32px (`top-8`)
2. Added `-webkit-overflow-scrolling: touch` for Safari

**Why:**
- 20px not quite enough for Chrome mobile
- Safari had scroll issue (modal didn't scroll independently)

**Code Changes:**
```javascript
// Backdrop: top-5 → top-8
className:'... top-8 ...'

// Inner container: added webkit scrolling
style:{WebkitOverflowScrolling:'touch'}
```

**Result:** Chrome shows full image, Safari scrolls correctly

**Key Learning:** Mobile browsers have quirks - test on actual devices

### **Build77 - STABLE (Mobile Title Size)**
**Status:** ✅ STABLE (User approved)  
**Date:** February 3, 2026

**Problem:** Event titles too large on mobile (36px overwhelming on small screens)

**User Request:** "Reduce by 30%" (36px × 0.70 = 25.2px)

**Solution:** Used Tailwind `text-2xl sm:text-4xl` (24px mobile, 36px desktop)
- 24px = 33% reduction (close to requested 30%)
- Maintains design system consistency
- Standard Tailwind responsive pattern

**Code:**
```javascript
// Changed from:
className:'text-4xl font-bold'

// To:
className:'text-2xl sm:text-4xl font-bold'
```

**Why 24px (33%) Instead of 25.2px (30%):**
- Tailwind scale: text-2xl = 24px (standard)
- 25.2px is off-scale (not in Tailwind)
- Difference: 1.2px (visually imperceptible)
- Easier maintenance with Tailwind classes

**Result:** Mobile titles more readable, desktop unchanged

**Key Learning:** When user requests specific percentage but Tailwind has close alternative, use Tailwind for design system consistency (with user approval)

### **Build78 - STABLE (Backdrop + Scroll Lock)**
**Status:** ✅ STABLE  
**Date:** February 3, 2026

**Problems (Two Issues):**
1. Grey backdrop didn't cover full viewport (stopped 32px from top)
2. Page still scrolled behind modal (body scroll lock not working)

**Root Causes:**
1. Backdrop had `top-8` from Build76.1 spacing
2. Simple `overflow: hidden` insufficient on iOS/mobile

**Solutions:**

**Issue #1 - Backdrop Coverage:**
```javascript
// Changed from:
className:'fixed left-0 right-0 bottom-0 top-8 ...'

// To:
className:'fixed inset-0 ... pt-10 ...'
```
- `inset-0`: Covers entire viewport
- `pt-10`: 40px padding to maintain modal spacing

**Issue #2 - Aggressive Scroll Lock:**
```javascript
// Open modal:
const scrollY = window.scrollY;
document.body.style.overflow = 'hidden';
document.body.style.position = 'fixed';  // ← More aggressive
document.body.style.width = '100%';
document.body.style.top = `-${scrollY}px`;  // ← Preserve position

// Close modal:
const scrollY = document.body.style.top;
document.body.style.overflow = '';
document.body.style.position = '';
document.body.style.width = '';
document.body.style.top = '';
if(scrollY){
  window.scrollTo(0, parseInt(scrollY || '0') * -1);  // ← Restore position
}
```

**Why This Works:**
- `position: fixed` on body prevents ALL scrolling (more aggressive than overflow)
- Negative `top` preserves visual scroll position
- Restoration on close prevents "jump to top" issue

**Result:** Page completely frozen, grey covers everything, scroll position preserved

**Key Learning:** iOS requires more aggressive scroll locking than desktop browsers

### **Build79 - STABLE (Chrome Mobile Viewport)**
**Status:** ✅ FINAL AND STABLE  
**Date:** February 3, 2026

**Problem:** On Chrome mobile, modal extended past visible viewport (top and bottom)

**Why Safari/Edge Worked but Chrome Didn't:**
- Safari/Edge: Handle flexbox centering gracefully
- Chrome Mobile: Strict viewport calculations
- Math: 90vh modal + 56px padding > 100vh viewport

**Solution:**
```javascript
// Changed from:
max-h-[90vh]

// To:
max-h-[85vh]
```

**Calculation:**
```
Viewport: 100vh
Top padding: 40px (~4vh)
Bottom padding: 16px (~1.6vh)
Modal: 85vh
Total: 85vh + 5.6vh = 90.6vh
Buffer: 9.4vh (~60px on iPhone)
Result: Fits comfortably ✅
```

**Why 85vh:**
- 90vh too tall with padding
- 85vh leaves appropriate margin
- Standard modal height (many libraries use 80-85vh)
- Works on all browsers

**Result:** Chrome mobile matches Safari/Edge behavior

**Key Learning:** Different browsers calculate flexbox + viewport differently - test cross-browser

---

## 5. KEY LEARNINGS & PATTERNS

### **Pattern #1: Sticky Wrapper with Absolute Content**

**Use Case:** Making elements sticky without pushing content

**Code Pattern:**
```javascript
// Wrapper: sticky with height:0
e('div',{
  className:'sticky z-50',
  style:{
    top:'16px',  // Stick position
    height:'0',  // Remove from document flow
    pointerEvents:'none'  // Don't block clicks
  }
},
  // Content: absolute positioned inside
  e('button',{
    className:'absolute top-0 right-4 ...',
    style:{
      pointerEvents:'auto'  // Re-enable clicks
    }
  },...)
)
```

**Why It Works:**
- Wrapper sticks at specified position
- height:0 prevents white gap
- Absolute positioned content positions relative to sticky wrapper
- pointer-events controlled independently

**Where We Use It:**
- X button (Build75)
- Navigation arrows (existing, inspired Build75)

**When to Use:**
- Need sticky element that doesn't push content
- Want to preserve document flow
- Need precise positioning control

### **Pattern #2: Aggressive Body Scroll Lock (iOS Compatible)**

**Use Case:** Prevent page scrolling behind modal (especially iOS/Safari)

**Code Pattern:**
```javascript
// When opening modal:
const scrollY = window.scrollY;
document.body.style.overflow = 'hidden';
document.body.style.position = 'fixed';
document.body.style.width = '100%';
document.body.style.top = `-${scrollY}px`;

// When closing modal:
const scrollY = document.body.style.top;
document.body.style.overflow = '';
document.body.style.position = '';
document.body.style.width = '';
document.body.style.top = '';
if(scrollY){
  window.scrollTo(0, parseInt(scrollY || '0') * -1);
}
```

**Why It Works:**
- `position: fixed` more aggressive than `overflow: hidden`
- Works on iOS where overflow alone fails
- Negative top preserves scroll position visually
- Restoration prevents "jump to top" issue

**Where We Use It:**
- Modal open/close (Build78)

**When to Use:**
- Modal or overlay that should prevent background scrolling
- Need iOS/Safari compatibility
- Must preserve scroll position

### **Pattern #3: Tailwind Responsive Classes for Mobile/Desktop**

**Use Case:** Different styling for mobile vs desktop

**Code Pattern:**
```javascript
// Base class applies to mobile (<640px)
// sm: prefix applies at ≥640px
className:'text-2xl sm:text-4xl font-bold'

// Mobile: text-2xl (24px)
// Desktop: text-4xl (36px)
```

**Why It Works:**
- Mobile-first approach (Tailwind standard)
- Clear breakpoint (640px = sm)
- Maintains design system
- No media queries needed

**Where We Use It:**
- Event titles (Build77)
- Throughout the app for responsive design

**When to Use:**
- Need different sizes/spacing for mobile vs desktop
- Want to use Tailwind design system
- Prefer declarative over imperative styling

### **Pattern #4: Viewport Calculation for Modals**

**Use Case:** Ensure modal fits within viewport with padding

**Formula:**
```
Modal max-height = 100vh - (top padding + bottom padding + buffer)

Example:
Top padding: 40px (~4vh)
Bottom padding: 16px (~1.6vh)
Buffer: ~10vh
Modal max-height: 100vh - 15.6vh = 84-85vh
```

**Code Pattern:**
```javascript
// Conservative approach:
max-h-[85vh]

// Precise approach:
style={{maxHeight: 'calc(100vh - 80px)'}}
```

**Why It Works:**
- Accounts for padding explicitly
- Leaves buffer for browser chrome
- Prevents overflow

**Where We Use It:**
- Modal container (Build79)

**When to Use:**
- Full-height or near-full-height modals
- Need cross-browser compatibility
- Mobile viewport considerations

### **Pattern #5: Opus Consultation for Complex Blockers**

**Use Case:** When stuck after multiple failed attempts

**When to Use:**
1. **3+ failed attempts** on same issue
2. **Technical complexity** beyond current understanding
3. **Time-sensitive** need for solution
4. **High risk** of making wrong architectural decision

**Process:**
1. **Document the problem:**
   - What you're trying to achieve
   - What you've tried
   - Why each attempt failed
   - Specific technical questions

2. **Create consultation package:**
   - Problem statement (clear, specific)
   - Code samples (before/after, failed attempts)
   - Technical constraints
   - Expected output format

3. **Hand to user** who sends to Opus

4. **Implement Opus solution:**
   - Follow exactly as specified
   - Don't "improve" or modify
   - Test according to Opus's protocol
   - Only deviate if testing reveals issues

**Example Success:** Build74.3 → Opus consultation → Build75 (sticky X button)

**Why It Works:**
- Opus has deeper technical knowledge
- Fresh perspective
- Can reference entire codebase
- Provides step-by-step solutions

### **Pattern #6: Evidence-Based Debugging**

**Use Case:** Any bug or unexpected behavior

**Process:**
1. **Observe:** What exactly is wrong? (screenshot, description)
2. **Hypothesize:** What might cause this?
3. **Investigate:** Use browser DevTools to gather evidence
4. **Test:** Verify hypothesis with specific checks
5. **Fix:** Implement targeted solution
6. **Validate:** Confirm fix works

**Example from Build76.1:**
```
Observe: Modal frame too high on mobile
Hypothesize: Backdrop position issue
Investigate: 
  - Check computed styles (top: 20px not enough)
  - Measure actual spacing (16px visible)
Test: Try top-8 (32px)
Fix: Change top-5 to top-8
Validate: User confirms "better" but still Safari scroll issue
```

**Why It Works:**
- Systematic approach prevents random fixes
- Builds understanding of root cause
- Creates documentation for future
- Faster than trial-and-error

**When to Use:**
- Always, for every bug
- Before asking user to test
- When stuck (evidence informs Opus consultation)

---

[DOCUMENT CONTINUES - This is Part 1 of 3]

**NEXT SECTIONS TO FOLLOW:**
- Part 2: Processes, Workflows, Technical Details
- Part 3: How to Proceed, Troubleshooting, Quick Reference

**COMPREHENSIVE HANDOFF IN PROGRESS...**
