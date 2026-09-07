/**
 * GS Location Changer - Popup Logic
 * Seamlessly manages country/language selection, Local SEO GPS/UULE spoofing,
 * favorites presets, quick search, and active tab synchronization.
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Local active state
  let state = {
    isEnabled: true,
    countryCode: 'us',
    countryName: 'United States',
    languageCode: 'en',
    languageName: 'English',
    latitude: 40.7128,
    longitude: -74.0060,
    canonicalName: 'New York, New York, United States',
    uule: 'w+CAIQICIlTmV3IFlvcmssIE5ldyBZb3JrLCBVbml0ZWQgU3RhdGVz',
    autoApply: true,
    nonPersonalized: true,
    languageRestrict: false,
    favorites: []
  };

  // DOM Elements
  const masterToggle = document.getElementById('masterToggle');
  const statusBadge = document.getElementById('statusBadge');
  const statusCard = document.getElementById('statusCard');
  const activeFlag = document.getElementById('activeFlag');
  const activeCountryName = document.getElementById('activeCountryName');
  const activeLanguageTag = document.getElementById('activeLanguageTag');
  const activeGeoTag = document.getElementById('activeGeoTag');
  const activeUuleText = document.getElementById('activeUuleText');
  const quickReloadBtn = document.getElementById('quickReloadBtn');

  // Country & Language Dropdowns
  const countrySearch = document.getElementById('countrySearch');
  const countryDropdown = document.getElementById('countryDropdown');
  const langSearch = document.getElementById('langSearch');
  const langDropdown = document.getElementById('langDropdown');
  const applyQuickBtn = document.getElementById('applyQuickBtn');
  const saveCurrentAsFavBtn = document.getElementById('saveCurrentAsFavBtn');

  // GPS / SEO Controls
  const cityPresetSelect = document.getElementById('cityPresetSelect');
  const latInput = document.getElementById('latInput');
  const lngInput = document.getElementById('lngInput');
  const canonicalCityInput = document.getElementById('canonicalCityInput');
  const generateUuleBtn = document.getElementById('generateUuleBtn');
  const uuleDisplay = document.getElementById('uuleDisplay');
  const applyGpsBtn = document.getElementById('applyGpsBtn');
  const clearGpsBtn = document.getElementById('clearGpsBtn');

  // Favorites Controls
  const favCount = document.getElementById('favCount');
  const addNewFavToggleBtn = document.getElementById('addNewFavToggleBtn');
  const newFavForm = document.getElementById('newFavForm');
  const favCustomName = document.getElementById('favCustomName');
  const confirmSaveFavBtn = document.getElementById('confirmSaveFavBtn');
  const cancelSaveFavBtn = document.getElementById('cancelSaveFavBtn');
  const favoritesList = document.getElementById('favoritesList');

  // Settings Controls
  const autoApplyToggle = document.getElementById('autoApplyToggle');
  const pwsToggle = document.getElementById('pwsToggle');
  const lrToggle = document.getElementById('lrToggle');
  const exportFavsBtn = document.getElementById('exportFavsBtn');
  const importFavsInput = document.getElementById('importFavsInput');
  const resetDefaultsBtn = document.getElementById('resetDefaultsBtn');

  // Quick Search
  const quickSearchInput = document.getElementById('quickSearchInput');
  const quickSearchSubmitBtn = document.getElementById('quickSearchSubmitBtn');
  const toast = document.getElementById('toast');

  // Load state from chrome.storage
  const stored = await chrome.storage.local.get(null);
  if (stored && Object.keys(stored).length > 0) {
    state = Object.assign({}, state, stored);
  }

  // Helper: Show temporary toast
  function showToast(message) {
    toast.textContent = message;
    toast.classList.remove('hidden');
    setTimeout(() => {
      toast.classList.add('hidden');
    }, 2200);
  }

  // Find country flag helper
  function getCountryFlag(code) {
    const c = GOOGLE_COUNTRIES.find(item => item.code.toLowerCase() === (code || '').toLowerCase());
    return c ? c.flag : '🌐';
  }

  // Update top status card & master switch
  function renderStatus() {
    masterToggle.checked = state.isEnabled;
    if (state.isEnabled) {
      statusBadge.textContent = 'ACTIVE';
      statusBadge.className = 'status-badge active';
      statusCard.classList.remove('disabled');
    } else {
      statusBadge.textContent = 'OFF';
      statusBadge.className = 'status-badge';
      statusCard.classList.add('disabled');
    }

    const flag = getCountryFlag(state.countryCode);
    activeFlag.textContent = flag;
    activeCountryName.textContent = state.countryName || 'Global';
    activeLanguageTag.textContent = `🌐 ${state.languageName || 'English'} (${state.languageCode || 'en'})`;

    if (state.latitude !== null && state.longitude !== null && !isNaN(state.latitude)) {
      activeGeoTag.textContent = `📍 ${Number(state.latitude).toFixed(4)}, ${Number(state.longitude).toFixed(4)}`;
    } else {
      activeGeoTag.textContent = '📍 Country-level';
    }

    if (state.uule) {
      const decoded = decodeUULE(state.uule) || state.canonicalName || 'Active';
      activeUuleText.textContent = `${decoded} (${state.uule.slice(0, 16)}...)`;
    } else {
      activeUuleText.textContent = 'None (Standard SERP)';
    }

    // Set input values
    countrySearch.value = `${flag} ${state.countryName} (${state.countryCode.toUpperCase()})`;
    langSearch.value = `${state.languageName} (${state.languageCode})`;
    latInput.value = state.latitude !== null ? state.latitude : '';
    lngInput.value = state.longitude !== null ? state.longitude : '';
    canonicalCityInput.value = state.canonicalName || '';
    uuleDisplay.value = state.uule || '';

    // Settings
    autoApplyToggle.checked = state.autoApply !== false;
    pwsToggle.checked = state.nonPersonalized !== false;
    lrToggle.checked = state.languageRestrict === true;
  }

  // Populate City Presets dropdown
  function initCityPresets() {
    cityPresetSelect.innerHTML = '<option value="">-- Choose a city preset or enter custom below --</option>';
    DEFAULT_PRESETS.forEach((p) => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = `${p.name} (${p.canonicalName})`;
      cityPresetSelect.appendChild(opt);
    });
  }

  cityPresetSelect.addEventListener('change', () => {
    const selectedId = cityPresetSelect.value;
    if (!selectedId) return;
    const preset = DEFAULT_PRESETS.find(p => p.id === selectedId);
    if (preset) {
      latInput.value = preset.latitude;
      lngInput.value = preset.longitude;
      canonicalCityInput.value = preset.canonicalName;
      const genUule = encodeUULE(preset.canonicalName);
      uuleDisplay.value = genUule;
    }
  });

  // UULE Generator Trigger
  generateUuleBtn.addEventListener('click', () => {
    const city = canonicalCityInput.value.trim();
    if (!city) {
      showToast('Please enter a city or location name');
      return;
    }
    const gen = encodeUULE(city);
    uuleDisplay.value = gen;
    showToast('UULE generated!');
  });

  // Master Toggle Change
  masterToggle.addEventListener('change', async () => {
    state.isEnabled = masterToggle.checked;
    await chrome.storage.local.set({ isEnabled: state.isEnabled });
    chrome.runtime.sendMessage({
      action: 'UPDATE_BADGE',
      isEnabled: state.isEnabled,
      countryCode: state.countryCode
    });
    renderStatus();
    showToast(state.isEnabled ? 'Spoofing activated' : 'Spoofing disabled');
  });

  // Quick Tab: Searchable Country Dropdown
  function filterCountries(query) {
    countryDropdown.innerHTML = '';
    const q = (query || '').toLowerCase().trim();
    const filtered = GOOGLE_COUNTRIES.filter(c => 
      c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
    );

    if (filtered.length === 0) {
      const emptyItem = document.createElement('div');
      emptyItem.className = 'dropdown-item';
      emptyItem.textContent = 'No matching country found';
      countryDropdown.appendChild(emptyItem);
      countryDropdown.classList.add('show');
      return;
    }

    filtered.slice(0, 40).forEach(c => {
      const item = document.createElement('div');
      item.className = 'dropdown-item';
      if (c.code.toLowerCase() === state.countryCode.toLowerCase()) {
        item.classList.add('selected');
      }
      item.innerHTML = `
        <div class="item-left">
          <span class="item-flag">${c.flag}</span>
          <span class="item-name">${c.name}</span>
        </div>
        <span class="item-code">${c.code.toUpperCase()}</span>
      `;
      item.addEventListener('click', () => {
        state.countryCode = c.code;
        state.countryName = c.name;
        countrySearch.value = `${c.flag} ${c.name} (${c.code.toUpperCase()})`;
        countryDropdown.classList.remove('show');
      });
      countryDropdown.appendChild(item);
    });
    countryDropdown.classList.add('show');
  }

  countrySearch.addEventListener('focus', () => filterCountries(countrySearch.value));
  countrySearch.addEventListener('input', (e) => filterCountries(e.target.value));

  // Quick Tab: Searchable Language Dropdown
  function filterLanguages(query) {
    langDropdown.innerHTML = '';
    const q = (query || '').toLowerCase().trim();
    const filtered = GOOGLE_LANGUAGES.filter(l => 
      l.name.toLowerCase().includes(q) || 
      l.code.toLowerCase().includes(q) || 
      l.nativeName.toLowerCase().includes(q)
    );

    if (filtered.length === 0) {
      const emptyItem = document.createElement('div');
      emptyItem.className = 'dropdown-item';
      emptyItem.textContent = 'No matching language found';
      langDropdown.appendChild(emptyItem);
      langDropdown.classList.add('show');
      return;
    }

    filtered.slice(0, 40).forEach(l => {
      const item = document.createElement('div');
      item.className = 'dropdown-item';
      if (l.code.toLowerCase() === state.languageCode.toLowerCase()) {
        item.classList.add('selected');
      }
      item.innerHTML = `
        <div class="item-left">
          <span class="item-name">${l.name} (${l.nativeName})</span>
        </div>
        <span class="item-code">${l.code}</span>
      `;
      item.addEventListener('click', () => {
        state.languageCode = l.code;
        state.languageName = l.name;
        langSearch.value = `${l.name} (${l.code})`;
        langDropdown.classList.remove('show');
      });
      langDropdown.appendChild(item);
    });
    langDropdown.classList.add('show');
  }

  langSearch.addEventListener('focus', () => filterLanguages(langSearch.value));
  langSearch.addEventListener('input', (e) => filterLanguages(e.target.value));

  // Close dropdowns on outside click
  document.addEventListener('click', (e) => {
    if (!countrySearch.contains(e.target) && !countryDropdown.contains(e.target)) {
      countryDropdown.classList.remove('show');
    }
    if (!langSearch.contains(e.target) && !langDropdown.contains(e.target)) {
      langDropdown.classList.remove('show');
    }
  });

  // Apply Quick Location & Language Button
  applyQuickBtn.addEventListener('click', async () => {
    await chrome.storage.local.set({
      countryCode: state.countryCode,
      countryName: state.countryName,
      languageCode: state.languageCode,
      languageName: state.languageName
    });
    renderStatus();
    chrome.runtime.sendMessage({ action: 'RELOAD_CURRENT_GOOGLE_TAB' });
    showToast('Applied location & language!');
  });

  // Apply GPS & UULE Button
  applyGpsBtn.addEventListener('click', async () => {
    const lat = latInput.value ? parseFloat(latInput.value) : null;
    const lng = lngInput.value ? parseFloat(lngInput.value) : null;
    const canonical = canonicalCityInput.value.trim();
    let uuleVal = uuleDisplay.value.trim();

    if (!uuleVal && canonical) {
      uuleVal = encodeUULE(canonical);
      uuleDisplay.value = uuleVal;
    }

    state.latitude = lat;
    state.longitude = lng;
    state.canonicalName = canonical;
    state.uule = uuleVal;

    await chrome.storage.local.set({
      latitude: lat,
      longitude: lng,
      canonicalName: canonical,
      uule: uuleVal
    });

    renderStatus();
    chrome.runtime.sendMessage({ action: 'RELOAD_CURRENT_GOOGLE_TAB' });
    showToast('Coordinates & UULE updated!');
  });

  // Clear GPS Button
  clearGpsBtn.addEventListener('click', async () => {
    state.latitude = null;
    state.longitude = null;
    state.canonicalName = '';
    state.uule = '';

    await chrome.storage.local.set({
      latitude: null,
      longitude: null,
      canonicalName: '',
      uule: ''
    });

    cityPresetSelect.value = '';
    renderStatus();
    chrome.runtime.sendMessage({ action: 'RELOAD_CURRENT_GOOGLE_TAB' });
    showToast('Cleared GPS coordinates');
  });

  // Quick Reload Button in Header
  quickReloadBtn.addEventListener('click', async () => {
    quickReloadBtn.classList.add('rotating');
    chrome.runtime.sendMessage({ action: 'RELOAD_CURRENT_GOOGLE_TAB' }, (res) => {
      quickReloadBtn.classList.remove('rotating');
      if (res && res.reloaded) {
        showToast('Google tab refreshed!');
      } else {
        showToast('Active tab is not Google Search');
      }
    });
  });

  // Favorites Rendering
  function renderFavorites() {
    favCount.textContent = state.favorites.length;
    favoritesList.innerHTML = '';

    if (state.favorites.length === 0) {
      favoritesList.innerHTML = `
        <div style="text-align: center; padding: 25px 10px; color: var(--text-muted); font-size: 11px;">
          No favorite presets saved yet.<br>Click "Save to Favorites" or "+ Add Current" to bookmark your frequent locations.
        </div>
      `;
      return;
    }

    state.favorites.forEach((fav) => {
      const card = document.createElement('div');
      card.className = 'favorite-card';
      const flag = fav.badge || getCountryFlag(fav.countryCode);
      const geoLabel = fav.latitude ? `${Number(fav.latitude).toFixed(2)}, ${Number(fav.longitude).toFixed(2)}` : 'Country';

      card.innerHTML = `
        <div class="fav-card-left">
          <span class="fav-card-flag">${flag}</span>
          <div class="fav-card-info">
            <span class="fav-card-name" title="${fav.name}">${fav.name}</span>
            <div class="fav-card-tags">
              <span class="fav-tag">${(fav.countryCode || '').toUpperCase()}</span>
              <span class="fav-tag">${fav.languageCode || 'en'}</span>
              <span class="fav-tag">📍 ${geoLabel}</span>
            </div>
          </div>
        </div>
        <div class="fav-card-actions">
          <button class="fav-apply-btn" title="Apply this favorite preset">Apply</button>
          <button class="fav-del-btn" title="Delete favorite">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      `;

      // Apply button event
      card.querySelector('.fav-apply-btn').addEventListener('click', async () => {
        state.countryCode = fav.countryCode;
        state.countryName = fav.countryName;
        state.languageCode = fav.languageCode;
        state.languageName = fav.languageName;
        state.latitude = fav.latitude;
        state.longitude = fav.longitude;
        state.canonicalName = fav.canonicalName;
        state.uule = fav.uule;

        await chrome.storage.local.set({
          countryCode: state.countryCode,
          countryName: state.countryName,
          languageCode: state.languageCode,
          languageName: state.languageName,
          latitude: state.latitude,
          longitude: state.longitude,
          canonicalName: state.canonicalName,
          uule: state.uule
        });

        renderStatus();
        chrome.runtime.sendMessage({ action: 'RELOAD_CURRENT_GOOGLE_TAB' });
        showToast(`Applied preset: ${fav.name}`);
      });

      // Delete button event
      card.querySelector('.fav-del-btn').addEventListener('click', async () => {
        state.favorites = state.favorites.filter(f => f.id !== fav.id);
        await chrome.storage.local.set({ favorites: state.favorites });
        renderFavorites();
        showToast('Favorite removed');
      });

      favoritesList.appendChild(card);
    });
  }

  // Save current location as favorite
  function openNewFavForm() {
    newFavForm.classList.remove('hidden');
    favCustomName.value = `${state.countryName} - ${state.languageName} Preset`;
    favCustomName.focus();
  }

  saveCurrentAsFavBtn.addEventListener('click', () => {
    // Switch to favorites tab and open form
    switchTab('tab-favorites');
    openNewFavForm();
  });

  addNewFavToggleBtn.addEventListener('click', () => {
    openNewFavForm();
  });

  cancelSaveFavBtn.addEventListener('click', () => {
    newFavForm.classList.add('hidden');
  });

  confirmSaveFavBtn.addEventListener('click', async () => {
    const name = favCustomName.value.trim();
    if (!name) {
      showToast('Please enter a name for the favorite');
      return;
    }

    const newFav = {
      id: 'fav-' + Date.now(),
      name: name,
      countryCode: state.countryCode,
      countryName: state.countryName,
      languageCode: state.languageCode,
      languageName: state.languageName,
      latitude: state.latitude,
      longitude: state.longitude,
      canonicalName: state.canonicalName,
      uule: state.uule,
      badge: getCountryFlag(state.countryCode)
    };

    state.favorites.unshift(newFav);
    await chrome.storage.local.set({ favorites: state.favorites });
    newFavForm.classList.add('hidden');
    renderFavorites();
    showToast('Saved to Favorites!');
  });

  // Settings Toggles
  autoApplyToggle.addEventListener('change', async () => {
    state.autoApply = autoApplyToggle.checked;
    await chrome.storage.local.set({ autoApply: state.autoApply });
    showToast(`Auto-apply ${state.autoApply ? 'enabled' : 'disabled'}`);
  });

  pwsToggle.addEventListener('change', async () => {
    state.nonPersonalized = pwsToggle.checked;
    await chrome.storage.local.set({ nonPersonalized: state.nonPersonalized });
    showToast(`Non-personalized ${state.nonPersonalized ? 'enabled' : 'disabled'}`);
  });

  lrToggle.addEventListener('change', async () => {
    state.languageRestrict = lrToggle.checked;
    await chrome.storage.local.set({ languageRestrict: state.languageRestrict });
    showToast(`Language restrict ${state.languageRestrict ? 'enabled' : 'disabled'}`);
  });

  // Export Favorites JSON
  exportFavsBtn.addEventListener('click', () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state.favorites, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "gs-location-changer-favorites.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Favorites exported!');
  });

  // Import Favorites JSON
  importFavsInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (Array.isArray(imported)) {
          state.favorites = imported;
          await chrome.storage.local.set({ favorites: state.favorites });
          renderFavorites();
          showToast(`Imported ${imported.length} favorites!`);
        } else {
          showToast('Invalid favorites JSON structure');
        }
      } catch (err) {
        showToast('Error parsing JSON file');
      }
    };
    reader.readAsText(file);
  });

  // Reset Defaults
  resetDefaultsBtn.addEventListener('click', async () => {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
      await chrome.storage.local.clear();
      chrome.runtime.reload();
      window.close();
    }
  });

  // Quick Search Execution
  function executeQuickSearch() {
    const query = quickSearchInput.value.trim();
    if (!query) return;

    chrome.runtime.sendMessage({
      action: 'QUICK_SEARCH',
      query: query,
      settings: state
    }, () => {
      window.close();
    });
  }

  quickSearchSubmitBtn.addEventListener('click', executeQuickSearch);
  quickSearchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      executeQuickSearch();
    }
  });

  // Navigation Tab Switching
  function switchTab(targetTabId) {
    document.querySelectorAll('.tab-btn').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-tab') === targetTabId);
    });
    document.querySelectorAll('.tab-content').forEach(c => {
      c.classList.toggle('active', c.id === targetTabId);
    });
  }

  document.querySelectorAll('.nav-tabs .tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      switchTab(btn.getAttribute('data-tab'));
    });
  });

  // Initial Boot
  const countryCountEl = document.getElementById('countryCount');
  const langCountEl = document.getElementById('langCount');
  if (countryCountEl && typeof GOOGLE_COUNTRIES !== 'undefined') {
    countryCountEl.textContent = `${GOOGLE_COUNTRIES.length}`;
  }
  if (langCountEl && typeof GOOGLE_LANGUAGES !== 'undefined') {
    langCountEl.textContent = `${GOOGLE_LANGUAGES.length}`;
  }

  initCityPresets();
  renderStatus();
  renderFavorites();
});
