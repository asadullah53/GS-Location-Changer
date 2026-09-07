/**
 * GS Location Changer Content Script
 * Injected into Google Search tabs.
 * Bridges chrome.storage settings to inject-geo.js in the page context.
 */

(function () {
  // Inject the geolocation mocking script into page context
  function injectScript(filePath) {
    try {
      const script = document.createElement('script');
      script.src = chrome.runtime.getURL(filePath);
      script.onload = function () {
        this.remove();
        syncCurrentConfig();
      };
      (document.head || document.documentElement).appendChild(script);
    } catch (err) {
      console.warn('[GS Location Changer] Script injection failed:', err);
    }
  }

  // Push latest configuration to inject-geo.js
  function syncCurrentConfig() {
    chrome.storage.local.get(['isEnabled', 'latitude', 'longitude', 'accuracy'], (data) => {
      const isEnabled = data.isEnabled !== false;
      const lat = typeof data.latitude === 'number' ? data.latitude : parseFloat(data.latitude);
      const lng = typeof data.longitude === 'number' ? data.longitude : parseFloat(data.longitude);

      window.postMessage({
        type: 'GS_GEO_UPDATE',
        payload: {
          enabled: isEnabled && !isNaN(lat) && !isNaN(lng),
          latitude: !isNaN(lat) ? lat : null,
          longitude: !isNaN(lng) ? lng : null,
          accuracy: data.accuracy || 15
        }
      }, '*');
    });
  }

  // Listen to storage changes from popup or background
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local') {
      if (changes.isEnabled || changes.latitude || changes.longitude || changes.accuracy) {
        syncCurrentConfig();
      }
    }
  });

  // Inject at document start
  injectScript('content/inject-geo.js');
})();
