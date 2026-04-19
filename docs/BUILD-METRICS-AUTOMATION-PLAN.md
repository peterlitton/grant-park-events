# BUILD METRICS AUTOMATION PLAN
## Grant Park Events — Automated Build Time Tracking

**Document Version:** 1.0  
**Date:** February 9, 2026  
**Status:** Approved — Awaiting Implementation  
**Current Build:** v2.3.1-Build10.14.7  
**Target Build:** v2.3.1-Build10.14.8+

---

## 1. BUSINESS NEED

### Problem Statement

The project owner needs to track the amount of Claude AI processing time consumed during development on a daily and cumulative basis. This data informs resource planning, project velocity assessment, and development investment tracking.

### Current State

Build metrics are tracked via a manually maintained CSV file (`/docs/METRICS/build-metrics-raw.csv`) containing ~100 entries from January 22 – February 5, 2026. The Build Metrics tab in the admin panel reads this CSV and renders charts using Plotly.js.

**Deficiencies in the current system:**

- **Manual process** — CSV requires a human or Claude to add rows after each build, which has already fallen behind (last entry is Build6.2, current build is Build10.14.7, a gap of ~40 builds)
- **Inconsistent data** — many entries are marked "Estimated" with approximate times rather than measured values
- **No automation** — nothing triggers data collection; it relies on remembering to update the file
- **Static file** — CSV deploys with each build, meaning metrics are only as current as the last deployment
- **No separation of concerns** — development time estimates conflate planning, conversation, and actual build execution

### Owner Requirements

1. Track Claude AI build processing time (not chat/planning duration)
2. Measurements must be consistently calculated using the same methodology every time
3. Data collection must be fully automated — no manual steps
4. Real-time reporting is not required; daily aggregation after activity concludes is acceptable
5. Per-build detail records should accompany daily summaries for drill-down capability
6. Historical data from the existing CSV (Jan 22 onward) must be preserved and included in reporting
7. The Build Metrics tab in the admin panel must display the full timeline seamlessly

---

## 2. ASSESSMENT

### What Can Be Measured

**Claude build processing time** — the elapsed wall-clock time from Claude's first tool call when beginning build work to Claude's final tool call when delivering the build package. This captures:

- File reads (PROJECT-STANDARDS.md, skill files, source code)
- Code analysis and validation
- Code modifications (str_replace, create_file operations)
- Build packaging and documentation generation

This is the most accurate proxy available for Claude compute consumed during a build.

### What Cannot Be Measured

**Claude conversation processing time** — in the claude.ai interface, there is no programmatic access to per-response generation latency or token counts. The API exposes this data, but the chat interface does not. There is no reliable way to separate Claude's 3-second response generation from the user's 5-minute reading/thinking gap in a conversational exchange.

**Decision:** Track build processing time only. Conversation time is excluded from scope as it cannot be reliably or consistently measured.

### Data Source Evaluation

| Source | Accuracy | Automation | Feasibility |
|--------|----------|------------|-------------|
| Manual CSV entries | Low (estimates) | None | Current state, unsustainable |
| Netlify Deploy API | High (deploy timestamps) | Full | Measures deployment, not build time |
| Claude self-logging | High (tool call timestamps) | Full via SOP | Measures actual Claude work time |
| Token usage (API) | Highest | N/A | Not available in claude.ai |

**Selected approach:** Claude self-logging via build manifests, with Netlify Deploy API as supplementary data.

---

## 3. RECOMMENDATION

### Architecture: Build Manifest System

A three-layer automated tracking system:

1. **Build Manifests** — Claude writes a manifest during every build (real-time capture)
2. **Nightly Aggregation** — scheduled function processes manifests into daily summaries (automated rollup)
3. **Build Metrics Tab** — reads aggregated data from Blobs for display (on-demand reporting)

### Data Flow

```
BUILD TIME                           AFTER MIDNIGHT CT                    ON-DEMAND
─────────────                        ──────────────────                   ─────────
Claude starts work                   Scheduled function fires             User opens Build Metrics tab
  ↓                                    ↓                                   ↓
Records start timestamp              Scans build-manifests/ Blobs         Fetches daily-metrics/ Blobs
  ↓                                  for previous day's entries             ↓
Executes build                         ↓                                 Fetches build-manifests/ Blobs
  ↓                                  Aggregates: build count,              for detail drill-down
Records end timestamp                total minutes, active window           ↓
  ↓                                    ↓                                 Renders charts and tables
Writes build-manifest.json           Writes daily summary to
to Netlify Blobs                     daily-metrics/{YYYY-MM-DD}
  ↓
Includes manifest in
build package
```

### Data Continuity Strategy

To maintain an unbroken reporting timeline from January 22, 2026 forward:

1. **Legacy CSV import** — one-time migration of existing CSV data into Blobs, tagged `source: "legacy-csv"`
2. **Transcript backfill** — one-time reconstruction of Builds 6.2 → 10.14.7 from transcript files, tagged `source: "transcript-estimate"`
3. **Manifest tracking** — Build10.14.8 onward, tagged `source: "manifest"`

The Build Metrics tab reads exclusively from Blobs. The CSV file remains in the repository as a historical archive but is no longer read by the application.

---

## 4. IMPLEMENTATION PLAN

### Phase 1: Build Manifest Infrastructure

**Scope:** Create the manifest writing capability and Blob storage

**New Netlify Function:** `save-build-manifest.js`
- Accepts POST with manifest JSON
- Writes to Netlify Blob store `build-manifests/{version}`
- Returns confirmation

**Build Manifest Schema:**
```json
{
  "version": "v2.3.1-Build10.14.8",
  "llm": "Opus 4.6",
  "start": "2026-02-09T20:15:00Z",
  "end": "2026-02-09T20:48:00Z",
  "duration_minutes": 33,
  "items": 7,
  "source": "manifest",
  "notes": "Queue fixes + metrics automation"
}
```

**SOP Update:** Add to BUILD-VALIDATION-SOP.md:
- New checklist item: "Manifest written to Blobs ✅"
- Claude records `start` timestamp at first tool call of build execution
- Claude records `end` timestamp at final deliverable (zip creation or last tool call)
- Claude POSTs manifest to Blobs before delivering the build package

**Constants Update:** Add `BUILD_LLM` alongside `BUILD_VERSION` in admin.html:
```javascript
const BUILD_VERSION = 'v2.3.1-Build10.14.8';
const BUILD_LLM = 'Opus 4.6';
```

### Phase 2: Legacy Data Migration

**Scope:** Import historical data into Blobs for unified reporting

**One-time migration script:** Reads `build-metrics-raw.csv` and writes each row as a Blob entry in `build-manifests/` with:
- Version and build from CSV columns
- Date from CSV
- Duration from CSV "Development Time (minutes)" column
- LLM from CSV
- `source: "legacy-csv"`
- No start/end timestamps (not available for historical data)

**Transcript backfill:** Reconstruct missing builds (Build6.2 → Build10.14.7) from available transcript files:
- Extract approximate dates and version numbers
- Estimate duration based on build complexity
- Tag as `source: "transcript-estimate"`

### Phase 3: Nightly Aggregation

**Scope:** Automated daily rollup of build metrics

**New Netlify Scheduled Function:** `aggregate-build-metrics.js`
- Runs daily after midnight Central Time
- Scans `build-manifests/` for entries with timestamps from the previous day
- Calculates:
  - Total builds for the day
  - Total Claude minutes (sum of all `duration_minutes`)
  - First build start time
  - Last build end time
  - Active window (last end minus first start)
  - Individual build version list
- Writes summary to `daily-metrics/{YYYY-MM-DD}` Blob
- Skips days with no build activity (no empty records)

**Daily Summary Schema:**
```json
{
  "date": "2026-02-09",
  "build_count": 3,
  "total_minutes": 87,
  "first_start": "2026-02-09T14:15:00Z",
  "last_end": "2026-02-09T22:48:00Z",
  "active_window_minutes": 513,
  "builds": ["Build10.14.8", "Build10.14.9", "Build10.15"],
  "generated_at": "2026-02-10T06:00:00Z"
}
```

### Phase 4: Build Metrics Tab Redesign

**Scope:** Update admin panel to read from Blobs

**New Netlify Function:** `get-build-metrics.js`
- Reads all entries from `daily-metrics/` Blob store
- Reads all entries from `build-manifests/` Blob store (for detail view)
- Returns combined data to the admin panel

**Build Metrics Tab Updates:**
- Time period presets: 30 / 60 / 90 / 180 / All Time
- Daily bar chart: builds per day and Claude minutes per day
- Cumulative line chart: total Claude minutes over time
- Summary statistics: total builds, total hours, average builds/day, average minutes/build, busiest day
- Per-build detail table (expandable): version, date, LLM, duration, source tag
- Data confidence indicator: visual distinction between manifest-tracked (high confidence) and estimated (lower confidence) data

### Phase 5: Deprecation

**Scope:** Clean up legacy system

- Remove CSV reading logic from admin.html
- Remove `generate-chart.py` from docs/METRICS/
- Remove `build-metrics-chart.html` from docs/METRICS/
- Archive `build-metrics-raw.csv` (keep in repo, add header noting it's archived)
- Update `docs/METRICS/README.md` to document new system

---

## 5. FILES AFFECTED

### New Files
| File | Purpose |
|------|---------|
| `netlify/functions/save-build-manifest.js` | Accepts and stores build manifests |
| `netlify/functions/aggregate-build-metrics.js` | Nightly scheduled aggregation |
| `netlify/functions/get-build-metrics.js` | Serves metrics data to admin panel |

### Modified Files
| File | Change |
|------|--------|
| `admin.html` | Add `BUILD_LLM` constant; redesign Build Metrics tab to read from Blobs |
| `docs/SOPs/BUILD-VALIDATION-SOP.md` | Add manifest checklist item |
| `docs/SOPs/PROJECT-STANDARDS.md` | Add `BUILD_LLM` to version constants section |
| `docs/METRICS/README.md` | Document new automated system |

### Archived Files (no longer active)
| File | Status |
|------|--------|
| `docs/METRICS/build-metrics-raw.csv` | Archived — data migrated to Blobs |
| `docs/METRICS/generate-chart.py` | Removed — replaced by Blobs + admin panel |
| `docs/METRICS/build-metrics-chart.html` | Removed — replaced by admin panel rendering |

---

## 6. RISK ASSESSMENT

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Manifest not written (Claude forgets) | Low | Missed build data | SOP checklist enforcement; validation step |
| Nightly function fails | Low | Delayed aggregation | Function can reprocess; manifests persist |
| Legacy import creates duplicates | Medium | Inflated counts | Deduplication by version key in Blob store |
| Timestamp accuracy (timezone issues) | Medium | Incorrect duration | All timestamps in UTC; convert to CT for display only |
| Blob storage limits | Very Low | Data loss | Minimal data per record; well within Netlify limits |

---

## 7. IMPLEMENTATION SEQUENCE

This feature spans multiple builds due to scope:

1. **Build10.14.8** — Manifest infrastructure (save function, SOP update, BUILD_LLM constant). First build to self-log. Also includes the 7 queued fixes already approved.
2. **Build10.14.9** — Legacy data migration (CSV import + transcript backfill)
3. **Build10.15** — Nightly aggregation function + Build Metrics tab redesign
4. **Build10.15.1** — Deprecation cleanup (remove CSV system, update docs)

Each build is independently deployable. The system is fully operational after Build10.15.

---

## 8. SUCCESS CRITERIA

- Every build from 10.14.8 onward has a manifest in Blobs with accurate start/end timestamps
- Build Metrics tab displays unbroken data from January 22, 2026 to present
- Daily summaries are generated automatically with no manual intervention
- Data confidence levels are visually distinguishable (manifest vs. estimated)
- No manual CSV maintenance required going forward
- Historical data is preserved and accessible

---

## 9. DECISION LOG

| Decision | Rationale | Date |
|----------|-----------|------|
| Track build time only, not conversation time | Conversation processing time cannot be reliably measured in claude.ai | Feb 9, 2026 |
| Claude self-logging via manifests | Most accurate available proxy for Claude compute time | Feb 9, 2026 |
| Nightly aggregation (not real-time) | Owner confirmed real-time reporting not required; daily rollup is sufficient | Feb 9, 2026 |
| Preserve all data from Jan 22 forward | Owner requires maximum historical coverage | Feb 9, 2026 |
| Replace CSV with Blobs | Eliminates manual maintenance; enables automation | Feb 9, 2026 |
| Skip zero-activity days | No value in empty records; simplifies queries | Feb 9, 2026 |
| Multi-build implementation | Scope too large for single build; phased approach reduces risk | Feb 9, 2026 |
