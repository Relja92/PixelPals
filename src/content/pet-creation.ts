import { state } from './state';
import type { PetConfig } from './types';
import { showPetPhrase } from './speech-bubbles';
import { startAnimation } from './animation';

// Create a pet element with GIF
export function createPetElement(petConfig: PetConfig): HTMLDivElement {
  const petDiv = document.createElement('div');
  petDiv.id = `pet-${petConfig.id}`;
  petDiv.style.position = 'fixed';
  petDiv.style.width = '80px';
  petDiv.style.height = '80px';
  petDiv.style.pointerEvents = 'none';
  petDiv.style.userSelect = 'none';
  petDiv.style.opacity = petConfig.enabled ? '1' : '0.5';
  petDiv.style.transition = 'opacity 0.2s';

  // Create image element for GIF
  const img = document.createElement('img');
  img.style.width = '100%';
  img.style.height = '100%';
  img.style.objectFit = 'contain';
  img.style.imageRendering = 'pixelated';
  img.style.imageRendering = 'crisp-edges';

  // Determine GIF path
  const petType = petConfig.type || 'dog';
  const petColor = petConfig.color || 'brown';
  const gifPath = chrome.runtime.getURL(`assets/${petType}/${petColor}_idle_8fps.gif`);
  console.log('[Content Script] Loading pet GIF:', gifPath, 'for', petType, petColor);

  img.onerror = () => {
    // Fallback to emoji if GIF not found - clear the image and show emoji
    console.error('[Content Script] Failed to load GIF:', gifPath, '- showing emoji fallback');
    petDiv.innerHTML = '';
    petDiv.style.backgroundColor = petColor;
    petDiv.style.borderRadius = '50%';
    petDiv.style.display = 'flex';
    petDiv.style.alignItems = 'center';
    petDiv.style.justifyContent = 'center';
    petDiv.style.fontSize = '32px';
    const emojiMap = {
      'dog': '🐕',
      'chicken': '🐔',
      'panda': '🐼',
      'fox': '🦊',
      'horse': '🐴',
      'monkey': '🐵',
      'deno': '🦕',
      'crab': '🦀',
      'clippy': '📎',
      'cockatiel': '🦜',
      'mod': '👾',
      'morph': '👻',
      'rat': '🐀',
      'rocky': '🪨',
      'rubber-duck': '🦆',
      'skeleton': '💀',
      'snail': '🐌',
      'snake': '🐍',
      'turtle': '🐢',
      'vampire': '🧛',
      'zappy': '⚡'
    };
    petDiv.textContent = emojiMap[petType as keyof typeof emojiMap] || '🐶';
  };
  img.src = gifPath;
  petDiv.appendChild(img);

  // Add invisible hover overlay to capture mouse events
  const hoverOverlay = document.createElement('div');
  hoverOverlay.style.position = 'absolute';
  hoverOverlay.style.width = '100%';
  hoverOverlay.style.height = '100%';
  hoverOverlay.style.top = '0';
  hoverOverlay.style.left = '0';
  hoverOverlay.style.pointerEvents = 'auto';
  hoverOverlay.style.cursor = 'pointer';
  hoverOverlay.style.zIndex = '10000';

  hoverOverlay.addEventListener('mouseenter', () => {
    const petState = state.petStates.get(petConfig.id);
    if (petState) {
      petState.isHovering = true;
      petState.hoveredAt = Date.now();
    }
  });

  hoverOverlay.addEventListener('mouseleave', () => {
    const petState = state.petStates.get(petConfig.id);
    if (petState) {
      petState.isHovering = false;
    }
  });

  hoverOverlay.addEventListener('click', (e) => {
    e.stopPropagation();
    const petState = state.petStates.get(petConfig.id);
    showPetPhrase(petDiv, petConfig, petState);
  });

  petDiv.appendChild(hoverOverlay);

  // Initialize pet state if not exists
  if (!state.petStates.has(petConfig.id)) {
    // Convert speed from 1-5 scale to movement speed (0.5-2.5)
    const petSpeed = (petConfig.speed || 3) * 0.5;

    const now = Date.now();
    state.petStates.set(petConfig.id, {
      x: Math.random() * (state.viewportWidth - 100),
      y: Math.random() * (state.viewportHeight - 100),
      targetX: Math.random() * (state.viewportWidth - 100),
      targetY: Math.random() * (state.viewportHeight - 100),
      eventTargetX: undefined,
      eventTargetY: undefined,
      speed: petSpeed,
      facingRight: Math.random() > 0.5,
      currentAnimation: 'idle',
      lastAnimationChange: now,
      idleUntil: now, // Time when pet can move again
      type: petType,
      color: petColor,
      isHovering: false,
      hoveredAt: null,
      element: petDiv,
      imgElement: img,
      nextIdleSwitch: now + 3000 + Math.random() * 2000
    });
  }

  petDiv.dataset.currentAnimation = 'idle';
  return petDiv;
}

// Reload pets based on config
export function reloadPets() {
  if (!state.currentConfig || !state.petsContainer) {
    return;
  }

  const enabledPetIds = new Set(state.currentConfig.pets.filter(p => p.enabled).map(p => p.id));
  const existingPets = state.petsContainer.querySelectorAll('[id^="pet-"]');

  // Remove pets that are no longer enabled
  existingPets.forEach(petEl => {
    const petId = petEl.id.replace('pet-', '');
    if (!enabledPetIds.has(petId)) {
      petEl.remove();
      state.petStates.delete(petId);
      // Also clean up any bubbles for this pet
      const bubble = state.activeBubbles.get(petId);
      if (bubble) {
        bubble.updateInterval && clearInterval(bubble.updateInterval);
        bubble.container && bubble.container.remove();
        state.activeBubbles.delete(petId);
      }
    }
  });

  // Add new pets or update existing ones
  state.currentConfig.pets.forEach((petConfig) => {
    const petState = state.petStates.get(petConfig.id);
    const petEl = petState?.element;

    if (!petEl && petConfig.enabled) {
      // Pet doesn't exist, create it
      const petElement = createPetElement(petConfig);
      state.petsContainer!.appendChild(petElement);
    } else if (petEl && petConfig.enabled) {
      // Pet exists, update speed and color in state
      if (petState) {
        petState.speed = (petConfig.speed || 3) * 0.5;

        // If color changed, update the current animation GIF
        const newColor = petConfig.color || 'brown';
        if (petState.color !== newColor) {
          petState.color = newColor;
          const petType = petState.type || 'dog';
          const gifPath = chrome.runtime.getURL(`assets/${petType}/${newColor}_${petState.currentAnimation}_8fps.gif`);
          if (petState.imgElement) {
            petState.imgElement.src = gifPath;
          }
        }
      }
    }
  });

  console.log('[Content Script] Loaded', enabledPetIds.size, 'pets');

  // Start animation loop if not already running
  if (!state.animationFrameId) {
    startAnimation();
  }
}
