# Build10.33.5 Release Notes
## TODAY/THIS WEEKEND: Pill Overlay Replaced with Thin Strip

**Version:** v2.3.1-Build10.33.5
**Date:** 2026-06-01
**Type:** UI improvement

---

## Change

The TODAY / THIS WEEKEND indicator on event cards was a rounded pill positioned over the event image (top-right corner since Build10.33). It blocked key elements of the image.

Replaced with a thin full-width color strip between the image and the event details. No image overlap.

- **TODAY:** red strip (`bg-red-600`)
- **THIS WEEKEND:** blue strip (`bg-blue-600`)
- **Neither:** no strip, card renders normally

Centered text, 11px bold, uppercase letter-spacing. Matches the style Peter approved from the four-option HTML comparison.

## Files Changed

| File | Change |
|------|--------|
| `index.html` | Pill overlay removed, thin strip added below image container + version bump |
| `build-version.js` | Version bump |
| `admin.html` | Version bump |
| `admin-dashboard.html` | Version bump |
| `CURRENT-BUILD.md` | Version bump |

## Testing After Deploy

1. Visit the public site — event cards for this Friday, Saturday, or Sunday should show a blue "THIS WEEKEND" strip below the image
2. If today is Fri/Sat/Sun, today's events show a red "TODAY" strip instead
3. Events not this weekend should have no strip
4. Verify the strip doesn't overlap the image or the event title
5. Verify the "View Details" hover overlay still works on images

---

## PRE-DELIVERY VALIDATION RESULTS

✅ Syntax: All files clean
✅ Structure: index.html 917/917 braces, 1662/1662 parens, 124/124 brackets
✅ Versions: All 4 locations + CURRENT-BUILD.md at v2.3.1-Build10.33.5
✅ File integrity: GOOGLE-CREDENTIALS.json absent
✅ Config files: _headers, netlify.toml, _redirects valid
✅ Feature registry: All features present
✅ Step 4d: No files removed
✅ Diff: Old pill removed (7 lines), new strip added (5 lines), version bumps

**VALIDATION STATUS: ALL CHECKS PASSED ✅**
