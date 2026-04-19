# QUICK-START GUIDE
## Essential Reference for Next Claude Session

**Current Stable Build:** v2.3.0-Build79  
**Last Updated:** February 3, 2026  
**Purpose:** Quick reference for common tasks and requirements

---

## ⚡ MANDATORY FIRST ACTIONS

### **Starting ANY GPE Work Session:**

```bash
# 1. Read project standards (MANDATORY)
view /home/claude/gpe20-v2.3.0-build79/docs/SOPs/PROJECT-STANDARDS.md

# 2. Read build validation SOP (MANDATORY)
view /home/claude/gpe20-v2.3.0-build79/docs/SOPs/BUILD-VALIDATION-SOP.md

# 3. Read master handoff (CRITICAL CONTEXT)
view /home/claude/gpe20-v2.3.0-build79/docs/handoff/MASTER-HANDOFF-BUILD79.md
```

**DO NOT SKIP THESE STEPS**

---

## 🚀 CREATE NEW BUILD (BUILD80+)

### **Step-by-Step Checklist:**

**1. Copy from stable base:**
```bash
cp -r /home/claude/gpe20-v2.3.0-build79 /home/claude/gpe20-v2.3.0-build[N]
```

**2. Make your changes**
- Implement focused solution
- Follow established patterns
- Add explanatory comments

**3. Update version.js:**
```javascript
export const BUILD_VERSION = 'v2.3.0-Build[N]';
export const BUILD_DATE = '2026-02-0[X]';
export const BUILD_NOTES = 'Clear description';

export const VERSION_HISTORY = [
  'v2.3.0-Build[N]',  // Current
  'v2.3.0-Build79',   // Add to history
  // ... keep full history
];
```

**4. Update index.html version:**
```bash
sed -i 's/v2.3.0-Build79/v2.3.0-Build[N]/g' /home/claude/gpe20-v2.3.0-build[N]/index.html
grep -c "v2.3.0-Build[N]" /home/claude/gpe20-v2.3.0-build[N]/index.html  # Should be 2
```

**5. Validate (see BUILD-VALIDATION-SOP.md):**
- [ ] Syntax check
- [ ] Regression test
- [ ] Manual verification
- [ ] Cross-browser (if UI changes)

**6. Create release notes:**
```bash
# Create in build root:
/home/claude/gpe20-v2.3.0-build[N]/BUILD[N]-RELEASE-NOTES.md
```

**7. Package:**
```bash
cd /home/claude
zip -qr gpe20-v2.3.0-build[N]-VALIDATED.zip gpe20-v2.3.0-build[N]/
cp gpe20-v2.3.0-build[N]-VALIDATED.zip /mnt/user-data/outputs/
cp /home/claude/gpe20-v2.3.0-build[N]/BUILD[N]-RELEASE-NOTES.md /mnt/user-data/outputs/
```

**8. Deliver:**
```bash
present_files ["/mnt/user-data/outputs/gpe20-v2.3.0-build[N]-VALIDATED.zip", "/mnt/user-data/outputs/BUILD[N]-RELEASE-NOTES.md"]
```

---

## 📍 KEY FILE LOCATIONS

### **Stable Build:**
```
/home/claude/gpe20-v2.3.0-build79/
```

### **Critical Documentation:**
```
/home/claude/gpe20-v2.3.0-build79/docs/SOPs/PROJECT-STANDARDS.md
/home/claude/gpe20-v2.3.0-build79/docs/SOPs/BUILD-VALIDATION-SOP.md
/home/claude/gpe20-v2.3.0-build79/docs/handoff/MASTER-HANDOFF-BUILD79.md
/home/claude/gpe20-v2.3.0-build79/docs/handoff/BUILD-PROGRESSION-SUMMARY.md
```

### **Build History:**
```
/home/claude/gpe20-v2.3.0-build79/docs/build-history/
├── BUILD75-STABLE-RELEASE-DECLARATION.md
├── BUILD76.1-STABLE-RELEASE-DECLARATION.md
├── BUILD77-RELEASE-NOTES.md
├── BUILD78-RELEASE-NOTES.md
├── BUILD78-STABLE-RELEASE-DECLARATION.md
├── BUILD79-RELEASE-NOTES.md
└── BUILD79-STABLE-RELEASE-DECLARATION.md
```

### **Main Application:**
```
/home/claude/gpe20-v2.3.0-build79/index.html (2311 lines)
/home/claude/gpe20-v2.3.0-build79/version.js
```

### **Output Directory:**
```
/mnt/user-data/outputs/  (final deliverables go here)
```

---

## 🔧 COMMON PATTERNS & LINE NUMBERS

### **Sticky X Button (Build75):**
```
Lines: 1862-1877
Pattern: Sticky wrapper + absolute button
```

### **Body Scroll Lock (Build78):**
```
Open: Lines 1074-1080
Close: Lines 1093-1100
Pattern: position: fixed + scroll preservation
```

### **Mobile Title Size (Build77):**
```
Calendar title: Line 1393
Modal title: Line 1961
Pattern: text-2xl sm:text-4xl
```

### **Modal Backdrop (Build78):**
```
Line: 1847
Pattern: fixed inset-0 ... pt-10
```

### **Modal Container (Build79):**
```
Line: 1849
Pattern: max-h-[85vh]
```

---

## ✅ VALIDATION CHECKLIST

### **Before Every Delivery:**

**Syntax:**
- [ ] No console errors
- [ ] No trailing commas in React.createElement
- [ ] All brackets/tags closed

**Visual:**
- [ ] Modal opens correctly
- [ ] X button works
- [ ] Layout looks good

**Functional:**
- [ ] All interactions work
- [ ] Body scroll locked when modal open
- [ ] Scroll position preserved

**Regression:**
- [ ] All Build79 features still work
- [ ] Sticky X button works
- [ ] Title sizing correct
- [ ] Modal spacing correct
- [ ] Viewport fit correct

**Documentation:**
- [ ] Release notes created
- [ ] Problem/solution documented
- [ ] Testing requirements specified

**Packaging:**
- [ ] Version.js updated
- [ ] index.html versions updated (2 places)
- [ ] Zip created and moved to outputs
- [ ] Delivered with present_files

---

## 🎯 DECISION TREES

### **When Stuck:**

```
Is requirement clear?
├─ NO → Ask Peter for clarification
└─ YES → Continue

Does similar pattern exist?
├─ YES → Adapt existing pattern
└─ NO → Continue

Have I tried 3+ times?
├─ YES → Consider Opus consultation
└─ NO → Continue systematic investigation

Is this UI-related?
├─ YES → Cross-browser testing required
└─ NO → Functional testing sufficient
```

### **When to Consult Opus:**

```
Attempts: ≥ 4 failed attempts
└─ OR

Complexity: Complex technical issue
└─ OR

Time: Investigation not yielding solution

→ CONSULT OPUS with diagnostic data
```

---

## 🔍 QUICK DIAGNOSTICS

### **Modal Not Opening:**
```javascript
// Check state
console.log('Selected event:', selectedEvent);

// Test function
openEventModal({id:'test', title:'Test'}, false);

// Check console for errors
// (DevTools → Console)
```

### **Body Scroll Not Locked:**
```javascript
// When modal open:
console.log('Body overflow:', document.body.style.overflow);  // 'hidden'
console.log('Body position:', document.body.style.position);  // 'fixed'
console.log('Body top:', document.body.style.top);  // Negative value
```

### **Modal Extends Past Viewport:**
```javascript
const modal = document.querySelector('.bg-white.rounded-2xl');
const rect = modal.getBoundingClientRect();
console.log('Modal bottom:', rect.bottom);
console.log('Viewport height:', window.innerHeight);
console.log('Extends:', rect.bottom > window.innerHeight);
```

### **Title Wrong Size:**
```javascript
const title = document.querySelector('h2.font-bold');
console.log('Font size:', window.getComputedStyle(title).fontSize);
// Mobile: '24px', Desktop: '36px'
```

---

## 📊 BUILD79 FEATURE SUMMARY

### **Complete Feature Set:**
- ✅ Sticky X button (stays visible on scroll)
- ✅ Modal spacing (40px top padding)
- ✅ Safari scroll fix (webkit momentum)
- ✅ Mobile title size (24px vs 36px desktop)
- ✅ Full backdrop coverage
- ✅ Body scroll lock (aggressive)
- ✅ Chrome viewport fit (85vh)

### **Browser Compatibility:**
- ✅ Safari iOS
- ✅ Chrome iOS
- ✅ Edge iOS
- ✅ Desktop (all browsers)

---

## ⚠️ CRITICAL REMINDERS

### **Always:**
- ✅ Read PROJECT-STANDARDS.md first
- ✅ Follow BUILD-VALIDATION-SOP.md
- ✅ Ask questions when unclear
- ✅ Document comprehensively
- ✅ Test thoroughly

### **Never:**
- ❌ Skip reading SOPs
- ❌ Guess at requirements
- ❌ Skip validation
- ❌ Deliver without testing
- ❌ Trial-and-error without investigation

### **Peter Expects:**
- ✅ Working code first time
- ✅ Professional documentation
- ✅ Systematic problem solving
- ✅ Comprehensive testing
- ✅ No production issues

---

## 🚨 EMERGENCY ROLLBACK

### **If Build[N] Has Critical Issue:**

```bash
# Option 1: Revert to Build79
cp -r /home/claude/gpe20-v2.3.0-build79 /home/claude/gpe20-v2.3.0-build[N]

# Option 2: Fix and revalidate
# Identify issue → Fix → Test → Deliver

# Option 3: Rollback to earlier stable
# Use Build78, Build76.1, or Build75 if needed
```

---

## 📞 WHERE TO FIND HELP

### **Pattern Examples:**
```
/home/claude/gpe20-v2.3.0-build79/docs/handoff/BUILD-PROGRESSION-SUMMARY.md
(All patterns from Build75-79 with code examples)
```

### **Complete Context:**
```
/home/claude/gpe20-v2.3.0-build79/docs/handoff/MASTER-HANDOFF-BUILD79.md
(Everything about project, builds, processes)
```

### **Build History:**
```
/home/claude/gpe20-v2.3.0-build79/docs/build-history/
(Individual build release notes and declarations)
```

### **Project Standards:**
```
/home/claude/gpe20-v2.3.0-build79/docs/SOPs/PROJECT-STANDARDS.md
(Coding conventions, Peter's expectations)
```

### **Validation Protocol:**
```
/home/claude/gpe20-v2.3.0-build79/docs/SOPs/BUILD-VALIDATION-SOP.md
(Complete testing and delivery checklist)
```

---

## 🎓 PROVEN PATTERNS TO REUSE

### **Sticky Positioning:**
```javascript
// Wrapper: sticky + height:0
e('div',{
  className:'sticky z-50',
  style:{top:'16px', height:'0', pointerEvents:'none'}
},
  // Element: absolute inside
  e('button',{
    className:'absolute top-0 right-4 ...',
    style:{pointerEvents:'auto'}
  }, ...)
)
```

### **Body Scroll Lock:**
```javascript
// Lock
const scrollY = window.scrollY;
document.body.style.overflow = 'hidden';
document.body.style.position = 'fixed';
document.body.style.width = '100%';
document.body.style.top = `-${scrollY}px`;

// Unlock
const scrollY = document.body.style.top;
document.body.style.overflow = '';
document.body.style.position = '';
document.body.style.width = '';
document.body.style.top = '';
window.scrollTo(0, parseInt(scrollY || '0') * -1);
```

### **Responsive Sizing:**
```javascript
// Mobile first, desktop override
className:'text-2xl sm:text-4xl'
// < 640px: text-2xl
// ≥ 640px: text-4xl
```

### **Full Viewport Overlay:**
```javascript
// Backdrop
className:'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 pt-10'

// Inner content
className:'... max-h-[85vh] ...'
```

---

## ✨ SUCCESS FORMULA

**1. Preparation (5 min)**
- Read PROJECT-STANDARDS.md
- Read BUILD-VALIDATION-SOP.md
- Understand requirement

**2. Planning (5 min)**
- Check for similar patterns
- Identify files to change
- Plan testing approach

**3. Implementation (15-30 min)**
- Make focused changes
- Add explanatory comments
- Update versions

**4. Validation (10-15 min)**
- Syntax check
- Visual verification
- Regression testing
- Cross-browser if needed

**5. Documentation (10-15 min)**
- Create release notes
- Document problem/solution
- Specify testing requirements

**6. Delivery (5 min)**
- Package build
- Move to outputs
- Present with present_files

**Total: 50-80 min for typical build**

---

## 🎯 QUALITY GATES

### **Every Build Must Pass:**

**Gate 1: Requirements Clear**
- [ ] Understand what needs to change
- [ ] Know success criteria
- [ ] Have clarification if needed

**Gate 2: Implementation Correct**
- [ ] Code follows patterns
- [ ] Comments explain why
- [ ] Versions updated

**Gate 3: Validation Complete**
- [ ] All tests passed
- [ ] No regressions
- [ ] Cross-browser if UI

**Gate 4: Documentation Complete**
- [ ] Release notes comprehensive
- [ ] Problem/solution documented
- [ ] Testing requirements clear

**Gate 5: Package Ready**
- [ ] Zip created
- [ ] Moved to outputs
- [ ] Delivered properly

**If any gate fails: STOP and fix before proceeding**

---

**END OF QUICK-START GUIDE**

**For detailed information, see:**
- MASTER-HANDOFF-BUILD79.md (complete context)
- BUILD-PROGRESSION-SUMMARY.md (all patterns)
- PROJECT-STANDARDS.md (requirements)
- BUILD-VALIDATION-SOP.md (quality gates)
