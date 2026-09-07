/**
 * GS Location Changer - Background Service Worker (Manifest V3)
 * Manages extension state, dynamic badge updates, URL synchronization, and tab communication.
 */

// Default configuration on installation
const DEFAULT_CONFIG = {
  isEnabled: true,
  countryCode: "us",
  countryName: "United States",
  languageCode: "en",
  languageName: "English",
  latitude: 40.7128,
  longitude: -74.0060,
  canonicalName: "New York, New York, United States",
  uule: "w+CAIQICIlTmV3IFlvcmssIE5ldyBZb3JrLCBVbml0ZWQgU3RhdGVz",
  autoApply: true,
  nonPersonalized: true, // pws=0
  languageRestrict: false, // lr=lang_xx
  favorites: []
};

// Initial setup
chrome.runtime.onInstalled.addListener(async (details) => {
  const current = await chrome.storage.local.get(null);
  
  // Set defaults if empty
  const initial = Object.assign({}, DEFAULT_CONFIG, current);
  
  // Preload starter favorites if none exist
  if (!initial.favorites || initial.favorites.length === 0) {
    initial.favorites = [
      {
        id: "fav-1",
        name: "USA - New York (English)",
        countryCode: "us",
        countryName: "United States",
        languageCode: "en",
        languageName: "English",
        latitude: 40.7128,
        longitude: -74.0060,
        canonicalName: "New York, New York, United States",
        uule: "w+CAIQICIlTmV3IFlvcmssIE5ldyBZb3JrLCBVbml0ZWQgU3RhdGVz",
        badge: "🇺🇸"
      },
      {
        id: "fav-2",
        name: "UK - London (English)",
        countryCode: "gb",
        countryName: "United Kingdom",
        languageCode: "en",
        languageName: "English",
        latitude: 51.5074,
        longitude: -0.1278,
        canonicalName: "London, England, United Kingdom",
        uule: "w+CAIQICIeTG9uZG9uLEVuZ2xhbmQsVW5pdGVkIEtpbmdkb20=",
        badge: "🇬🇧"
      },
      {
        id: "fav-3",
        name: "Germany - Berlin (German)",
        countryCode: "de",
        countryName: "Germany",
        languageCode: "de",
        languageName: "German",
        latitude: 52.5200,
        longitude: 13.4050,
        canonicalName: "Berlin, Berlin, Germany",
        uule: "w+CAIQICIXQmVybGluLCBCZXJsaW4sR2VybWFueQ==",
        badge: "🇩🇪"
      },
      {
        id: "fav-4",
        name: "UAE - Dubai (Arabic)",
        countryCode: "ae",
        countryName: "United Arab Emirates",
        languageCode: "ar",
        languageName: "Arabic",
        latitude: 25.2048,
        longitude: 55.2708,
        canonicalName: "Dubai, Dubai, United Arab Emirates",
        uule: "w+CAIQICIhRHViYWksIER1YmFpLCBVbml0ZWQgQXJhYiBFbWlyYXRlcw==",
        badge: "🇦🇪"
      },
      {
        id: "fav-5",
        name: "Pakistan - Lahore (English)",
        countryCode: "pk",
        countryName: "Pakistan",
        languageCode: "en",
        languageName: "English",
        latitude: 31.5204,
        longitude: 74.3587,
        canonicalName: "Lahore, Punjab, Pakistan",
        uule: "w+CAIQICIXTGFob3JlLCBQdW5qYWIsIFBha2lzdGFu",
        badge: "🇵🇰"
      }
    ];
  }

  await chrome.storage.local.set(initial);
  updateBadge(initial.isEnabled, initial.countryCode);
});

// Update toolbar icon badge
function updateBadge(isEnabled, countryCode) {
  if (!isEnabled) {
    chrome.action.setBadgeText({ text: "OFF" });
    chrome.action.setBadgeBackgroundColor({ color: "#64748b" }); // Slate grey
  } else {
    const text = (countryCode || "US").toUpperCase().slice(0, 4);
    chrome.action.setBadgeText({ text });
    chrome.action.setBadgeBackgroundColor({ color: "#10b981" }); // Emerald green
  }
}

// Listen to storage changes to keep badge updated
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local') {
    chrome.storage.local.get(['isEnabled', 'countryCode'], (data) => {
      updateBadge(data.isEnabled, data.countryCode);
    });
  }
});

// Helper: Determine if URL is a Google Search query
function isGoogleSearchUrl(urlString) {
  try {
    const url = new URL(urlString);
    const isGoogle = url.hostname.includes('google.') || url.hostname.endsWith('google.com');
    const isSearchPath = url.pathname === '/search' || url.pathname.startsWith('/search');
    const hasQuery = url.searchParams.has('q');
    return isGoogle && (isSearchPath || hasQuery);
  } catch {
    return false;
  }
}

// Auto-sync Google Search URLs with user parameters
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // Only process when URL changes or loads
  if (!changeInfo.url && !changeInfo.status) return;
  const currentUrl = tab.url;
  if (!currentUrl || !isGoogleSearchUrl(currentUrl)) return;

  const settings = await chrome.storage.local.get([
    'isEnabled',
    'autoApply',
    'countryCode',
    'languageCode',
    'uule',
    'nonPersonalized',
    'languageRestrict'
  ]);

  if (!settings.isEnabled || !settings.autoApply) return;

  try {
    const url = new URL(currentUrl);
    let needsUpdate = false;

    // 1. Country 'gl'
    if (settings.countryCode && url.searchParams.get('gl') !== settings.countryCode.toLowerCase()) {
      url.searchParams.set('gl', settings.countryCode.toLowerCase());
      needsUpdate = true;
    }

    // 2. Language 'hl'
    if (settings.languageCode && url.searchParams.get('hl') !== settings.languageCode) {
      url.searchParams.set('hl', settings.languageCode);
      needsUpdate = true;
    }

    // 3. Language restrict 'lr'
    if (settings.languageRestrict && settings.languageCode) {
      const lrVal = `lang_${settings.languageCode}`;
      if (url.searchParams.get('lr') !== lrVal) {
        url.searchParams.set('lr', lrVal);
        needsUpdate = true;
      }
    }

    // 4. Non-personalized search 'pws=0'
    if (settings.nonPersonalized && url.searchParams.get('pws') !== '0') {
      url.searchParams.set('pws', '0');
      needsUpdate = true;
    }

    // 5. UULE Local SEO canonical parameter
    if (settings.uule && url.searchParams.get('uule') !== settings.uule) {
      url.searchParams.set('uule', settings.uule);
      needsUpdate = true;
    }

    // Redirect tab if parameters were adjusted
    if (needsUpdate && changeInfo.status === 'loading') {
      chrome.tabs.update(tabId, { url: url.toString() });
    }
  } catch (err) {
    console.error('[GS Location Changer] Error synchronizing search URL:', err);
  }
});

// Handle incoming messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'QUICK_SEARCH') {
    handleQuickSearch(message.query, message.settings).then(() => {
      sendResponse({ success: true });
    });
    return true; // async
  }

  if (message.action === 'UPDATE_BADGE') {
    updateBadge(message.isEnabled, message.countryCode);
    sendResponse({ success: true });
    return true;
  }

  if (message.action === 'RELOAD_CURRENT_GOOGLE_TAB') {
    reloadCurrentGoogleTab().then((res) => sendResponse(res));
    return true;
  }
});

// Launch a fresh Google Search with all custom parameters applied
async function handleQuickSearch(query, settings) {
  const targetCountry = settings.countryCode ? settings.countryCode.toLowerCase() : 'us';
  const targetLang = settings.languageCode || 'en';

  const searchUrl = new URL('https://www.google.com/search');
  searchUrl.searchParams.set('q', query);
  searchUrl.searchParams.set('gl', targetCountry);
  searchUrl.searchParams.set('hl', targetLang);

  if (settings.nonPersonalized) {
    searchUrl.searchParams.set('pws', '0');
  }

  if (settings.languageRestrict) {
    searchUrl.searchParams.set('lr', `lang_${targetLang}`);
  }

  if (settings.uule) {
    searchUrl.searchParams.set('uule', settings.uule);
  }

  await chrome.tabs.create({ url: searchUrl.toString() });
}

// Reload or update currently active Google tab with latest parameters
async function reloadCurrentGoogleTab() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tabs || tabs.length === 0) return { reloaded: false };

  const activeTab = tabs[0];
  if (!activeTab.url || !isGoogleSearchUrl(activeTab.url)) {
    return { reloaded: false, reason: 'not_google' };
  }

  const settings = await chrome.storage.local.get([
    'isEnabled',
    'countryCode',
    'languageCode',
    'uule',
    'nonPersonalized',
    'languageRestrict'
  ]);

  const url = new URL(activeTab.url);
  if (settings.isEnabled) {
    if (settings.countryCode) url.searchParams.set('gl', settings.countryCode.toLowerCase());
    if (settings.languageCode) url.searchParams.set('hl', settings.languageCode);
    if (settings.nonPersonalized) url.searchParams.set('pws', '0');
    if (settings.languageRestrict && settings.languageCode) {
      url.searchParams.set('lr', `lang_${settings.languageCode}`);
    }
    if (settings.uule) {
      url.searchParams.set('uule', settings.uule);
    }
  }

  await chrome.tabs.update(activeTab.id, { url: url.toString() });
  return { reloaded: true };
}
