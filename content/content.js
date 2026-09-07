/**
 * GS Location Changer Content Script (Runs at document_start in Google search tabs)
 * Injects inject-geo.js synchronously and safely relays storage configurations.
 */

(function () {
  // Inject script into page DOM
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
      // Gracefully handle context invalidation or CSP
    }
  }

  // Sync settings with inject-geo.js in the page context
  function syncCurrentConfig() {
    try {
      if (!chrome.runtime || !chrome.storage || !chrome.storage.local) return;
      chrome.storage.local.get(['isEnabled', 'latitude', 'longitude', 'accuracy'], (data) => {
        if (chrome.runtime.lastError) return;
        const isEnabled = data.isEnabled !== false;
        const lat = (data.latitude !== null && data.latitude !== undefined && data.latitude !== '') 
          ? parseFloat(data.latitude) 
          : null;
        const lng = (data.longitude !== null && data.longitude !== undefined && data.longitude !== '') 
          ? parseFloat(data.longitude) 
          : null;

        document.dispatchEvent(new CustomEvent('__GS_GEO_UPDATE__', {
          detail: {
            enabled: isEnabled,
            latitude: (lat !== null && !isNaN(lat)) ? lat : null,
            longitude: (lng !== null && !isNaN(lng)) ? lng : null,
            accuracy: data.accuracy || 15
          }
        }));
      });
    } catch (err) {
      // Prevent unhandled exceptions on context invalidation (CS-05)
    }
  }

  // Listen to storage changes
  try {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'local') {
        if (changes.isEnabled || changes.latitude || changes.longitude || changes.accuracy) {
          syncCurrentConfig();
        }
      }
    });
  } catch (err) {}

  injectScript('content/inject-geo.js');
})();
