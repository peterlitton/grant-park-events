# GOLD STANDARD BUILD NUMBERING SYSTEM

**Status:** COMPLETE  
**Date:** January 31, 2026  
**Purpose:** Institutionalize build versioning across all chats and Claude instances

---

## 🎯 SYSTEM OVERVIEW

**Problem Solved:**
- Build numbers were manual/arbitrary
- No single source of truth
- Easy to get out of sync
- No validation before delivery
- Version displays could mismatch

**Solution:**
- `/version.js` as single source of truth
- Automated validation scripts
- Increment validation
- Update scripts
- Post-deployment verification

---

## 📂 FILES IN THIS SYSTEM

### **1. version.js** - SOURCE OF TRUTH
**Location:** Project root  
**Purpose:** Defines current version, all other files reference this  
**Contents:**
```javascript
export const BUILD_VERSION = 'v2.3.0-Build69.1';
export const BUILD_DATE = '2026-01-31';
export const BUILD_NOTES = 'Description';
```

### **2. validate-version.sh** - CONSISTENCY CHECKER
**Location:** Project root  
**Purpose:** Validates all files have matching versions  
**Usage:** `./validate-version.sh`  
**Checks:**
- version.js format valid
- admin.html matches
- index.html matches
- PROJECT-STANDARDS.md matches
- ZIP filename matches

### **3. validate-increment.sh** - INCREMENT VALIDATOR
**Location:** Project root  
**Purpose:** Ensures new version is valid increment  
**Usage:** `./validate-increment.sh v2.3.0-Build70`  
**Validates:**
- No skipped build numbers
- No backwards movement
- Proper point/major increment logic

### **4. update-version.sh** - AUTOMATED UPDATER
**Location:** Project root  
**Purpose:** Updates version across ALL files automatically  
**Usage:** `./update-version.sh v2.3.0-Build70 "Bug fix"`  
**Updates:**
- version.js
- admin.html (all occurrences)
- index.html (all occurrences)
- PROJECT-STANDARDS.md
- Runs validation automatically

### **5. get-version.js** - DEPLOYMENT VERIFICATION
**Location:** /netlify/functions/  
**Purpose:** Returns deployed version via API  
**Usage:** `GET /.netlify/functions/get-version`  
**Returns:** JSON with current deployed version

### **6. version.lock** - AUDIT TRAIL
**Location:** Project root  
**Purpose:** JSON history of all versions  
**Contents:** Current, previous, full history

---

## 🔄 WORKFLOW

### **Creating a New Build:**

**STEP 1: Read Current Version**
```bash
# Read version.js
Current version: v2.3.0-Build69.1
```

**STEP 2: Determine Increment Type**
```
Bug fix? → Point release (Build69.1 → Build69.2)
New feature? → Major release (Build69.1 → Build70)
```

**STEP 3: Validate Increment**
```bash
./validate-increment.sh v2.3.0-Build70
# Must return ✅ PASS
```

**STEP 4: Update Version** ⭐ RECOMMENDED
```bash
./update-version.sh v2.3.0-Build70 "Added feature X"

# This automatically:
# - Updates version.js
# - Updates admin.html
# - Updates index.html
# - Updates PROJECT-STANDARDS.md
# - Runs validation
```

**OR Manual Update:** (Not recommended)
```bash
# Edit version.js manually
# Edit admin.html manually
# Edit index.html manually
# Edit PROJECT-STANDARDS.md manually
# Then run:
./validate-version.sh  # MUST PASS
```

**STEP 5: Validate Before Delivery**
```bash
./validate-version.sh
# ALL checks must show ✅ PASS
```

**STEP 6: Package Build**
```bash
# ZIP filename MUST match version.js
zip -r gpe20-v2.3.0-build70.zip .
```

**STEP 7: Deliver with Validation Report**
```
Include:
- Build ZIP
- Validation report showing version checks passed
```

**STEP 8: Post-Deployment Verify**
```bash
# After deploying:
curl https://www.grantparkevents.com/.netlify/functions/get-version

# Verify version matches what you deployed
```

---

## ✅ INCREMENT RULES

### **Point Release (BuildN.X)**
**When:** Bug fix to current build  
**Examples:**
- Build69 → Build69.1 (first bug fix)
- Build69.1 → Build69.2 (second bug fix)
- Build69.2 → Build69.3 (third bug fix)

### **Major Release (BuildN+1)**
**When:** 
- New feature
- After point release deployed successfully
- Significant change

**Examples:**
- Build69 → Build70
- Build69.1 → Build70
- Build69.5 → Build70

### **Invalid Increments:**
❌ Build69 → Build71 (skipped 70)  
❌ Build70 → Build69 (backwards)  
❌ Build69.1 → Build69.3 (skipped 69.2)  

---

## 🛡️ SAFEGUARDS

**7 Layers of Protection:**

1. ✅ **version.js** - Single source of truth in code
2. ✅ **validate-version.sh** - Automated consistency check
3. ✅ **validate-increment.sh** - Prevents invalid increments
4. ✅ **update-version.sh** - Eliminates manual errors
5. ✅ **get-version.js** - Post-deployment verification
6. ✅ **version.lock** - Audit trail
7. ✅ **BUILD-VALIDATION-SOP.md** - Mandatory process

---

## 🎯 CROSS-CHAT RELIABILITY

### **How Future Claude Instances Know Current Version:**

**Layer 1:** Read `/version.js` (lives in code, travels with builds)  
**Layer 2:** Read `PROJECT-STANDARDS.md` (automatic habit)  
**Layer 3:** Memory points to `BUILD-VALIDATION-SOP.md`  
**Layer 4:** SOP requires reading version before any work  

**All four would have to fail for version to drift**

---

## 📊 VALIDATION CHECKLIST

**Before delivering ANY build:**

- [ ] Read /version.js for current version
- [ ] Determine increment type
- [ ] Run `./validate-increment.sh <new-version>` → PASS
- [ ] Run `./update-version.sh <new-version> "<notes>"`
- [ ] Run `./validate-version.sh` → ALL ✅
- [ ] Verify ZIP filename matches version
- [ ] Include version validation in report
- [ ] After deploy: check `/.netlify/functions/get-version`

---

## 🚀 IMPLEMENTATION STEPS

**To add this system to a build:**

1. Copy all files to project root:
   - version.js
   - validate-version.sh
   - validate-increment.sh  
   - update-version.sh
   
2. Copy to /netlify/functions/:
   - get-version.js
   
3. Make scripts executable:
   ```bash
   chmod +x validate-version.sh
   chmod +x validate-increment.sh
   chmod +x update-version.sh
   ```

4. Add to BUILD-VALIDATION-SOP.md:
   - Version validation requirements
   - Pre-delivery checklist
   
5. Update PROJECT-STANDARDS.md:
   - Reference gold standard system

6. Run initial validation:
   ```bash
   ./validate-version.sh
   ```

---

## 📝 EXAMPLE USAGE

**Scenario: Fixing a bug in Build69.1**

```bash
# Step 1: Check current version
cat version.js
# Shows: BUILD_VERSION = 'v2.3.0-Build69.1'

# Step 2: Determine it's a bug fix → point release
# New version: v2.3.0-Build69.2

# Step 3: Validate increment
./validate-increment.sh v2.3.0-Build69.2
# ✅ VALID INCREMENT: Continued point release

# Step 4: Update version
./update-version.sh v2.3.0-Build69.2 "Fixed time validation display bug"
# Updates all files automatically

# Step 5: Verify
./validate-version.sh
# ✅ VERSION VALIDATION: PASS

# Step 6: Package
zip -r gpe20-v2.3.0-build69.2.zip .

# Step 7: Deliver with validation report
```

---

## 🎊 BENEFITS

**What This System Guarantees:**

✅ Version consistency across all files  
✅ No skipped build numbers  
✅ No backwards movement  
✅ Automated validation before delivery  
✅ Post-deployment verification  
✅ Audit trail of all versions  
✅ Works across multiple chats/Claude instances  
✅ Human and machine readable  
✅ Zero manual tracking required  

---

**This is the gold standard for build numbering. Use it for every build going forward.**
