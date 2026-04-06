import { state } from './state';
import { getConfig } from './storage';
import { navigateTo, setupAddPetButton, setupAboutLink, setupGlobalToggle } from './navigation';

export async function init(): Promise<void> {
  // Show loading state
  const petList = document.getElementById('pet-list');
  if (petList) {
    const loader = document.createElement('div');
    loader.className = 'empty-state';
    loader.id = 'loading-state';
    loader.textContent = 'Loading...';
    petList.appendChild(loader);
  }

  try {
    state.config = await getConfig();
    if (!state.config) {
      state.config = { pets: [], domainRules: {}, version: 1 };
    }

    console.log('[Popup] Config loaded:', state.config);

    // Reset multi-step form
    state.addPetStep = 1;

    // Show home page initially
    navigateTo('home');

    // Wire navigation buttons
    setupAddPetButton();
    setupAboutLink();
    setupGlobalToggle();
  } catch (err) {
    console.error('[Popup] Init error:', err);
    // Show error state
    if (petList) {
      petList.innerHTML = '';
      const errorEl = document.createElement('div');
      errorEl.className = 'empty-state';
      const errorText = document.createElement('div');
      errorText.className = 'empty-state__text';
      errorText.textContent = 'Failed to load settings. Please close and reopen.';
      errorEl.appendChild(errorText);
      petList.appendChild(errorEl);
    }
  }
}
