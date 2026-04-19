// ================================================
// version.js — DEPRECATED as of Build10.14.8.3
// ================================================
// 
// DO NOT EDIT VERSION HERE.
// The single source of truth is: /build-version.js
//
// This file is kept ONLY for VERSION_HISTORY reference.
// No code imports from this file anymore.
//
// Previously: index.html, admin.html, and sw.js each had
// their own hardcoded BUILD_VERSION that had to be manually
// synced. Now they all load from /build-version.js at runtime.
//
// ================================================

// VERSION_HISTORY — archival reference only
// Not imported by any code
export const VERSION_HISTORY = [
  'v2.3.1-Build10.14.10.1', // RSS feed response format fix + sitemap redirect cleanup
  'v2.3.1-Build10.14.10',   // Edge Function canonical fix + sitemap routing
  'v2.3.1-Build10.14.9',    // CSV backfill + GSC per-URL cache fix
  'v2.3.1-Build10.14.8.4',  // STABLE — PNG CORS fix, popup Blobs on public site
  'v2.3.1-Build10.14.8.3',  // Single-source version control (build-version.js)
  'v2.3.1-Build10.14.8.2',  // sw.js cache fix, popup migration, PNG fix
  'v2.3.1-Build10.14.8.1',  // Popup dual write, inline status, PNG fix
  'v2.3.1-Build10.14.8',  // 7 queued fixes
  'v2.3.1-Build10.14.7',  // Auto-reload after Run Now + realistic test email
  'v2.3.1-Build10.14.6',  // Test Email button on Monitor tab
  'v2.3.1-Build10.14.5',  // Text-only content hashing (no false positives)
  'v2.3.1-Build10.14.4',  // Separate HTTP function for Run Now button
  'v2.3.1-Build10.14.3',  // URL parser fix + redirect cleanup (Run Now still broken)
  'v2.3.1-Build10.14.2',  // Run Now button + timezone fix (Run Now broken - scheduled fn)
  'v2.3.1-Build10.14.1',  // WWW domain consolidation
  'v2.3.1-Build10.14',    // Admin nav category grouping
  'v2.3.1-Build10.13.18', // Shadow revert
  'v2.3.1-Build10.13.17', // Drop zone compact + index header + monitor confirm + padding/shadows
  'v2.3.1-Build10.13.16', // About confirm + shadows + logo + image mgmt + caching
  'v2.3.1-Build10.13.15', // Shadow adjustments + filter fixes + clickable Total
  'v2.3.1-Build10.13.14', // Execution log + shadows + filter improvements
  'v2.3.1-Build10.13.13', // About textarea + Page Monitor + ES module conversion
  'v2.3.1-Build10.13.12', // About editor fix + header border fix
  'v2.3.1-Build10.13.11', // Header adjust + About backend (had bugs)
  'v2.3.1-Build10.13.10', // UI tweaks (6 items)
  'v2.3.1-Build10.13.9',  // Cache fix + subscribers pre-load + Request Index fix
  'v2.3.1-Build10.13.8',  // Smart cache + bug fixes
  'v2.3.1-Build10.13.7',  // Real-time stats, Discovered/Pending cards
  'v2.3.1-Build8',    // Growth charts and source breakdown
  'v2.3.1-Build7.1',  // Fix pagination + index.html version
  'v2.3.1-Build7',    // MailerLite Subscriber Dashboard
  'v2.3.1-Build6.5',  // Fix admin version sync
  'v2.3.1-Build6.4',  // Fix mobile menu version sync
  'v2.3.1-Build6.3',  // CSV update, Phase>Step, version in mobile menu
  'v2.3.1-Build6.2',  // Fix sw.js version display; Hide past events; Fix admin syntax error
  'v2.3.1-Build6.1',  // Attempted fixes (syntax error prevented loading)
  'v2.3.1-Build6',    // Admin improvements + PWA
  'v2.3.1-Build4',    // Remove duplicate React load (~40KB savings)
  'v2.3.1-Build3',    // Image redirect, enhanced Images tab, location fix
  'v2.3.1-Build2',    // Image redirect, removed assets/events, cleanup
  'v2.3.1-1',         // Image Manager, Netlify Blobs, asset consolidation
  'v2.3.0-Build81',   // Calendar view page isolation, admin version sync
  'v2.3.0-Build80',   // Clickable calendar preview with hover delay
  'v2.3.0-Build79',   // Chrome mobile viewport fix
  'v2.3.0-Build77',   // Mobile title size reduction
  'v2.3.0-Build76.1', // Stable - Modal spacing + Safari scroll fix
  'v2.3.0-Build76',   // Modal top spacing (20px)
  'v2.3.0-Build75',   // Stable - Sticky X button
  'v2.3.0-Build74.3',
  'v2.3.0-Build74.2',
  'v2.3.0-Build74.1',
  'v2.3.0-Build74',
  'v2.3.0-Build73.21',
  'v2.3.0-Build73.19',
  'v2.3.0-Build73.18',
  'v2.3.0-Build73.17',
  'v2.3.0-Build73.16',
  'v2.3.0-Build73.15',
  'v2.3.0-Build73.14',
  'v2.3.0-Build73.13',
  'v2.3.0-Build73.12',
  'v2.3.0-Build73.11',
  'v2.3.0-Build73.10',
  'v2.3.0-Build73.9',
  'v2.3.0-Build73.8',
  'v2.3.0-Build73.7',
  'v2.3.0-Build73.6',
  'v2.3.0-Build73.5',
  'v2.3.0-Build73.4',
  'v2.3.0-Build73.2',
  'v2.3.0-Build73.1',
  'v2.3.0-Build73',
  'v2.3.0-Build69',
  'v2.3.0-Build68.2',
  'v2.3.0-Build68.1'
];
