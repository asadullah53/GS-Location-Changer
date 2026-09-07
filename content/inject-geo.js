/**
 * Injected Geolocation Mocking Script (Runs in the MAIN world page context)
 * Overrides navigator.geolocation.getCurrentPosition and watchPosition
 * to return user-specified coordinates on Google Search pages.
 */
(() => {
  // Prevent duplicate injection
  if (window.__gsLocationChangerInjected) return;
  window.__gsLocationChangerInjected = true;

  let geoConfig = {
    enabled: true,
    latitude: null,
    longitude: null,
    accuracy: 15
  };

  // Listen for configuration updates from the content script bridge
  window.addEventListener('message', (event) => {
    if (event.source !== window || !event.data || event.data.type !== 'GS_GEO_UPDATE') {
      return;
    }
    geoConfig = Object.assign({}, geoConfig, event.data.payload);
  });

  // Preserve original methods in case spoofing is toggled off
  const originalGetCurrentPosition = navigator.geolocation.getCurrentPosition.bind(navigator.geolocation);
  const originalWatchPosition = navigator.geolocation.watchPosition.bind(navigator.geolocation);

  function createMockPosition(lat, lng, accuracy = 15) {
    return {
      coords: {
        latitude: lat,
        longitude: lng,
        accuracy: accuracy,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null
      },
      timestamp: Date.now()
    };
  }

  // Override getCurrentPosition
  navigator.geolocation.getCurrentPosition = function (successCallback, errorCallback, options) {
    if (geoConfig.enabled && typeof geoConfig.latitude === 'number' && typeof geoConfig.longitude === 'number') {
      const position = createMockPosition(geoConfig.latitude, geoConfig.longitude, geoConfig.accuracy);
      if (typeof successCallback === 'function') {
        setTimeout(() => successCallback(position), 10);
      }
      return;
    }
    return originalGetCurrentPosition(successCallback, errorCallback, options);
  };

  // Override watchPosition
  navigator.geolocation.watchPosition = function (successCallback, errorCallback, options) {
    if (geoConfig.enabled && typeof geoConfig.latitude === 'number' && typeof geoConfig.longitude === 'number') {
      const position = createMockPosition(geoConfig.latitude, geoConfig.longitude, geoConfig.accuracy);
      if (typeof successCallback === 'function') {
        setTimeout(() => successCallback(position), 10);
      }
      // Return a dummy watchId
      return Math.floor(Math.random() * 10000) + 1;
    }
    return originalWatchPosition(successCallback, errorCallback, options);
  };

  // Signal that spoofing hook is active
  window.dispatchEvent(new CustomEvent('GS_GEO_HOOK_READY'));
})();
