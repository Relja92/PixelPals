import type { ExtensionConfig } from './types';
import { CONFIG_STORAGE_KEY, PET_COLORS } from './constants';
import { state } from './state';
import { renderAll } from './navigation';

const VALID_PET_TYPES = Object.keys(PET_COLORS);

/** Sanitize config loaded from storage — filter out invalid pets */
function sanitizeConfig(cfg: any): ExtensionConfig {
  const defaults: ExtensionConfig = { pets: [], domainRules: {}, version: 1 };
  if (!cfg || typeof cfg !== 'object') return defaults;
  if (!Array.isArray(cfg.pets)) return { ...defaults, ...cfg, pets: [] };

  const validPets = cfg.pets.filter((pet: any) => {
    if (!pet || typeof pet !== 'object') return false;
    if (typeof pet.id !== 'string' || !pet.id) return false;
    if (!VALID_PET_TYPES.includes(pet.type)) return false;
    // Validate color against allowed colors for this type
    if (pet.color && typeof pet.color === 'string') {
      const allowed = PET_COLORS[pet.type];
      if (allowed && !allowed.includes(pet.color)) return false;
    }
    // Sanitize name
    if (pet.name && typeof pet.name === 'string') {
      pet.name = pet.name.replace(/[<>"'&]/g, '').substring(0, 50);
    }
    return true;
  });

  return { pets: validPets, domainRules: cfg.domainRules || {}, version: cfg.version || 1 };
}

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

export async function saveConfig(newConfig: ExtensionConfig): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ [CONFIG_STORAGE_KEY]: newConfig }, () => {
      chrome.storage.local.set({ [CONFIG_STORAGE_KEY]: newConfig }, () => {
        resolve();
      });
    });
  });
}

export async function saveAndBroadcast(): Promise<void> {
  try {
    await saveConfig(state.config!);
    console.log('[Popup] Config saved');

    chrome.runtime.sendMessage({ type: 'CONFIG_CHANGED', payload: state.config }, (_response) => {
      if (chrome.runtime.lastError) {
        console.warn('[Popup] Service worker message failed:', chrome.runtime.lastError);
      }
    });

    renderAll();
  } catch (err) {
    console.error('[Popup] Save error:', err);
  }
}
