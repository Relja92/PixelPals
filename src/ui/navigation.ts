import { state } from './state';
import { saveAndBroadcast } from './storage';
import { renderHomePage } from './pages/home';
import { renderAddPetPage } from './pages/add-pet';
import { renderPetSettingsPage } from './pages/settings';
import { renderAboutPage } from './pages/about';

export function navigateTo(page: string, data: { petId?: string } = {}): void {
  // Hide current page
  const currentPageEl = document.getElementById(`page-${state.currentPage}`);
  if (currentPageEl) {
    currentPageEl.classList.remove('page--active');
    currentPageEl.classList.add('page--hidden');
  }

  // Update state
  state.currentPage = page;
  if (data.petId) {
    state.currentPetId = data.petId;
  }

  // Render target page
  const targetPageEl = document.getElementById(`page-${page}`);
  if (!targetPageEl) {
    console.error('[Popup] Page not found:', page);
    return;
  }

  // Render content based on page
  if (page === 'home') {
    renderHomePage();
  } else if (page === 'add-pet') {
    state.addPetStep = 1;
    state.selectedPetType = null;
    state.selectedPetColor = null;
    renderAddPetPage();
  } else if (page === 'pet-settings') {
    renderPetSettingsPage(state.currentPetId);
  } else if (page === 'about') {
    renderAboutPage();
  }

  // Show target page
  targetPageEl.classList.remove('page--hidden');
  targetPageEl.classList.add('page--active');
}

export function goBack(): void {
  navigateTo('home');
}

export async function renderAll(): Promise<void> {
  if (state.currentPage === 'home') {
    renderHomePage();
  } else if (state.currentPage === 'add-pet') {
    renderAddPetPage();
  } else if (state.currentPage === 'pet-settings') {
    renderPetSettingsPage(state.currentPetId);
  }
}

export function setupGlobalToggle(): void {
  const toggle = document.getElementById('global-toggle') as HTMLInputElement | null;
  if (!toggle) return;

  syncGlobalToggle();

  toggle.addEventListener('change', () => {
    const enable = toggle.checked;
    state.config!.pets.forEach((p) => {
      p.enabled = enable;
    });
    saveAndBroadcast();
  });
}

export function syncGlobalToggle(): void {
  const toggle = document.getElementById('global-toggle') as HTMLInputElement | null;
  if (!toggle || !state.config || state.config.pets.length === 0) return;
  const allDisabled = state.config.pets.every((p) => !p.enabled);
  toggle.checked = !allDisabled;
}

export function setupAboutLink(): void {
  const btn = document.getElementById('about-link');
  if (btn) {
    btn.addEventListener('click', () => {
      navigateTo('about');
    });
  }
}

export function setupAddPetButton(): void {
  const btn = document.getElementById('add-pet-btn');
  if (btn) {
    btn.addEventListener('click', (e: MouseEvent) => {
      e.preventDefault();
      navigateTo('add-pet');
    });
  }
}
