export const CONFIG_STORAGE_KEY = 'pets_extension_config';

export const EVENT_DEBOUNCE = {
  keyboard: 50,
  video: 500
};

/** Pet types that support the lie (rest) animation on hover */
export const PETS_WITH_LIE = new Set(['dog', 'fox', 'panda', 'turtle']);

/** Pet types that don't have a with_ball animation */
export const PETS_WITHOUT_BALL = new Set(['rocky', 'vampire']);
