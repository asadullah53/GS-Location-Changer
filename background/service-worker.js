/**
 * GS Location Changer - Background Service Worker (Manifest V3)
 * Handles toolbar badges, search URL synchronization, ccTLD routing, and tab messaging.
 */

// Import shared datasets and utilities
importScripts('../data/countries.js', '../data/languages.js', '../utils/uule-generator.js');

// Build strict allowed Google domain lookup set (SEC-02)
const GOOGLE_DOMAINS_SET = new Set(['google.com']);
if (typeof GOOGLE_COUNTRIES !== 'undefined' && Array.isArray(GOOGLE_COUNTRIES)) {
  GOOGLE_COUNTRIES.forEach(c => {
    if (c.domain) GOOGLE_DOMAINS_SET.add(c.domain.toLowerCase());
  });
}

// Starter favorites definitions (single source of truth: canonicalName -> encodeUULE)
function createInitialFavorites() {
  const starter = [
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
      badge: "🇵🇰"
    }
  ];

  return starter.map(f => ({
    ...f,
    uule: encodeUULE(f.canonicalName) // UUL-01: Dynamically generated valid protobuf
  }));
}

// Default configuration
const DEFAULT_CONFIG = {
  isEnabled: true,
  countryCode: "us",
  countryName: "United States",
  languageCode: "en",
  languageName: "English",
  latitude: 40.7128,
  longitude: -74.0060,
  canonicalName: "New York, New York, United States",
  uule: encodeUULE("New York, New York, United States"),
  autoApply: true,
  nonPersonalized: true, // pws=0
  languageRestrict: false,
  favorites: []
};

// Initial setup on install/update (SW-09: preserve user deletions across updates)
chrome.runtime.onInstalled.addListener(async (details) => {
  const current = await chrome.storage.local.get(null);
  
  if (details.reason === 'install' || !current || Object.keys(current).length === 0) {
    const initial = {
      ...DEFAULT_CONFIG,
      ...current,
      favorites: (current.favorites && current.favorites.length > 0)
        ? current.favorites
        : createInitialFavorites()
    };
    await chrome.storage.local.set(initial);
    updateBadge(initial.isEnabled, initial.countryCode);
  } else {
    // On update, just refresh badge
    updateBadge(current.isEnabled !== false, current.countryCode || 'us');
  }
});

// Restore badge on browser startup (SW-04)
chrome.runtime.onStartup.addListener(async () => {
  const data = await chrome.storage.local.get(['isEnabled', 'countryCode']);
  updateBadge(data.isEnabled !== false, data.countryCode || 'us');
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

// Efficient storage listener (SW-05: only wake up when badge state changes)
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local') {
    if (changes.isEnabled || changes.countryCode) {
      chrome.storage.local.get(['isEnabled', 'countryCode'], (data) => {
        updateBadge(data.isEnabled !== false, data.countryCode || 'us');
      });
    }
  }
});

// Strict Google Search URL detector (SEC-02)
function isGoogleSearchUrl(urlString) {
  try {
    const url = new URL(urlString);
    const host = url.hostname.toLowerCase();
    
    // Check if hostname matches or ends with any valid Google ccTLD
    let isGoogleDomain = false;
    for (const domain of GOOGLE_DOMAINS_SET) {
      if (host === domain || host.endsWith('.' + domain)) {
        isGoogleDomain = true;
        break;
      }
    }
    if (!isGoogleDomain) return false;

    // Strict path matching: only /search, ignore /maps, /flights, etc.
    const isSearchPath = url.pathname === '/search';
    const hasQuery = url.searchParams.has('q');
    return isSearchPath && hasQuery;
  } catch {
    return false;
  }
}

// Auto-apply search parameters with declarativeNetRequest.
// Chrome rewrites the URL *before* the request leaves the browser, so Google
// receives exactly one request per search. The previous tabs.onUpdated +
// tabs.update approach sent every search twice (original + rewritten), which
// Google flags as automated traffic and answers with "403 ... /search".
const SEARCH_PARAMS_RULE_ID = 1;
const SEARCH_RULE_KEYS = [
  'isEnabled',
  'autoApply',
  'countryCode',
  'languageCode',
  'uule',
  'nonPersonalized',
  'languageRestrict'
];

async function syncSearchParamsRule() {
  const settings = await chrome.storage.local.get(SEARCH_RULE_KEYS);

  const params = [];
  if (settings.isEnabled !== false && settings.autoApply !== false) {
    if (settings.countryCode) params.push({ key: 'gl', value: settings.countryCode.toLowerCase() });
    if (settings.languageCode) params.push({ key: 'hl', value: settings.languageCode });
    if (settings.languageRestrict && settings.languageCode) {
      params.push({ key: 'lr', value: getGoogleLrCode(settings.languageCode) });
    }
    if (settings.nonPersonalized) params.push({ key: 'pws', value: '0' });
    if (settings.uule) params.push({ key: 'uule', value: settings.uule });
  }

  const update = { removeRuleIds: [SEARCH_PARAMS_RULE_ID] };
  if (params.length > 0) {
    update.addRules = [{
      id: SEARCH_PARAMS_RULE_ID,
      priority: 1,
      action: {
        type: 'redirect',
        redirect: { transform: { queryTransform: { addOrReplaceParams: params } } }
      },
      condition: {
        // Only top-level Google Search result pages with a query (?q= / &q=)
        regexFilter: '^https?://[^/]+/search\\?(.*&)?q=',
        requestDomains: [...GOOGLE_DOMAINS_SET],
        resourceTypes: ['main_frame']
      }
    }];
  }

  try {
    await chrome.declarativeNetRequest.updateDynamicRules(update);
  } catch (err) {
    console.error('[GS Location Changer] Failed to update search rule:', err);
  }
}

chrome.runtime.onInstalled.addListener(() => { syncSearchParamsRule(); });
chrome.runtime.onStartup.addListener(() => { syncSearchParamsRule(); });

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== 'local') return;
  if (SEARCH_RULE_KEYS.some((key) => key in changes)) {
    syncSearchParamsRule();
  }
});

// Stale device-location cookie cleanup.
// After a page gets a position from navigator.geolocation, Google caches it in a
// "UULE" cookie (a+cm9sZ... = base64 text proto with latitude_e7/longitude_e7).
// Google then shows that position as "From your device" and ranks results for it,
// which overrides the uule/gl URL params (e.g. gl=nl but results for New York).
// Remove the cookie whenever it doesn't match the GPS coordinates configured here.
const DEVICE_LOCATION_COOKIE = 'UULE';
const COOKIE_RULE_KEYS = ['isEnabled', 'latitude', 'longitude'];
const COORD_MATCH_TOLERANCE = 0.01; // ~1 km

function parseDeviceLocationCookie(value) {
  try {
    let raw = decodeURIComponent(value || '').trim();
    if (!raw.startsWith('a+') && !raw.startsWith('a ')) return null;
    raw = raw.slice(2).replace(/-/g, '+').replace(/_/g, '/');
    const text = atob(raw);
    const lat = text.match(/latitude_e7:\s*(-?\d+)/);
    const lng = text.match(/longitude_e7:\s*(-?\d+)/);
    if (!lat || !lng) return null;
    return { latitude: Number(lat[1]) / 1e7, longitude: Number(lng[1]) / 1e7 };
  } catch {
    return null;
  }
}

function isGoogleCookieDomain(domain) {
  const host = (domain || '').replace(/^\./, '').toLowerCase();
  for (const d of GOOGLE_DOMAINS_SET) {
    if (host === d || host.endsWith('.' + d)) return true;
  }
  return false;
}

function shouldRemoveDeviceCookie(cookie, settings) {
  if (cookie.name !== DEVICE_LOCATION_COOKIE || !isGoogleCookieDomain(cookie.domain)) return false;
  if (settings.isEnabled === false) return false;

  const lat = parseFloat(settings.latitude);
  const lng = parseFloat(settings.longitude);
  if (isNaN(lat) || isNaN(lng)) return true; // Country-level: no device location at all

  const cached = parseDeviceLocationCookie(cookie.value);
  if (!cached) return true;
  return Math.abs(cached.latitude - lat) > COORD_MATCH_TOLERANCE ||
    Math.abs(cached.longitude - lng) > COORD_MATCH_TOLERANCE;
}

async function removeCookie(cookie) {
  const host = cookie.domain.replace(/^\./, '');
  try {
    await chrome.cookies.remove({
      url: `https://${host}${cookie.path || '/'}`,
      name: cookie.name,
      storeId: cookie.storeId
    });
  } catch (err) {
    console.warn('[GS Location Changer] Failed to remove device location cookie:', err);
  }
}

async function purgeStaleDeviceLocationCookies() {
  const settings = await chrome.storage.local.get(COOKIE_RULE_KEYS);
  if (settings.isEnabled === false) return;
  const stores = await chrome.cookies.getAllCookieStores();
  for (const store of stores) {
    const cookies = await chrome.cookies.getAll({ name: DEVICE_LOCATION_COOKIE, storeId: store.id });
    for (const cookie of cookies) {
      if (shouldRemoveDeviceCookie(cookie, settings)) await removeCookie(cookie);
    }
  }
}

chrome.cookies.onChanged.addListener(async ({ removed, cookie }) => {
  if (removed || cookie.name !== DEVICE_LOCATION_COOKIE) return;
  const settings = await chrome.storage.local.get(COOKIE_RULE_KEYS);
  if (shouldRemoveDeviceCookie(cookie, settings)) await removeCookie(cookie);
});

chrome.runtime.onInstalled.addListener(() => { purgeStaleDeviceLocationCookies(); });
chrome.runtime.onStartup.addListener(() => { purgeStaleDeviceLocationCookies(); });

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== 'local') return;
  if (COOKIE_RULE_KEYS.some((key) => key in changes)) {
    purgeStaleDeviceLocationCookies();
  }
});

// Handle incoming messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'QUICK_SEARCH') {
    handleQuickSearch(message.query, message.settings)
      .then(() => sendResponse({ success: true }))
      .catch((err) => {
        console.error('[GS Location Changer] Quick search failed:', err);
        sendResponse({ success: false, error: err.message });
      });
    return true; // async
  }

  if (message.action === 'UPDATE_BADGE') {
    updateBadge(message.isEnabled, message.countryCode);
    sendResponse({ success: true });
    return true;
  }

  if (message.action === 'RELOAD_CURRENT_GOOGLE_TAB') {
    reloadCurrentGoogleTab()
      .then((res) => sendResponse(res))
      .catch((err) => sendResponse({ reloaded: false, error: err.message }));
    return true;
  }
});

// Launch a fresh Google Search with ccTLD routing (SW-07, SW-08)
async function handleQuickSearch(query, settings) {
  const targetCountry = settings.countryCode ? settings.countryCode.toLowerCase() : 'us';
  const targetLang = settings.languageCode || 'en';

  // Find country's native Google domain (e.g. google.co.uk, google.com.pk)
  let targetDomain = 'google.com';
  if (typeof GOOGLE_COUNTRIES !== 'undefined') {
    const found = GOOGLE_COUNTRIES.find(c => c.code.toLowerCase() === targetCountry);
    if (found && found.domain) {
      targetDomain = found.domain;
    }
  }

  const searchUrl = new URL(`https://www.${targetDomain}/search`);
  searchUrl.searchParams.set('q', query);
  searchUrl.searchParams.set('gl', targetCountry);
  searchUrl.searchParams.set('hl', targetLang);

  if (settings.nonPersonalized) {
    searchUrl.searchParams.set('pws', '0');
  }

  if (settings.languageRestrict) {
    searchUrl.searchParams.set('lr', getGoogleLrCode(targetLang));
  }

  if (settings.uule) {
    searchUrl.searchParams.set('uule', settings.uule);
  }

  try {
    await chrome.tabs.create({ url: searchUrl.toString() });
  } catch (err) {
    console.warn('[GS Location Changer] Tab creation aborted:', err);
  }
}

// Reload or update currently active Google tab with latest parameters (SW-02)
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

  // Drop any cached device location before the reload request carries it
  await purgeStaleDeviceLocationCookies();

  if (settings.isEnabled) {
    // Apply parameters
    if (settings.countryCode) url.searchParams.set('gl', settings.countryCode.toLowerCase());
    if (settings.languageCode) url.searchParams.set('hl', settings.languageCode);
    if (settings.nonPersonalized) url.searchParams.set('pws', '0');
    if (settings.languageRestrict && settings.languageCode) {
      url.searchParams.set('lr', getGoogleLrCode(settings.languageCode));
    } else {
      url.searchParams.delete('lr');
    }

    if (settings.uule) {
      url.searchParams.set('uule', settings.uule);
    } else {
      url.searchParams.delete('uule'); // Explicit deletion if cleared
    }
  } else {
    // SW-02: Explicitly strip all spoofed parameters when disabled
    ['gl', 'hl', 'lr', 'pws', 'uule'].forEach(param => url.searchParams.delete(param));
  }

  try {
    await chrome.tabs.update(activeTab.id, { url: url.toString() });
    return { reloaded: true };
  } catch (err) {
    // Navigation was aborted or tab closed
    return { reloaded: false, error: err.message };
  }
}
