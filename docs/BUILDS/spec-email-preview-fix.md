# Email Preview Text Fix

**Version:** v2.3.1-Build10.39
**Date:** 2026-06-15

## Condition

Email clients display "Grant Park Events Hayden, Copland, Gold Coast Art Fair, Juneteenth Cele..." as the preview text. The "Grant Park Events" prefix is redundant — it duplicates the sender name already shown by the email client.

## Root Cause

Line 132 of `generate-email-html.js`:

```html
<img src=".../gpe-logo-email.png" alt="Grant Park Events" width="266">
```

Email clients construct preview text from the first visible text in the email body. When images haven't loaded, the `alt` attribute is the first text the client encounters. The logo's `alt="Grant Park Events"` becomes the preview prefix.

## Need

The email preview should start with the actual content — the event headline — not repeat the sender name. The sender is already displayed by the email client ("Grant Park Events") to the left of the subject line.

## Solution

Change `alt="Grant Park Events"` to `alt=""` on the logo image. An empty alt is semantically correct — the logo is decorative and conveys no information beyond the sender identity, which is already shown. Email clients skip empty alt text when building the preview.

## Change

**File:** `netlify/functions/generate-email-html.js`
**Line:** 132
**Before:** `alt="Grant Park Events"`
**After:** `alt=""`

## Verification

1. Send a test email from the campaign builder
2. View in email client (Gmail, Apple Mail)
3. Confirm preview text starts with the event headline, not "Grant Park Events"
