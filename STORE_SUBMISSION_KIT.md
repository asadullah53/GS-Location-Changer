# Chrome Web Store - Complete Submission Kit
## Extension: GS Location Changer (v1.0.0)

This document contains **everything** you need to publish **GS Location Changer** to the Chrome Web Store Developer Dashboard. All texts, descriptions, and permission justifications are pre-written and ready to copy-paste.

---

## 📦 1. Upload Package (Zip File)

- **File to Upload**: `dist\GS-Location-Changer-v1.0.0.zip`
- **Location**: Inside your project folder (`c:\xampp\htdocs\GS Location Changer Chrome Extension\dist\GS-Location-Changer-v1.0.0.zip`)
- **Status**: Tested, verified, clean production build (contains manifest v3, icons, assets, zero junk).

---

## 📝 2. Store Listing Tab (Copy & Paste)

### Title (Max 45 characters):
```text
GS Location Changer
```

### Short Description (Max 132 characters):
```text
Instantly change Google Search country, language, and coordinates with Local SEO UULE support and 1-click favorites.
```

### Detailed Description:
```text
GS Location Changer is an enterprise-grade extension designed for SEO professionals, digital marketers, international researchers, and everyday users who need to test, view, and analyze localized Google Search results worldwide without relying on sluggish VPNs.

🌟 KEY FEATURES

🌐 1. Google Country & Regional Domains (gl)
• Switch Google search results across 166 countries and territories.
• Native Google ccTLD routing (e.g. google.co.uk, google.de, google.com.pk, google.co.jp).
• Searchable, instant-filter dropdown with full keyboard navigation (Arrow keys, Enter, Escape).

🗣️ 2. Google Interface & Result Languages (hl & lr)
• Support for 79 global languages (English, Urdu, Arabic, Spanish, French, German, Japanese, Chinese, etc.).
• Strict language restrict (lr) option to filter search results exclusively to web pages written in your target language.

📍 3. Local SEO & Precise GPS Pinpoint
• Override HTML5 Geolocation: When searching "near me" or clicking "Use precise location", Google receives your custom Latitude and Longitude.
• Built-in Google Protobuf UULE Generator: Encodes any city or area (e.g. "Austin, Texas, United States" or "Dubai, UAE") into Google's official canonical UULE parameter (w+CAIQICI...).
• Built-in major global city presets (New York, London, Paris, Berlin, Tokyo, Dubai, Lahore, Sydney, etc.).
• Fail-closed privacy: Automatically prevents real physical location leaks if coordinates are unassigned while spoofing is active.

⭐ 4. 1-Click Favorites & Presets
• Save frequent combinations (Country + Language + Coordinates + UULE) with custom names (e.g. "Client A - UK SEO").
• Activate any saved favorite in 1 second with a single click.
• Export and import your favorite presets as JSON.

⚡ 5. Power Tools for Digital Marketers & SEOs
• Non-Personalized Search (pws=0): Strips search history and cookie bias to inspect authentic, unskewed organic rankings.
• Quick Search Launcher: Type queries directly in the popup footer to open Google with all spoofed parameters applied.
• Live Toolbar Icon Badge: Displays your active 2-letter country code (e.g. US, GB, PK) in green, or OFF when disabled.
• Interactive In-Popup User Guide: Built-in step-by-step walkthrough explaining every feature and Local SEO tip.

🔒 PRIVACY & SECURITY FIRST
• 100% On-Device: All settings are stored locally on your machine via chrome.storage.local.
• Zero Data Collection: No tracking, no telemetry, no analytics, no external servers.
• Safe DOM rendering: Zero-XSS architecture with strict JSON schema validation.

🚀 HOW TO USE
1. Open the extension popup.
2. Select your target country and language.
3. Click "Apply Location & Language".
4. Search Google directly from Chrome's URL bar or the popup's Quick Search box!
```

### Category:
- Primary Category: **Productivity** (or **Developer Tools** / **Search Tools**)

### Language:
- **English (United States)**

---

## 🛡️ 3. Privacy Tab (Crucial for Fast Google Review Approval)

### Single Purpose Description (Max 1,000 characters):
```text
GS Location Changer allows users and SEO professionals to customize their Google Search region, language, and client-side geolocation parameters (gl, hl, uule, and HTML5 coordinates) for localized search testing, international keyword research, and privacy without needing a VPN.
```

### Permission Justifications:

#### `storage` Permission:
```text
The storage permission is required solely to persist the user's selected country code, preferred language, custom GPS coordinates, and saved favorite location presets locally on their device via chrome.storage.local. No user data is ever transmitted to any external server.
```

#### `tabs` Permission:
```text
The tabs permission is strictly used to check if the currently active browser tab is an active Google Search results page, allowing the extension to reload or navigate the tab with the user's requested localized search parameters (gl, hl, uule, pws).
```

#### Host Permissions (`*://*.google.<tld>/*`):
```text
Host permissions on Google domains are required to append search localization URL parameters (gl, hl, uule, pws) and inject the HTML5 geolocation mock script on Google Search pages so that local searches (e.g., "near me" or clicking "Use precise location") reflect the user's chosen coordinates.
```

### Data Usage Declarations:
When Google asks you these questions on the Privacy tab, select:
- **Do you collect personal data?**: ➔ **NO**
- **Do you sell user data?**: ➔ **NO**
- **Do you use or transfer user data for purposes unrelated to the extension's single purpose?**: ➔ **NO**
- **Do you use or transfer user data for creditworthiness or lending purposes?**: ➔ **NO**
- **Certification Checkbox**: ➔ **Check the box** certifying compliance with the Developer Program Policies.

### Privacy Policy URL:
- Point to your GitHub raw link, for example:
  `https://raw.githubusercontent.com/<YOUR-GITHUB-USERNAME>/<YOUR-REPO-NAME>/main/PRIVACY_POLICY.md`
  *(Or your GitHub repo page: `https://github.com/<YOUR-USERNAME>/<YOUR-REPO>/blob/main/PRIVACY_POLICY.md`)*

---

## 🎨 4. Graphic Assets Checklist

Chrome Web Store requires the following images:

| Asset | Dimensions | Status |
|---|---|---|
| **Store Icon** | 128 x 128 px | ✅ Ready at `icons/icon128.png` |
| **Screenshots** | 1280 x 800 px (or 640 x 400 px) | Take 2-3 screenshots of the popup (Country tab, Local SEO tab, and User Guide) |
| **Small Promo Tile** | 440 x 280 px | Optional but recommended (can be created in Canva/Figma with extension logo) |

---

## 🚀 5. Step-by-Step Submission Instructions

1. Log in to the [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole).
2. Click **+ New Item** (or "Add new item" button).
3. Drag & drop or upload the ZIP file:
   `c:\xampp\htdocs\GS Location Changer Chrome Extension\dist\GS-Location-Changer-v1.0.0.zip`
4. In the **Store Listing** tab:
   - Paste the Title, Short Description, and Detailed Description from Section 2 above.
   - Upload `icons/icon128.png` as the Store Icon.
   - Upload at least one 1280x800 screenshot.
   - Select Category: **Productivity**.
5. In the **Privacy** tab:
   - Paste the Single Purpose description from Section 3 above.
   - Paste the justification texts for `storage`, `tabs`, and Host permissions.
   - Check all certification boxes confirming you do not sell or collect data.
   - Paste your Privacy Policy URL.
6. In the **Distribution** tab:
   - Select **Public** and choose **All regions**.
7. Click **Submit for Review**!
   *(Google usually reviews and approves in 24 to 48 hours).*
