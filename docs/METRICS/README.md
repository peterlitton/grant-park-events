# BUILD METRICS - README

**Location:** `/docs/METRICS/`  
**Purpose:** Track and visualize development time for all builds

---

## 📁 FILES IN THIS DIRECTORY

### **Data Files:**
- **build-metrics-raw.csv** - Raw build metrics data (updated with each build)
  - Format: `Version,Build,Date,Development Time (minutes),LLM,Source,Notes`
  - One row per build
  - Updated manually after each build completion

### **Chart Generation:**
- **generate-chart.py** - Python script to generate interactive chart
  - Reads from `build-metrics-raw.csv`
  - Outputs `build-metrics-chart.html`
  - Runs automatically or on-demand

### **Generated Output:**
- **build-metrics-chart.html** - Interactive dual Y-axis chart
  - Blue bars: Daily development time (hours)
  - Orange line: Cumulative development time (hours)
  - Hover for details, zoom/pan enabled
  - Auto-generated from latest CSV data

---

## 🚀 USAGE

### **Regenerate Chart After Adding New Build:**

```bash
cd /path/to/gpe20-v2.3.0-buildXX/docs/METRICS/
python3 generate-chart.py
```

**Output:**
```
✅ Chart generated successfully!
📊 Output: /path/to/docs/METRICS/build-metrics-chart.html
```

### **View Chart:**

Open `build-metrics-chart.html` in any web browser:
- **Mac:** `open build-metrics-chart.html`
- **Windows:** `start build-metrics-chart.html`
- **Linux:** `xdg-open build-metrics-chart.html`

### **In Claude Conversations:**

Just ask:
- "Show me the build chart"
- "Generate the latest metrics chart"
- "Update the build metrics visualization"

Claude will:
1. Run `generate-chart.py`
2. Present the updated `build-metrics-chart.html`

---

## 📊 CHART FEATURES

**Dual Y-Axis Visualization:**
- **Left Y-axis (Bars):** Daily development time in hours
- **Right Y-axis (Line):** Cumulative development time (running total)

**Interactive Features:**
- **Hover:** See exact values for any date
- **Zoom:** Click and drag to zoom into specific date ranges
- **Pan:** Shift-drag to pan across dates
- **Reset:** Double-click to reset view
- **Legend:** Click to show/hide data series

---

## 🔄 WORKFLOW

### **After Each Build:**

1. **Update CSV:**
   ```csv
   v2.3.0,Build69,2026-02-01,25,Sonnet 4.5,Tracked,New feature
   ```

2. **Regenerate Chart:**
   ```bash
   python3 generate-chart.py
   ```

3. **Include in Package:**
   - `build-metrics-raw.csv` (updated)
   - `build-metrics-chart.html` (regenerated)
   - `generate-chart.py` (unchanged)

### **Chart Auto-Updates:**
- Reads latest data from CSV
- Calculates daily totals automatically
- Adjusts axes to fit all data
- Preserves all historical data

---

## 📈 STATISTICS DISPLAYED

**Chart Summary (printed when generating):**
- Total days of development
- Total builds completed
- Total development time (hours)
- Average time per day
- Average time per build
- Latest build date and number

**Example Output:**
```
✅ Chart generated successfully!
📊 Output: /docs/METRICS/build-metrics-chart.html

📈 Summary Statistics:
   Total Days: 10
   Total Builds: 105
   Total Development Time: 31.1 hours
   Average per Day: 3.1 hours
   Average per Build: 17.8 minutes

📅 Latest Build: January 31, 2026
🔢 Latest Build Number: Build68.2
```

---

## 🛠️ TECHNICAL DETAILS

**Dependencies:**
- Python 3.6+
- pandas
- plotly

**Install Dependencies:**
```bash
pip install pandas plotly
```

**Script Behavior:**
- Reads CSV from same directory
- Outputs HTML to same directory
- Handles missing/estimated times (removes ~ prefix)
- Groups by date automatically
- Converts minutes to hours
- Calculates cumulative totals

---

## 📝 NOTES

**Data Quality:**
- Historical builds (1-68.2) include estimates
- Future builds (69+) will have explicit times
- Estimated values marked with ~ in CSV
- Script strips ~ for calculations

**Chart Updates:**
- Always reflects latest CSV data
- No manual configuration needed
- Automatically adjusts to new date ranges
- Handles any number of builds

**File Management:**
- Keep all 3 files together in /docs/METRICS/
- CSV is the source of truth
- Chart regenerates from CSV on demand
- Chart can be safely deleted and regenerated

---

## ✅ BEST PRACTICES

1. **Update CSV immediately** after each build
2. **Regenerate chart** before sharing reports
3. **Include chart** in project documentation
4. **Archive old charts** if needed (rename with date)
5. **Commit all files** to version control

---

**Questions? Ask Claude: "How do I use the build metrics chart?"**
