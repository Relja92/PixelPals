# Changelog

All notable changes to PixelPals will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-04-06

### Added
- 21 pet types: Dog, Fox, Chicken, Deno, Panda, Horse, Monkey, Crab, Clippy, Cockatiel, Mod, Morph, Rat, Rocky, Rubber Duck, Skeleton, Snail, Snake, Turtle, Vampire, Zappy
- 40+ color variants across all pets
- 7 animation states: idle, walk, run, swipe, with_ball, lie, walk_fast
- Keyboard typing detection — pets run to your input field
- Video playback detection — pets sit by playing videos
- Speech bubbles — click any pet for a random phrase (70 per pet type)
- Hover interaction — idle, with_ball, then lie down sequence
- Popup UI with 4-page navigation (Home, Add Pet, Settings, About)
- 3-step add pet wizard (type, color, events)
- Per-pet settings: name, speed, color, event subscriptions
- Global enable/disable toggle
- GIF preloading to prevent first-render flicker
- Password and credit card field filtering
- Content Security Policy (script-src 'self')
- Message validation with sender ID and type whitelist
- Pet name sanitization (HTML chars stripped, max 50 chars)
- Memory leak prevention with cleanup on page unload
- Race condition fix: config reloads deferred to animation frame boundary
- ARIA labels on all interactive controls
- Production build with terser minification and console stripping
- Full credits with links to all pixel art contributors

### Architecture
- TypeScript strict mode with esbuild bundling
- Modular content script (10 files) and popup (12 files)
- Service worker for config storage and cross-tab sync
- Chrome Storage API with sync + local fallback
