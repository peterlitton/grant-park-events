# Build10.26 Release Notes

**Version:** v2.3.1-Build10.26
**Date:** 2026-03-11
**Base:** Build10.25.8

## Overview

Campaign builder enhancements: new optional rich text "Text" field, and hero image/dates/events all made optional. Enables text-only emails without events.

## Changes

### 1. New "Text" Field (admin.html)
- Rich text editor added to campaign builder between Headline and Date Range
- Uses same contentEditable + EventFieldToolbar pattern as Description/Featuring/Programming fields
- Supports bold, italic, underline, lists, links via toolbar
- Paste cleanup via cleanPastedHTML
- Stored as `text` property in campaign formData (persists to Netlify Blobs automatically)
- If empty, omitted from generated email

### 2. Optional Fields (admin.html)
- Removed validation requirements for: hero image, date range, and events
- Only Internal Name, Subject, and Headline remain required
- Enables text-only campaigns with no events, no hero image, no date range

### 3. Email Template Updates (generate-email-html.js)
- Hero image: conditionally rendered only when `campaign.heroImage` has a value
- Text: rendered between headline and events when `campaign.text` has non-empty content (HTML tags stripped for emptiness check)
- Headline bottom padding adjusts: 10px when text follows, 20px when it doesn't
- Events section: renders empty string gracefully when no events selected
- Safety check: `events` defaults to empty array if undefined/null in request

## Files Modified
- `admin.html` — Text field + validation changes
- `netlify/functions/generate-email-html.js` — conditional hero/text/events in template
- `build-version.js` — version + notes
- `index.html` — version bump only
- `CURRENT-BUILD.md` — version update

## Testing
1. **With all fields:** Create campaign with all fields filled → Preview should show hero, headline, text, events
2. **Text only:** Create campaign with just name/subject/headline/text, no hero/dates/events → Preview should show headline + text only
3. **No text:** Create campaign with events but no text → Text section should not appear
4. **Edit existing:** Open an existing campaign → text field should be empty (existing campaigns don't have it)
5. **Rich formatting:** Bold, italic, lists in Text field → should render in email preview

## PRE-DELIVERY VALIDATION RESULTS

✅ **Syntax Validation** — No double commas
✅ **Structural Integrity** — admin.html braces 1434/1434, parens 2532/2532; index.html braces 915/915, parens 1653/1653
✅ **Version Consistency** — v2.3.1-Build10.26 in build-version.js, index.html, admin.html, CURRENT-BUILD.md
✅ **Feature Registry** — All checks passed
✅ **Code Review** — Changes verified in admin.html and generate-email-html.js

**VALIDATION STATUS: ALL CHECKS PASSED ✅**
