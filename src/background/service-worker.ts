(() => {
/**
 * Service Worker for Web Pets Extension
 * Handles state management and message routing
 */

const CONFIG_STORAGE_KEY = 'pets_extension_config';

let currentConfig: any = {
  pets: [],
  domainRules: {},
  version: 1,
};

/**
 * Initialize service worker
 */
async function init() {
  console.log('[Service Worker] Starting up...');

  // Load config on startup
  try {
    const result = await chrome.storage.sync.get(CONFIG_STORAGE_KEY);
    if (result[CONFIG_STORAGE_KEY]) {
      currentConfig = result[CONFIG_STORAGE_KEY];
      console.log('[Service Worker] Config loaded from sync storage:', currentConfig);
    } else {
      // Try local storage as fallback
      const localResult = await chrome.storage.local.get(CONFIG_STORAGE_KEY);
      if (localResult[CONFIG_STORAGE_KEY]) {
        currentConfig = localResult[CONFIG_STORAGE_KEY];
        console.log('[Service Worker] Config loaded from local storage:', currentConfig);
      } else {
        console.log('[Service Worker] No config found, using defaults');
      }
    }
  } catch (error) {
    console.error('[Service Worker] Failed to load config:', error);
  }

  // Handle install event
  chrome.runtime.onInstalled.addListener(() => {
    console.log('[Service Worker] Extension installed');
  });

  // Valid message types
  const VALID_MESSAGE_TYPES = ['GET_CONFIG', 'CONFIG_CHANGED', 'HEARTBEAT'];

  // Valid pet types and colors (whitelist)
  const VALID_PET_TYPES = ['dog', 'fox', 'chicken', 'deno', 'panda', 'horse', 'monkey', 'crab', 'clippy', 'cockatiel', 'mod', 'morph', 'rat', 'rocky', 'rubber-duck', 'skeleton', 'snail', 'snake', 'turtle', 'vampire', 'zappy'];

  const VALID_PET_COLORS: Record<string, string[]> = {
    dog: ['akita', 'black', 'brown', 'red', 'white'],
    fox: ['red', 'white'],
    chicken: ['brown', 'white'],
    deno: ['green'],
    panda: ['black', 'brown'],
    horse: ['black', 'brown', 'magical', 'paint_beige', 'paint_black', 'paint_brown', 'socks_beige', 'socks_black', 'socks_brown', 'warrior', 'white'],
    monkey: ['gray'],
    crab: ['red'],
    clippy: ['black', 'brown', 'green', 'yellow'],
    cockatiel: ['brown', 'gray'],
    mod: ['purple'],
    morph: ['purple'],
    rat: ['brown', 'gray', 'white'],
    rocky: ['gray'],
    'rubber-duck': ['yellow'],
    skeleton: ['blue', 'brown', 'green', 'orange', 'pink', 'purple', 'red', 'warrior', 'white', 'yellow'],
    snail: ['brown'],
    snake: ['green'],
    turtle: ['green', 'orange'],
    vampire: ['converted', 'countess', 'girl'],
    zappy: ['yellow'],
  };

  // Validate config structure before accepting
  function isValidConfig(cfg: any): boolean {
    if (!cfg || typeof cfg !== 'object') return false;
    if (!Array.isArray(cfg.pets)) return false;
    for (const pet of cfg.pets) {
      if (!pet || typeof pet !== 'object') return false;
      if (typeof pet.id !== 'string' || !pet.id) return false;
      if (!VALID_PET_TYPES.includes(pet.type)) return false;
      // Validate color against allowed colors for this pet type
      if (pet.color && typeof pet.color === 'string') {
        const allowedColors = VALID_PET_COLORS[pet.type];
        if (allowedColors && !allowedColors.includes(pet.color)) return false;
      }
      if (pet.name && typeof pet.name === 'string' && pet.name.length > 50) return false;
    }
    return true;
  }

  // Handle messages from content scripts or popup
  chrome.runtime.onMessage.addListener((message: any, sender: any, sendResponse: any) => {
    // Validate sender — only accept messages from this extension
    if (sender.id !== chrome.runtime.id) {
      sendResponse({ error: 'Untrusted sender' });
      return true;
    }

    // Validate message type
    if (!message || !VALID_MESSAGE_TYPES.includes(message.type)) {
      sendResponse({ error: 'Invalid message type' });
      return true;
    }

    console.log('[Service Worker] Message received:', message.type);

    if (message.type === 'GET_CONFIG') {
      // Content script requesting current config
      sendResponse({ config: currentConfig });
    } else if (message.type === 'CONFIG_CHANGED') {
      // Popup or content script notifying of config change
      const newConfig = message.payload;
      if (isValidConfig(newConfig)) {
        currentConfig = newConfig;

        // Save to storage
        chrome.storage.sync.set({ [CONFIG_STORAGE_KEY]: currentConfig }, () => {
          if (chrome.runtime.lastError) {
            console.error('[Service Worker] Failed to save to sync storage:', chrome.runtime.lastError);
            chrome.storage.local.set({ [CONFIG_STORAGE_KEY]: currentConfig });
          } else {
            console.log('[Service Worker] Config saved to sync storage');
            // Also save to local
            chrome.storage.local.set({ [CONFIG_STORAGE_KEY]: currentConfig });
          }
        });

        // Broadcast to all tabs
        broadcastToAllTabs('CONFIG_CHANGED', newConfig);
        sendResponse({ success: true });
      } else {
        sendResponse({ success: false, error: 'Invalid config structure' });
      }
    } else if (message.type === 'HEARTBEAT') {
      // Content script heartbeat check
      sendResponse({ alive: true });
    }

    return true; // Keep channel open for async response
  });

  console.log('[Service Worker] Initialization complete');
}

/**
 * Broadcast a message to all content scripts on all tabs
 */
function broadcastToAllTabs(type: string, payload: any) {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      if (tab.id) {
        chrome.tabs.sendMessage(
          tab.id,
          { type, payload },
          () => {
            // Ignore errors (tab might not have content script loaded)
            if (chrome.runtime.lastError) {
              console.log('[Service Worker] Could not send to tab', tab.id, '- likely no content script');
            }
          }
        );
      }
    });
  });
}

// Start initialization
init();
})();
