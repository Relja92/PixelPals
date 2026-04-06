import { state } from './state';
import type { PetConfig, ExtensionConfig } from './types';
import { CONFIG_STORAGE_KEY, PETS_WITHOUT_BALL } from './constants';

const VALID_PET_TYPES = ['dog', 'fox', 'chicken', 'deno', 'panda', 'horse', 'monkey', 'crab', 'clippy', 'cockatiel', 'mod', 'morph', 'rat', 'rocky', 'rubber-duck', 'skeleton', 'snail', 'snake', 'turtle', 'vampire', 'zappy'];

/** Sanitize config loaded from storage — filter out invalid pets */
export function sanitizeConfig(cfg: any): ExtensionConfig {
  const defaults: ExtensionConfig = { pets: [], domainRules: {}, version: 1 };
  if (!cfg || typeof cfg !== 'object') return defaults;
  if (!Array.isArray(cfg.pets)) return { ...defaults, ...cfg, pets: [] };

  const validPets = cfg.pets.filter((pet: any) => {
    if (!pet || typeof pet !== 'object') return false;
    if (typeof pet.id !== 'string' || !pet.id) return false;
    if (!VALID_PET_TYPES.includes(pet.type)) return false;
    // Sanitize name
    if (pet.name && typeof pet.name === 'string') {
      pet.name = pet.name.replace(/[<>"'&]/g, '').substring(0, 50);
    }
    return true;
  });

  return { pets: validPets, domainRules: cfg.domainRules || {}, version: cfg.version || 1 };
}

// Performance optimization: cache video queries
export function getPlayingVideos(): HTMLVideoElement[] {
  const now = Date.now();
  // Only query DOM every 500ms to avoid expensive video detection every frame
  if (now - state.lastVideoCacheTime > 500) {
    state.lastVideoCacheTime = now;
    // Cache the query result
    const videos = document.querySelectorAll('video');
    state.cachedPlayingVideos = [];
    videos.forEach(video => {
      if (!video.paused && !video.ended && video.style.display !== 'none') {
        state.cachedPlayingVideos.push(video);
      }
    });
  }
  return state.cachedPlayingVideos;
}

// Get config from storage with fallback, validates on load
export async function getConfig(): Promise<ExtensionConfig> {
  return new Promise((resolve) => {
    chrome.storage.sync.get(CONFIG_STORAGE_KEY, (result) => {
      if (result[CONFIG_STORAGE_KEY]) {
        resolve(sanitizeConfig(result[CONFIG_STORAGE_KEY]));
      } else {
        chrome.storage.local.get(CONFIG_STORAGE_KEY, (localResult) => {
          resolve(sanitizeConfig(localResult[CONFIG_STORAGE_KEY]));
        });
      }
    });
  });
}

// Preload GIF images for all configured pets to avoid flicker on first render
export function preloadPetGifs(pets: PetConfig[]) {
  pets.forEach(pet => {
    if (!pet.enabled) return;
    const color = pet.color || 'brown';
    const actions = ['idle', 'walk', 'run', 'swipe'];
    if (!PETS_WITHOUT_BALL.has(pet.type)) actions.push('with_ball');
    actions.forEach(action => {
      const img = new Image();
      img.src = chrome.runtime.getURL(`assets/${pet.type}/${color}_${action}_8fps.gif`);
    });
  });
}

// Inject container into page
export function injectContainer() {
  const container = document.createElement('div');
  container.id = 'pets-container';
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.left = '0';
  container.style.width = '100%';
  container.style.height = '100%';
  container.style.pointerEvents = 'none';
  container.style.zIndex = '2147483647';
  container.style.overflow = 'hidden';
  document.documentElement.appendChild(container);
  state.petsContainer = container;
  console.log('[Content Script] Container injected');
}

// Get position next to an input element
export function getInputTargetPosition(inputElement: HTMLElement) {
  const rect = inputElement.getBoundingClientRect();
  // Position to the right of the input
  const x = Math.min(rect.right + 20, state.viewportWidth - 100);
  const y = Math.max(rect.top, 0);
  return { x, y };
}

// Get position at bottom-right of video
export function getVideoTargetPosition(videoElement: HTMLVideoElement) {
  const rect = videoElement.getBoundingClientRect();
  // Position just below and to the right of video
  const x = Math.min(rect.right - 100, state.viewportWidth - 100);
  const y = Math.min(rect.bottom + 10, state.viewportHeight - 100);
  return { x, y };
}

// Update event state based on user activity
export function updateEventState(eventType: string) {
  const now = Date.now();

  if (eventType === 'keyboard') {
    const activeElement = document.activeElement as HTMLInputElement | null;
    if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
      // Skip password fields and other sensitive inputs
      const inputType = (activeElement.type || '').toLowerCase();
      if (inputType === 'password' || activeElement.autocomplete === 'cc-number' || activeElement.autocomplete === 'cc-csc') {
        return;
      }
      if (state.currentEventState !== 'typing') {
        state.currentEventState = 'typing';
        state.activeInputElement = activeElement;
        state.lastEventTime = now;
        console.log('[Content Script] Pet running to typing input');
      }
    }
  } else if (eventType === 'video') {
    if (state.currentEventState !== 'video_playing') {
      state.currentEventState = 'video_playing';
      state.lastEventTime = now;
      console.log('[Content Script] Pet running to video');
    }
  }
}

// Check if pet is subscribed to an event
export function petSubscribedToEvent(petConfig: PetConfig, eventType: string): boolean {
  if (!petConfig.watches) return false;

  const eventMap: Record<string, string> = {
    'typing': 'keyboard_typing',
    'video_playing': 'video_play',
    'scrolling': 'scroll'
  };

  return petConfig.watches.includes(eventMap[eventType]);
}
