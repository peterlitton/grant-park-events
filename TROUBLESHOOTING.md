# TROUBLESHOOTING GUIDE - Gold Standard Build Numbering

**Last Updated:** January 31, 2026  
**System Version:** v2.3.0-Build69.3

---

## 🔧 COMMON ISSUES & SOLUTIONS

### **1. "Cannot extract version from PROJECT-STANDARDS.md"**

**Error Message:**
```
❌ ERROR: Cannot extract version from PROJECT-STANDARDS.md
File format may have changed or parsing needs update
```

**Cause:**
- Line format changed in PROJECT-STANDARDS.md
- Markdown formatting is different
- Multiple "Current Version" strings confusing parser

**Solution:**
```bash
# Check current format
grep "Current Version" docs/SOPs/PROJECT-STANDARDS.md

# Expected format:
**Current Version:** v2.3.0-BuildN (description)

# If different, update validate-version.sh parsing
# Line to modify: VERSION_STANDARDS=$(grep...)
```

---

### **2. "Multiple versions found in admin.html"**

**Error Message:**
```
❌ FAIL: Multiple different versions found:
   - v2.3.0-Build69.2
   - v2.3.0-Build68.2
```

**Cause:**
- Old version references weren't updated
- Manual edits left inconsistent versions
- Search/replace didn't catch all occurrences

**Solution:**
```bash
# Find all version references
grep -n "Release: v" admin.html

# Manually update each to match version.js
# Then re-run validation
./validate-version.sh
```

---

### **3. "Validation fails after running update-version.sh"**

**Error Message:**
```
❌ VERSION VALIDATION: FAIL
admin.html: Does NOT match version.js
```

**Cause:**
- Sed command didn't match the format in HTML
- Version string format changed
- Regex pattern needs update

**Solution:**
```bash
# Check what update-version.sh is looking for
grep "sed -i" update-version.sh

# Current pattern: Release: v[0-9.]*-[Bb]uild[0-9.]*

# If your format is different, update the pattern
# Example: If using "Version:" instead of "Release:"
sed -i "s/Version: v[0-9.]*-[Bb]uild[0-9.]*/Version: $NEW_VERSION/g" admin.html
```

---

### **4. "validate-increment.sh rejects valid increment"**

**Error Message:**
```
❌ INVALID INCREMENT: Unrecognized pattern
From: Build69.2
To: Build70
```

**Cause:**
- Script doesn't recognize the increment pattern
- Edge case not handled

**Solution:**
```bash
# Check what the script expects
./validate-increment.sh --help

# Valid patterns:
# - Build69 → Build69.1 (point release)
# - Build69.1 → Build69.2 (continued point)
# - Build69.2 → Build70 (major after point)

# If your pattern should be valid, update validate-increment.sh
```

---

### **5. "No version found in admin.html"**

**Error Message:**
```
⚠️ WARN: No version found in admin.html
```

**Cause:**
- Version display removed from HTML
- String format changed (e.g., "Version:" instead of "Release:")
- Not using standard "Release: vX.X.X-BuildN" format

**Solution:**
```bash
# Search for what's actually in the file
grep -i "version\|release\|build" admin.html | grep -v "//.*version"

# Add version display if missing:
# In admin.html footer, add:
React.createElement('p', { className: 'text-white text-xs mt-2 opacity-75' }, 'Release: v2.3.0-Build69.3')
```

---

### **6. "Dry-run mode not working"**

**Error Message:**
```
Files were modified even with --dry-run
```

**Cause:**
- Old version of update-version.sh without dry-run support
- Typo in flag (e.g., --dryrun instead of --dry-run)

**Solution:**
```bash
# Check if dry-run is supported
./update-version.sh --help

# Should show:
# Usage: ./update-version.sh [--dry-run] <new-version> <build-notes>

# If not, you have old version - get Build69.3 or later
```

---

### **7. "Pre-flight check fails"**

**Error Message:**
```
❌ ERROR: Cannot extract version from PROJECT-STANDARDS.md
```

**Cause:**
- File format incompatible with extraction script
- This is the new pre-flight check working correctly

**Solution:**
```bash
# This is good! Pre-flight caught an issue before modifying files

# Fix PROJECT-STANDARDS.md format:
**Current Version:** v2.3.0-BuildN (description)

# Then try again
./update-version.sh v2.3.0-BuildN "notes"
```

---

### **8. "validate-version.sh passes but version still wrong on deployed site"**

**Symptom:**
- Validation shows ✅ PASS
- But website shows old version

**Cause:**
- Old deployment still cached
- Forgot to deploy new build
- Browser cache showing old HTML

**Solution:**
```bash
# 1. Verify version endpoint
curl https://www.grantparkevents.com/.netlify/functions/get-version

# 2. Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)

# 3. Check Netlify deployment:
# - Did new build deploy?
# - Check deployment log for errors
# - Verify files uploaded

# 4. Check version.js was included in ZIP
unzip -l gpe20-v2.3.0-buildN.zip | grep version.js
```

---

### **9. "How do I rollback a version update?"**

**Situation:**
- Ran update-version.sh
- Want to undo changes

**Solution:**
```bash
# Option 1: Use backup (if it exists)
ls version.js.backup-*
cp version.js.backup-v2.3.0-Build69.2 version.js

# Option 2: Manual rollback
# 1. Edit version.js - change BUILD_VERSION back
# 2. Run update-version.sh with old version
./update-version.sh v2.3.0-Build69.2 "Rolled back"

# Option 3: Git (if using version control)
git checkout version.js admin.html index.html docs/SOPs/PROJECT-STANDARDS.md
```

---

### **10. "Scripts have wrong permissions (permission denied)"**

**Error Message:**
```
bash: ./validate-version.sh: Permission denied
```

**Cause:**
- Scripts not executable
- Happens after unzipping build

**Solution:**
```bash
# Make all scripts executable
chmod +x *.sh

# Or individually:
chmod +x validate-version.sh
chmod +x validate-increment.sh
chmod +x update-version.sh
chmod +x validate-syntax.sh
```

---

## 📞 GETTING HELP

### **Before Asking for Help:**

1. ✅ Run `./validate-version.sh` - capture full output
2. ✅ Check `version.js` - confirm format
3. ✅ Check `PROJECT-STANDARDS.md` - confirm format
4. ✅ Check script permissions - run `ls -la *.sh`
5. ✅ Try `--dry-run` mode first

### **Information to Provide:**

```bash
# System info
cat version.js | head -10
grep "Current Version" docs/SOPs/PROJECT-STANDARDS.md
ls -la *.sh
./validate-version.sh 2>&1 | tee validation-output.txt
```

---

## 🔍 DEBUGGING TIPS

### **Enable Verbose Mode:**

```bash
# Add to top of any script:
set -x  # Print each command before executing

# Or run with bash -x:
bash -x ./validate-version.sh
```

### **Test Extraction Manually:**

```bash
# Test PROJECT-STANDARDS.md extraction:
grep "\*\*Current Version:\*\*" docs/SOPs/PROJECT-STANDARDS.md | head -1 | sed 's/.*Current Version:\*\* //' | sed 's/ (.*//' | sed 's/  .*//') 

# Test admin.html extraction:
grep -o "Release: v[0-9.]*-[Bb]uild[0-9.]*" admin.html | sort -u

# Test version.js extraction:
grep "BUILD_VERSION = " version.js | sed "s/.*'\(.*\)'.*/\1/"
```

---

## ✅ VERIFICATION CHECKLIST

**After fixing any issue:**

- [ ] Run `./validate-version.sh` → Should show ✅ PASS
- [ ] Check all files manually - version matches
- [ ] Test dry-run - `./update-version.sh --dry-run v2.3.0-BuildN "test"`
- [ ] Verify scripts are executable - `ls -la *.sh`
- [ ] Test increment validation works
- [ ] Package build and verify ZIP contains version.js

---

**If issue not listed here, document it and add to this guide!**
