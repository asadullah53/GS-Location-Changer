/**
 * GS Location Changer - Popup Logic (Enterprise Hardened)
 * Clean DOM manipulation, XSS immunity, strict schema validation,
 * keyboard accessibility, consolidated state saves, and instant search.
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Global active state
  let state = {
    isEnabled: true,
    countryCode: 'us',
    countryName: 'United States',
    languageCode: 'en',
    languageName: 'English',
    latitude: 40.7128,
    longitude: -74.0060,
    accuracy: 15,
    canonicalName: 'New York, New York, United States',
    uule: encodeUULE('New York, New York, United States'),
    autoApply: true,
    nonPersonalized: true,
    languageRestrict: false,
    favorites: []
  };

  // Toast timer tracking (POP-08)
  let toastTimeout = null;

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

  // Country & Language
  const countrySearch = document.getElementById('countrySearch');
  const countryDropdown = document.getElementById('countryDropdown');
  const langSearch = document.getElementById('langSearch');
  const langDropdown = document.getElementById('langDropdown');
  const countryCountEl = document.getElementById('countryCount');
  const langCountEl = document.getElementById('langCount');
  const applyQuickBtn = document.getElementById('applyQuickBtn');
  const saveCurrentAsFavBtn = document.getElementById('saveCurrentAsFavBtn');

  // GPS / SEO Controls
  const cityPresetSelect = document.getElementById('cityPresetSelect');
  const latInput = document.getElementById('latInput');
  const lngInput = document.getElementById('lngInput');
  const accInput = document.getElementById('accInput');
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

  // Quick Search & Toast
  const quickSearchInput = document.getElementById('quickSearchInput');
  const quickSearchSubmitBtn = document.getElementById('quickSearchSubmitBtn');
  const toast = document.getElementById('toast');

  // Load state from chrome.storage
  try {
    const stored = await chrome.storage.local.get(null);
    if (stored && Object.keys(stored).length > 0) {
      state = Object.assign({}, state, stored);
    }
  } catch (e) {
    console.error('Error loading storage:', e);
  }

  // Toast feedback with proper timer cancellation (POP-08)
  function showToast(message) {
    if (toastTimeout) {
      clearTimeout(toastTimeout);
    }
    toast.textContent = message;
    toast.classList.remove('hidden');
    toastTimeout = setTimeout(() => {
      toast.classList.add('hidden');
      toastTimeout = null;
    }, 2200);
  }

  // Flag helper with null guard (POP-06)
  function getCountryFlag(code) {
    if (!code) return '🌐';
    const c = GOOGLE_COUNTRIES.find(item => item.code.toLowerCase() === code.toLowerCase());
    return c ? c.flag : '🌐';
  }

  // Single Consolidated State Persist (POP-01)
  async function saveState(reloadTab = true) {
    // Validate coordinates (POP-05)
    let lat = latInput.value !== '' ? parseFloat(latInput.value) : null;
    let lng = lngInput.value !== '' ? parseFloat(lngInput.value) : null;
    let acc = accInput && accInput.value !== '' ? parseInt(accInput.value, 10) : 15;

    if (lat !== null && (isNaN(lat) || lat < -90 || lat > 90)) {
      showToast('Latitude must be between -90 and 90');
      return false;
    }
    if (lng !== null && (isNaN(lng) || lng < -180 || lng > 180)) {
      showToast('Longitude must be between -180 and 180');
      return false;
    }

    state.latitude = lat;
    state.longitude = lng;
    state.accuracy = !isNaN(acc) ? acc : 15;
    state.canonicalName = canonicalCityInput.value.trim();

    if (state.canonicalName && !uuleDisplay.value.trim()) {
      state.uule = encodeUULE(state.canonicalName);
      uuleDisplay.value = state.uule;
    } else {
      state.uule = uuleDisplay.value.trim();
    }

    await chrome.storage.local.set({
      isEnabled: state.isEnabled,
      countryCode: state.countryCode,
      countryName: state.countryName,
      languageCode: state.languageCode,
      languageName: state.languageName,
      latitude: state.latitude,
      longitude: state.longitude,
      accuracy: state.accuracy,
      canonicalName: state.canonicalName,
      uule: state.uule,
      autoApply: state.autoApply,
      nonPersonalized: state.nonPersonalized,
      languageRestrict: state.languageRestrict
    });

    renderStatus();

    if (reloadTab) {
      chrome.runtime.sendMessage({ action: 'RELOAD_CURRENT_GOOGLE_TAB' });
    }
    return true;
  }

  // Update Status Card & UI
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

    const codeUpper = (state.countryCode || 'US').toUpperCase();
    countrySearch.value = `${flag} ${state.countryName} (${codeUpper})`;
    langSearch.value = `${state.languageName} (${state.languageCode})`;
    latInput.value = state.latitude !== null ? state.latitude : '';
    lngInput.value = state.longitude !== null ? state.longitude : '';
    if (accInput) accInput.value = state.accuracy || 15;
    canonicalCityInput.value = state.canonicalName || '';
    uuleDisplay.value = state.uule || '';

    autoApplyToggle.checked = state.autoApply !== false;
    pwsToggle.checked = state.nonPersonalized !== false;
    lrToggle.checked = state.languageRestrict === true;
  }

  // Populate City Presets (DAT-02: updates country & language too)
  function initCityPresets() {
    cityPresetSelect.innerHTML = '<option value="">-- Choose a city preset or enter custom below --</option>';
    if (typeof DEFAULT_PRESETS !== 'undefined') {
      DEFAULT_PRESETS.forEach((p) => {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = `${p.name} (${p.canonicalName})`;
        cityPresetSelect.appendChild(opt);
      });
    }
  }

  cityPresetSelect.addEventListener('change', () => {
    const selectedId = cityPresetSelect.value;
    if (!selectedId) return;
    const preset = DEFAULT_PRESETS.find(p => p.id === selectedId);
    if (preset) {
      // DAT-02: Sync country and language from preset
      state.countryCode = preset.countryCode;
      const c = GOOGLE_COUNTRIES.find(item => item.code.toLowerCase() === preset.countryCode.toLowerCase());
      state.countryName = c ? c.name : preset.name;

      state.languageCode = preset.languageCode;
      const l = GOOGLE_LANGUAGES.find(item => item.code.toLowerCase() === preset.languageCode.toLowerCase());
      state.languageName = l ? l.name : 'English';

      latInput.value = preset.latitude;
      lngInput.value = preset.longitude;
      canonicalCityInput.value = preset.canonicalName;
      uuleDisplay.value = encodeUULE(preset.canonicalName);

      renderStatus();
      showToast(`Selected preset: ${preset.name}`);
    }
  });

  // UULE Generator Button
  generateUuleBtn.addEventListener('click', () => {
    const city = canonicalCityInput.value.trim();
    if (!city) {
      showToast('Please enter a location name');
      return;
    }
    const gen = encodeUULE(city);
    uuleDisplay.value = gen;
    state.uule = gen;
    showToast('Canonical UULE generated!');
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
    chrome.runtime.sendMessage({ action: 'RELOAD_CURRENT_GOOGLE_TAB' });
    showToast(state.isEnabled ? 'Location spoofing active' : 'Location spoofing disabled');
  });

  // Keyboard navigation & Dropdown state (POP-02)
  let activeHighlightIndex = -1;

  function handleDropdownKeyboard(e, dropdownEl, selectCallback) {
    const items = dropdownEl.querySelectorAll('.dropdown-item:not(.dropdown-hint)');
    if (!items || items.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeHighlightIndex = (activeHighlightIndex + 1) % items.length;
      updateHighlight(items);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeHighlightIndex = (activeHighlightIndex - 1 + items.length) % items.length;
      updateHighlight(items);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeHighlightIndex >= 0 && activeHighlightIndex < items.length) {
        items[activeHighlightIndex].click();
      }
    } else if (e.key === 'Escape') {
      dropdownEl.classList.remove('show');
      activeHighlightIndex = -1;
    }
  }

  function updateHighlight(items) {
    items.forEach((item, idx) => {
      if (idx === activeHighlightIndex) {
        item.classList.add('selected');
        item.scrollIntoView({ block: 'nearest' });
      } else {
        item.classList.remove('selected');
      }
    });
  }

  // Country Dropdown Filter
  function filterCountries(query) {
    countryDropdown.innerHTML = '';
    activeHighlightIndex = -1;
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

    const maxItems = 40;
    filtered.slice(0, maxItems).forEach((c, idx) => {
      const item = document.createElement('div');
      item.className = 'dropdown-item';
      item.setAttribute('role', 'option');
      if (c.code.toLowerCase() === (state.countryCode || '').toLowerCase()) {
        item.classList.add('selected');
        activeHighlightIndex = idx;
      }
      
      const left = document.createElement('div');
      left.className = 'item-left';
      
      const flag = document.createElement('span');
      flag.className = 'item-flag';
      flag.textContent = c.flag;
      
      const name = document.createElement('span');
      name.className = 'item-name';
      name.textContent = c.name;
      
      left.appendChild(flag);
      left.appendChild(name);
      
      const code = document.createElement('span');
      code.className = 'item-code';
      code.textContent = c.code.toUpperCase();
      
      item.appendChild(left);
      item.appendChild(code);

      item.addEventListener('click', () => {
        state.countryCode = c.code;
        state.countryName = c.name;
        countrySearch.value = `${c.flag} ${c.name} (${c.code.toUpperCase()})`;
        countryDropdown.classList.remove('show');
      });

      countryDropdown.appendChild(item);
    });

    // POP-09: Showing count hint
    if (filtered.length > maxItems) {
      const hint = document.createElement('div');
      hint.className = 'dropdown-item dropdown-hint';
      hint.style.fontSize = '10px';
      hint.style.color = 'var(--text-muted)';
      hint.style.cursor = 'default';
      hint.textContent = `Showing 40 of ${filtered.length} — type more to refine`;
      countryDropdown.appendChild(hint);
    }

    countryDropdown.classList.add('show');
  }

  countrySearch.addEventListener('focus', () => filterCountries(countrySearch.value));
  countrySearch.addEventListener('input', (e) => filterCountries(e.target.value));
  countrySearch.addEventListener('keydown', (e) => handleDropdownKeyboard(e, countryDropdown));

  // Language Dropdown Filter
  function filterLanguages(query) {
    langDropdown.innerHTML = '';
    activeHighlightIndex = -1;
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

    const maxItems = 40;
    filtered.slice(0, maxItems).forEach((l, idx) => {
      const item = document.createElement('div');
      item.className = 'dropdown-item';
      item.setAttribute('role', 'option');
      if (l.code.toLowerCase() === (state.languageCode || '').toLowerCase()) {
        item.classList.add('selected');
        activeHighlightIndex = idx;
      }
      
      const left = document.createElement('div');
      left.className = 'item-left';
      
      const name = document.createElement('span');
      name.className = 'item-name';
      name.textContent = `${l.name} (${l.nativeName})`;
      
      left.appendChild(name);
      
      const code = document.createElement('span');
      code.className = 'item-code';
      code.textContent = l.code;
      
      item.appendChild(left);
      item.appendChild(code);

      item.addEventListener('click', () => {
        state.languageCode = l.code;
        state.languageName = l.name;
        langSearch.value = `${l.name} (${l.code})`;
        langDropdown.classList.remove('show');
      });

      langDropdown.appendChild(item);
    });

    if (filtered.length > maxItems) {
      const hint = document.createElement('div');
      hint.className = 'dropdown-item dropdown-hint';
      hint.style.fontSize = '10px';
      hint.style.color = 'var(--text-muted)';
      hint.style.cursor = 'default';
      hint.textContent = `Showing 40 of ${filtered.length} — type more to refine`;
      langDropdown.appendChild(hint);
    }

    langDropdown.classList.add('show');
  }

  langSearch.addEventListener('focus', () => filterLanguages(langSearch.value));
  langSearch.addEventListener('input', (e) => filterLanguages(e.target.value));
  langSearch.addEventListener('keydown', (e) => handleDropdownKeyboard(e, langDropdown));

  // Close dropdowns on outside click
  document.addEventListener('click', (e) => {
    if (!countrySearch.contains(e.target) && !countryDropdown.contains(e.target)) {
      countryDropdown.classList.remove('show');
    }
    if (!langSearch.contains(e.target) && !langDropdown.contains(e.target)) {
      langDropdown.classList.remove('show');
    }
  });

  // Apply Buttons (POP-01: Consolidated save)
  applyQuickBtn.addEventListener('click', async () => {
    const success = await saveState(true);
    if (success) showToast('Applied location & language!');
  });

  applyGpsBtn.addEventListener('click', async () => {
    const success = await saveState(true);
    if (success) showToast('Coordinates & UULE updated!');
  });

  // Clear GPS Button (SW-02: explicit deletion in reload)
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

  // Header quick reload
  quickReloadBtn.addEventListener('click', async () => {
    quickReloadBtn.classList.add('rotating');
    chrome.runtime.sendMessage({ action: 'RELOAD_CURRENT_GOOGLE_TAB' }, (res) => {
      quickReloadBtn.classList.remove('rotating');
      if (res && res.reloaded) {
        showToast('Google tab refreshed!');
      } else {
        showToast('Active tab is not a Google Search page');
      }
    });
  });

  // Render Favorites with DOM nodes (SEC-01: Immunity to XSS)
  function renderFavorites() {
    favCount.textContent = state.favorites.length;
    favoritesList.innerHTML = '';

    if (state.favorites.length === 0) {
      const emptyDiv = document.createElement('div');
      emptyDiv.style.textAlign = 'center';
      emptyDiv.style.padding = '25px 10px';
      emptyDiv.style.color = 'var(--text-muted)';
      emptyDiv.style.fontSize = '11px';
      emptyDiv.textContent = 'No favorite presets saved yet. Click "Save to Favorites" or "+ Add Current" to bookmark your frequent locations.';
      favoritesList.appendChild(emptyDiv);
      return;
    }

    state.favorites.forEach((fav) => {
      const card = document.createElement('div');
      card.className = 'favorite-card';

      const left = document.createElement('div');
      left.className = 'fav-card-left';

      const flag = document.createElement('span');
      flag.className = 'fav-card-flag';
      flag.textContent = fav.badge || getCountryFlag(fav.countryCode);

      const info = document.createElement('div');
      info.className = 'fav-card-info';

      const nameEl = document.createElement('span');
      nameEl.className = 'fav-card-name';
      nameEl.textContent = fav.name || 'Unnamed Preset';
      nameEl.title = fav.name || '';

      const tags = document.createElement('div');
      tags.className = 'fav-card-tags';

      const tagC = document.createElement('span');
      tagC.className = 'fav-tag';
      tagC.textContent = (fav.countryCode || '').toUpperCase();

      const tagL = document.createElement('span');
      tagL.className = 'fav-tag';
      tagL.textContent = fav.languageCode || 'en';

      const tagG = document.createElement('span');
      tagG.className = 'fav-tag';
      const latNum = Number(fav.latitude);
      const lngNum = Number(fav.longitude);
      tagG.textContent = (!isNaN(latNum) && fav.latitude !== null)
        ? `📍 ${latNum.toFixed(2)}, ${lngNum.toFixed(2)}`
        : '📍 Country';

      tags.appendChild(tagC);
      tags.appendChild(tagL);
      tags.appendChild(tagG);

      info.appendChild(nameEl);
      info.appendChild(tags);
      left.appendChild(flag);
      left.appendChild(info);

      const actions = document.createElement('div');
      actions.className = 'fav-card-actions';

      const applyBtn = document.createElement('button');
      applyBtn.className = 'fav-apply-btn';
      applyBtn.textContent = 'Apply';
      applyBtn.title = 'Apply this favorite preset';

      const delBtn = document.createElement('button');
      delBtn.className = 'fav-del-btn';
      delBtn.title = 'Delete favorite';
      delBtn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>';

      applyBtn.addEventListener('click', async () => {
        state.countryCode = fav.countryCode || 'us';
        state.countryName = fav.countryName || 'United States';
        state.languageCode = fav.languageCode || 'en';
        state.languageName = fav.languageName || 'English';
        state.latitude = (fav.latitude !== null && !isNaN(fav.latitude)) ? fav.latitude : null;
        state.longitude = (fav.longitude !== null && !isNaN(fav.longitude)) ? fav.longitude : null;
        state.canonicalName = fav.canonicalName || '';
        state.uule = fav.uule || (state.canonicalName ? encodeUULE(state.canonicalName) : '');

        await saveState(true);
        showToast(`Applied preset: ${fav.name}`);
      });

      delBtn.addEventListener('click', async () => {
        state.favorites = state.favorites.filter(f => f.id !== fav.id);
        await chrome.storage.local.set({ favorites: state.favorites });
        renderFavorites();
        showToast('Favorite removed');
      });

      actions.appendChild(applyBtn);
      actions.appendChild(delBtn);

      card.appendChild(left);
      card.appendChild(actions);

      favoritesList.appendChild(card);
    });
  }

  // Save new favorite form
  function openNewFavForm() {
    newFavForm.classList.remove('hidden');
    favCustomName.value = `${state.countryName} - ${state.languageName} Preset`;
    favCustomName.focus();
  }

  saveCurrentAsFavBtn.addEventListener('click', () => {
    switchTab('tab-favorites');
    openNewFavForm();
  });

  addNewFavToggleBtn.addEventListener('click', openNewFavForm);
  cancelSaveFavBtn.addEventListener('click', () => newFavForm.classList.add('hidden'));

  confirmSaveFavBtn.addEventListener('click', async () => {
    const name = favCustomName.value.trim();
    if (!name) {
      showToast('Please enter a name for the favorite');
      return;
    }

    const newFav = {
      id: 'fav-' + Date.now(),
      name: name.slice(0, 80),
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

  // Export Favorites (POP-03: Blob URL instead of data: URL)
  exportFavsBtn.addEventListener('click', () => {
    try {
      const jsonStr = JSON.stringify(state.favorites, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'gs-location-changer-favorites.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      showToast('Favorites exported successfully!');
    } catch (e) {
      showToast('Export failed');
    }
  });

  // Schema Validator for Imported Favorites (SEC-01 & POP-04)
  function validateFavoriteItem(item) {
    if (!item || typeof item !== 'object') return null;

    const name = typeof item.name === 'string' ? item.name.slice(0, 80).trim() : '';
    if (!name) return null;

    const countryCode = (typeof item.countryCode === 'string' && /^[a-z]{2}$/i.test(item.countryCode))
      ? item.countryCode.toLowerCase()
      : 'us';

    const countryName = typeof item.countryName === 'string' ? item.countryName.slice(0, 60) : 'United States';
    const languageCode = (typeof item.languageCode === 'string' && /^[a-z0-9\-]{2,10}$/i.test(item.languageCode))
      ? item.languageCode
      : 'en';
    const languageName = typeof item.languageName === 'string' ? item.languageName.slice(0, 60) : 'English';

    let lat = parseFloat(item.latitude);
    let lng = parseFloat(item.longitude);
    if (isNaN(lat) || lat < -90 || lat > 90) lat = null;
    if (isNaN(lng) || lng < -180 || lng > 180) lng = null;

    const canonicalName = typeof item.canonicalName === 'string' ? item.canonicalName.slice(0, 150) : '';
    const uule = canonicalName ? encodeUULE(canonicalName) : (typeof item.uule === 'string' ? item.uule.slice(0, 200) : '');
    const badge = typeof item.badge === 'string' ? item.badge.slice(0, 8) : getCountryFlag(countryCode);

    return {
      id: 'fav-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      name: name,
      countryCode: countryCode,
      countryName: countryName,
      languageCode: languageCode,
      languageName: languageName,
      latitude: lat,
      longitude: lng,
      canonicalName: canonicalName,
      uule: uule,
      badge: badge
    };
  }

  // Import Favorites with Schema Validation
  importFavsInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const raw = JSON.parse(event.target.result);
        if (!Array.isArray(raw)) {
          showToast('Invalid format: root must be a JSON array');
          return;
        }

        const validItems = [];
        raw.forEach(item => {
          const sanitized = validateFavoriteItem(item);
          if (sanitized) validItems.push(sanitized);
        });

        if (validItems.length === 0) {
          showToast('No valid presets found in file');
          return;
        }

        const shouldMerge = confirm(`Import ${validItems.length} favorites?\nClick OK to append/merge, or Cancel to replace existing favorites.`);
        if (shouldMerge) {
          state.favorites = state.favorites.concat(validItems);
        } else {
          state.favorites = validItems;
        }

        await chrome.storage.local.set({ favorites: state.favorites });
        renderFavorites();
        showToast(`Loaded ${validItems.length} favorites!`);
      } catch (err) {
        showToast('Error reading or parsing JSON file');
      } finally {
        importFavsInput.value = '';
      }
    };
    reader.readAsText(file);
  });

  // Reset to Defaults (SW-03: direct write of DEFAULT_CONFIG)
  resetDefaultsBtn.addEventListener('click', async () => {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
      const defaultSetup = {
        isEnabled: true,
        countryCode: 'us',
        countryName: 'United States',
        languageCode: 'en',
        languageName: 'English',
        latitude: 40.7128,
        longitude: -74.0060,
        accuracy: 15,
        canonicalName: 'New York, New York, United States',
        uule: encodeUULE('New York, New York, United States'),
        autoApply: true,
        nonPersonalized: true,
        languageRestrict: false,
        favorites: [
          {
            id: 'fav-1',
            name: 'USA - New York (English)',
            countryCode: 'us',
            countryName: 'United States',
            languageCode: 'en',
            languageName: 'English',
            latitude: 40.7128,
            longitude: -74.0060,
            canonicalName: 'New York, New York, United States',
            uule: encodeUULE('New York, New York, United States'),
            badge: '🇺🇸'
          },
          {
            id: 'fav-2',
            name: 'UK - London (English)',
            countryCode: 'gb',
            countryName: 'United Kingdom',
            languageCode: 'en',
            languageName: 'English',
            latitude: 51.5074,
            longitude: -0.1278,
            canonicalName: 'London, England, United Kingdom',
            uule: encodeUULE('London, England, United Kingdom'),
            badge: '🇬🇧'
          },
          {
            id: 'fav-3',
            name: 'Germany - Berlin (German)',
            countryCode: 'de',
            countryName: 'Germany',
            languageCode: 'de',
            languageName: 'German',
            latitude: 52.5200,
            longitude: 13.4050,
            canonicalName: 'Berlin, Berlin, Germany',
            uule: encodeUULE('Berlin, Berlin, Germany'),
            badge: '🇩🇪'
          },
          {
            id: 'fav-4',
            name: 'UAE - Dubai (Arabic)',
            countryCode: 'ae',
            countryName: 'United Arab Emirates',
            languageCode: 'ar',
            languageName: 'Arabic',
            latitude: 25.2048,
            longitude: 55.2708,
            canonicalName: 'Dubai, Dubai, United Arab Emirates',
            uule: encodeUULE('Dubai, Dubai, United Arab Emirates'),
            badge: '🇦🇪'
          },
          {
            id: 'fav-5',
            name: 'Pakistan - Lahore (English)',
            countryCode: 'pk',
            countryName: 'Pakistan',
            languageCode: 'en',
            languageName: 'English',
            latitude: 31.5204,
            longitude: 74.3587,
            canonicalName: 'Lahore, Punjab, Pakistan',
            uule: encodeUULE('Lahore, Punjab, Pakistan'),
            badge: '🇵🇰'
          }
        ]
      };

      state = Object.assign({}, defaultSetup);
      await chrome.storage.local.set(defaultSetup);
      chrome.runtime.sendMessage({
        action: 'UPDATE_BADGE',
        isEnabled: state.isEnabled,
        countryCode: state.countryCode
      });
      renderStatus();
      renderFavorites();
      showToast('Settings reset to defaults');
    }
  });

  // Quick Search Execution (SW-08: clean response handling)
  function executeQuickSearch() {
    const query = quickSearchInput.value.trim();
    if (!query) return;

    chrome.runtime.sendMessage({
      action: 'QUICK_SEARCH',
      query: query,
      settings: state
    }, (res) => {
      window.close();
    });
  }

  quickSearchSubmitBtn.addEventListener('click', executeQuickSearch);
  quickSearchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') executeQuickSearch();
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

  // Listen to storage changes in popup (POP-07)
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local') {
      chrome.storage.local.get(null, (latest) => {
        if (latest) {
          state = Object.assign({}, state, latest);
          renderStatus();
          renderFavorites();
        }
      });
    }
  });

  // Dynamic counts for countries & languages (DAT-01)
  if (countryCountEl && typeof GOOGLE_COUNTRIES !== 'undefined') {
    countryCountEl.textContent = `${GOOGLE_COUNTRIES.length}`;
  }
  if (langCountEl && typeof GOOGLE_LANGUAGES !== 'undefined') {
    langCountEl.textContent = `${GOOGLE_LANGUAGES.length}`;
  }

  // Initial Boot
  initCityPresets();
  renderStatus();
  renderFavorites();
});
