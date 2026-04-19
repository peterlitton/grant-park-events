# ICON FILE NAMING & DIRECTORY STRUCTURE
## Recommended Organization for PWA/TWA Icons

**Date:** February 4, 2026  
**Source:** favicon.ico (6000x6000 Chicago star with "e")

---

## RECOMMENDED FILE NAMING CONVENTION

### Standard PWA/TWA Naming Pattern

**Format:** `icon-{size}-{purpose}.{ext}`

**Why this format:**
- ✅ Clear size identification
- ✅ Groups alphabetically in directory
- ✅ Industry standard
- ✅ Easy to reference in code
- ✅ Self-documenting

---

## COMPLETE FILE LIST

### In /assets/common/ directory:

```
assets/common/
├── ce-star.png                    (existing - 89KB, WebP)
├── chicago-star.png               (existing - 17KB, WebP)
├── favicon.ico                    (existing - 1.1MB, actually 6000x6000 PNG)
├── gpe-logo.png                   (existing - 66KB, WebP banner)
├── poster-qr-code.png             (existing - 105KB)
│
├── favicon-16.png                 (NEW - 16x16, tiny browser tab)
├── favicon-32.png                 (NEW - 32x32, browser tab)
├── favicon.ico                    (REPLACE - proper multi-size .ico)
│
├── icon-48.png                    (NEW - 48x48, Android ldpi)
├── icon-72.png                    (NEW - 72x72, Android mdpi)
├── icon-96.png                    (NEW - 96x96, Android hdpi)
├── icon-144.png                   (NEW - 144x144, Android xhdpi)
├── icon-180.png                   (NEW - 180x180, iOS bookmark)
├── icon-192.png                   (NEW - 192x192, PWA required)
├── icon-512.png                   (NEW - 512x512, PWA required)
├── icon-512-maskable.png          (NEW - 512x512, Android adaptive)
│
└── icon-source-6000.png           (NEW - 6000x6000, master source)
```

---

## FILE NAMING BREAKDOWN

### Browser Favicons (Small Icons)

**favicon-16.png**
- Size: 16x16 pixels
- Usage: Browser tab (standard size)
- Format: PNG

**favicon-32.png**
- Size: 32x32 pixels
- Usage: Browser tab (retina/high-DPI)
- Format: PNG

**favicon.ico** (UPDATED)
- Size: Multi-size (16x16, 32x32, 48x48 embedded)
- Usage: Browser compatibility (IE, older browsers)
- Format: ICO (true .ico format, not PNG)

---

### PWA Icons (Required)

**icon-192.png**
- Size: 192x192 pixels
- Usage: PWA home screen icon (minimum required)
- Purpose: Primary app icon on Android
- Format: PNG

**icon-512.png**
- Size: 512x512 pixels
- Usage: PWA splash screen, high-res displays
- Purpose: Large displays, Play Store listing
- Format: PNG

**icon-512-maskable.png**
- Size: 512x512 pixels (with 20% padding for safe zone)
- Usage: Android adaptive icons
- Purpose: Works with circular, squircle, rounded square masks
- Format: PNG

---

### iOS Icons

**icon-180.png**
- Size: 180x180 pixels
- Usage: iOS bookmark icon (iPhone/iPad home screen)
- Purpose: apple-touch-icon
- Format: PNG

---

### Android Multi-Density Icons (TWA)

**icon-48.png**
- Size: 48x48 pixels
- Usage: Android ldpi (low density ~120dpi)
- Purpose: Old/budget Android devices
- Format: PNG

**icon-72.png**
- Size: 72x72 pixels
- Usage: Android mdpi (medium density ~160dpi)
- Purpose: Standard Android devices
- Format: PNG

**icon-96.png**
- Size: 96x96 pixels
- Usage: Android hdpi (high density ~240dpi)
- Purpose: Mid-range Android devices
- Format: PNG

**icon-144.png**
- Size: 144x144 pixels
- Usage: Android xhdpi (extra high density ~320dpi)
- Purpose: High-end Android devices
- Format: PNG

---

### Master Source

**icon-source-6000.png**
- Size: 6000x6000 pixels
- Usage: Master source file
- Purpose: Future regeneration if needed
- Format: PNG
- Note: This is your current favicon.ico renamed properly

---

## DIRECTORY STRUCTURE

### Option 1: All in /assets/common/ (RECOMMENDED)

**Rationale:**
- ✅ All icons in one place
- ✅ Consistent with current structure
- ✅ Easy to find and manage
- ✅ Simple paths in HTML/manifest

**Current structure:**
```
assets/
├── common/
│   ├── ce-star.png
│   ├── chicago-star.png
│   ├── favicon.ico
│   ├── gpe-logo.png
│   ├── poster-qr-code.png
│   └── [ALL NEW ICON FILES HERE]
└── vendor/
    └── [other files]
```

**Pros:**
- Simple, flat structure
- Easy to reference: `/assets/common/icon-192.png`
- No need to create new directories
- Consistent with Build4

**Cons:**
- Directory gets a bit crowded (19 files total)

---

### Option 2: Separate /assets/icons/ (Alternative)

**Rationale:**
- ✅ Dedicated icon directory
- ✅ Cleaner separation
- ✅ Easier to manage icon-specific files

**New structure:**
```
assets/
├── common/
│   ├── ce-star.png
│   ├── chicago-star.png
│   ├── gpe-logo.png
│   ├── poster-qr-code.png
│   └── favicon.ico (small, proper .ico)
├── icons/
│   ├── icon-48.png
│   ├── icon-72.png
│   ├── icon-96.png
│   ├── icon-144.png
│   ├── icon-180.png
│   ├── icon-192.png
│   ├── icon-512.png
│   ├── icon-512-maskable.png
│   └── icon-source-6000.png
└── vendor/
    └── [other files]
```

**Pros:**
- Organized by purpose
- Easy to find all icons
- Can add more icons later without cluttering

**Cons:**
- Need to create new directory
- Slightly more complex paths: `/assets/icons/icon-192.png`

---

### Option 3: PWA-specific directory (Over-engineered)

**Not recommended** - too complex for your needs

---

## MY RECOMMENDATION

**Use Option 1: Keep everything in /assets/common/**

**Why:**
- Simplest approach
- Matches current structure
- Easy paths in HTML
- All static assets in one place
- No migration needed

**Final structure:**
```
assets/common/
├── ce-star.png              (existing)
├── chicago-star.png         (existing)  
├── favicon.ico              (updated - proper .ico file)
├── favicon-16.png           (new)
├── favicon-32.png           (new)
├── gpe-logo.png             (existing)
├── icon-48.png              (new)
├── icon-72.png              (new)
├── icon-96.png              (new)
├── icon-144.png             (new)
├── icon-180.png             (new)
├── icon-192.png             (new)
├── icon-512.png             (new)
├── icon-512-maskable.png    (new)
├── icon-source-6000.png     (new - your current favicon.ico renamed)
└── poster-qr-code.png       (existing)
```

**Total files:** 15 files (5 existing + 10 new)

---

## HTML REFERENCES

### Current (Build4)

```html
<link rel="icon" type="image/x-icon" href="assets/common/favicon.ico">
```

---

### After Build5 (with new icons)

```html
<!-- Browser favicons -->
<link rel="icon" type="image/x-icon" href="assets/common/favicon.ico">
<link rel="icon" type="image/png" sizes="16x16" href="assets/common/favicon-16.png">
<link rel="icon" type="image/png" sizes="32x32" href="assets/common/favicon-32.png">

<!-- iOS bookmark icon -->
<link rel="apple-touch-icon" href="assets/common/icon-180.png">

<!-- Android bookmark icons -->
<link rel="icon" type="image/png" sizes="192x192" href="assets/common/icon-192.png">
<link rel="icon" type="image/png" sizes="512x512" href="assets/common/icon-512.png">

<!-- PWA manifest -->
<link rel="manifest" href="/manifest.json">
```

---

## MANIFEST.JSON REFERENCES

### manifest.json (new file)

```json
{
  "name": "Grant Park Events",
  "short_name": "GP Events",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#FF6B6B",
  "icons": [
    {
      "src": "/assets/common/icon-48.png",
      "sizes": "48x48",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/assets/common/icon-72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/assets/common/icon-96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/assets/common/icon-144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/assets/common/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/assets/common/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/assets/common/icon-512-maskable.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ]
}
```

---

## SIZE GUIDE REFERENCE

| File Name | Size | DPI Class | Purpose |
|-----------|------|-----------|---------|
| favicon-16.png | 16×16 | — | Browser tab |
| favicon-32.png | 32×32 | — | Browser tab (retina) |
| icon-48.png | 48×48 | ldpi | Android low density |
| icon-72.png | 72×72 | mdpi | Android medium density |
| icon-96.png | 96×96 | hdpi | Android high density |
| icon-144.png | 144×144 | xhdpi | Android extra high |
| icon-180.png | 180×180 | — | iOS bookmark |
| icon-192.png | 192×192 | xxhdpi | PWA minimum required |
| icon-512.png | 512×512 | xxxhdpi | PWA splash, Play Store |
| icon-512-maskable.png | 512×512 | — | Android adaptive icon |

---

## ALTERNATIVE NAMING SCHEMES (NOT RECOMMENDED)

### If you want more descriptive names:

```
icon-48-android-ldpi.png
icon-72-android-mdpi.png
icon-96-android-hdpi.png
icon-144-android-xhdpi.png
icon-180-ios-touch.png
icon-192-pwa-home.png
icon-512-pwa-splash.png
icon-512-maskable-android.png
```

**Problem:** 
- Longer filenames
- Less standard
- Harder to type

**My advice:** Stick with simple `icon-{size}.png` format

---

### If you want brand-specific names:

```
gpe-icon-48.png
gpe-icon-72.png
gpe-icon-96.png
...
```

**Problem:**
- Redundant (already in grantparkevents.com)
- Less standard
- Doesn't add clarity

**My advice:** Size is the distinguishing factor, keep it simple

---

## FILE SIZE ESTIMATES

| File | Dimensions | Estimated Size | Format |
|------|-----------|----------------|--------|
| favicon-16.png | 16×16 | ~1 KB | PNG |
| favicon-32.png | 32×32 | ~2 KB | PNG |
| favicon.ico | Multi | ~15 KB | ICO |
| icon-48.png | 48×48 | ~3 KB | PNG |
| icon-72.png | 72×72 | ~5 KB | PNG |
| icon-96.png | 96×96 | ~8 KB | PNG |
| icon-144.png | 144×144 | ~12 KB | PNG |
| icon-180.png | 180×180 | ~15 KB | PNG |
| icon-192.png | 192×192 | ~18 KB | PNG |
| icon-512.png | 512×512 | ~45 KB | PNG |
| icon-512-maskable.png | 512×512 | ~45 KB | PNG |
| **Total new files** | — | **~169 KB** | — |

**Impact:** Minimal (~169KB added to assets)

---

## .GITIGNORE CONSIDERATIONS

**Should you add to .gitignore?**

**NO** - These are production assets

All icon files should be:
- ✅ Committed to git
- ✅ Deployed to Netlify
- ✅ Version controlled

**Why:**
- They're part of the application
- Users need to download them
- They're not temporary or generated files

---

## WHAT I'LL DO IN BUILD5

**Step 1: Rename/Backup Current favicon.ico**
```bash
# Rename current 6000x6000 favicon.ico to proper name
favicon.ico → icon-source-6000.png
```

**Step 2: Generate All Sizes**
```bash
# From icon-source-6000.png, create:
- favicon-16.png (16x16)
- favicon-32.png (32x32)
- favicon.ico (proper multi-size .ico)
- icon-48.png (48x48)
- icon-72.png (72x72)
- icon-96.png (96x96)
- icon-144.png (144x144)
- icon-180.png (180x180)
- icon-192.png (192x192)
- icon-512.png (512x512)
- icon-512-maskable.png (512x512 with padding)
```

**Step 3: Add to /assets/common/**
All files go in `/assets/common/` alongside existing files

**Step 4: Update HTML**
Add `<link>` tags for all icons to index.html and admin.html

**Step 5: Create manifest.json**
Reference all icons with proper paths

**Step 6: Include in Build5 Package**
All new files included in zip

---

## SUMMARY

**Recommended Structure:**
```
All icons in: /assets/common/
Naming format: icon-{size}.png (e.g., icon-192.png)
Special cases: 
  - icon-512-maskable.png (Android adaptive)
  - icon-source-6000.png (master source)
  - favicon.ico (proper multi-size .ico)
  - favicon-16.png, favicon-32.png (browser)
```

**Total new files:** 10 PNG files + 1 proper .ico
**Total size added:** ~169 KB
**Directory:** /assets/common/ (same as now)

**This naming convention:**
- ✅ Industry standard
- ✅ Self-documenting
- ✅ Easy to reference
- ✅ Groups logically
- ✅ Simple and clean

**Want me to proceed with this structure in Build5?**
