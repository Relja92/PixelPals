export const CONFIG_STORAGE_KEY = 'pets_extension_config';

export const PET_EMOJIS: Record<string, string> = {
  dog: '\u{1F415}',
  fox: '\u{1F98A}',
  chicken: '\u{1F414}',
  deno: '\u{1F995}',
  panda: '\u{1F43C}',
  horse: '\u{1F434}',
  monkey: '\u{1F412}',
  crab: '\u{1F980}',
  clippy: '\u{1F4CE}',
  cockatiel: '\u{1F99C}',
  mod: '\u{1F47E}',
  morph: '\u{1F47B}',
  rat: '\u{1F400}',
  rocky: '\u{1FAA8}',
  'rubber-duck': '\u{1F986}',
  skeleton: '\u{1F480}',
  snail: '\u{1F40C}',
  snake: '\u{1F40D}',
  turtle: '\u{1F422}',
  vampire: '\u{1F9DB}',
  zappy: '\u{26A1}'
};

// MUST match PET_COLORS in src/utils/resources.ts
export const PET_COLORS: Record<string, string[]> = {
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

export const LIVE_EVENTS = ['keyboard_typing', 'video_play'];

export const ALL_EVENTS = ['keyboard_typing', 'video_play', 'video_pause', 'scroll', 'focus_gained', 'focus_lost'];

export const EVENT_LABELS: Record<string, string> = {
  keyboard_typing: 'Keyboard Typing',
  video_play: 'Video Play',
  video_pause: 'Video Pause',
  scroll: 'Scrolling',
  focus_gained: 'Focus In',
  focus_lost: 'Focus Out'
};

export const PETS_WITHOUT_BALL = ['rocky', 'vampire'];
