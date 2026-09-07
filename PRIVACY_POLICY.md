# Privacy Policy for GS Location Changer

**Last Updated**: September 7, 2026

**GS Location Changer** ("we", "our", or "the extension") is dedicated to protecting user privacy. This Privacy Policy details our practices regarding user data collection, storage, and processing.

---

## 1. Zero Data Collection
- **GS Location Changer does NOT collect, track, store, or transmit any personal data, search history, IP addresses, or browsing activity to any external server or third-party service.**
- There are **no analytics, no telemetry, and no third-party tracking scripts** included in this extension.

---

## 2. On-Device Local Storage Only
- All user-defined settings (such as selected country code, preferred interface language, custom coordinates, UULE parameters, and saved favorites) are stored exclusively on your local device using Chrome's built-in `chrome.storage.local` API.
- Your data never leaves your computer.

---

## 3. Extension Permissions Usage
- **`storage`**: Used solely to persist your chosen location, language, and favorite presets locally within your browser.
- **`tabs`**: Used strictly to detect when an active tab is a Google Search results page so that parameters (`gl`, `hl`, `uule`, `pws`) can be updated, and to refresh the tab upon your explicit request.
- **Host Permissions (`*://*.google.<tld>/*`)**: Used exclusively to apply your preferred region and language parameters to Google Search domains and mock client-side HTML5 Geolocation when requested by Google Search.

---

## 4. Third-Party Sharing
- We do not sell, trade, rent, or share any user data with third parties.

---

## 5. Changes to This Policy
- Any updates to this policy will be documented in the extension's official repository and release notes.

---

## 6. Contact
For questions regarding this Privacy Policy, please open an issue in the official project repository or contact the developer via the Chrome Web Store developer support page.
