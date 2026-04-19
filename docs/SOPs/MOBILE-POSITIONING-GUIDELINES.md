# MOBILE POSITIONING GUIDELINES

**Document Type:** Standard Operating Procedure (SOP)  
**Project:** Grant Park Events 2.0  
**Created:** February 3, 2026  
**Status:** MANDATORY for all mobile layout work  
**Related:** See `/docs/CASE-STUDIES/mobile-icon-positioning-flexbox-constraints.md` for detailed background

---

## 🎯 PURPOSE

This SOP provides guidelines for positioning elements on mobile views, particularly when mobile positioning needs to differ from desktop. It prevents the trial-and-error approach by establishing a clear methodology based on lessons learned from the share icon positioning challenge (Builds 73.13-73.21).

---

## 📋 APPROACH HIERARCHY

Use this hierarchy to select the appropriate positioning technique. Start at the top and work down until you find a working solution.

### Level 1: Responsive Tailwind Classes (Try First)
**When to use:** Simple adjustments where standard Tailwind values suffice

**Example:**
```javascript
className: 'ml-2 md:ml-4 lg:ml-6'  // Different margins at breakpoints
className: 'text-sm md:text-base'   // Different sizes
```

**Advantages:**
- Clean, declarative
- No JavaScript needed
- Easy to maintain

**Limitations:**
- Only works with standard Tailwind values
- Cannot handle complex positioning logic

---

### Level 2: Direct Element Margins (Recommended for Most Cases)
**When to use:** Need custom spacing values or placement-aware logic

**Example:**
```javascript
const mobileMargin = (placement === 'modal') 
  ? 'ml-5 md:ml-2'  // More margin on mobile
  : '';

className: `base-classes ${mobileMargin}`
```

**Advantages:**
- Works reliably on mobile
- Can use arbitrary values: `ml-[22px]`
- Respects layout flow

**Limitations:**
- May hit ceiling (~20-25px typically)
- Constrained by parent container

**⚠️ IMPORTANT:** 
- In `justify-between` flex containers, use LEFT margin to push right
- AVOID right margin on last child (inverts direction)

---

### Level 3: Transform Overlay (For Final Adjustments)
**When to use:** Margin reaches ceiling or need precise pixel-perfect positioning

**Example:**
```javascript
const isMobile = window.innerWidth < 768;
const transformStyle = isMobile 
  ? { transform: 'translateX(8px)' }  // Horizontal only
  : {};

style: { ...baseStyles, ...transformStyle }
```

**Advantages:**
- Bypasses flex layout constraints
- Pixel-precise control
- Can combine with margin

**Limitations:**
- Doesn't affect layout space (visual only)
- Requires JavaScript for responsive logic

**⚠️ BEST PRACTICE:** Combine with margin approach
```javascript
// Base position with margin, fine-tune with transform
className: 'ml-5 md:ml-2'
style: { transform: isMobile ? 'translateX(8px)' : 'none' }
```

---

### Level 4: Relative Positioning (When Transform Fails)
**When to use:** Need positioning that affects layout space, or transform doesn't work

**Example:**
```javascript
style: {
  position: 'relative',
  right: '-8px'  // Negative right = moves right
}
```

**Advantages:**
- Affects layout space
- Works when transform blocked
- Still in document flow

**Limitations:**
- Can cause overlap issues
- More complex than transform

---

### Level 5: Absolute Positioning (Last Resort)
**When to use:** All other approaches failed, or element truly needs to float

**Example:**
```javascript
if (isMobile && placement === 'modal') {
  return e('div', {
    style: {
      position: 'absolute',
      top: '32px',
      right: '28px',
      zIndex: 20
    }
  }, ...content);
}
```

**Advantages:**
- Complete positioning control
- Not constrained by layout

**Limitations:**
- Removes from document flow
- Requires manual positioning calculations
- Breaks on different screen sizes
- Hard to maintain

**⚠️ USE SPARINGLY:** Only when Levels 1-4 proven ineffective

---

## 🔍 DIAGNOSTIC PROTOCOL

Follow this protocol when mobile positioning isn't working as expected.

### Step 1: Verify the Change Actually Deployed
- [ ] Check version number in footer matches expected build
- [ ] Hard refresh browser (Cmd+Shift+R or Ctrl+Shift+F5)
- [ ] Check different mobile device/simulator

### Step 2: Test with Obvious Values
Before fine-tuning, confirm the approach works AT ALL:

```javascript
// Test with absurd value to see if approach works
className: 'ml-20'  // If this doesn't move element, margin blocked
style: { transform: 'translateX(100px)' }  // If this doesn't move, transform blocked
```

**If obvious value doesn't work:** Approach is blocked, move to next level

**If obvious value works:** Reduce to correct value

### Step 3: Screenshot Comparison
- [ ] Take screenshot of current build
- [ ] Take screenshot of previous build
- [ ] Compare side-by-side to verify movement
- [ ] Measure pixel distance moved
- [ ] Verify direction of movement

### Step 4: Check for Constraints
Common mobile constraints that block positioning:

- **Viewport boundary:** Content at edge of screen
- **Parent overflow:** Parent has `overflow: hidden`
- **Z-index issues:** Element behind other content
- **Flex constraints:** `justify-between`, `justify-end` behavior
- **Transform context:** Parent has transform creating new stacking context

### Step 5: Root Cause Analysis
Ask these questions:

1. Does it work on desktop? (If yes → mobile-specific constraint)
2. Does it work with absurd value? (If no → approach blocked)
3. Did it work partially before? (If yes → hit ceiling, try next level)
4. Is element in flex container? (If yes → check flex properties)
5. Does element have siblings? (If yes → check spacing algorithm)

---

## 🎨 COMMON PATTERNS

### Pattern 1: Placement-Aware Mobile Styling

```javascript
// Apply mobile-specific styling based on placement
const ShareButton = ({ placement, ...props }) => {
  const isMobile = window.innerWidth < 768;
  const needsAdjustment = isMobile && (placement === 'modal' || placement === 'hero');
  
  const mobileMargin = needsAdjustment ? 'ml-5.5 md:ml-2' : '';
  const transformStyle = needsAdjustment ? { transform: 'translateX(8px)' } : {};
  
  return e('span', {
    className: `base-class ${mobileMargin}`,
    style: { ...baseStyle, ...transformStyle }
  }, ...);
};
```

### Pattern 2: Responsive Breakpoint Detection

```javascript
// Detect viewport width for conditional styling
const isMobileWidth = typeof window !== 'undefined' && window.innerWidth < 768;
const isTabletWidth = typeof window !== 'undefined' && window.innerWidth >= 768 && window.innerWidth < 1024;

// Apply styles accordingly
const responsiveStyle = isMobileWidth 
  ? { /* mobile styles */ }
  : isTabletWidth
  ? { /* tablet styles */ }
  : { /* desktop styles */ };
```

### Pattern 3: Combined Margin + Transform

```javascript
// Use margin for base positioning (respects layout)
// Add transform for fine-tuning (bypasses constraints)

const baseMargin = 'ml-5.5 md:ml-2';  // Takes element most of the way

const isMobile = window.innerWidth < 768;
const needsTransform = isMobile && requiresPrecisePosition;
const transformOverlay = needsTransform 
  ? { transform: 'translateX(8px)' }  // Final 8px adjustment
  : {};

return e('element', {
  className: `base ${baseMargin}`,
  style: { ...base, ...transformOverlay }
}, ...);
```

---

## ⚠️ GOTCHAS & ANTI-PATTERNS

### ❌ ANTI-PATTERN: Container Negative Margins on Mobile

```javascript
// DON'T: This works on desktop but fails on mobile
e('div', { className: 'flex justify-between -mr-8 pr-8' },
  e('h2', {}, title),
  e(Icon)
)
```

**Why it fails:** Mobile viewport constrains container extension

**Instead:**
```javascript
// DO: Style the element directly
e('div', { className: 'flex justify-between' },
  e('h2', {}, title),
  e(Icon, { className: 'ml-5 md:ml-2' })  // Direct element styling
)
```

### ❌ ANTI-PATTERN: Right Margin in justify-between

```javascript
// DON'T: Right margin on last child moves it LEFT in justify-between
e('div', { className: 'flex justify-between' },
  e('h2', {}, title),
  e(Icon, { className: 'mr-4' })  // Moves LEFT, not right!
)
```

**Why it fails:** Increases bounding box, flex recalculates spacing

**Instead:**
```javascript
// DO: Use left margin to push away from first child
e('div', { className: 'flex justify-between' },
  e('h2', {}, title),
  e(Icon, { className: 'ml-4' })  // Pushes RIGHT correctly
)
```

### ❌ ANTI-PATTERN: Changing Multiple Variables at Once

```javascript
// DON'T: Can't tell which change caused what effect
// Build N: Change margin, transform, AND positioning together
```

**Instead:**
```javascript
// DO: Change one variable per build, verify, then iterate
// Build N: Change margin only
// Build N+1: Keep margin, add transform
// Build N+2: Fine-tune transform value
```

### ❌ ANTI-PATTERN: Assuming Same Behavior Across Viewports

```javascript
// DON'T: Assume desktop solution works on mobile
// Built and tested only on desktop → deploy → mobile broken
```

**Instead:**
```javascript
// DO: Test on mobile FIRST, or test both simultaneously
// Use responsive design mode or actual device
// Verify mobile behavior before marking complete
```

---

## 📏 TESTING REQUIREMENTS

### Visual Verification Method
1. **Red Line Overlay Technique:**
   - Take screenshot on mobile device
   - Add measurement overlay (vertical/horizontal line)
   - Verify alignment visually
   - Measure pixel distances if not aligned

2. **Screenshot Comparison:**
   - Keep previous build screenshot
   - Take new build screenshot
   - Compare side-by-side
   - Verify movement direction and distance

### Mandatory Test Cases
For any mobile positioning change:

- [ ] **Mobile (<768px):** Verify intended positioning
- [ ] **Desktop (≥768px):** Verify no regression
- [ ] **Tablet (768-1024px):** Verify responsive behavior
- [ ] **Different placements:** Test all affected locations
- [ ] **Vertical position:** Confirm no unintended vertical shift
- [ ] **Layout integrity:** No text wrapping, overlap, or clipping

---

## 🔧 DEBUGGING CHECKLIST

When positioning doesn't work as expected, check:

- [ ] Viewport constraints (element at screen edge?)
- [ ] Parent container overflow (hidden/clip?)
- [ ] Flex container properties (justify-between?)
- [ ] Sibling elements (affecting spacing?)
- [ ] Z-index layering (element visible?)
- [ ] Transform context (parent transformed?)
- [ ] CSS specificity (style being overridden?)
- [ ] Responsive breakpoints (correct width detected?)
- [ ] Deployment verified (change actually deployed?)
- [ ] Cache cleared (seeing latest version?)

---

## 📚 RELATED DOCUMENTATION

- **Case Study:** `/docs/CASE-STUDIES/mobile-icon-positioning-flexbox-constraints.md`
- **Component Docs:** `/docs/COMPONENTS/ShareButton.md`
- **Project Standards:** `/docs/SOPs/PROJECT-STANDARDS.md`
- **Build Validation:** `/docs/SOPs/BUILD-VALIDATION-SOP.md`

---

## ✅ SUCCESS CRITERIA

A mobile positioning solution is complete when:

- ✅ Element positioned precisely as specified on mobile
- ✅ Desktop positioning unchanged (no regression)
- ✅ Works across all intended placements
- ✅ No layout breaks, overlaps, or visual issues
- ✅ Verified with screenshots and measurements
- ✅ Solution documented in code comments
- ✅ Approach follows this hierarchy (used simplest effective level)

---

**Document Status:** ACTIVE SOP  
**Mandatory Compliance:** All mobile positioning work  
**Review Frequency:** After each major mobile positioning challenge  
**Last Updated:** February 3, 2026
