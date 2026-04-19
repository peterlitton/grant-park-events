# QUICK START GUIDE - BUILD79 HANDOFF
## Fast Reference for Next Claude Session

**Last Updated:** February 3, 2026  
**Current Stable:** v2.3.0-Build79  
**Quick Read Time:** 5 minutes

---

## 🚨 START HERE - MANDATORY FIRST STEPS

**BEFORE doing ANYTHING:**

1. **Read the full handoff:**
   ```
   view('/home/claude/gpe20-v2.3.0-build79/SONNET-HANDOFF-BUILD79-SESSION-SUMMARY.md')
   ```

2. **Read project standards:**
   ```
   view('/mnt/user-data/uploads/docs/SOPs/PROJECT-STANDARDS.md')
   ```

3. **Read build validation SOP:**
   ```
   view('/mnt/user-data/uploads/docs/SOPs/BUILD-VALIDATION-SOP.md')
   ```

**Never skip these. Peter has zero tolerance for builds that don't follow standards.**

---

## 📍 CURRENT STATE

**Stable Build:** v2.3.0-Build79  
**Location:** `/home/claude/gpe20-v2.3.0-build79/`  
**Status:** Production-ready, all browsers tested and working

**What Works:**
- ✅ Sticky X button (Build75)
- ✅ Modal spacing 40px top (Build76.1)
- ✅ Safari scroll fix (Build76.1)
- ✅ Mobile titles 24px (Build77)
- ✅ Full backdrop coverage (Build78)
- ✅ Body scroll lock (Build78)
- ✅ Chrome mobile viewport (Build79)

**Tested On:**
- Safari iOS ✅
- Chrome iOS ✅
- Edge iOS ✅
- Desktop (all browsers) ✅

---

## ⚡ QUICK BUILD PROCESS

**For ANY new build:**

```bash
# 1. Copy stable build
cp -r /home/claude/gpe20-v2.3.0-build79 /home/claude/gpe20-v2.3.0-build80

# 2. Make your changes
cd /home/claude/gpe20-v2.3.0-build80
# Edit files...

# 3. Update version
# Edit version.js manually
sed -i 's/v2.3.0-Build79/v2.3.0-Build80/g' index.html

# 4. Verify version
grep -c "v2.3.0-Build80" index.html  # Should show 2

# 5. Create package
cd /home/claude
zip -qr gpe20-v2.3.0-build80-VALIDATED.zip gpe20-v2.3.0-build80/

# 6. Move to outputs
cp gpe20-v2.3.0-build80-VALIDATED.zip /mnt/user-data/outputs/
cp gpe20-v2.3.0-build80/BUILD80-RELEASE-NOTES.md /mnt/user-data/outputs/

# 7. Present
present_files([
  '/mnt/user-data/outputs/gpe20-v2.3.0-build80-VALIDATED.zip',
  '/mnt/user-data/outputs/BUILD80-RELEASE-NOTES.md'
])
```

---

## 🎯 KEY PATTERNS (COPY-PASTE READY)

### **Sticky Wrapper Pattern:**
```javascript
e('div', {
  className: 'sticky z-50',
  style: {top: '16px', height: '0', pointerEvents: 'none'}
}, 
  e('button', {
    className: 'absolute top-0 right-4 bg-white rounded-full p-2',
    style: {pointerEvents: 'auto'}
  }, 'Content')
)
```

### **Body Scroll Lock (iOS Compatible):**
```javascript
// On open:
const scrollY = window.scrollY;
document.body.style.overflow = 'hidden';
document.body.style.position = 'fixed';
document.body.style.width = '100%';
document.body.style.top = `-${scrollY}px`;

// On close:
const scrollY = document.body.style.top;
document.body.style.overflow = '';
document.body.style.position = '';
document.body.style.width = '';
document.body.style.top = '';
if(scrollY) window.scrollTo(0, parseInt(scrollY || '0') * -1);
```

### **Responsive Typography:**
```javascript
className: 'text-2xl sm:text-4xl font-bold'
// Mobile < 640px: 24px
// Desktop ≥ 640px: 36px
```

### **Full Viewport Modal:**
```javascript
e('div', {
  className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 pt-10 z-50',
  onClick: () => closeModal()
},
  e('div', {
    className: 'bg-white rounded-2xl max-w-4xl w-full max-h-[85vh] overflow-y-auto',
    style: {WebkitOverflowScrolling: 'touch'},
    onClick: (ev) => ev.stopPropagation()
  }, 'Content')
)
```

---

## 📂 FILE LOCATIONS

**Current Build:**
```
/home/claude/gpe20-v2.3.0-build79/
```

**Documentation:**
```
/home/claude/gpe20-v2.3.0-build79/docs/build-history/
/mnt/user-data/uploads/docs/SOPs/
```

**Key Files:**
```
index.html          # Main app
version.js          # Version tracking
admin.html          # Admin interface
```

---

## 🎭 PETER'S EXPECTATIONS

**Communication:**
- ✅ Ask questions, don't assume
- ✅ Present options with recommendations
- ✅ Document comprehensively
- ✅ Show your work

**Quality:**
- ✅ Zero tolerance for production issues
- ✅ Gold standard validation every build
- ✅ Test on actual devices
- ✅ Follow all SOPs

**Documentation:**
- ✅ Over-explain rather than leave gaps
- ✅ Include WHY, not just WHAT
- ✅ Comprehensive testing requirements
- ✅ Troubleshooting protocols

---

## 🚨 WHEN STUCK

**After 3-4 failed attempts:**
1. Stop trying random solutions
2. Ask Peter to consult Opus
3. Provide comprehensive context
4. Implement Opus guidance

**Build75 success:** Opus consultation after 4 failures → A+ solution

---

## ✅ VALIDATION CHECKLIST

**Every build must:**
- [ ] Follow established patterns
- [ ] Update version (version.js + index.html)
- [ ] Create comprehensive release notes
- [ ] Test on Safari iOS, Chrome iOS, Desktop
- [ ] Pass BUILD-VALIDATION-SOP.md requirements
- [ ] Get Peter's approval before considering stable

---

## 🎯 KEY REMINDERS

1. **Mobile matters:** 50% of users on mobile
2. **Browser differences:** Safari ≠ Chrome ≠ Edge
3. **Test on actual devices:** Don't assume
4. **Document everything:** Peter prefers over-explaining
5. **Ask before proceeding:** Don't assume approval
6. **Use existing patterns:** They're proven to work
7. **Consult Opus when stuck:** It works

---

## 📊 BROWSER COMPATIBILITY

| Browser | Device | Status |
|---------|--------|--------|
| Safari | iOS | ✅ All features working |
| Chrome | iOS | ✅ Build79 fixed viewport |
| Edge | iOS | ✅ All features working |
| All | Desktop | ✅ All features working |

---

## 🔧 COMMON COMMANDS

**View file:**
```bash
view('/home/claude/gpe20-v2.3.0-build79/index.html', [1847, 1860])
```

**Find pattern:**
```bash
grep -n "sticky" /home/claude/gpe20-v2.3.0-build79/index.html
```

**Compare builds:**
```bash
diff /home/claude/gpe20-v2.3.0-build79/index.html /home/claude/gpe20-v2.3.0-build80/index.html
```

**Check version:**
```bash
grep -c "v2.3.0-Build80" /home/claude/gpe20-v2.3.0-build80/index.html
```

---

## 📝 BUILD NAMING

**Format:** `v2.3.0-Build##`

**Examples:**
- Build80 (new feature)
- Build80.1 (refinement of Build80)
- Build81 (next feature)

---

## 🎓 LESSONS LEARNED

1. **Consult Opus when stuck** (proven effective)
2. **Test on actual browsers** (they behave differently)
3. **Small changes, big impact** (Build79: 90vh→85vh solved issue)
4. **Documentation prevents gaps** (Peter's preference)
5. **Patterns exist in codebase** (use them)
6. **Mobile ≠ Desktop** (design mobile-first)
7. **Iterate deliberately** (learn from each attempt)
8. **Preserve user context** (scroll position matters)
9. **Comments explain business** (WHY not just WHAT)
10. **Risk assessment builds trust** (show your thinking)

---

## ⚡ EMERGENCY ROLLBACK

**If Build80 fails:**

```bash
# Use Build79 stable
cd /home/claude/gpe20-v2.3.0-build79
zip -qr gpe20-v2.3.0-build79-ROLLBACK.zip .
cp gpe20-v2.3.0-build79-ROLLBACK.zip /mnt/user-data/outputs/
```

---

## 📚 FULL DOCUMENTATION

**For complete details, read:**
- SONNET-HANDOFF-BUILD79-SESSION-SUMMARY.md (comprehensive)
- PROJECT-STANDARDS.md (project rules)
- BUILD-VALIDATION-SOP.md (validation process)
- Build history in /docs/build-history/

---

**You're ready to start Build80!**

**Remember:**
1. Read mandatory docs first
2. Follow established patterns
3. Test comprehensively
4. Document thoroughly
5. Get approval

**Good luck!**
