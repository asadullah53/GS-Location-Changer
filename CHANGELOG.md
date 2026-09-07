# Changelog - GS Location Changer

All notable changes to this project will be documented in this file.

## [1.0.0] - 2026-09-07

### Initial Release & Enterprise Audit Hardening
- **Core Engine**: Full Google Search Location (`gl`), Language (`hl`), and Strict Restrict (`lr`) switching.
- **Protobuf UULE Generator**: Official Google-compliant Base64 Protobuf canonical UULE encoder and decoder supporting ASCII and international multi-byte UTF-8 locations (Urdu, Arabic, German, Spanish, Chinese, etc.).
- **Security Hardening**:
  - Eliminated DOM XSS vulnerabilities by migrating to safe DOM manipulation (`textContent` / `document.createElement`).
  - Added strict JSON schema validation for favorites imports with sanitization.
  - Strict Google domain validation preventing arbitrary host redirects.
- **Fail-Closed Privacy**: Geolocation emulation denies requests when coordinates are unassigned while spoofing is enabled, preventing real physical IP/GPS leakage.
- **Permissions & Lifecycle**:
  - Added `chrome.runtime.onStartup` for toolbar icon badge persistence across browser restarts.
  - Efficient storage change listener waking service worker only when badge state changes.
  - Native Google ccTLD routing for Quick Searches (e.g. `google.co.uk`, `google.com.pk`).
  - Consolidated state saving across all popup tabs.
  - Full keyboard accessibility (Arrow keys, Enter, Escape) on searchable dropdowns.
