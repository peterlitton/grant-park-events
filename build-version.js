// ============================================================
// build-version.js — THE SINGLE SOURCE OF VERSION TRUTH
// ============================================================
//
// RULE: This is the ONLY file that defines BUILD_VERSION.
//       No other file may contain a hardcoded version string.
//
// CONSUMERS (all read from this file at runtime):
//   - index.html    → <script src="/build-version.js">
//   - admin.html    → <script src="/build-version.js">
//   - sw.js         → importScripts('/build-version.js')
//   - get-version.js → fetches this file over HTTP
//
// TO UPDATE: Change the three values below. Nothing else.
//
// ARCHITECTURE: Uses 'var' (not const/export) so it works in:
//   - Browser <script> tags (sets window.BUILD_VERSION)
//   - Service Worker importScripts (sets self.BUILD_VERSION)
//
// Created: Build10.14.8.3 (2026-02-09)
// ============================================================

var BUILD_VERSION = 'v2.3.1-Build10.32.4';
var BUILD_DATE = '2026-04-13';
var BUILD_NOTES = 'Dashboard New Subscribers 24hr/7d/30d toggle; remove 50-row slice cap on get-subscriber-stats';
