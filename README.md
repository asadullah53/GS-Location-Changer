# GS Location Changer - Google Search Location & Language Chrome Extension

**GS Location Changer** is a modern, high-performance Chrome Extension (Manifest V3) designed for SEO professionals, digital marketers, international researchers, and everyday users. It allows you to effortlessly spoof Google Search's country region (`gl`), interface language (`hl`), search restrict (`lr`), HTML5 Geolocation coordinates (`lat/lng`), and Google canonical Local SEO strings (`uule`).

---

## 🌟 Key Features

1. **All Google Countries & Territories (`gl`)**:
   - Includes **240+ countries and territories** with country flags and ISO codes.
   - Searchable, instant-filter dropdown with keyboard navigation.

2. **All Google Supported Languages (`hl` & `lr`)**:
   - Includes **150+ languages** (English, Urdu, Arabic, Hindi, Spanish, French, German, Japanese, Chinese, etc.).
   - Displays both native language scripts and English names.

3. **Precise Local SEO & Coordinates Spoofing (Latitude & Longitude)**:
   - Enter exact GPS coordinates to spoof your location.
   - **DOM Geolocation Emulation**: Overrides `navigator.geolocation.getCurrentPosition` in Google tabs. When you search *"restaurants near me"* or click *"Use precise location"*, Google receives your spoofed GPS coordinates.

4. **Built-in Google UULE Generator**:
   - Type any city name (e.g., `Chicago, Illinois, United States` or `Dubai, United Arab Emirates`) and generate Google's official canonical `uule` parameter (`uule=w+CAIQICI...`).

5. **1-Click Favorites & Presets**:
   - Save custom location presets with one click (Country + Language + Coordinates + UULE).
   - Pre-loaded with popular SEO hubs (New York, London, Berlin, Dubai, Lahore, Karachi, Tokyo, Sydney, etc.).
   - Export and Import your favorites as JSON anytime.

6. **Live Toolbar Icon Badge & Status**:
   - Dynamic toolbar badge displays the 2-letter country code (e.g. `US`, `GB`, `PK`, `DE`) with a green indicator when active, or `OFF` when disabled.
   - Live status card in the popup shows the active configuration at a glance.

7. **Popup Quick Search**:
   - Type any query directly in the popup's search bar and press Enter to launch Google Search with your selected location and language parameters already applied.

8. **Non-Personalized Search (`pws=0`)**:
   - Toggle unbiased, raw search rankings by stripping personal history bias.

---

## 📂 Project Structure

```
GS Location Changer Chrome Extension/
├── manifest.json              # Chrome Manifest V3 configuration
├── background/
│   └── service-worker.js      # Background worker: badge, URL sync & messages
├── content/
│   ├── content.js             # Content script bridge for Google tabs
│   └── inject-geo.js          # Injected script overriding navigator.geolocation
├── popup/
│   ├── popup.html             # 2026 modern popup layout
│   ├── popup.css              # Sleek high-contrast design system
│   └── popup.js               # UI controls, search filters, favorites CRUD
├── data/
│   ├── countries.js           # 240+ Google-supported countries with flags
│   ├── languages.js           # 150+ Google-supported languages
│   └── presets.js             # Global city presets and coordinates
├── utils/
│   └── uule-generator.js      # Google canonical UULE encoder & decoder
├── icons/
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
└── README.md
```

---

## 🚀 How to Install in Google Chrome

1. Open **Google Chrome**.
2. Go to the extensions management page: `chrome://extensions` (type this in your address bar and press Enter).
3. In the top right corner, toggle **Developer mode** to **ON**.
4. Click the **Load unpacked** button in the top left corner.
5. Select the folder you cloned this repository into, for example:
   `C:\Users\you\GS-Location-Changer-Chrome-Extension`
6. Click **Select Folder**. The extension is now loaded and ready!
7. Click the **Puzzle piece** icon in Chrome's top toolbar, find **GS Location Changer**, and click the **Pin** icon to pin it to your toolbar.

---

## 🎯 How to Use

### 1. Instant Country & Language Switching
- Open the extension popup by clicking its icon.
- In the **Country & Lang** tab, type the country or language name you want.
- Click **Apply Location & Language**.
- The extension icon badge will update to reflect the country (e.g., `US`, `GB`, `PK`).

### 2. Local SEO & Precise Coordinates
- Switch to the **Local SEO / GPS** tab.
- Select a preset city (e.g. *United States (New York)*) or type custom Latitude & Longitude.
- In the **Canonical Location** field, type the city name and click **Generate UULE**.
- Click **Apply Coordinates & UULE**.
- Now open Google and search *"coffee shop near me"* to see exact local results.

### 3. Managing Favorites
- Configure any desired location, language, and coordinates.
- Click **Save to Favorites** or go to the **Favorites** tab and click **+ Add Current**.
- Give it a name (e.g., *"Client A - UK SEO"*).
- Later, click **Apply** on any saved favorite card to switch instantly!

### 4. Direct Quick Search
- In the bottom search bar of the popup, type what you want to search for.
- Press **Enter** or click the search button.
- A new tab opens immediately with all spoofed parameters applied to Google.
