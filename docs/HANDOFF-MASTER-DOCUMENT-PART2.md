# COMPREHENSIVE HANDOFF DOCUMENT - PART 2
# Grant Park Events Project - Build79 Stable Release
# Processes, Workflows, and Technical Details

---

## 6. PROCESSES & WORKFLOWS

### **Build Creation Workflow (MANDATORY)**

**Every build must follow this exact process:**

```
1. READ PROJECT-STANDARDS.md
   ↓
2. Create new build directory (cp -r build79 build80)
   ↓
3. Make code changes
   ↓
4. Update version.js
   ↓
5. Update version in index.html (sed command)
   ↓
6. Run BUILD-VALIDATION-SOP.md checks
   ↓
7. Create comprehensive release notes
   ↓
8. Create validated package (.zip)
   ↓
9. Present to user with release notes
   ↓
10. User tests → declares stable OR requests fixes
```

**Commands for Build Creation:**

```bash
# Step 1: Read standards (MANDATORY)
view /home/claude/gpe20-v2.3.0-build79/docs/SOPs/PROJECT-STANDARDS.md

# Step 2: Create new build
cp -r /home/claude/gpe20-v2.3.0-build79 /home/claude/gpe20-v2.3.0-build80

# Step 3: Make changes (in build80 directory)

# Step 4-5: Update versions (in version.js, then index.html)

# Step 6: Validate
# (Manual checks per BUILD-VALIDATION-SOP.md)

# Step 7-8: Package
cd /home/claude && zip -qr gpe20-v2.3.0-build80-VALIDATED.zip gpe20-v2.3.0-build80/

# Step 9: Deliver
cp /home/claude/gpe20-v2.3.0-build80-VALIDATED.zip /mnt/user-data/outputs/
```

### **Build Validation Checklist**

From `/home/claude/gpe20-v2.3.0-build79/docs/SOPs/BUILD-VALIDATION-SOP.md`:

**1. Syntax Validation:**
- [ ] No React.createElement errors (trailing commas, malformed structure)
- [ ] All functions defined before use
- [ ] All imports present
- [ ] No typos in className or Tailwind classes

**2. Version Consistency:**
- [ ] version.js: BUILD_VERSION matches build number
- [ ] index.html: 2 instances of version (header + footer)
- [ ] Both match exactly

**3. Regression Testing:**
- [ ] All Build79 features still work
- [ ] Sticky X button works
- [ ] Modal opens/closes
- [ ] Body scroll lock works
- [ ] Backdrop covers full viewport
- [ ] Title sizes correct

**4. New Feature Verification:**
- [ ] New feature implemented as specified
- [ ] Works on mobile
- [ ] Works on desktop
- [ ] Cross-browser tested (or documented for user testing)

**5. Documentation:**
- [ ] Release notes created
- [ ] What changed documented
- [ ] Why it changed documented
- [ ] Testing requirements listed
- [ ] Troubleshooting guidance included

**6. File Organization:**
- [ ] Release notes in /docs/BUILDS/RELEASE-NOTES/
- [ ] Stable declarations in /docs/BUILDS/STABLE-DECLARATIONS/ (if stable)
- [ ] Code changes in proper locations
- [ ] No orphaned files

### **Release Notes Template**

**Every build must have comprehensive release notes:**

```markdown
# BUILD[NUMBER] RELEASE NOTES

**Version:** v2.3.0-Build[NUMBER]
**Build Date:** [DATE]
**Type:** [Feature/Fix/Enhancement]
**Risk Level:** [LOW/MEDIUM/HIGH]
**Base Build:** v2.3.0-Build[PREVIOUS]

## OVERVIEW
[What this build does in 1-2 sentences]

## ISSUE ADDRESSED
[What problem are we solving]

## TECHNICAL IMPLEMENTATION
[Exact code changes with before/after]

## VALIDATION COMPLETED
[What was checked]

## TESTING REQUIREMENTS
[How user should test]

## TROUBLESHOOTING
[What to do if it fails]

## SUCCESS CRITERIA
[How to know it worked]

## COMPARISON TO PREVIOUS BUILD
[What changed]
```

### **Stable Build Declaration Process**

**When user declares build stable:**

1. **Create stable declaration document:**
```markdown
# BUILD[NUMBER] - STABLE RELEASE DECLARATION

**Version:** v2.3.0-Build[NUMBER]
**Status:** ✅ FINAL AND STABLE
**Declared By:** Peter (Project Owner)
**Declaration Date:** [DATE]

[Include: what was solved, why it's stable, browser compatibility, etc.]
```

2. **Save to proper location:**
```bash
cp BUILD[NUMBER]-STABLE-RELEASE-DECLARATION.md /home/claude/gpe20-v2.3.0-build[NUMBER]/docs/BUILDS/STABLE-DECLARATIONS/
```

3. **Create STABLE-RELEASE.zip:**
```bash
cd /home/claude && rm gpe20-v2.3.0-build[NUMBER]-VALIDATED.zip
zip -qr gpe20-v2.3.0-build[NUMBER]-STABLE-RELEASE.zip gpe20-v2.3.0-build[NUMBER]/
```

4. **This becomes the base for all future builds**

### **Troubleshooting Workflow**

**When user reports an issue:**

1. **Clarify the issue:**
   - What browser/device?
   - What exactly happens?
   - Can you reproduce it?

2. **Investigate systematically:**
   - Check browser DevTools
   - Review recent code changes
   - Look for similar patterns in build history

3. **Propose solution with confidence level:**
   - High confidence (95%+): Proceed with fix
   - Medium confidence (70-94%): Offer alternatives
   - Low confidence (<70%): Request Opus consultation

4. **Implement, validate, deliver:**
   - Follow build creation workflow
   - Include troubleshooting in release notes
   - Provide clear testing instructions

### **Mobile Positioning Workflow**

**From lessons learned in Build73.13-73.21:**

When positioning UI elements on mobile (especially with flexbox):

1. **Check existing patterns first:**
   - See `/home/claude/gpe20-v2.3.0-build79/docs/SOPs/MOBILE-POSITIONING-GUIDELINES.md`
   - Review case study: `/home/claude/gpe20-v2.3.0-build79/docs/CASE-STUDIES/mobile-icon-positioning-flexbox-constraints.md`

2. **Understand constraints:**
   - Negative margins fail on mobile in flex containers
   - `justify-between` inverts right margin behavior
   - Margins have ~22px ceiling
   - `transform` bypasses flex constraints

3. **Solution pattern:**
```javascript
// Use margin + transform for fine-tuning:
className:'ml-5.5 ...',  // Base positioning
style:{transform: 'translateX(8px)'}  // Fine adjustment
```

4. **Test on actual mobile devices** (not just DevTools)

---

## 7. DOCUMENTATION LOCATIONS

### **Primary Documentation (READ THESE FIRST)**

**Before ANY work:**
```bash
/home/claude/gpe20-v2.3.0-build79/docs/SOPs/PROJECT-STANDARDS.md
```

**For build validation:**
```bash
/home/claude/gpe20-v2.3.0-build79/docs/SOPs/BUILD-VALIDATION-SOP.md
```

**For mobile positioning:**
```bash
/home/claude/gpe20-v2.3.0-build79/docs/SOPs/MOBILE-POSITIONING-GUIDELINES.md
```

### **Build History & Release Notes**

**All release notes:**
```bash
/home/claude/gpe20-v2.3.0-build79/docs/BUILDS/RELEASE-NOTES/
├── BUILD73.21-RELEASE-NOTES.md
├── BUILD75-RELEASE-NOTES.md
├── BUILD76-RELEASE-NOTES.md
├── BUILD76.1-RELEASE-NOTES.md
├── BUILD77-RELEASE-NOTES.md
├── BUILD78-RELEASE-NOTES.md
└── BUILD79-RELEASE-NOTES.md
```

**Stable build declarations:**
```bash
/home/claude/gpe20-v2.3.0-build79/docs/BUILDS/STABLE-DECLARATIONS/
├── BUILD75-STABLE-RELEASE-DECLARATION.md
├── BUILD76.1-STABLE-RELEASE-DECLARATION.md
├── BUILD78-STABLE-RELEASE-DECLARATION.md
└── BUILD79-STABLE-RELEASE-DECLARATION.md
```

### **Case Studies & Learnings**

**Mobile positioning deep dive:**
```bash
/home/claude/gpe20-v2.3.0-build79/docs/CASE-STUDIES/mobile-icon-positioning-flexbox-constraints.md
```
- Why negative margins fail on mobile
- How justify-between affects margins
- Transform solution pattern
- Testing methodology

### **Opus Consultation Materials**

**If you need to create Opus package, reference:**
```bash
# This was created during Build74 sticky X button issue
# Shows format and structure for consultation packages
# Located in outputs but serves as template
```

### **Future Features & Roadmap**

**Check for planned features:**
```bash
/home/claude/gpe20-v2.3.0-build79/docs/ROADMAP/
```

**Note:** Some roadmap items may exist. Check before implementing new features - might already be documented.

---

## 8. TECHNICAL STACK & CONSTRAINTS

### **React Without JSX - How It Works**

**We use:** `React.createElement(type, props, ...children)`

**Example:**
```javascript
// JSX would be:
// <div className="container"><h1>Title</h1></div>

// Our code:
React.createElement('div', {className: 'container'},
  React.createElement('h1', null, 'Title')
)

// Or using the 'e' shorthand:
e('div', {className: 'container'},
  e('h1', null, 'Title')
)
```

**Critical Syntax Rules:**

1. **Props must be object (even if empty):**
```javascript
// WRONG:
e('div', 'content')

// RIGHT:
e('div', null, 'content')
// OR
e('div', {}, 'content')
```

2. **Children come AFTER props:**
```javascript
// WRONG:
e('div', e('h1', null, 'Title'), {className: 'container'})

// RIGHT:
e('div', {className: 'container'}, e('h1', null, 'Title'))
```

3. **No trailing comma after props:**
```javascript
// WRONG:
e('div', {
  className: 'container',  // ← Trailing comma
  e('h1', null, 'Title')   // ← Children in props object
})

// RIGHT:
e('div', {
  className: 'container'   // ← No trailing comma
},                         // ← Close props
  e('h1', null, 'Title')   // ← Children after props
)
```

**This syntax error caused Build74.1 to fail entirely.**

### **Tailwind CSS - Conventions**

**We use Tailwind v3 via CDN:**

**Breakpoints:**
```
sm:  640px and up
md:  768px and up
lg:  1024px and up
xl:  1280px and up
2xl: 1536px and up
```

**Common classes used:**
- Layout: `flex`, `grid`, `fixed`, `absolute`, `relative`, `sticky`
- Spacing: `p-4`, `m-6`, `gap-3`, `space-y-4`
- Sizing: `w-full`, `h-screen`, `max-w-4xl`, `max-h-[85vh]`
- Colors: `bg-white`, `text-gray-600`, `border-blue-200`
- Typography: `text-xl`, `text-2xl`, `font-bold`, `leading-tight`

**Responsive pattern:**
```javascript
// Base class = mobile (<640px)
// sm: prefix = desktop (≥640px)
className:'text-2xl sm:text-4xl'
```

**Custom values with brackets:**
```javascript
className:'max-h-[85vh]'  // Custom value
className:'top-[12px]'    // Custom value
```

### **Netlify Platform Constraints**

**Hosting:** Netlify  
**Documentation:** https://docs.netlify.com

**Key Features Used:**
- **Netlify Functions:** Serverless functions in `/netlify/functions/`
- **Netlify Blobs:** Data storage (events stored here)
- **Netlify Forms:** (If used for contact forms)
- **Netlify Deploy:** Automated deployment from Git

**Important:**
- All functions must follow Netlify function format
- Blob operations require Netlify SDK
- Check Netlify docs for any Netlify-specific features

**When in doubt about Netlify feature, consult docs first.**

### **Browser Support Matrix**

**Target Browsers (MUST work on all):**

**Mobile:**
- Safari iOS (PRIMARY - 50% of mobile users)
- Chrome iOS (PRIMARY - tested in Build79)
- Edge iOS (tested in Build79)

**Desktop:**
- Chrome (latest)
- Safari (macOS)
- Firefox (latest)
- Edge (latest)

**Testing Priority:**
1. Safari iOS (highest priority - Peter's device)
2. Chrome iOS
3. Edge iOS
4. Desktop Chrome
5. Other desktop browsers

**Known Browser Quirks:**

**Safari iOS:**
- Needs `-webkit-overflow-scrolling: touch` for momentum
- Requires aggressive scroll lock (position: fixed)
- Sometimes calculates flexbox differently

**Chrome iOS:**
- Strict viewport calculations
- Doesn't compress content automatically like Safari
- Needs explicit max-height management

**Edge iOS:**
- Generally follows Safari behavior
- Fewer quirks than Chrome iOS

### **Performance Considerations**

**Current Performance Targets:**
- Page load: <2 seconds
- Modal open: Instant
- Scroll: Smooth (60fps)
- Event list render: <500ms

**Optimization Strategies Used:**
- Tailwind CSS (no custom CSS compilation)
- CDN for React/libraries
- Minimal JavaScript
- Netlify CDN for assets

**Don't Optimize Prematurely:**
- Current performance is good
- Focus on functionality and correctness
- Only optimize if user reports slowness

---

## 9. PETER'S EXPECTATIONS & WORK STYLE

### **Communication Style**

**Peter Prefers:**
- Direct, concise responses
- Technical precision
- Evidence over speculation
- Clear options with recommendations

**Avoid:**
- Excessive apologizing
- Hedging language ("maybe", "might", "possibly" without qualification)
- Overly verbose explanations
- Repeating information already acknowledged

**Example - Good:**
> "Found the issue: modal max-height (90vh) + padding (56px) exceeds viewport on Chrome mobile. Solution: Reduce to 85vh. Confidence: 95%. Ready to proceed?"

**Example - Bad:**
> "So I was thinking maybe the modal might possibly be too tall and perhaps we could try reducing it, though I'm not entirely sure if that will work, but it might be worth attempting..."

### **When Things Go Wrong**

**Peter's Response Patterns:**

**After 1st failure:** Understanding, supportive
**After 2nd failure:** Slightly frustrated, needs explanation
**After 3rd failure:** Frustrated, expects systematic approach

**How to Handle:**
1. **Acknowledge the pattern:** "This is the 3rd attempt - we need a different approach"
2. **Propose systematic solution:** "Let me investigate with browser DevTools" or "This warrants Opus consultation"
3. **Show evidence:** "Here's what I found..." with specific data
4. **Present clear path:** "Option A vs Option B, I recommend A because..."

**Don't:**
- Keep trying random fixes
- Ignore the pattern of failures
- Make excuses
- Blame tools/browsers without evidence

### **Decision Authority**

**Peter Decides:**
- Feature priorities
- Design preferences
- When builds are stable
- Whether to continue or pivot

**You Decide:**
- Technical approach (with justification)
- Code structure
- Implementation details
- Testing methodology

**Collaborative:**
- Architecture changes
- New patterns/conventions
- Risky refactors
- External dependencies

**Always ask when uncertain about scope of authority.**

### **Quality Standards Enforcement**

**Peter Has Zero Tolerance For:**
- Syntax errors reaching production
- Untested code
- Incomplete documentation
- Regressions from previous builds
- Missing validation steps

**Consequence:** Loss of trust, longer testing cycles, more oversight

**How to Maintain Trust:**
- Follow BUILD-VALIDATION-SOP.md religiously
- Test thoroughly before delivery
- Document comprehensively
- Be honest about limitations/risks
- Learn from mistakes (don't repeat)

### **Feedback Style**

**Positive Feedback:**
- "Well done"
- "Perfect"
- "Solved"
- "Consider stable"

**This means:** You've met or exceeded expectations. Current approach is working.

**Constructive Feedback:**
- "This is better but..."
- "Still having issue with..."
- "Can you..."

**This means:** On right track, needs adjustment. Keep iterating.

**Critical Feedback:**
- "This still isn't working"
- "Same issue"
- Extended silence

**This means:** Current approach not working. Need systematic investigation or consultation.

---

## 10. HOW TO PROCEED WITH BUILD80+

### **Starting a New Build**

**Step 1: Understand the Request**

When Peter requests a new feature or fix:
1. **Read the request carefully**
2. **Ask clarifying questions if anything ambiguous**
3. **Confirm your understanding before coding**

**Example Dialogue:**
```
Peter: "The event cards need better spacing on mobile"

You: "To clarify:
1. Which spacing - between cards or inside each card?
2. How much spacing - current is 16px, increase to 24px?
3. Mobile only or desktop too?
Ready to proceed once confirmed."
```

**Step 2: Check Existing Documentation**

Before implementing:
```bash
# 1. Read current standards
view /home/claude/gpe20-v2.3.0-build79/docs/SOPs/PROJECT-STANDARDS.md

# 2. Check if similar issue solved before
ls /home/claude/gpe20-v2.3.0-build79/docs/BUILDS/RELEASE-NOTES/

# 3. Review relevant case studies
ls /home/claude/gpe20-v2.3.0-build79/docs/CASE-STUDIES/

# 4. Check roadmap for related features
ls /home/claude/gpe20-v2.3.0-build79/docs/ROADMAP/
```

**Step 3: Plan the Implementation**

Before coding, outline:
1. What will change (specific files, lines)
2. Why this approach (justify decision)
3. What might go wrong (risks)
4. How to test (verification steps)

**Share this plan with Peter if:**
- Architectural change
- Multiple approaches possible
- High risk or complexity
- Unsure of scope

**Step 4: Implement**

```bash
# Create new build
cp -r /home/claude/gpe20-v2.3.0-build79 /home/claude/gpe20-v2.3.0-build80

# Make changes in build80

# Update versions

# Follow validation SOP
```

**Step 5: Document Thoroughly**

Create release notes covering:
- What changed (code level detail)
- Why it changed (user request + technical rationale)
- How to test (specific steps)
- What could go wrong (troubleshooting)
- Comparison to previous build

**Step 6: Package and Deliver**

```bash
# Create validated package
cd /home/claude && zip -qr gpe20-v2.3.0-build80-VALIDATED.zip gpe20-v2.3.0-build80/

# Move to outputs
cp /home/claude/gpe20-v2.3.0-build80-VALIDATED.zip /mnt/user-data/outputs/
cp /home/claude/gpe20-v2.3.0-build80/BUILD80-RELEASE-NOTES.md /mnt/user-data/outputs/

# Present files
# (use present_files tool)
```

### **Common Build Scenarios**

**Scenario A: Simple CSS Change**
- Example: Adjust padding, change color, resize element
- Risk: LOW
- Process: Standard build workflow
- Testing: Visual check on mobile + desktop

**Scenario B: New UI Feature**
- Example: Add button, new section, modal enhancement
- Risk: MEDIUM
- Process: Standard + extra validation
- Testing: Interaction testing + regression testing

**Scenario C: Logic Change**
- Example: Modify function, change state management, alter data flow
- Risk: MEDIUM-HIGH
- Process: Standard + comprehensive testing
- Testing: All affected features + edge cases

**Scenario D: Architecture Change**
- Example: Refactor component, change data structure, new pattern
- Risk: HIGH
- Process: Discuss with Peter first, then implement
- Testing: Full regression suite

**Scenario E: Bug Fix**
- Example: Fix broken feature, resolve error, correct behavior
- Risk: VARIES
- Process: Investigate → Fix → Validate → Document root cause
- Testing: Reproduction test + regression test

### **Build Numbering Convention**

**Format:** `v2.3.0-Build[NUMBER]`

**Current:** Build79  
**Next:** Build80

**Minor iterations:** Build80.1, Build80.2, etc.
- Use for quick fixes or adjustments to Build80
- User might request "Build80.1" if Build80 needs tweak

**When to increment:**
- Every distinct change set
- Every user request for modification
- After declaring previous build stable

**Version in files:**
- version.js: `export const BUILD_VERSION = 'v2.3.0-Build80';`
- index.html: Two locations (update both with sed)

---

[DOCUMENT CONTINUES - This is Part 2 of 3]

**FINAL SECTION TO FOLLOW:**
- Part 3: Troubleshooting Decision Trees, Quick Reference, Final Checklist

**COMPREHENSIVE HANDOFF CONTINUING...**
