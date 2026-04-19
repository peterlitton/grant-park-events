# VERSION VALIDATION REQUIREMENTS
# Add this section to BUILD-VALIDATION-SOP.md

## 📦 VERSION MANAGEMENT (Mandatory)

### **PHASE 0: VERSION VALIDATION** ⚠️ BEFORE ANY CODE CHANGES

**Step 0.1: Read Current Version**
```bash
ALWAYS read: /version.js
VERIFY: Current BUILD_VERSION
DOCUMENT: In validation report
```

**Step 0.2: Determine New Version**
```
IF bug fix to current build:
  → Point release (BuildN → BuildN.1 or BuildN.1 → BuildN.2)
  
IF new feature OR after successful deployment:
  → Major release (BuildN.X → BuildN+1)

NEVER skip build numbers
NEVER go backwards
```

**Step 0.3: Validate Increment** ⚠️ MANDATORY
```bash
RUN: ./validate-increment.sh <new-version>
MUST: Return exit code 0 (PASS)
IF FAIL: Do not proceed - fix increment logic
```

---

### **VERSION UPDATE PROCESS**

**Option A: Use Automated Script** ⭐ RECOMMENDED
```bash
./update-version.sh v2.3.0-BuildN "Build notes"

This script:
✓ Validates increment
✓ Backs up current version.js
✓ Updates version.js
✓ Updates admin.html (all occurrences)
✓ Updates index.html (all occurrences)  
✓ Updates PROJECT-STANDARDS.md
✓ Runs validation to confirm consistency
```

**Option B: Manual Update** (Not Recommended)
```
IF you must update manually:
1. Update /version.js
2. Update admin.html (search "Release:")
3. Update index.html (search "Release:")
4. Update PROJECT-STANDARDS.md
5. RUN ./validate-version.sh → MUST PASS
```

---

### **PRE-DELIVERY VERSION VALIDATION** ⚠️ MANDATORY

**Before delivering ANY build:**

```bash
STEP 1: Run version validation
./validate-version.sh

MUST show:
✅ PASS: Version format valid
✅ PASS: PROJECT-STANDARDS.md matches version.js
✅ PASS: admin.html matches version.js
✅ PASS: index.html matches version.js
✅ PASS: ZIP filename matches version.js

IF ANY FAIL:
  → STOP delivery
  → FIX inconsistencies
  → RE-RUN validation
  → Deliver only when PASS
```

**STEP 2: Verify Display**
```
Simulate loading:
- admin.html → Check version appears in footer/header
- index.html → Check version appears in footer/header
Both must show same version from version.js
```

**STEP 3: Verify ZIP Filename**
```
ZIP filename MUST match version.js:
✓ gpe20-v2.3.0-build70.zip
✗ gpe20-v2.3.0-build69.zip (wrong)
```

---

### **POST-DEPLOYMENT VERIFICATION**

**After deploying:**

```bash
STEP 1: Call version endpoint
GET /.netlify/functions/get-version

Response should show:
{
  "version": "v2.3.0-BuildN",
  "buildDate": "YYYY-MM-DD",
  "status": "deployed"
}

VERIFY: Matches what you delivered
```

**STEP 2: Visual Verification**
```
Visit deployed site:
- Check admin panel footer/header
- Check website footer/header
- Both should display correct version
```

---

### **DELIVERY BLOCKERS - VERSION**

**Build CANNOT be delivered if:**

❌ version.js does not exist  
❌ Version format invalid  
❌ admin.html version differs from version.js  
❌ index.html version differs from version.js  
❌ PROJECT-STANDARDS.md version differs from version.js  
❌ ZIP filename differs from version.js  
❌ validate-version.sh returns FAIL  
❌ Increment validation fails  

**ALL must be resolved before delivery**

---

### **FILES TO UPDATE EACH BUILD**

**Mandatory:**
1. ✅ /version.js (source of truth)
2. ✅ admin.html (all "Release:" references)
3. ✅ index.html (all "Release:" references)
4. ✅ docs/SOPs/PROJECT-STANDARDS.md (Current Version line)
5. ✅ ZIP filename
6. ✅ version.lock (audit trail)

**Validation:**
7. ✅ Run ./validate-version.sh → MUST PASS
8. ✅ Run ./validate-increment.sh → MUST PASS

---

### **GOLD STANDARD CHECKLIST**

**Before ANY build delivery:**

- [ ] Read /version.js for current version
- [ ] Determine increment type (point vs major)
- [ ] Run ./validate-increment.sh with new version
- [ ] Update version using ./update-version.sh OR manually
- [ ] Run ./validate-version.sh → MUST show all ✅
- [ ] Verify ZIP filename matches version
- [ ] Include in validation report
- [ ] Confirm version displays correctly in UI
- [ ] After deploy: verify /.netlify/functions/get-version

**Zero tolerance for version mismatches**

---

## 🎯 VERSION VALIDATION REPORT TEMPLATE

Add to every validation report:

```markdown
## 📦 VERSION VALIDATION

**Version:** v2.3.0-BuildN
**Build Date:** YYYY-MM-DD
**Build Notes:** [description]

### Validation Results:
- ✅ version.js format valid
- ✅ Increment validated (BuildN-1 → BuildN)
- ✅ admin.html matches
- ✅ index.html matches
- ✅ PROJECT-STANDARDS.md matches
- ✅ ZIP filename matches
- ✅ All locations consistent

**Version Validation:** PASS
```

---

**This version validation is mandatory for ALL builds, no exceptions.**
