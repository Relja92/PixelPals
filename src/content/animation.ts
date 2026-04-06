import type { PetConfig, PetState } from './types';
import { PETS_WITH_LIE, PETS_WITHOUT_BALL } from './constants';
import { state } from './state';
import { getInputTargetPosition, getVideoTargetPosition, petSubscribedToEvent } from './helpers';

// Callback to break circular dependency with pet-creation.ts
let reloadCallback: (() => void) | null = null;

/** Register the reloadPets callback (called from main.ts to wire modules together) */
export function setReloadCallback(fn: () => void) {
  reloadCallback = fn;
}

/** Update pet animation based on movement state and events */
export function updatePetAnimation(petConfig: PetConfig, petState: PetState, petElement: HTMLDivElement, now: number) {
  const petType = petState.type || petConfig.type || 'dog';
  const petColor = petState.color || petConfig.color || 'brown';

  // Determine animation based on distance to target AND idle state
  const dx = petState.targetX - petState.x;
  const dy = petState.targetY - petState.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  let newAnimation = 'idle';

  // Handle hover animation sequence
  if (petState.isHovering && petState.hoveredAt !== null) {
    const hoverDuration = now - petState.hoveredAt;
    const petType = petState.type || petConfig.type || 'dog';
    const supportsLie = PETS_WITH_LIE.has(petType);
    const ballAnim = PETS_WITHOUT_BALL.has(petType) ? 'swipe' : 'with_ball';

    if (hoverDuration < 500) {
      newAnimation = 'idle';
    } else if (hoverDuration < 3000) {
      newAnimation = ballAnim;
    } else if (supportsLie) {
      newAnimation = 'lie';
    } else {
      newAnimation = ballAnim;
    }
  } else if (!petState.isHovering && petState.hoveredAt !== null) {
    // Was hovering, now stopped - resume normal behavior
    petState.hoveredAt = null;
    petState.idleUntil = now; // Allow immediate movement
  } else {
    // Normal behavior (not hovering)
    // React to events: make pets move toward inputs and videos (only if subscribed)
    let eventDx = 0, eventDy = 0;

    if (state.currentEventState === 'typing' && state.activeInputElement && petSubscribedToEvent(petConfig, 'typing')) {
    // Pet runs toward the input
    const targetPos = getInputTargetPosition(state.activeInputElement);
    petState.eventTargetX = targetPos.x;
    petState.eventTargetY = targetPos.y;

    eventDx = targetPos.x - petState.x;
    eventDy = targetPos.y - petState.y;
    const eventDistance = Math.sqrt(eventDx * eventDx + eventDy * eventDy);

    if (eventDistance > 10) {
      newAnimation = 'run';
      petState.facingRight = eventDx > 0;
    } else {
      // At input, watch with swipe animation, facing left
      newAnimation = 'swipe';
      petState.facingRight = false; // Face left to watch typing
    }
  } else if (state.currentEventState === 'video_playing' && state.playingVideoElement && petSubscribedToEvent(petConfig, 'video_playing')) {
    // Pet runs to video position
    const targetPos = getVideoTargetPosition(state.playingVideoElement);
    petState.eventTargetX = targetPos.x;
    petState.eventTargetY = targetPos.y;

    eventDx = targetPos.x - petState.x;
    eventDy = targetPos.y - petState.y;
    const eventDistance = Math.sqrt(eventDx * eventDx + eventDy * eventDy);

    if (eventDistance > 10) {
      newAnimation = 'run';
      petState.facingRight = eventDx > 0;
    } else {
      // At video, go idle facing left
      newAnimation = 'idle';
      petState.facingRight = false; // Face left
    }
    } else {
      // Pet is wandering (not reacting to an event)
      // Only show movement animation if pet will actually move (matches movement logic)
      const willMove = now > petState.idleUntil || state.currentEventState !== 'idle';

      if (!willMove) {
        // In idle time and no active events, stay idle
        newAnimation = 'idle';
      } else if (distance > 100) {
        newAnimation = 'run';
      } else if (distance > 20) {
        newAnimation = 'walk';
      } else {
        newAnimation = 'idle';
      }
    }
  }

  // Update animation if changed
  if (newAnimation !== petState.currentAnimation) {
    petState.currentAnimation = newAnimation;
    petState.lastAnimationChange = now;
    const gifPath = chrome.runtime.getURL(`assets/${petType}/${petColor}_${newAnimation}_8fps.gif`);
    if (petState.imgElement) {
      petState.imgElement.src = gifPath;
    }
  }

  // Switch idle animations every 3-5 seconds (but not if actively watching something)
  if (newAnimation === 'idle' && state.currentEventState === 'idle' && now > petState.nextIdleSwitch) {
    const idleAnimations = ['idle', 'swipe'];
    const randomAnimation = idleAnimations[Math.floor(Math.random() * idleAnimations.length)];
    const gifPath = chrome.runtime.getURL(`assets/${petType}/${petColor}_${randomAnimation}_8fps.gif`);
    if (petState.imgElement) {
      petState.imgElement.src = gifPath;
    }
    petState.lastAnimationChange = now;
    petState.nextIdleSwitch = now + 3000 + Math.random() * 2000;
  }

  // Apply facing direction
  petElement.style.transform = petState.facingRight ? 'scaleX(1)' : 'scaleX(-1)';
}

/** Main animation loop using requestAnimationFrame */
export function startAnimation() {
  function animate() {
    if (!state.petsContainer || !state.currentConfig) {
      state.animationFrameId = requestAnimationFrame(animate);
      return;
    }

    // Process pending config reload at frame boundary (avoids race condition)
    if (state.pendingConfigReload && reloadCallback) {
      state.pendingConfigReload = false;
      reloadCallback();
    }

    // Cache timestamp for all pets to avoid multiple Date.now() calls
    state.sharedFrameTimestamp = Date.now();

    // Update each pet
    state.currentConfig.pets.forEach(petConfig => {
      if (!petConfig.enabled) return;

      const petState = state.petStates.get(petConfig.id);
      if (!petState) return;

      const petElement = petState.element;
      if (!petElement) return;

      const now = state.sharedFrameTimestamp;

      // Determine which target to move toward
      let targetX = petState.targetX;
      let targetY = petState.targetY;

      // If there's an event, move toward event target instead
      if (petState.eventTargetX !== undefined && petState.eventTargetY !== undefined) {
        targetX = petState.eventTargetX;
        targetY = petState.eventTargetY;
      }

      // Move toward target
      const dx = targetX - petState.x;
      const dy = targetY - petState.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // If we've reached target, start idle period
      if (distance < 5 && !petState.isHovering) {
        // Check if there's an active event that the pet is NOT subscribed to
        const hasUnsubscribedEvent = (state.currentEventState === 'typing' && !petSubscribedToEvent(petConfig, 'typing')) ||
                                      (state.currentEventState === 'video_playing' && !petSubscribedToEvent(petConfig, 'video_playing'));

        if (now > petState.idleUntil && (state.currentEventState === 'idle' || hasUnsubscribedEvent)) {
          // Idle time has ended and no events OR pet isn't subscribed to active event, pick new target
          petState.targetX = Math.random() * (state.viewportWidth - 100);
          petState.targetY = Math.random() * (state.viewportHeight - 100);

          const idleTime = 1500 + Math.random() * 3000; // 1.5-4.5 seconds
          petState.idleUntil = now + idleTime;
        }
      } else if ((now > petState.idleUntil || state.currentEventState !== 'idle') && !petState.isHovering) {
        // Move toward target if idle time passed or there's an active event (but not while hovering)
        const moveX = (dx / distance) * petState.speed;
        const moveY = (dy / distance) * petState.speed;
        petState.x += moveX;
        petState.y += moveY;

        // Update facing direction based on movement
        if (Math.abs(moveX) > 0.1) {
          petState.facingRight = moveX > 0;
        }
      }

      // Clamp to viewport
      petState.x = Math.max(0, Math.min(petState.x, state.viewportWidth - 100));
      petState.y = Math.max(0, Math.min(petState.y, state.viewportHeight - 100));

      // Update animation based on movement state
      updatePetAnimation(petConfig, petState, petElement, now);

      // Update element position
      petElement.style.left = petState.x + 'px';
      petElement.style.top = petState.y + 'px';
    });

    state.animationFrameId = requestAnimationFrame(animate);
  }

  state.animationFrameId = requestAnimationFrame(animate);
  console.log('[Content Script] Animation started');
}
