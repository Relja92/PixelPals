import { state } from '../state';
import { capitalizeWords, getGifUrl } from '../utils';
import { saveAndBroadcast } from '../storage';
import { navigateTo, syncGlobalToggle } from '../navigation';
import type { PetConfig } from '../types';

export function renderHomePage(): void {
  renderPetList();
  syncGlobalToggle();
}

export function renderPetList(): void {
  const container = document.getElementById('pet-list');
  if (!container) return;

  container.innerHTML = '';

  if (!state.config || state.config.pets.length === 0) {
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';
    emptyState.innerHTML = `
      <div class="empty-state__emoji">\u{1F43E}</div>
      <div class="empty-state__text">No pets yet. Add one below!</div>
    `;
    container.appendChild(emptyState);
    return;
  }

  state.config.pets.forEach((pet) => {
    const card = buildPetCard(pet);
    container.appendChild(card);
  });
}

export function buildPetCard(pet: PetConfig): HTMLDivElement {
  const card = document.createElement('div');
  card.className = 'pet-card';

  const colorText = pet.color ? capitalizeWords(pet.color.replace(/_/g, ' ')) : '';
  const gifUrl = getGifUrl(pet.type, pet.color || 'default');

  // GIF and info section
  const infoDiv = document.createElement('div');
  infoDiv.className = 'pet-card__info';

  const gifDiv = document.createElement('div');
  gifDiv.className = 'pet-card__gif';
  gifDiv.style.backgroundImage = `url('${gifUrl}')`;

  const textDiv = document.createElement('div');
  const petName = pet.name || capitalizeWords(pet.type);
  const nameDiv = document.createElement('div');
  nameDiv.className = 'pet-card__name';
  nameDiv.textContent = petName;
  textDiv.appendChild(nameDiv);
  if (colorText) {
    const colorDiv = document.createElement('div');
    colorDiv.className = 'pet-card__color';
    colorDiv.textContent = colorText;
    textDiv.appendChild(colorDiv);
  }

  infoDiv.appendChild(gifDiv);
  infoDiv.appendChild(textDiv);

  // Toggle
  const toggleLabel = document.createElement('label');
  toggleLabel.className = 'toggle pet-card__toggle';
  const toggleCheckbox = document.createElement('input');
  toggleCheckbox.type = 'checkbox';
  toggleCheckbox.className = 'toggle__input';
  toggleCheckbox.checked = pet.enabled;
  toggleCheckbox.addEventListener('change', (e: Event) => {
    e.stopPropagation(); // Don't navigate when toggling
    const p = state.config!.pets.find((x) => x.id === pet.id);
    if (p) {
      p.enabled = (e.target as HTMLInputElement).checked;
      saveAndBroadcast();
    }
  });

  const toggleTrack = document.createElement('span');
  toggleTrack.className = 'toggle__track';

  toggleLabel.appendChild(toggleCheckbox);
  toggleLabel.appendChild(toggleTrack);

  // Header
  const header = document.createElement('div');
  header.className = 'pet-card__header';
  header.appendChild(infoDiv);
  header.appendChild(toggleLabel);

  // Build card
  card.appendChild(header);

  // Click to navigate to settings
  card.addEventListener('click', (e: MouseEvent) => {
    if ((e.target as HTMLElement).closest('.pet-card__toggle')) {
      return; // Don't navigate on toggle click
    }
    navigateTo('pet-settings', { petId: pet.id });
  });

  return card;
}
