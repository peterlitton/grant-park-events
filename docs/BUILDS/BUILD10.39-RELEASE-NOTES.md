# Build10.39 Release Notes
## Email Preview Text Fix

**Version:** v2.3.1-Build10.39
**Date:** 2026-06-15

### Change
Logo image `alt="Grant Park Events"` → `alt=""` in `generate-email-html.js` line 132.

### Impact
Email preview text now starts with the event headline instead of repeating the sender name.

### Files Changed
- `netlify/functions/generate-email-html.js` — one attribute change
- Version bump files
