import { state } from '../state';
import { PET_EMOJIS, PET_COLORS, LIVE_EVENTS, ALL_EVENTS, EVENT_LABELS } from '../constants';
import { capitalizeWords, getGifUrl } from '../utils';
import { saveAndBroadcast } from '../storage';
import { goBack } from '../navigation';
import type { PetConfig } from '../types';

export function renderAddPetPage(): void {
  const bodyContainer = document.getElementById('add-pet-body');
  if (!bodyContainer) return;

  bodyContainer.innerHTML = '';

  // Update step indicator
  const stepIndicator = document.getElementById('add-pet-step-indicator');
  if (stepIndicator) {
    stepIndicator.textContent = `Step ${state.addPetStep} of 3`;
  }

  // Wire button behavior
  const prevBtn = document.getElementById('add-pet-prev-btn') as HTMLButtonElement | null;
  const nextBtn = document.getElementById('add-pet-next-btn') as HTMLButtonElement | null;
  const backBtn = document.getElementById('back-from-add');

  if (backBtn) {
    backBtn.onclick = () => {
      state.addPetStep = 1;
      goBack();
    };
  }

  if (prevBtn) {
    prevBtn.hidden = state.addPetStep === 1;
    prevBtn.onclick = () => {
      state.addPetStep--;
      renderAddPetPage();
    };
  }

  if (nextBtn) {
    if (state.addPetStep === 1) {
      nextBtn.textContent = 'Next';
      nextBtn.disabled = !state.selectedPetType;
      nextBtn.onclick = () => {
        state.addPetStep++;
        renderAddPetPage();
      };
    } else if (state.addPetStep === 2) {
      nextBtn.textContent = 'Next';
      const colors = state.selectedPetType ? PET_COLORS[state.selectedPetType] || [] : [];
      const colorSelected = colors.length === 1 || state.selectedPetColor;
      nextBtn.disabled = !colorSelected;
      nextBtn.onclick = () => {
        state.addPetStep++;
        renderAddPetPage();
      };
    } else if (state.addPetStep === 3) {
      nextBtn.textContent = 'Create Pet';
      nextBtn.disabled = false;
      nextBtn.onclick = () => confirmAddPet();
    }
  }

  // Render current step
  if (state.addPetStep === 1) {
    renderAddPetStep1(bodyContainer as HTMLDivElement);
  } else if (state.addPetStep === 2) {
    renderAddPetStep2(bodyContainer as HTMLDivElement);
  } else if (state.addPetStep === 3) {
    renderAddPetStep3(bodyContainer as HTMLDivElement);
  }
}

export function renderAddPetStep1(container: HTMLDivElement): void {
  const title = document.createElement('div');
  title.className = 'step-title';
  title.textContent = 'Choose a pet type';
  container.appendChild(title);

  const grid = document.createElement('div');
  grid.className = 'pet-grid';
  grid.setAttribute('role', 'listbox');
  grid.setAttribute('aria-label', 'Available pet types');

  Object.keys(PET_EMOJIS).forEach((type) => {
    const colors = PET_COLORS[type] || [];
    const defaultColor = colors[0] || 'default';
    const gifUrl = getGifUrl(type, defaultColor);

    const card = document.createElement('div');
    card.className = 'pet-preview-card';
    card.setAttribute('role', 'option');
    card.setAttribute('aria-label', capitalizeWords(type));
    card.tabIndex = 0;
    if (state.selectedPetType === type) {
      card.classList.add('selected');
      card.setAttribute('aria-selected', 'true');
    } else {
      card.setAttribute('aria-selected', 'false');
    }

    const gif = document.createElement('div');
    gif.className = 'pet-preview-gif';
    gif.style.backgroundImage = `url('${gifUrl}')`;

    const label = document.createElement('div');
    label.className = 'pet-preview-label';
    label.textContent = capitalizeWords(type);

    card.appendChild(gif);
    card.appendChild(label);

    card.addEventListener('click', () => {
      state.selectedPetType = type;
      state.selectedPetColor = null;
      renderAddPetPage();
    });

    grid.appendChild(card);
  });

  container.appendChild(grid);
}

export function renderAddPetStep2(container: HTMLDivElement): void {
  const title = document.createElement('div');
  title.className = 'step-title';
  title.textContent = 'Choose a color';
  container.appendChild(title);

  const colors = state.selectedPetType ? PET_COLORS[state.selectedPetType] || [] : [];

  // If only one color, auto-select it
  if (colors.length === 1) {
    state.selectedPetColor = colors[0];
  }

  const grid = document.createElement('div');
  grid.className = 'pet-grid color-grid';

  colors.forEach((color) => {
    const gifUrl = getGifUrl(state.selectedPetType!, color);

    const card = document.createElement('div');
    card.className = 'pet-preview-card';
    if (state.selectedPetColor === color) {
      card.classList.add('selected');
    }

    const gif = document.createElement('div');
    gif.className = 'pet-preview-gif';
    gif.style.backgroundImage = `url('${gifUrl}')`;

    const label = document.createElement('div');
    label.className = 'pet-preview-label';
    label.textContent = capitalizeWords(color.replace(/_/g, ' '));

    card.appendChild(gif);
    card.appendChild(label);

    card.addEventListener('click', () => {
      state.selectedPetColor = color;
      renderAddPetPage();
    });

    grid.appendChild(card);
  });

  container.appendChild(grid);
}

export function renderAddPetStep3(container: HTMLDivElement): void {
  const title = document.createElement('div');
  title.className = 'step-title';
  title.textContent = 'Watch for events';
  container.appendChild(title);

  // Review section
  const reviewContainer = document.createElement('div');
  reviewContainer.className = 'review-container';

  const gifUrl = getGifUrl(state.selectedPetType!, state.selectedPetColor!);
  const gif = document.createElement('div');
  gif.className = 'review-gif';
  gif.style.backgroundImage = `url('${gifUrl}')`;

  const info = document.createElement('div');
  info.className = 'review-info';

  const typeItem = document.createElement('div');
  typeItem.className = 'review-info-item';
  const typeStrong = document.createElement('strong');
  typeStrong.textContent = `${capitalizeWords(state.selectedPetType!)} \u00B7 ${capitalizeWords(state.selectedPetColor!.replace(/_/g, ' '))}`;
  typeItem.appendChild(typeStrong);

  const helpText = document.createElement('div');
  helpText.className = 'review-info-label';
  helpText.textContent = 'Select what this pet reacts to';

  info.appendChild(typeItem);
  info.appendChild(helpText);

  reviewContainer.appendChild(gif);
  reviewContainer.appendChild(info);
  container.appendChild(reviewContainer);

  // Events section
  const eventsSection = document.createElement('div');
  eventsSection.className = 'section';

  const eventsList = document.createElement('div');
  eventsList.className = 'events-list';

  ALL_EVENTS.forEach((eventType) => {
    const isLive = LIVE_EVENTS.includes(eventType);

    const item = document.createElement('div');
    item.className = 'event-item';
    if (!isLive) {
      item.classList.add('coming-soon');
    }

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `add-event-${eventType}`;
    checkbox.dataset.eventType = eventType;
    // Pre-check keyboard and video
    checkbox.checked = LIVE_EVENTS.includes(eventType);
    checkbox.disabled = !isLive;

    const label = document.createElement('label');
    label.htmlFor = checkbox.id;
    label.textContent = EVENT_LABELS[eventType];

    if (!isLive) {
      const badge = document.createElement('span');
      badge.className = 'event-badge-coming';
      badge.textContent = 'Coming Soon';
      label.appendChild(badge);
    }

    item.appendChild(checkbox);
    item.appendChild(label);
    eventsList.appendChild(item);
  });

  eventsSection.appendChild(eventsList);
  container.appendChild(eventsSection);
}

export function confirmAddPet(): void {
  if (!state.selectedPetType || !state.selectedPetColor) {
    console.log('[Popup] Pet type or color not selected');
    return;
  }

  // Collect checked events
  const watchedEvents: string[] = [];
  document.querySelectorAll<HTMLInputElement>('input[id^="add-event-"][type="checkbox"]').forEach((checkbox) => {
    if (checkbox.checked) {
      watchedEvents.push(checkbox.dataset.eventType!);
    }
  });

  const newPet: PetConfig = {
    id: `pet_${Date.now()}`,
    type: state.selectedPetType,
    color: state.selectedPetColor,
    enabled: true,
    watches: watchedEvents.length > 0 ? watchedEvents : ['keyboard_typing', 'video_play']
  };

  state.config!.pets.push(newPet);
  console.log('[Popup] Pet added:', newPet);

  // Reset state
  state.addPetStep = 1;
  state.selectedPetType = null;
  state.selectedPetColor = null;

  saveAndBroadcast();
  goBack();
}
