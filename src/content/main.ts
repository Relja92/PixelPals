import type { ExtensionConfig } from './types';
import { CONFIG_STORAGE_KEY } from './constants';
import { state } from './state';
import { startAnimation, setReloadCallback } from './animation';
import { reloadPets } from './pet-creation';
import { getConfig, preloadPetGifs, injectContainer, sanitizeConfig } from './helpers';
import { setupEventDetection, cleanup } from './events';

// Wire the reload callback to break circular dependency
setReloadCallback(reloadPets);

console.log('[Content Script] Loaded');

// Initialize
async function init() {
  console.log('[Content Script] Initializing on', window.location.href);

  // Check if already initialized
  if (document.getElementById('pets-container')) {
    console.log('[Content Script] Already initialized, skipping');
    return;
  }

  // Load config
  state.currentConfig = await getConfig() as ExtensionConfig | null;
  if (!state.currentConfig) {
    console.log('[Content Script] No config found');
    return;
  }

  // Check domain rules
  const domain = new URL(window.location.href).hostname;
  const normalized = domain.toLowerCase().replace(/^www\./, '');
  if (state.currentConfig.domainRules && state.currentConfig.domainRules[normalized] && state.currentConfig.domainRules[normalized].blocked === true) {
    console.log('[Content Script] Pets disabled for domain:', domain);
    return;
  }

  // Preload GIFs for configured pets to avoid first-load flicker
  preloadPetGifs(state.currentConfig.pets);

  // Inject container
  injectContainer();

  // Render initial pets
  reloadPets();

  // Listen for config changes from service worker
  chrome.storage.onChanged.addListener((changes, _areaName) => {
    if (changes[CONFIG_STORAGE_KEY]) {
      console.log('[Content Script] Config changed');
      state.currentConfig = sanitizeConfig(changes[CONFIG_STORAGE_KEY].newValue);
      state.pendingConfigReload = true;
    }
  });

  // Handle window resize with debouncing
  let resizeScheduled = false;
  state.resizeHandler = () => {
    if (resizeScheduled) return;
    resizeScheduled = true;

    requestAnimationFrame(() => {
      state.viewportWidth = window.innerWidth;
      state.viewportHeight = window.innerHeight;

      state.petStates.forEach(petState => {
        petState.x = Math.max(0, Math.min(petState.x, state.viewportWidth - 100));
        petState.y = Math.max(0, Math.min(petState.y, state.viewportHeight - 100));
        petState.targetX = Math.max(0, Math.min(petState.targetX, state.viewportWidth - 100));
        petState.targetY = Math.max(0, Math.min(petState.targetY, state.viewportHeight - 100));
      });
      resizeScheduled = false;
    });
  };
  window.addEventListener('resize', state.resizeHandler);

  // Setup event detection
  setupEventDetection();

  console.log('[Content Script] Initialization complete');
}

// Clean up on page unload to prevent memory leaks
window.addEventListener('beforeunload', cleanup);

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
