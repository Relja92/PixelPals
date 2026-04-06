import { state } from './state';
import { EVENT_DEBOUNCE } from './constants';
import { updateEventState, getPlayingVideos } from './helpers';

// Setup keyboard and video detection
export function setupEventDetection() {
  // Keyboard detection - track when user is typing (passive for performance)
  state.keydownHandler = () => {
    const now = Date.now();
    if (now - state.lastEventTime > EVENT_DEBOUNCE.keyboard) {
      updateEventState('keyboard');
    }
    if (state.keyboardTimeout) clearTimeout(state.keyboardTimeout);
    state.keyboardTimeout = setTimeout(() => {
      if (state.currentEventState === 'typing') {
        console.log('[Content Script] Typing stopped, pets return to normal behavior');
        state.currentEventState = 'idle';
        state.activeInputElement = null;
        state.petStates.forEach(s => {
          s.eventTargetX = undefined;
          s.eventTargetY = undefined;
        });
      }
    }, 2000);
  };

  document.addEventListener('keydown', state.keydownHandler, { passive: true });

  // Video detection - find and track playing videos
  state.videoCheckInterval = setInterval(() => {
    const playingVideos = getPlayingVideos();
    const foundPlayingVideo = playingVideos.length > 0 ? playingVideos[0] : null;

    if (foundPlayingVideo && state.currentEventState !== 'video_playing') {
      state.playingVideoElement = foundPlayingVideo;
      updateEventState('video');
    } else if (!foundPlayingVideo && state.currentEventState === 'video_playing') {
      console.log('[Content Script] Video stopped, pets return to normal behavior');
      state.currentEventState = 'idle';
      state.playingVideoElement = null;
      state.petStates.forEach(s => {
        s.eventTargetX = undefined;
        s.eventTargetY = undefined;
      });
    }
  }, EVENT_DEBOUNCE.video);

  console.log('[Content Script] Event detection setup complete');
}

// Clean up all listeners and intervals to prevent memory leaks
export function cleanup() {
  if (state.animationFrameId) {
    cancelAnimationFrame(state.animationFrameId);
    state.animationFrameId = null;
  }
  if (state.videoCheckInterval) {
    clearInterval(state.videoCheckInterval);
    state.videoCheckInterval = null;
  }
  if (state.keyboardTimeout) {
    clearTimeout(state.keyboardTimeout);
    state.keyboardTimeout = null;
  }
  if (state.keydownHandler) {
    document.removeEventListener('keydown', state.keydownHandler);
    state.keydownHandler = null;
  }
  if (state.resizeHandler) {
    window.removeEventListener('resize', state.resizeHandler);
    state.resizeHandler = null;
  }
  // Clean up bubbles
  state.activeBubbles.forEach(bubble => {
    if (bubble.updateInterval) clearInterval(bubble.updateInterval);
    if (bubble.container) bubble.container.remove();
  });
  state.activeBubbles.clear();
  // Remove pet elements
  if (state.petsContainer) {
    state.petsContainer.remove();
    state.petsContainer = null;
  }
  state.petStates.clear();
}
