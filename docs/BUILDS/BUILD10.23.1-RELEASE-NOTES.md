# Build10.23.1 Release Notes

**Version:** v2.3.1-Build10.23.1
**Date:** 2026-03-07
**Base:** Build10.23

## Overview

Cache-bust query parameters added to all star.png and gpe-logo.png references so the CDN serves the resized files from Build10.22 instead of the old cached versions.

## Problem

Build10.22 deployed resized static assets (star.png 105KB→3.5KB, gpe-logo.png 66KB→26KB) but the Netlify CDN continued serving the old cached versions. PSI still reported 860x865 star.png and 2000x434 logo.

## Fix

Added `?v=2` to all references. The CDN treats the query-parameterized URL as a new resource and fetches the current file from origin.

## References Updated (11 lines in index.html)
- Line 24: OG meta image
- Line 34: Twitter meta image
- Line 62: Preload href
- Line 987: logoUrl for client-side OG updates
- Line 1037: getAbsoluteImageUrl fallback
- Line 1078: Schema fallback
- Line 1489: Header logo img
- Line 1653: Card view star img
- Line 1707: Event page header logo img
- Line 1982: Footer star img

## Expected Result
- star.png: 105KB → 3.5KB in PSI reports
- gpe-logo.png: 65KB → 26KB in PSI reports
- Combined ~140KB savings per page load

## Testing
Run PSI on homepage. Check "Improve image delivery" section — star.png and gpe-logo.png should show dramatically reduced sizes or disappear from the flagged list.

## PRE-DELIVERY VALIDATION RESULTS

✅ **Syntax Validation** — Known patterns only, no errors
✅ **Structural Integrity** — Braces 851/851, Brackets 108/108, Parens 1516/1516
✅ **Version Consistency** — v2.3.1-Build10.23.1 in build-version.js, index.html, admin.html, CURRENT-BUILD.md
✅ **File Integrity** — All files present, 2591 lines index.html
✅ **Config Files** — _headers, netlify.toml, _redirects all valid
✅ **Feature Registry** — 13/13 passed
✅ **Code Review** — 11 lines changed, all ?v=2 appends

**VALIDATION STATUS: ALL CHECKS PASSED ✅**
