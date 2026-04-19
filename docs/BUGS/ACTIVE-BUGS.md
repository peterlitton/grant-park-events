# Active Bugs

**Last Updated:** January 29, 2026  
**Total Active Bugs:** 1

---

## 🐛 OPEN BUGS

### **BUG-2026-002: Scraper Error**

**ID:** BUG-2026-002  
**Status:** OPEN  
**Priority:** LOW  
**Created:** build14  
**Assigned:** Unassigned

#### **Description:**
Event scraper fails on some URLs when attempting to automatically extract event data.

#### **Impact:**
- **Severity:** Low
- **Workaround Available:** YES
- **Users Affected:** Admin users only
- **Production Impact:** None

#### **Reproduction:**
1. Go to admin panel
2. Use scraper on certain event URLs
3. Scraper returns error

#### **Workaround:**
Use manual entry in admin panel. All fields are available for direct input.

#### **Technical Details:**
- Scraper function encounters errors on specific URL structures
- Manual entry works perfectly as alternative
- Not blocking any critical functionality

#### **Next Steps:**
- Low priority due to available workaround
- Will address when scraper improvements scheduled
- Manual entry is reliable alternative

#### **Related Documentation:**
- Full bug log: `/docs/BUGS/BUG-2026-002-SCRAPER-ERROR.md`

---

## ✅ RECENTLY RESOLVED

*See `/docs/BUGS/RESOLVED-BUGS.md` for complete history*

### **Recent Resolutions:**
1. **BUG-2026-001** - Text backwards in admin (RESOLVED build13)
2. **BUG-2026-003** - Rich text editor missing (RESOLVED build15)

---

## 📊 BUG STATISTICS

**Total Bugs Tracked:** 3  
**Resolved:** 2 (67%)  
**Active:** 1 (33%)  
**Severity Breakdown:**
- Critical: 0
- High: 0
- Medium: 0
- Low: 1

---

## 🔍 HOW TO REPORT BUGS

1. Document the issue clearly
2. Include steps to reproduce
3. Note severity and impact
4. Create bug log file: `BUG-YYYY-###-description.md`
5. Add to this ACTIVE-BUGS.md file
6. Reference in BUILD-HISTORY.md

---

## ⚠️ KNOWN LIMITATIONS (Not Bugs)

*These are design decisions or external constraints, not bugs:*

### **EmailOctopus Rate Limits**
- 10 requests per second maximum
- This is an API limitation, not a bug

### **Browser Cookie Requirements**
- Popup cookie requires cookies enabled
- Standard web behavior, not a bug

---

*Update this file when bugs are opened or resolved.*
