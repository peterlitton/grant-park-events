# COMPREHENSIVE HANDOFF DOCUMENT - PART 3
# Grant Park Events Project - Build79 Stable Release
# Troubleshooting, Decision Trees, Quick Reference, Final Checklist

---

## 11. TROUBLESHOOTING & DECISION TREES

### **When User Reports "Not Working"**

```
User: "[Feature] isn't working"
    ↓
Ask: "What browser/device? What exactly happens?"
    ↓
User provides details
    ↓
┌─────────────────────────────────────┐
│ Can you reproduce it?               │
└────┬────────────────────┬───────────┘
     YES                  NO
     ↓                    ↓
Open DevTools      Ask for screenshot
Check console      Ask for steps to reproduce
Inspect element    Try different browser
     ↓                    ↓
Find root cause    Gather more info
     ↓                    ↓
Fix → Validate    Return to top
```

### **Mobile Positioning Issue Decision Tree**

```
Element not positioned correctly on mobile
    ↓
┌────────────────────────────────────┐
│ Is it in a flex container?         │
└────┬───────────────────┬───────────┘
     YES                 NO
     ↓                   ↓
Check docs:          Use standard
MOBILE-POSITIONING-  positioning
GUIDELINES.md        (absolute, fixed, etc.)
     ↓
┌────────────────────────────────────┐
│ Need fine-tuning beyond margins?   │
└────┬───────────────────┬───────────┘
     YES                 NO
     ↓                   ↓
Use transform       Use margin
translateX()        (ml-, mr-)
     ↓                   ↓
Test on actual    Test on actual
device            device
```

### **Scroll Lock Not Working Decision Tree**

```
Page scrolls behind modal
    ↓
┌────────────────────────────────────┐
│ Body has overflow: hidden?         │
└────┬───────────────────┬───────────┘
     NO                  YES
     ↓                   ↓
Add it              iOS/Safari?
     ↓                   ↓
                    YES → Add position: fixed
                          + preserve scroll position
                          (Build78 pattern)
                    ↓
                Test on Safari iOS
```

### **Modal Doesn't Fit Viewport Decision Tree**

```
Modal extends past screen
    ↓
┌────────────────────────────────────┐
│ Check backdrop positioning         │
└────────────────────────────────────┘
    ↓
Is backdrop inset-0? (covers full viewport)
    ↓ NO → Change to inset-0
    ↓ YES
    ↓
┌────────────────────────────────────┐
│ Check modal max-height             │
└────────────────────────────────────┘
    ↓
max-height + padding < 100vh?
    ↓ NO → Reduce max-height (Build79 pattern)
    ↓ YES
    ↓
┌────────────────────────────────────┐
│ Browser-specific issue?            │
└────────────────────────────────────┘
    ↓
Test on: Safari, Chrome, Edge
Document which browsers fail
Consider browser-specific fix
```

### **When to Consult Opus**

```
Stuck on technical issue
    ↓
┌────────────────────────────────────┐
│ How many attempts made?            │
└────┬───────────────────┬───────────┘
  <3 attempts          ≥3 attempts
     ↓                   ↓
Keep trying         Opus time
Try different       ↓
approach        Create package:
     ↓          - Problem statement
Test more       - All attempts
     ↓          - Code samples
Return to       - Specific questions
top                ↓
               Hand to Peter
                    ↓
               Peter sends to Opus
                    ↓
               Implement Opus solution
```

### **Responsive Design Decision Tree**

```
Need different mobile vs desktop styling
    ↓
┌────────────────────────────────────┐
│ Can use Tailwind classes?          │
└────┬───────────────────┬───────────┘
     YES                 NO
     ↓                   ↓
Use responsive      Use CSS media
classes:            queries or
text-2xl sm:text-4xl    JS detection
     ↓                   ↓
Document why        Document why
Tailwind not        Tailwind not
sufficient          sufficient
```

---

## 12. QUICK REFERENCE CARDS

### **CARD A: First Actions in New Chat**

```
┌─────────────────────────────────────────┐
│ START NEW CHAT                          │
├─────────────────────────────────────────┤
│ 1. Read this entire handoff document    │
│ 2. view PROJECT-STANDARDS.md            │
│ 3. Locate current stable build:         │
│    /home/claude/gpe20-v2.3.0-build79    │
│ 4. Review Build79 release notes         │
│ 5. Ask Peter: "What's the objective?"   │
└─────────────────────────────────────────┘
```

### **CARD B: Every Build Checklist**

```
┌─────────────────────────────────────────┐
│ BUILD CREATION CHECKLIST                │
├─────────────────────────────────────────┤
│ □ Read PROJECT-STANDARDS.md             │
│ □ Create new build directory            │
│ □ Make code changes                     │
│ □ Update version.js                     │
│ □ Update index.html version (2x)        │
│ □ Run validation checks                 │
│ □ Create release notes                  │
│ □ Package (.zip)                        │
│ □ Move to outputs                       │
│ □ Present to user                       │
└─────────────────────────────────────────┘
```

### **CARD C: Common Commands**

```bash
# View standards (DO THIS FIRST EVERY TIME)
view /home/claude/gpe20-v2.3.0-build79/docs/SOPs/PROJECT-STANDARDS.md

# Create new build
cp -r /home/claude/gpe20-v2.3.0-build79 /home/claude/gpe20-v2.3.0-build80

# Update version in index.html (after updating version.js)
sed -i 's/v2.3.0-Build79/v2.3.0-Build80/g' /home/claude/gpe20-v2.3.0-build80/index.html

# Verify version updated (should show 2)
grep -c "v2.3.0-Build80" /home/claude/gpe20-v2.3.0-build80/index.html

# Package build
cd /home/claude && zip -qr gpe20-v2.3.0-build80-VALIDATED.zip gpe20-v2.3.0-build80/

# Copy to outputs
cp /home/claude/gpe20-v2.3.0-build80-VALIDATED.zip /mnt/user-data/outputs/
cp /home/claude/gpe20-v2.3.0-build80/BUILD80-RELEASE-NOTES.md /mnt/user-data/outputs/

# Find specific code
grep -n "specific text" /home/claude/gpe20-v2.3.0-build79/index.html

# List build history
ls /home/claude/gpe20-v2.3.0-build79/docs/BUILDS/RELEASE-NOTES/
```

### **CARD D: Critical File Locations**

```
Standards:
/home/claude/gpe20-v2.3.0-build79/docs/SOPs/PROJECT-STANDARDS.md

Validation:
/home/claude/gpe20-v2.3.0-build79/docs/SOPs/BUILD-VALIDATION-SOP.md

Current Build:
/home/claude/gpe20-v2.3.0-build79/

Release Notes:
/home/claude/gpe20-v2.3.0-build79/docs/BUILDS/RELEASE-NOTES/

Stable Declarations:
/home/claude/gpe20-v2.3.0-build79/docs/BUILDS/STABLE-DECLARATIONS/

Case Studies:
/home/claude/gpe20-v2.3.0-build79/docs/CASE-STUDIES/
```

### **CARD E: Browser Testing Priority**

```
Priority Order:
1. Safari iOS (Peter's primary device)
2. Chrome iOS (common, strict viewport)
3. Edge iOS (usually similar to Safari)
4. Desktop Chrome (development)
5. Desktop Safari, Firefox, Edge (nice to have)

Always Test:
- Modal open/close
- Scroll behavior
- Touch interactions
- Viewport fit
- Button positioning
```

### **CARD F: When in Doubt**

```
┌─────────────────────────────────────────┐
│ WHEN IN DOUBT                           │
├─────────────────────────────────────────┤
│ 1. Check PROJECT-STANDARDS.md           │
│ 2. Review similar past builds           │
│ 3. Ask Peter clarifying questions       │
│ 4. Propose options with recommendation  │
│ 5. Never guess on critical decisions    │
└─────────────────────────────────────────┘
```

---

## 13. APPENDICES

### **APPENDIX A: Build79 Feature Summary**

**Complete Feature Set:**
- ✅ Sticky X button (stays visible on scroll)
- ✅ Modal spacing (40px top, comfortable breathing room)
- ✅ Mobile title size (24px, readable)
- ✅ Full backdrop coverage (grey covers entire viewport)
- ✅ Body scroll lock (page frozen, scroll preserved)
- ✅ Chrome mobile viewport fit (modal fits within screen)
- ✅ Safari scroll fix (webkit momentum)
- ✅ Cross-browser compatible (Safari, Chrome, Edge iOS + desktop)

**Browser Compatibility:**
- Safari iOS: ✅ Perfect
- Chrome iOS: ✅ Perfect (Build79 fix)
- Edge iOS: ✅ Perfect
- Desktop all: ✅ Perfect

**Mobile Experience:** Gold Standard  
**Desktop Experience:** Maintained Excellence  
**Production Status:** Ready to Deploy

### **APPENDIX B: Common Pitfalls to Avoid**

**❌ DON'T:**
1. Skip reading PROJECT-STANDARDS.md
2. Work from nested build directories (use build79, not build73.5)
3. Use trailing commas in React.createElement props
4. Test only in DevTools (test real mobile devices)
5. Deploy without complete validation
6. Create builds without release notes
7. Continue trial-and-error past 3 attempts
8. Use localStorage in artifacts
9. Ignore Netlify documentation
10. Assume mobile = desktop with smaller screen

**✅ DO:**
1. Read standards before every work session
2. Work from /home/claude/gpe20-v2.3.0-build79
3. Validate React syntax carefully
4. Test on actual Safari iOS
5. Follow BUILD-VALIDATION-SOP.md religiously
6. Document comprehensively
7. Consult Opus when stuck
8. Use memory state instead of localStorage
9. Check Netlify docs for Netlify features
10. Test responsive behavior on real devices

### **APPENDIX C: Peter's Feedback Interpretation**

**"Well done"** = Excellent work, continue this approach  
**"Perfect"** = Exactly right, no changes needed  
**"Solved"** = Issue resolved, can move on  
**"Consider stable"** = Declare stable and create declaration  

**"Better but..."** = Right direction, needs adjustment  
**"Still having..."** = Issue persists, investigate more  
**"Can you..."** = New request, follow build workflow  

**"This isn't working"** = Current approach failed, need systematic investigation  
**Extended silence** = Might be testing, might be stuck, follow up if >1 hour  

**Direct technical question** = Peter is investigating, provide detailed answer

### **APPENDIX D: Glossary**

**Build:** A version of the codebase with specific changes  
**Stable Build:** A build declared production-ready by Peter  
**Release Notes:** Documentation of what changed in a build  
**Validation:** Testing and checks before marking build complete  
**Regression:** Previously working feature breaks  
**Viewport:** Visible area of web page in browser  
**Sticky:** CSS positioning that stays visible on scroll  
**Modal:** Overlay dialog (event details in this project)  
**Backdrop:** Grey overlay behind modal  
**Scroll Lock:** Preventing page scroll behind modal  

**Opus:** Claude Opus 4.5 (expert model for consultations)  
**Sonnet:** Claude Sonnet (you/current model)  
**SOP:** Standard Operating Procedure  
**DevTools:** Browser developer tools  
**CDN:** Content Delivery Network  

### **APPENDIX E: Version History Quick Reference**

**Build73.21** → Previous stable before this session  
**Build74-74.3** → Failed sticky X button attempts  
**Build75** → ✅ STABLE - Sticky X (Opus solution)  
**Build76** → Modal spacing (20px)  
**Build76.1** → ✅ STABLE - More spacing (32px) + Safari scroll  
**Build77** → Mobile title size reduction  
**Build78** → ✅ STABLE - Backdrop + scroll lock  
**Build79** → ✅ STABLE - Chrome mobile viewport (CURRENT)

---

## 14. FINAL CHECKLIST FOR NEW SONNET

**Before Starting Any Work:**

```
□ Read this entire handoff document (all 3 parts)
□ Read PROJECT-STANDARDS.md
□ Read BUILD-VALIDATION-SOP.md
□ Locate Build79 directory: /home/claude/gpe20-v2.3.0-build79
□ Review Build79 release notes
□ Understand build progression (73.21→79)
□ Understand key patterns (sticky wrapper, scroll lock, etc.)
□ Understand Peter's expectations
□ Know when to consult Opus (3+ failures)
□ Have quick reference cards bookmarked mentally
```

**For Every New Build:**

```
□ Read PROJECT-STANDARDS.md (yes, again)
□ Understand the request completely
□ Ask clarifying questions if needed
□ Check if similar issue solved before
□ Plan the implementation
□ Create new build directory
□ Make changes carefully
□ Update versions (version.js + index.html)
□ Validate per BUILD-VALIDATION-SOP.md
□ Create comprehensive release notes
□ Package properly
□ Deliver with clear testing instructions
```

**When Issues Arise:**

```
□ Gather evidence (DevTools, screenshots, user description)
□ Investigate systematically
□ Document findings
□ Propose solution with confidence level
□ If stuck after 3 attempts: Create Opus package
□ Learn from the issue (document in release notes)
```

**After Build Declared Stable:**

```
□ Create stable declaration document
□ Move to STABLE-DECLARATIONS directory
□ Create STABLE-RELEASE.zip
□ This becomes base for next build
□ Update mental model of "current stable"
```

---

## 15. CONCLUDING GUIDANCE

### **Your Mission**

You are inheriting a project at Build79 - a stable, production-ready state with excellent mobile experience across all major browsers. Your job is to:

1. **Maintain this quality standard**
2. **Build incrementally from this stable base**
3. **Follow established processes rigorously**
4. **Learn from documented patterns**
5. **Consult Opus when genuinely stuck**
6. **Document comprehensively for future handoffs**

### **Keys to Success**

**Technical Excellence:**
- Read PROJECT-STANDARDS.md before every work session
- Follow BUILD-VALIDATION-SOP.md for every build
- Test on real devices, especially Safari iOS
- Use proven patterns from Build75-79

**Communication Excellence:**
- Be direct and concise
- Provide evidence and confidence levels
- Ask clarifying questions
- Present options with recommendations

**Process Excellence:**
- Systematic investigation over trial-and-error
- Documentation as comprehensive as code
- Build numbering and versioning discipline
- Opus consultation when appropriate

### **What Makes You Successful**

**Peter values:**
- Zero production issues
- Comprehensive documentation
- Systematic problem-solving
- Learning from failures
- Professional execution

**Peter is frustrated by:**
- Repeated mistakes
- Incomplete testing
- Missing documentation
- Excessive iterations on simple tasks

### **When You Succeed**

You'll hear:
- "Well done"
- "Perfect"
- "Solved"
- "Consider stable"

**This means you're maintaining the quality standard. Keep it up.**

### **Final Reminder**

**This is not just code.** This is:
- Peter's project (personal investment)
- A live website (real users)
- Documentation of institutional knowledge
- Foundation for future work

**Treat it with:**
- Respect for established patterns
- Care in implementation
- Diligence in testing
- Pride in documentation

---

## 🎯 YOU ARE READY

**You now have:**
✅ Complete context (Build73.21→79 progression)  
✅ Current stable state (Build79 details)  
✅ Proven patterns (sticky wrapper, scroll lock, etc.)  
✅ Clear processes (build workflow, validation, documentation)  
✅ Decision trees (troubleshooting paths)  
✅ Quick references (commands, checklists, locations)  
✅ Peter's expectations (quality, communication, execution)

**Your first action when Peter returns:**
```bash
view /home/claude/gpe20-v2.3.0-build79/docs/SOPs/PROJECT-STANDARDS.md
```

**Then ask:** "What's the objective for Build80?"

---

## 📞 HANDOFF COMPLETE

**From:** Claude Sonnet (Build73.21-79 Session)  
**To:** Claude Sonnet (Next Session)  
**Date:** February 3, 2026  
**Status:** Comprehensive, Zero Ambiguity, Ready for Continuity

**You have everything you need to maintain and extend this project at the quality standard Peter expects.**

**Good luck, and remember: When in doubt, check PROJECT-STANDARDS.md.**

---

**END OF COMPREHENSIVE HANDOFF DOCUMENT**

**File Structure:**
- Part 1: Critical Info, Context, Build History, Key Learnings
- Part 2: Processes, Documentation, Technical Stack, Peter's Style  
- Part 3: Troubleshooting, Quick Reference, Checklists, Final Guidance

**All parts stored in:**
```
/home/claude/gpe20-v2.3.0-build79/docs/
├── HANDOFF-MASTER-DOCUMENT-PART1.md
├── HANDOFF-MASTER-DOCUMENT-PART2.md
└── HANDOFF-MASTER-DOCUMENT-PART3.md
```

**Next Sonnet: Start by reading Part 1, then Part 2, then Part 3.**

**May your builds be stable and your validation complete.**
