#!/bin/bash
# feature-registry-check.sh — Build Validation Step 4c
# Greps for critical feature signatures to catch silent regressions
# Run from build root directory
# Exit code: 0 = all pass, 1 = failures detected

echo "=== STEP 4c: FEATURE REGISTRY CHECK ==="
echo ""

FAIL=0

check_feature() {
  local file="$1"
  local pattern="$2"
  local feature="$3"
  
  if [ ! -f "$file" ]; then
    echo "❌ $file: FILE MISSING — cannot check '$feature'"
    FAIL=1
    return
  fi
  
  if grep -q "$pattern" "$file"; then
    echo "✅ $file: $feature"
  else
    echo "❌ $file: MISSING '$feature' (pattern: $pattern)"
    FAIL=1
  fi
}

echo "--- admin-index-report.html ---"
check_feature "admin-index-report.html" "clipboard.writeText(page.url)" "Inspect copies URL to clipboard"
check_feature "admin-index-report.html" "setTick" "Live age clock (60s re-render)"
check_feature "admin-index-report.html" "Back to Admin" "Minimal nav bar"

echo ""
echo "--- admin.html ---"
check_feature "admin.html" "eventVisibilityFilter" "Event visibility filter"
check_feature "admin.html" "fullSeoValidating" "Full SEO validation"
check_feature "admin.html" "admin-index-report" "Index Report link"
check_feature "admin.html" "flex flex-wrap" "Tab wrap layout"

echo ""
echo "--- index.html ---"
echo "(No feature signatures registered)"

echo ""
echo "--- Edge functions ---"
if [ -f "netlify/edge-functions/seo-canonical.js" ]; then
  echo "✅ netlify/edge-functions/seo-canonical.js: SEO canonical injection"
else
  echo "❌ netlify/edge-functions/seo-canonical.js: MISSING — edge function file not found"
  FAIL=1
fi
check_feature "netlify/edge-functions/seo-canonical.js" "410 Gone" "410 for old-format event URLs"
check_feature "netlify/edge-functions/seo-canonical.js" "about-us-contact" "410 for legacy pages"

echo ""
echo "--- Config files ---"
check_feature "netlify.toml" 'functions = "netlify/functions"' "Functions directory"
check_feature "_headers" "Cache-Control: no-cache, no-store, must-revalidate" "build-version.js no-cache rule"
check_feature "_redirects" ".netlify/functions/rss-feed" "RSS function route"

echo ""
if [ $FAIL -eq 0 ]; then
  echo "✅ ALL FEATURE CHECKS PASSED"
else
  echo "❌ FEATURE REGRESSION DETECTED — investigate and restore before delivery"
fi

exit $FAIL
