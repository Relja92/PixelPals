import type { PetState, BubbleData, ExtensionConfig } from './types';

/** Shared mutable state for the content script */
export const state = {
  petsContainer: null as HTMLDivElement | null,
  currentConfig: null as ExtensionConfig | null,
  animationFrameId: null as number | null,
  petStates: new Map<string, PetState>(),
  activeBubbles: new Map<string, BubbleData>(),

  // Event detection
  currentEventState: 'idle' as 'idle' | 'typing' | 'video_playing',
  lastEventTime: 0,
  keyboardTimeout: null as ReturnType<typeof setTimeout> | null,
  videoCheckInterval: null as ReturnType<typeof setInterval> | null,
  activeInputElement: null as HTMLElement | null,
  playingVideoElement: null as HTMLVideoElement | null,
  lastVideoCacheTime: 0,
  cachedPlayingVideos: [] as HTMLVideoElement[],
  viewportWidth: window.innerWidth,
  viewportHeight: window.innerHeight,
  sharedFrameTimestamp: 0,

  // Config reload flag (avoids race condition with animation loop)
  pendingConfigReload: false,

  // Listener references for cleanup
  keydownHandler: null as (() => void) | null,
  resizeHandler: null as (() => void) | null,
};
