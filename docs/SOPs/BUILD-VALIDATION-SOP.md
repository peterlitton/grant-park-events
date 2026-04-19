# BUILD VALIDATION SOP
## Standard Operating Procedure for All Grant Park Events Builds

**Version:** 2.1  
**Last Updated:** February 7, 2026  
**Updated By:** Claude (Sonnet 4.5) - Added explicit documentation location requirements  
**Applies To:** All builds (Build80+)  
**Owner:** Peter  
**Enforcement:** MANDATORY - Zero tolerance for violations

---

## 🎯 PURPOSE

This SOP ensures every build meets gold standard quality before delivery. Peter should NEVER discover errors Claude could have caught. Quality over speed. No shortcuts.

---

## ⚠️ CRITICAL REMINDERS

**BEFORE STARTING ANY BUILD:**

1. **Documentation Location:**
   - ✅ Release notes go in: `docs/BUILDS/BUILD##-RELEASE-NOTES.md`
   - ✅ Validation reports go in: `docs/BUILDS/BUILD##-VALIDATION-REPORT.md`
   - ❌ DO NOT create documentation in root directory
   - Files in root are historical mistakes

2. **Always Check SOP First:**
   - Read relevant sections before creating files
   - Don't copy patterns from old builds
   - When in doubt, check docs/BUILDS/ for examples

3. **Zero Tolerance:**
   - Every step is mandatory
   - No skipping validation
   - Quality over speed

---

## 📋 PRE-DELIVERY VALIDATION CHECKLIST

Every build MUST pass ALL validation checks before presenting to Peter.

### **STEP 1: SYNTAX VALIDATION**

Run these bash commands and verify all pass:

```bash
cd /home/claude/gpe20-v2.3.0-build##

# 1. Check for nested objects (common React.createElement error)
grep -n "e('.*'.*,.*{.*}.*,.*{" index.html
# MUST return empty (no results = pass)

# 2. Check for missing quotes on className
grep -n "className:[^'\"]" index.html | grep -v "className:'[a-z]"
# MUST return empty

# 3. Check for style not being an object
grep -n "style:[^{]" index.html | grep -v "style:{"
# MUST return empty

# 4. Check for double commas
grep -n "},," index.html
# MUST return empty

# 5. Check for missing quotes on element types
grep -n "e([^'\"]*," index.html
# MUST return empty
```

**If ANY check fails:** Fix the error, re-run ALL checks.

---

### **STEP 2: STRUCTURAL INTEGRITY**

```bash
# Count brackets and braces - must be balanced
echo "Opening braces: $(grep -o "{" index.html | wc -l)"
echo "Closing braces: $(grep -o "}" index.html | wc -l)"
# Numbers must match exactly

echo "Opening brackets: $(grep -o "\[" index.html | wc -l)"
echo "Closing brackets: $(grep -o "\]" index.html | wc -l)"
# Numbers must match exactly

echo "Opening parens: $(grep -o "(" index.html | wc -l)"
echo "Closing parens: $(grep -o ")" index.html | wc -l)"
# Numbers must match exactly
```

**If ANY mismatch:** Find and fix the unmatched character.

---

### **STEP 3: VERSION CONSISTENCY**

**Build10.14.8.3: Single-source version system**

Version is defined ONLY in `/build-version.js`. All other files load it at runtime.
No manual syncing. No cross-file checks. Just verify the one file.

```bash
# 1. Verify build-version.js has correct version
grep "BUILD_VERSION" build-version.js
# MUST show the current build version string

# 2. Verify NO hardcoded BUILD_VERSION declarations exist in HTML files
grep -n "const BUILD_VERSION\|var BUILD_VERSION" index.html admin.html
# MUST return empty — these files load from build-version.js

# 3. Verify NO hardcoded CACHE_VERSION string literal in sw.js
grep -n "CACHE_VERSION = 'gpe-v" sw.js
# MUST return empty — sw.js derives CACHE_VERSION from BUILD_VERSION
# (CACHE_VERSION = 'gpe-' + BUILD_VERSION.toLowerCase() is OK — that's derived)

# 4. Verify script tags are present (files load build-version.js)
grep "build-version.js" index.html admin.html sw.js
# MUST return 3 results (one per file)
```

**CRITICAL:** Only ONE file defines version. Period. If you find a hardcoded
version string in index.html, admin.html, or sw.js — that's a regression.
Remove it immediately and ensure the file loads from build-version.js.

**If ANY check fails:** Fix build-version.js or remove rogue declarations.

---

### **STEP 4: FILE INTEGRITY**

```bash
# Verify essential files exist
ls -la index.html build-version.js admin.html
# ALL must exist

# Check file sizes are reasonable
wc -l index.html
# Should be ~2300-2500 lines (verify not 0 or corrupted)

wc -l build-version.js
# Should be ~25 lines (version source of truth)

# CRITICAL: Verify release notes exist IN CORRECT LOCATION
ls -la docs/BUILDS/BUILD##-RELEASE-NOTES.md
# MUST exist in docs/BUILDS/ directory (NOT root)

# CRITICAL: Verify validation report IN CORRECT LOCATION (if created)
ls -la docs/BUILDS/BUILD##-VALIDATION-REPORT.md 2>/dev/null
# Should exist in docs/BUILDS/ directory for major builds

# VERIFY: No release notes in ROOT directory (common mistake)
ls -la BUILD##-RELEASE-NOTES.md 2>&1 | grep "No such file"
# Should return "No such file" (confirming NOT in root)
```

**CRITICAL RULE:** 
- ✅ Release notes go in: `docs/BUILDS/BUILD##-RELEASE-NOTES.md`
- ❌ DO NOT put in root: `BUILD##-RELEASE-NOTES.md`
- Files in root are historical mistakes to be cleaned up

**If ANY file missing or corrupted:** Fix before proceeding.

---

### **STEP 4b: CONFIG FILE CONTENT VALIDATION (Build10.17.4+)**

**Why this exists:** Build10.17.1-10.17.3 shipped with `netlify.toml` and `_headers` containing Netlify's 404 HTML page instead of valid config. This happened because files were fetched from the live site via HTTP — the catch-all redirect returned `index.html` for those paths. Netlify silently degrades when config files contain garbage (functions stop working, cache headers are ignored).

```bash
# CRITICAL: Verify config files contain valid content, not HTML
# All three must PASS — if any contains <!DOCTYPE, it's corrupted

echo "--- Config file content validation ---"

# 1. _headers must start with a comment, not HTML
head -1 _headers | grep -q "^#" && echo "✅ _headers: valid" || echo "❌ _headers: CORRUPTED (expected # comment, got: $(head -1 _headers))"

# 2. netlify.toml must start with a comment or [section], not HTML
head -1 netlify.toml | grep -qE "^(#|\[)" && echo "✅ netlify.toml: valid" || echo "❌ netlify.toml: CORRUPTED (expected # or [, got: $(head -1 netlify.toml))"

# 3. _redirects must start with a comment or rule, not HTML
head -1 _redirects | grep -qE "^(#|http|/)" && echo "✅ _redirects: valid" || echo "❌ _redirects: CORRUPTED (expected # or rule, got: $(head -1 _redirects))"

# 4. Nuclear check: NO config file should contain <!DOCTYPE anywhere
for f in _headers netlify.toml _redirects; do
  grep -q "<!DOCTYPE" "$f" && echo "❌ $f contains <!DOCTYPE — file is HTML, not config!" || echo "✅ $f: no HTML contamination"
done
```

**If ANY config file is corrupted:** Source the correct version from the previous build package or `docs/` reference copies. NEVER fetch config files from the live site via HTTP (see PROJECT-STANDARDS.md).

---

### **STEP 4c: FEATURE REGISTRY CHECK (Build10.17.5+)**

**Why this exists:** Build10.17.1-10.17.5 silently lost the Inspect clipboard feature from `admin-index-report.html` because the file was sourced from an older build. No errors, no structural failures — the feature just disappeared. Syntax and structure checks cannot detect removed features.

```bash
# Run the feature registry validation script
bash docs/SOPs/feature-registry-check.sh
```

The script greps each file for registered feature signatures listed in `docs/SOPs/FEATURE-REGISTRY.md`. Every pattern must be found.

**If ANY feature check fails:** A feature was silently dropped. Investigate the source file version, restore the missing feature from the correct build, and re-run the check. DO NOT deliver until all features pass.

**Maintaining the registry:** When adding a feature to a frequently-rebuilt file (`admin-index-report.html`, `admin.html`, `index.html`), add a corresponding entry to `FEATURE-REGISTRY.md` with a unique grep pattern.

---

### **STEP 4d: MISSING-FILES CHECK vs PREVIOUS BUILD (Build10.32.2+)**

**Why this exists:** Between Build10.16.8 and Build10.25.8, three files were lost from production without any release note documenting their removal: `admin-dashboard.html`, `netlify/functions/ga4-analytics.js`, and `netlify/functions/gsc-search-analytics.js`. The dashboard URL `https://www.grantparkevents.com/admin-dashboard.html` was a 404 for weeks before anyone noticed. Root cause: a session sourced files from an older build baseline that didn't have those files, then shipped without realizing what was missing. Feature registry catches features removed from inside files; this check catches entire files removed from the build package.

```bash
# Compare file list of new build against previous build
# Anything in the previous build but missing from this one is flagged

# Set these to your build paths
PREV_BUILD=/path/to/gpe20-v2.3.1-BuildXX.X
THIS_BUILD=/path/to/gpe20-v2.3.1-BuildYY.Y

# Generate sorted file lists (relative paths, excluding noise)
find "$PREV_BUILD" -type f \
  -not -path "*/node_modules/*" \
  -not -path "*/.git/*" \
  -not -path "*/__MACOSX/*" \
  -not -name ".DS_Store" \
  | sed "s|$PREV_BUILD/||" | sort > /tmp/prev-files.txt

find "$THIS_BUILD" -type f \
  -not -path "*/node_modules/*" \
  -not -path "*/.git/*" \
  -not -path "*/__MACOSX/*" \
  -not -name ".DS_Store" \
  | sed "s|$THIS_BUILD/||" | sort > /tmp/this-files.txt

# Files in previous build but not in this one
comm -23 /tmp/prev-files.txt /tmp/this-files.txt
# Empty output = no files removed (good)
# Any output = files removed; verify each is intentional per release notes
```

**If ANY files are listed:**
1. Check the release notes for the current build — is the removal documented?
2. If yes (intentional removal), record the removed file in the release notes "Files Removed" section and proceed.
3. If no (accidental loss), STOP — restore the missing file(s) from the previous build and re-run the check.
4. Pay particular attention to `.html` files at the root, files under `netlify/functions/`, files under `netlify/edge-functions/`, and `package.json` — these are the highest-impact losses.

**Common false positives to acknowledge:**
- Old release notes intentionally cleaned up (verify they're now in `docs/BUILDS/`)
- Stale handoff/migration docs being pruned
- Test artifacts and build scratch files

**Common true positives to catch:**
- `admin-*.html` standalone admin pages
- Netlify functions that aren't called from the main admin tab navigation (and therefore aren't tested every build)
- Service worker, manifest, or icon files
- `package.json`, `package-lock.json`, `_headers`, `_redirects`, `netlify.toml`

---

### **STEP 5: VISUAL CODE REVIEW**

**For EVERY line you changed:**

1. **Read the full context** (5 lines before, 5 lines after)
2. **Verify proper nesting** (indentation correct)
3. **Check closing tags/braces** (all matched)
4. **Compare to stable build pattern** (if modifying existing code)
5. **Verify comments added** (explaining WHY, not just WHAT)

**Use diff to see exact changes:**
```bash
diff /home/claude/gpe20-v2.3.0-build79/index.html /home/claude/gpe20-v2.3.0-build##/index.html
```

Review EVERY line in the diff output.

---

### **STEP 6: PATTERN VALIDATION**

**If using established patterns:**

```bash
# Example: If implementing sticky wrapper, compare to nav arrows
grep -A10 "Navigation arrows" /home/claude/gpe20-v2.3.0-build79/index.html
# Compare your implementation to this proven pattern
```

**Verify:**
- Same structure
- Same property names
- Same style approach
- Consistent with codebase

---

### **STEP 7: DOCUMENTATION COMPLETENESS**

**LOCATION REQUIREMENT:**
- ✅ **docs/BUILDS/BUILD##-RELEASE-NOTES.md** (correct location)
- ✅ **docs/BUILDS/BUILD##-VALIDATION-REPORT.md** (for major builds)
- ❌ **DO NOT** create in root directory

**BUILD##-RELEASE-NOTES.md must include:**

- [ ] Overview (what changed)
- [ ] Problem addressed (what was broken/needed)
- [ ] Technical implementation (code details)
- [ ] Why it works (explanation)
- [ ] Testing requirements (specific test cases)
- [ ] Troubleshooting (if something goes wrong)
- [ ] Success criteria (how to know it worked)
- [ ] Comparison to previous build
- [ ] **VALIDATION RESULTS** (see format below)

---

## ✅ VALIDATION RESULTS FORMAT

**Every BUILD##-RELEASE-NOTES.md MUST include this section:**

```markdown
## PRE-DELIVERY VALIDATION RESULTS

✅ **Syntax Validation**
   - React.createElement pattern check: PASS
   - Props object validation: PASS
   - String quote validation: PASS
   - Trailing comma check: PASS
   - Element type validation: PASS

✅ **Structural Integrity**
   - Bracket matching: PASS (### open, ### close)
   - Brace matching: PASS (### open, ### close)  
   - Parenthesis matching: PASS (### open, ### close)

✅ **Version Consistency (Single-Source)**
   - build-version.js: Correct version string
   - index.html: No hardcoded BUILD_VERSION (loads from build-version.js)
   - admin.html: No hardcoded BUILD_VERSION (loads from build-version.js)
   - sw.js: No hardcoded CACHE_VERSION (derives from BUILD_VERSION)
   - All 3 consumer files have build-version.js script/import: Verified

✅ **File Integrity**
   - All essential files present: Verified
   - No empty/corrupted files: Verified
   - Line counts reasonable: Verified
   - Release notes exist: Verified

✅ **Code Review**
   - All changes reviewed: Complete
   - Context checked: Complete
   - Nesting verified: Correct
   - Pattern consistency: Verified
   - Comments added: Complete

✅ **Pattern Validation**
   - Compared to stable build: Complete
   - Follows established patterns: Verified
   - Consistent with codebase: Verified

**VALIDATION STATUS: ALL CHECKS PASSED ✅**

Build ready for delivery.
```

---

## 🎯 PETER'S DIRECT REQUIREMENTS

From Peter (February 3, 2026):

> "I can't specify how you go about testing and validating your own work. It seems to me that if I upload code and it finds a malformed statement that you should be able to catch that before you put it into a build no?"

> "VERY important to test first. you don't need me to tell you there's a syntax error. do the coding, test it. if it returns a syntax error fix it. PLEASE do not force me to find an error you can discover yourself."

> "Do everything you can do to maintain a quality code base and to ensure that what you provide in a release package doesn't include errors. if it requires additional build time that's fine."

**Translation:**
- Quality over speed
- Peter should never find errors Claude could catch
- Comprehensive validation is expected
- Additional time for quality is acceptable
- No excuses for preventable errors

---

## 📝 BUILD WORKFLOW WITH VALIDATION

**Complete workflow (mandatory order):**

1. ✅ Read PROJECT-STANDARDS.md (if not already read this session)
2. ✅ Understand requirement completely
3. ✅ Copy stable build as base
4. ✅ Make code changes
5. ✅ Add comprehensive comments
6. ✅ **RUN STEP 1: Syntax Validation** ← START VALIDATION HERE
7. ✅ **RUN STEP 2: Structural Integrity**
8. ✅ **RUN STEP 3: Version Consistency**
9. ✅ **RUN STEP 4: File Integrity**
10. ✅ **RUN STEP 5: Visual Code Review**
11. ✅ **RUN STEP 6: Pattern Validation**
12. ✅ Create comprehensive release notes
13. ✅ **ADD STEP 7: Validation Results to release notes**
14. ✅ Create package (ONLY after all validation passes)
15. ✅ Move to outputs
16. ✅ Present to Peter

**If ANY validation fails:** Return to step 4, fix, and restart validation from step 6.

---

## 🏆 GOLD STANDARD DEFINITION

**A build meets gold standard when:**

- ✅ All 7 validation phases pass
- ✅ Zero syntax errors
- ✅ Zero structural errors  
- ✅ Version consistent everywhere
- ✅ All files present and valid
- ✅ Every change visually reviewed
- ✅ Patterns match established code
- ✅ Comprehensive documentation
- ✅ Validation results documented
- ✅ Ready for immediate deployment

**Peter's deployment process:**
1. Downloads build package
2. Unzips locally
3. Drag/drop to Netlify
4. Tests on actual devices (Safari iOS, Chrome iOS, Desktop)

**Peter does NOT:**
- Test locally (unreliable)
- Debug syntax errors
- Fix validation issues
- Re-run builds

**Therefore:** Build MUST be deployment-ready when delivered.

---

**END OF BUILD VALIDATION SOP v2.0**
