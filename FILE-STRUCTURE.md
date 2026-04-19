# GRANT PARK EVENTS - FILE STRUCTURE GUIDE

**Last Updated:** February 1, 2026  
**Build:** v2.3.0-Build72  
**Purpose:** Orientation guide for project file organization

---

## 📂 ROOT DIRECTORY

### **Approved .md Files (ONLY these allowed in root):**
✅ `README.md` - Project entry point and deployment guide  
✅ `BUILD-HISTORY.md` - Complete changelog of all builds  
✅ `FILE-STRUCTURE.md` - This file (orientation guide)  
✅ `BUILD[XX]-RELEASE-NOTES.md` - Current build only (historical go to archive)  
✅ `TROUBLESHOOTING.md` - Operational reference  
✅ `STABLE-RELEASE.md` - Rollback target reference  
✅ `GOLD-STANDARD-DOCUMENTATION.md` - Build process documentation  
✅ `CHAT-HANDOFF.md` - AI session continuity (moved to /docs/AI/ in Build72)

### **Project Files:**
- `index.html` - Main public website  
- `admin.html` - Admin panel  
- `admin-index-report.html` - Admin reporting tool  
- `admin-function-tests.html` - Function testing tool  
- `diagnostic-events.html` - Event diagnostics  
- `reset-storage.html` - Storage management  
- `netlify.toml` - Netlify configuration  
- `package.json` - Dependencies  
- `_headers` - HTTP headers  
- `_redirects` - URL redirects  
- `robots.txt` - Search engine instructions  
- `sitemap.xml` - Site map  
- `googleb*.html` - Google Search Console verification

### **Directories:**
- `/assets/` - Images, icons, static files  
- `/netlify/` - Netlify functions  
- `/docs/` - All documentation  
- `/scripts/` - Build automation tools (NEW in Build71.3)

---

## 🛠️ /scripts/ DIRECTORY

**Purpose:** Build automation and version management tools

**Contents:**
- `version.js` - Version source of truth  
- `update-version.sh` - Update version across all files  
- `validate-version.sh` - Verify version consistency  
- `validate-increment.sh` - Validate version numbering  
- `validate-syntax.sh` - Syntax checking  
- `version.js.backup-*` - Version backups

**Usage:**
```bash
# From project root:
/scripts/validate-syntax.sh
/scripts/validate-version.sh
/scripts/update-version.sh v2.3.0-Build73 "Description"
```

---

## 📚 /docs/ DIRECTORY STRUCTURE

```
/docs/
  ├── README.md - Orientation to /docs/ subdirectories
  ├── PROJECT-STATUS.md - Current project state
  │
  ├── /SOPs/ - Standard Operating Procedures
  │   ├── PROJECT-STANDARDS.md - Project-wide standards
  │   ├── BUILD-VALIDATION-SOP.md - Build validation process
  │   ├── DEPLOYMENT-SOP.md - Deployment procedure
  │   ├── TESTING-SOP.md - Testing checklist
  │   └── IMAGE-PATH-SOP.md - Image handling rules
  │
  ├── /BUILDS/ - Build documentation
  │   ├── BUILD-HISTORY.md - Also in root
  │   ├── /RELEASE-NOTES/ - Historical release notes
  │   ├── /VALIDATION-REPORTS/ - Build validation reports
  │   └── /IMPLEMENTATION-GUIDES/ - Feature implementation docs
  │
  ├── /BUGS/ - Bug tracking
  │   ├── ACTIVE-BUGS.md - Currently open bugs
  │   └── BUG-2026-00X.md - Individual bug logs
  │
  ├── /ROADMAP/ - Features & planning
  │   ├── FUTURE-FEATURES-OPEN-ONLY.md - Open feature requests
  │   └── COMPLETED-FEATURES-ARCHIVE.md - Completed features
  │
  ├── /EVENTS/ - Event data documentation
  │   ├── 2026-EVENTS-SPREADSHEET-DOCS.md - Event tracking
  │   └── EVENT-IMAGES-CATALOG.md - Image inventory
  │
  ├── /INTEGRATION/ - Third-party integrations
  │   └── EMAILOCTOPUS-*.md - Integration docs
  │
  ├── /TESTING/ - Test documentation
  │
  ├── /METRICS/ - Analytics & metrics
  │
  ├── /AI/ - AI session continuity (NEW in Build72)
  │   └── CHAT-HANDOFF.md - Session handoff content
  │
  └── /HISTORICAL/ - Archived one-time docs (NEW in Build72)
      └── WIX-REDIRECT-CLEANUP.md - Migration documentation
```

---

## 🎯 DECISION GUIDE: WHERE DOES THIS GO?

### **"I have a new .md file, where does it go?"**

**Is it current build release notes?**  
→ Root as `BUILD[XX]-RELEASE-NOTES.md`

**Is it project entry point / deployment guide?**  
→ Root as `README.md`

**Is it frequently referenced troubleshooting?**  
→ Root as `TROUBLESHOOTING.md`

**Is it a Standard Operating Procedure?**  
→ `/docs/SOPs/`

**Is it an old build's release notes?**  
→ `/docs/BUILDS/RELEASE-NOTES/`

**Is it a validation report?**  
→ `/docs/BUILDS/VALIDATION-REPORTS/`

**Is it feature implementation details?**  
→ `/docs/BUILDS/IMPLEMENTATION-GUIDES/`

**Is it AI session handoff content?**  
→ `/docs/AI/`

**Is it historical one-time documentation?**  
→ `/docs/HISTORICAL/`

**Is it bug tracking?**  
→ `/docs/BUGS/`

**Is it future feature planning?**  
→ `/docs/ROADMAP/`

---

## 📋 EXAMPLES

### **Example 1: Completing BUILD73**

**After completing BUILD73:**
1. `BUILD73-RELEASE-NOTES.md` → Root  
2. Move `BUILD72-RELEASE-NOTES.md` → `/docs/BUILDS/RELEASE-NOTES/`  
3. `BUILD73-VALIDATION-REPORT.md` → `/docs/BUILDS/VALIDATION-REPORTS/`  
4. Update `BUILD-HISTORY.md` (stays in root)

---

### **Example 2: Creating Migration Guide**

**One-time migration:**  
→ `/docs/HISTORICAL/`

**Ongoing integration:**  
→ `/docs/INTEGRATION/`

---

### **Example 3: Documenting Feature Implementation**

**Feature implementation details:**  
`BUILD[XX]-FEATURE-NAME-IMPLEMENTATION.md` → `/docs/BUILDS/IMPLEMENTATION-GUIDES/`

---

## 🚫 PROHIBITED IN ROOT

**Never put these in root:**
- Old BUILD[XX]-RELEASE-NOTES.md files (archive them)
- BUILD[XX]-VALIDATION-REPORT.md files (goes to /docs/BUILDS/VALIDATION-REPORTS/)
- BUILD[XX]-IMPLEMENTATION-GUIDE.md files (goes to /docs/BUILDS/IMPLEMENTATION-GUIDES/)
- BUILD[XX]-STAGING-SUMMARY.md files (goes to /docs/BUILDS/)
- Internal process documentation (goes to /docs/SOPs/)
- Migration guides (goes to /docs/HISTORICAL/)
- AI handoff files (goes to /docs/AI/)
- Any other non-essential documentation

---

## 🔒 ENFORCEMENT

**FILE-STRUCTURE.md compliance is enforced via:**
1. Pre-Build Gate (Phase 0) - Must read this file
2. File Structure Verification Checklist (Phase 3)
3. Final Delivery Checklist (Phase 5)
4. Delivery Blockers (#26-30)

**See BUILD-VALIDATION-SOP.md for enforcement details.**

---

## 🎯 QUICK REFERENCE

**Root .md files:** 7 approved only  
**Scripts location:** `/scripts/` directory  
**Current release notes:** Root only  
**Old release notes:** `/docs/BUILDS/RELEASE-NOTES/`  
**Validation reports:** `/docs/BUILDS/VALIDATION-REPORTS/`  
**Implementation guides:** `/docs/BUILDS/IMPLEMENTATION-GUIDES/`  
**AI handoff:** `/docs/AI/`  
**Historical docs:** `/docs/HISTORICAL/`

---

**Questions? See BUILD-VALIDATION-SOP.md for complete file structure enforcement rules.**
