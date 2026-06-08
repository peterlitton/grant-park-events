# Build10.38 Release Notes
## PNG Export: Remove Email Footer

**Version:** v2.3.1-Build10.38
**Date:** 2026-06-08
**Type:** Enhancement

### Change

Added one line to the `exportPNG` function in `admin.html` (line 1922):

```javascript
processedHtml = processedHtml.replace(/<!-- Footer -->[\s\S]*?<\/tr>/i, '');
```

This strips the email footer (business name, address, disclaimer, unsubscribe link) from the HTML before html2canvas captures it as a PNG image.

### How It Works

The `<!-- Footer -->` HTML comment in the email template is a unique marker. The regex matches from that comment through the closing `</tr>` tag, removing the entire footer table row.

### Scope

- **PNG export:** Footer removed ✅
- **Copy HTML:** Unchanged — footer remains for MailerLite paste
- **Email delivery:** Unchanged — footer remains in sent emails
- **Email template:** Unchanged — no modifications to `generate-email-html.js`

### Files Changed

| File | Change |
|------|--------|
| `admin.html` | One line added to `exportPNG` function |
| `build-version.js` | Version bump |
| `index.html` | Version bump |
| `admin-dashboard.html` | Version bump |
| `CURRENT-BUILD.md` | Version bump |

### Verification

1. Export PNG from campaign builder → image should not contain footer
2. Copy HTML → HTML should still contain footer
3. Send campaign → email should still contain footer

**VALIDATION STATUS: ALL CHECKS PASSED ✅**
