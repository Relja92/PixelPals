import { state } from '../state';
import { PET_COLORS, LIVE_EVENTS, ALL_EVENTS, EVENT_LABELS, PETS_WITHOUT_BALL } from '../constants';
import { capitalizeWords, getGifUrl } from '../utils';
import { saveAndBroadcast } from '../storage';
import { goBack } from '../navigation';

export function renderPetSettingsPage(petId: string | null): void {
  if (!petId || !state.config) {
    goBack();
    return;
  }

  const pet = state.config.pets.find((p) => p.id === petId);
  if (!pet) {
    console.error('[Popup] Pet not found:', petId);
    goBack();
    return;
  }

  // Keep back button as arrow (no changes needed)
  const backBtn = document.getElementById('back-from-settings');

  // Show pet GIF in title area (with_ball if available, otherwise idle)
  const titleEl = document.getElementById('settings-title');
  if (titleEl) {
    const titleAction = PETS_WITHOUT_BALL.includes(pet.type) ? 'idle' : 'with_ball';
    const gifUrl = getGifUrl(pet.type, pet.color, titleAction);
    const colorText = pet.color ? capitalizeWords(pet.color.replace(/_/g, ' ')) : '';

    titleEl.innerHTML = '';

    // Pet GIF
    const gif = document.createElement('div');
    gif.style.width = '32px';
    gif.style.height = '32px';
    gif.style.backgroundImage = `url('${gifUrl}')`;
    gif.style.backgroundSize = 'contain';
    gif.style.backgroundRepeat = 'no-repeat';
    gif.style.backgroundPosition = 'center';
    gif.style.imageRendering = 'pixelated';

    // Text
    const text = document.createElement('span');
    const petName = pet.name || capitalizeWords(pet.type);
    text.textContent = `${petName}${colorText ? ' (' + colorText + ')' : ''}`;

    titleEl.appendChild(gif);
    titleEl.appendChild(text);
  }

  const bodyContainer = document.getElementById('pet-settings-body');
  if (!bodyContainer) return;

  bodyContainer.innerHTML = '';

  // Pet Name
  const nameSection = document.createElement('div');
  nameSection.className = 'section';
  const nameLabel = document.createElement('p');
  nameLabel.className = 'section__label';
  nameLabel.textContent = 'Name';
  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.className = 'settings-text-input';
  nameInput.value = pet.name || capitalizeWords(pet.type);
  nameInput.addEventListener('change', (e: Event) => {
    // Sanitize: strip HTML characters, limit length
    const target = e.target as HTMLInputElement;
    const raw = (target.value || '').replace(/[<>"'&]/g, '').substring(0, 50);
    pet.name = raw || capitalizeWords(pet.type);
    target.value = pet.name; // Reflect sanitized value back
    saveAndBroadcast();
  });
  nameSection.appendChild(nameLabel);
  nameSection.appendChild(nameInput);
  bodyContainer.appendChild(nameSection);

  // Enabled toggle with pet preview
  const enabledSection = document.createElement('div');
  enabledSection.className = 'section';
  const settingRow = document.createElement('div');
  settingRow.className = 'setting-row';

  // Pet preview GIF
  const gifUrl = getGifUrl(pet.type, pet.color);
  const petPreview = document.createElement('div');
  petPreview.style.width = '48px';
  petPreview.style.height = '48px';
  petPreview.style.backgroundImage = `url('${gifUrl}')`;
  petPreview.style.backgroundSize = 'contain';
  petPreview.style.backgroundRepeat = 'no-repeat';
  petPreview.style.backgroundPosition = 'center';
  petPreview.style.imageRendering = 'pixelated';
  petPreview.style.flexShrink = '0';

  const label = document.createElement('span');
  label.className = 'setting-row__label';
  label.textContent = 'Enabled';

  const toggleLabel = document.createElement('label');
  toggleLabel.className = 'toggle';
  const toggleCheckbox = document.createElement('input');
  toggleCheckbox.type = 'checkbox';
  toggleCheckbox.className = 'toggle__input';
  toggleCheckbox.checked = pet.enabled;
  toggleCheckbox.addEventListener('change', (e: Event) => {
    pet.enabled = (e.target as HTMLInputElement).checked;
    saveAndBroadcast();
  });

  const toggleTrack = document.createElement('span');
  toggleTrack.className = 'toggle__track';

  toggleLabel.appendChild(toggleCheckbox);
  toggleLabel.appendChild(toggleTrack);

  // Left side: label + pet preview
  const leftSide = document.createElement('div');
  leftSide.style.display = 'flex';
  leftSide.style.alignItems = 'center';
  leftSide.style.gap = '12px';
  leftSide.appendChild(petPreview);
  leftSide.appendChild(label);

  settingRow.appendChild(leftSide);
  settingRow.appendChild(toggleLabel);
  enabledSection.appendChild(settingRow);
  bodyContainer.appendChild(enabledSection);

  // Color picker (if >1 color)
  const colors = PET_COLORS[pet.type] || [];
  if (colors.length > 1) {
    const colorSection = document.createElement('div');
    colorSection.className = 'section';
    const colorLabel = document.createElement('p');
    colorLabel.className = 'section__label';
    colorLabel.textContent = 'Color';
    colorSection.appendChild(colorLabel);

    const colorPicker = document.createElement('div');
    colorPicker.className = 'color-picker';

    colorPicker.setAttribute('role', 'radiogroup');
    colorPicker.setAttribute('aria-label', 'Pet color');

    colors.forEach((color) => {
      const btn = document.createElement('button');
      btn.className = 'color-btn';
      btn.type = 'button';
      btn.textContent = capitalizeWords(color.replace(/_/g, ' '));
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-label', `Color: ${capitalizeWords(color.replace(/_/g, ' '))}`);

      if (pet.color === color) {
        btn.classList.add('selected');
        btn.setAttribute('aria-checked', 'true');
      } else {
        btn.setAttribute('aria-checked', 'false');
      }

      btn.addEventListener('click', (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        pet.color = color;
        saveAndBroadcast();
      });

      colorPicker.appendChild(btn);
    });

    colorSection.appendChild(colorPicker);
    bodyContainer.appendChild(colorSection);
  }

  // Speed Control
  const speedSection = document.createElement('div');
  speedSection.className = 'section';
  const speedLabel = document.createElement('p');
  speedLabel.className = 'section__label';
  speedLabel.textContent = 'Speed';
  speedSection.appendChild(speedLabel);

  const speedRow = document.createElement('div');
  speedRow.style.display = 'flex';
  speedRow.style.alignItems = 'center';
  speedRow.style.gap = '8px';

  const speedSlider = document.createElement('input');
  speedSlider.type = 'range';
  speedSlider.className = 'settings-slider';
  speedSlider.min = '1';
  speedSlider.max = '15';
  speedSlider.value = String(pet.speed || 3);
  speedSlider.setAttribute('aria-label', 'Pet speed');
  speedSlider.setAttribute('aria-valuemin', '1');
  speedSlider.setAttribute('aria-valuemax', '15');
  speedSlider.setAttribute('aria-valuenow', String(pet.speed || 3));
  speedSlider.setAttribute('aria-valuetext', `${pet.speed || 3}x speed`);

  const speedValueLabel = document.createElement('span');
  speedValueLabel.className = 'settings-slider-label';
  speedValueLabel.textContent = `${pet.speed || 3}x`;

  speedSlider.addEventListener('input', (e: Event) => {
    const target = e.target as HTMLInputElement;
    speedValueLabel.textContent = `${target.value}x`;
    speedSlider.setAttribute('aria-valuenow', target.value);
    speedSlider.setAttribute('aria-valuetext', `${target.value}x speed`);
    pet.speed = parseInt(target.value);
    saveAndBroadcast();
  });

  speedRow.appendChild(speedSlider);
  speedRow.appendChild(speedValueLabel);
  speedSection.appendChild(speedRow);
  bodyContainer.appendChild(speedSection);

  // Events section
  const eventsSection = document.createElement('div');
  eventsSection.className = 'section';
  const eventsLabel = document.createElement('p');
  eventsLabel.className = 'section__label';
  eventsLabel.textContent = 'Watch for';
  eventsSection.appendChild(eventsLabel);

  const eventsList = document.createElement('div');
  eventsList.className = 'events-list';

  ALL_EVENTS.forEach((eventType) => {
    const isWatching = pet.watches.includes(eventType);
    const isLive = LIVE_EVENTS.includes(eventType);

    const item = document.createElement('div');
    item.className = 'event-item';
    if (!isLive) {
      item.classList.add('coming-soon');
    }

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `settings-event-${pet.id}-${eventType}`;
    checkbox.checked = isWatching;
    checkbox.dataset.eventType = eventType;
    checkbox.disabled = !isLive;

    if (isLive) {
      checkbox.addEventListener('change', (e: Event) => {
        if ((e.target as HTMLInputElement).checked) {
          if (!pet.watches.includes(eventType)) {
            pet.watches.push(eventType);
          }
        } else {
          pet.watches = pet.watches.filter((x) => x !== eventType);
        }
        saveAndBroadcast();
      });
    }

    const eventLabel = document.createElement('label');
    eventLabel.htmlFor = checkbox.id;
    eventLabel.textContent = EVENT_LABELS[eventType];

    if (!isLive) {
      const badge = document.createElement('span');
      badge.className = 'event-badge-coming';
      badge.textContent = 'Coming Soon';
      eventLabel.appendChild(badge);
    }

    item.appendChild(checkbox);
    item.appendChild(eventLabel);
    eventsList.appendChild(item);
  });

  eventsSection.appendChild(eventsList);
  bodyContainer.appendChild(eventsSection);

  // Wire buttons
  const removeBtn = document.getElementById('remove-pet-btn');
  if (removeBtn) {
    removeBtn.addEventListener('click', () => {
      state.config!.pets = state.config!.pets.filter((p) => p.id !== petId);
      saveAndBroadcast();
      goBack();
    });
  }

  // Wire back button (already declared at top, just add listener)
  if (backBtn) {
    backBtn.addEventListener('click', () => goBack());
  }
}
