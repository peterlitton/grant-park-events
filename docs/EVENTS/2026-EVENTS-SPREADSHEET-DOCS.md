# 2026 EVENTS SPREADSHEET - Project Documentation

**File:** `2026_Events.xlsx`  
**Location:** `/mnt/user-data/outputs/2026_Events.xlsx`  
**Last Updated:** January 25, 2026  
**Purpose:** Master spreadsheet for tracking and building 2026 event content

---

## 📋 FILE OVERVIEW

This spreadsheet is the **master source** for all 2026 Grant Park Events content. Events tracked here will be added to the website.

**Access:** Reference this file by name: `2026_Events.xlsx`

---

## 📊 SPREADSHEET STRUCTURE

### **Sheet 1: Instructions**
Contains workflow and purpose documentation.

### **Sheet 2: 2026 Events** (Main Data Sheet)
Contains event data with 17 columns:

**Column Structure:**
1. **ID** - Unique event identifier
2. **Title** - Event name
3. **Performer** - Artist/performer name
4. **Date** - Event date (YYYY-MM-DD format)
5. **Time** - Start time
6. **End Time** - End time
7. **Location** - General location (e.g., "Millennium Park")
8. **Venue** - Specific venue details
9. **Organizer Name** - Event organizer
10. **Organizer URL** - Organizer website
11. **Image URL** - Event image link
12. **Description** - Event description text
13. **Published** - Publication status
14. **2026 Status** - Confirmation status (Confirmed, TBD, etc.)
15. **Notes** - Internal notes
16. **Ready to Publish** - Ready flag
17. **Published** - Duplicate published column

---

## 📅 CURRENT EVENT COUNT

**Total Events:** 81 rows (including header)  
**Confirmed Events:** 9+ (based on sample)

**Sample Events:**
1. Grant Park Music Festival (June 10, 2026)
2. International Jazz Day (April 30, 2026)
3. Sueños Music Festival Days 1 & 2 (May 23-24, 2026)
4. Chicago Blues Festival (4 days, June 4-7, 2026)
5. Taste of Chicago (July 4, 2026 - dates TBD)

---

## 🔄 WORKFLOW

### **Phase 1: Research & Data Collection**
1. Research each event to confirm 2026 return
2. Fill in 2025 date information as reference
3. Add performer/artist information
4. Fill in location and venue details
5. Update 2026 Status column

### **Phase 2: Content Preparation**
1. Write event descriptions
2. Find/upload event images
3. Verify organizer information
4. Add organizer URLs
5. Mark "Ready to Publish" when complete

### **Phase 3: Website Publication**
1. Export data from spreadsheet
2. Import to website admin panel
3. Review and publish events
4. Update "Published" column in spreadsheet

---

## 📝 DATA QUALITY REQUIREMENTS

### **Required Fields:**
- ✅ ID
- ✅ Title
- ✅ Date
- ✅ Location
- ✅ Venue
- ✅ Description
- ✅ 2026 Status

### **Optional But Recommended:**
- Performer
- Time
- End Time
- Organizer Name
- Organizer URL
- Image URL

### **Internal Tracking:**
- Notes
- Ready to Publish
- Published

---

## 🎯 2026 STATUS VALUES

**Use these standardized values:**
- **Confirmed** - Event confirmed for 2026
- **Confirmed (dates TBD)** - Event confirmed but exact dates pending
- **Likely** - Strong indication event will return
- **Uncertain** - Need more research
- **Not Returning** - Confirmed NOT happening in 2026
- **New Event** - Brand new event for 2026

---

## 📥 IMPORTING TO WEBSITE

### **Method 1: Manual Entry (Admin Panel)**
1. Open admin panel
2. Click "Add Event"
3. Copy data from spreadsheet
4. Paste into form fields
5. Save event

### **Method 2: CSV Export + Import** (Recommended)
1. Export sheet to CSV
2. Use bulk import feature in admin
3. Map CSV columns to event fields
4. Review imported events
5. Publish in batches

### **Method 3: Scraper Tool** (For events with URLs)
1. Add event URL to "Organizer URL" column
2. Use website's "Copy From Website" feature
3. Auto-populate fields
4. Review and adjust
5. Publish

---

## 🔍 DATA VALIDATION CHECKLIST

**Before Publishing:**
- [ ] ID is unique
- [ ] Title is descriptive and accurate
- [ ] Date is in YYYY-MM-DD format
- [ ] Time is in consistent format (if applicable)
- [ ] Location matches venue
- [ ] Description is compelling and complete
- [ ] Organizer info is accurate
- [ ] Image URL works (if provided)
- [ ] 2026 Status is up to date

---

## 📊 CURRENT DATA SNAPSHOT

**Confirmed Major Events:**

### **Spring 2026**
- International Jazz Day - April 30
- Sueños Music Festival - May 23-24

### **Early Summer 2026**
- Chicago Blues Festival - June 4-7 (4 days)
- Grant Park Music Festival - Starting June 10 (10-week season)

### **Mid Summer 2026**
- Taste of Chicago - Around July 4 (dates TBD)

---

## 💡 USAGE TIPS

### **Quick Reference:**
In any chat, reference this file by name:
```
"Show me the 2026_Events.xlsx data"
"What events are in the spreadsheet?"
"Read row 5 from 2026_Events.xlsx"
```

### **Data Analysis:**
```
"How many confirmed events are there?"
"List all June events"
"Show events without images"
```

### **Bulk Operations:**
```
"Export confirmed events to CSV"
"Generate import script for these events"
"Create admin panel commands for bulk add"
```

---

## 🛠️ TECHNICAL DETAILS

**File Format:** .xlsx (Excel 2007+)  
**Sheets:** 2  
**Max Rows:** 81 (including header)  
**Max Columns:** 17  
**Encoding:** UTF-8  
**Date Format:** YYYY-MM-DD  

**Python Access:**
```python
import openpyxl
wb = openpyxl.load_workbook('/mnt/user-data/outputs/2026_Events.xlsx')
ws = wb['2026 Events']
for row in ws.iter_rows(min_row=2, values_only=True):
    print(row)
```

---

## 📋 COLUMN MAPPING (For Import)

**Spreadsheet → Website Field Mapping:**

| Spreadsheet Column | Website Field | Required |
|-------------------|---------------|----------|
| ID | eventId | Yes |
| Title | title | Yes |
| Performer | performer | No |
| Date | date | Yes |
| Time | time | No |
| End Time | endTime | No |
| Location | location | Yes |
| Venue | venue | Yes |
| Organizer Name | organizerName | No |
| Organizer URL | organizerUrl | No |
| Image URL | image | No |
| Description | description | Yes |
| Published | published | Yes |

---

## 🔄 MAINTENANCE SCHEDULE

**Weekly:**
- Review and update 2026 Status
- Research unconfirmed events
- Add new events as announced

**Monthly:**
- Verify all dates and times
- Update descriptions with new info
- Add missing images
- Clean up notes

**Before Each Batch Publication:**
- Run data validation
- Check for duplicates
- Verify all required fields
- Review descriptions for accuracy

---

## 📝 CHANGE LOG

**January 25, 2026:**
- Initial upload to project
- Documentation created
- 81 rows of event data
- 9+ confirmed events

---

## 🎯 NEXT STEPS

1. **Complete Research** - Verify all 2026 statuses
2. **Add Missing Data** - Fill in times, performers, images
3. **Write Descriptions** - Complete all event descriptions
4. **Quality Check** - Run validation on all rows
5. **Batch Import** - Import confirmed events to website
6. **Publish** - Review and publish live

---

## 📞 SUPPORT

**Questions About This File:**
- Reference by name: "2026_Events.xlsx"
- Located at: `/mnt/user-data/outputs/2026_Events.xlsx`
- Always accessible in this project

**Need Help:**
- "Show me events from 2026_Events.xlsx"
- "How do I import this data?"
- "What's the format for [column]?"

---

**This is the master source for 2026 event content. Keep it updated!**
