import type { PetConfig, PetState } from './types';
import { state } from './state';
import { PET_PHRASES } from './phrases';

/** Display a random phrase from the pet in a speech bubble */
export function showPetPhrase(petElement: HTMLDivElement, petConfig: PetConfig, petState: PetState | undefined) {
  // Remove previous bubble for this pet if it exists
  const existingBubble = state.activeBubbles.get(petConfig.id);
  if (existingBubble) {
    existingBubble.updateInterval && clearInterval(existingBubble.updateInterval);
    existingBubble.container && existingBubble.container.remove();
  }

  const petType = petConfig.type || 'dog';
  const phrases = PET_PHRASES[petType] || PET_PHRASES['dog'];
  const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];

  // Create speech bubble container (positioned relative to pet)
  const bubbleContainer = document.createElement('div');
  bubbleContainer.style.position = 'absolute';
  bubbleContainer.style.top = '-35px';
  bubbleContainer.style.left = '50%';
  bubbleContainer.style.transform = 'translateX(-50%)';
  bubbleContainer.style.pointerEvents = 'none';
  bubbleContainer.style.zIndex = '9998';

  // Create speech bubble
  const speechBubble = document.createElement('div');
  speechBubble.style.backgroundColor = 'rgba(255, 255, 255, 0.75)';
  speechBubble.style.border = '1px solid rgba(0, 0, 0, 0.1)';
  speechBubble.style.borderRadius = '16px';
  speechBubble.style.padding = '8px 12px';
  speechBubble.style.fontSize = '12px';
  speechBubble.style.fontWeight = '500';
  speechBubble.style.color = '#333';
  speechBubble.style.minWidth = '80px';
  speechBubble.style.maxWidth = '150px';
  speechBubble.style.whiteSpace = 'nowrap';
  speechBubble.style.overflow = 'hidden';
  speechBubble.style.textOverflow = 'ellipsis';
  speechBubble.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.08)';
  speechBubble.style.opacity = '1';
  speechBubble.style.transition = 'opacity 0.3s ease-out';
  speechBubble.style.position = 'relative';
  speechBubble.textContent = randomPhrase;

  // Update transform based on pet's facing direction
  const updateBubbleTransform = () => {
    if (petState && !petState.facingRight) {
      speechBubble.style.transform = 'scaleX(-1)'; // Pet is facing left, flip bubble to counter it
    } else {
      speechBubble.style.transform = ''; // Pet is facing right, no flip needed
    }
  };

  // Set initial transform
  updateBubbleTransform();

  // Update transform dynamically as pet changes direction
  const updateInterval = setInterval(() => {
    if (!bubbleContainer.parentElement) {
      // Bubble was removed, stop updating
      clearInterval(updateInterval);
      return;
    }
    updateBubbleTransform();
  }, 50);

  // Add arrow tail pointing down
  const arrow = document.createElement('div');
  arrow.style.position = 'absolute';
  arrow.style.bottom = '-8px';
  arrow.style.left = '50%';
  arrow.style.transform = 'translateX(-50%)';
  arrow.style.width = '0';
  arrow.style.height = '0';
  arrow.style.borderLeft = '8px solid transparent';
  arrow.style.borderRight = '8px solid transparent';
  arrow.style.borderTop = '8px solid rgba(255, 255, 255, 0.75)';
  speechBubble.appendChild(arrow);

  bubbleContainer.appendChild(speechBubble);
  petElement.appendChild(bubbleContainer);

  // Store bubble reference for this pet
  const bubbleData = { container: bubbleContainer, updateInterval: updateInterval };
  state.activeBubbles.set(petConfig.id, bubbleData);

  // Fade out and remove after 2.5 seconds
  setTimeout(() => {
    speechBubble.style.opacity = '0';
    clearInterval(updateInterval);
    setTimeout(() => {
      bubbleContainer.remove();
      // Remove from active bubbles if it's still this one
      if (state.activeBubbles.get(petConfig.id) === bubbleData) {
        state.activeBubbles.delete(petConfig.id);
      }
    }, 300);
  }, 2500);
}
