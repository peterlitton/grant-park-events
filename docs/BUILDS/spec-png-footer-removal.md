# Specification: Remove Footer from PNG Export

## Task

Strip the email footer from the rendered HTML before the PNG capture so the exported image does not include the footer content.

## Scope

This change affects only the PNG export. The email HTML sent to MailerLite is unchanged — the footer remains in the email.

## What Is the Footer

The email template (`generate-email-html.js`) includes a footer block at lines 177-186:

```html
<!-- Footer -->
<tr>
  <td align="center" style="padding: 30px 30px 20px; border-top: 1px solid #e0e0e0;">
    <p style="...">Grant Park Events</p>
    <p style="...">65 E Monroe St, Chicago</p>
    <p style="...">United States of America</p>
    <p style="...">You received this email because you signed up on the website or have attended a Grant Park event.</p>
    <p style="..."><a href="{$unsubscribe}">Unsubscribe</a></p>
  </td>
</tr>
```

Content:
- Business name: "Grant Park Events"
- Address: "65 E Monroe St, Chicago"
- Country: "United States of America"
- Disclaimer: "You received this email because..."
- Unsubscribe link with MailerLite merge tag `{$unsubscribe}`

## Where the Change Goes

File: `admin.html`, inside the `exportPNG` function (line 1894).

The function already has two HTML processing steps before rendering:

1. **Line 1919:** Converts absolute URLs to relative (CORS fix)
2. **Line 1921:** Strips white backgrounds (html2canvas rendering fix)

The footer removal would be a third processing step, applied to `processedHtml` before it is injected into the hidden div at line 1934.

## How to Identify the Footer

The `<!-- Footer -->` HTML comment is a reliable marker. It is the only instance of this comment in the generated email HTML. The footer block starts with `<!-- Footer -->` and ends with the closing `</tr>` tag for that table row.

## What to Remove

Everything from `<!-- Footer -->` through the next `</tr>`, inclusive.

## Verification

After the change:
1. Export a PNG from the campaign builder — the image should not contain the address, disclaimer, or unsubscribe text
2. Copy HTML to clipboard — the HTML should still contain the full footer (this operation does not use `exportPNG`)
3. Send a campaign via MailerLite — the email should still contain the full footer
