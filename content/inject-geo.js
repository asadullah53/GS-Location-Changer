/**
 * Injected Geolocation Mocking Script (Runs in page context)
 * Overrides navigator.geolocation.getCurrentPosition, watchPosition, clearWatch,
 * and navigator.permissions.query for seamless Local SEO emulation.
 */
(() => {
  if (window.__gsLocationChangerInjected) return;
  window.__gsLocationChangerInjected = true;

  let geoConfig = {
    enabled: true,
    latitude: null,
    longitude: null,
    accuracy: 15
  };

  // Watch registry for watchPosition and clearWatch (CS-02)
  let nextWatchId = 1000;
  const activeWatches = new Map();

  // Listen for configuration updates from the content script bridge
  document.addEventListener('__GS_GEO_UPDATE__', (event) => {
    if (event && event.detail) {
      geoConfig = Object.assign({}, geoConfig, event.detail);
      // Trigger update for active watches
      if (geoConfig.enabled && typeof geoConfig.latitude === 'number' && typeof geoConfig.longitude === 'number') {
        const pos = createMockPosition(geoConfig.latitude, geoConfig.longitude, geoConfig.accuracy);
        activeWatches.forEach((watch) => {
          try {
            watch.successCallback(pos);
          } catch (e) {}
        });
      }
    }
  });

  // Preserve originals
  const originalGetCurrentPosition = navigator.geolocation.getCurrentPosition.bind(navigator.geolocation);
  const originalWatchPosition = navigator.geolocation.watchPosition.bind(navigator.geolocation);
  const originalClearWatch = navigator.geolocation.clearWatch.bind(navigator.geolocation);

  // Position constructor helper matching GeolocationPosition specification (CS-03)
  function createMockPosition(lat, lng, accuracy = 15) {
    const coords = {
      latitude: lat,
      longitude: lng,
      accuracy: accuracy,
      altitude: null,
      altitudeAccuracy: null,
      heading: null,
      speed: null,
      toJSON: function () {
        return {
          latitude: this.latitude,
          longitude: this.longitude,
          accuracy: this.accuracy,
          altitude: this.altitude,
          altitudeAccuracy: this.altitudeAccuracy,
          heading: this.heading,
          speed: this.speed
        };
      }
    };

    return {
      coords: coords,
      timestamp: Date.now()
    };
  }

  // Error generator helper
  function createPositionError(code, message) {
    return {
      code: code,
      message: message,
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3
    };
  }

  // Override getCurrentPosition (SEC-04: Fail-closed privacy)
  navigator.geolocation.getCurrentPosition = function (successCallback, errorCallback, options) {
    if (!geoConfig.enabled) {
      return originalGetCurrentPosition(successCallback, errorCallback, options);
    }

    if (typeof geoConfig.latitude === 'number' && typeof geoConfig.longitude === 'number') {
      const position = createMockPosition(geoConfig.latitude, geoConfig.longitude, geoConfig.accuracy);
      if (typeof successCallback === 'function') {
        setTimeout(() => successCallback(position), 5);
      }
      return;
    }

    // Fail-closed: do not leak real GPS to Google if coordinates are cleared/unspecified
    if (typeof errorCallback === 'function') {
      setTimeout(() => {
        errorCallback(createPositionError(1, 'User denied Geolocation'));
      }, 5);
    }
  };

  // Override watchPosition (CS-02)
  navigator.geolocation.watchPosition = function (successCallback, errorCallback, options) {
    if (!geoConfig.enabled) {
      return originalWatchPosition(successCallback, errorCallback, options);
    }

    const watchId = nextWatchId++;
    activeWatches.set(watchId, { successCallback, errorCallback, options });

    if (typeof geoConfig.latitude === 'number' && typeof geoConfig.longitude === 'number') {
      const position = createMockPosition(geoConfig.latitude, geoConfig.longitude, geoConfig.accuracy);
      if (typeof successCallback === 'function') {
        setTimeout(() => successCallback(position), 5);
      }
    } else if (typeof errorCallback === 'function') {
      setTimeout(() => {
        errorCallback(createPositionError(1, 'User denied Geolocation'));
      }, 5);
    }

    return watchId;
  };

  // Override clearWatch (CS-02)
  navigator.geolocation.clearWatch = function (watchId) {
    if (activeWatches.has(watchId)) {
      activeWatches.delete(watchId);
      return;
    }
    return originalClearWatch(watchId);
  };

  // Shim navigator.permissions.query for geolocation (CS-04)
  if (navigator.permissions && typeof navigator.permissions.query === 'function') {
    const originalQuery = navigator.permissions.query.bind(navigator.permissions);
    navigator.permissions.query = function (descriptor) {
      if (descriptor && descriptor.name === 'geolocation' && geoConfig.enabled) {
        return Promise.resolve({
          state: 'granted',
          name: 'geolocation',
          onchange: null
        });
      }
      return originalQuery(descriptor);
    };
  }
})();
