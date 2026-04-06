# Contributing to PixelPals

Thanks for your interest in contributing! Here's everything you need to get started.

## Getting Started

1. Fork the repo and clone your fork
2. `npm install`
3. `npm run build` — make sure it builds clean
4. Load the `build/` folder in `chrome://extensions/` (Developer mode enabled)
5. Make your changes
6. `npm run build:prod` — verify production build works
7. Test the extension manually (add a pet, check animations, hover, click)
8. Open a PR

## Code Style

- **TypeScript strict mode** — no `any` unless absolutely necessary
- **Named exports only** — no default exports
- **Keep files under 300 lines** — if a file grows beyond that, split it into a new module
- **No external dependencies** without discussion in an issue first
- **2 spaces** for indentation (see `.editorconfig`)

## Adding a New Pet

1. Add GIF assets to `assets/{pet-name}/` following the naming pattern: `{color}_{animation}_8fps.gif`
   - Required animations: `idle`, `walk`, `run`, `swipe`
   - Optional: `with_ball`, `lie`, `walk_fast`
2. Update `src/content/constants.ts` — add to `PETS_WITH_LIE` or `PETS_WITHOUT_BALL` if applicable
3. Add 70 phrases to `src/content/phrases.ts`
4. Add emoji fallback to `src/content/pet-creation.ts` in the `emojiMap` object
5. Update `src/ui/constants.ts` — add to `PET_EMOJIS` and `PET_COLORS`
6. Update `src/background/service-worker.ts` — add to `VALID_PET_TYPES`
7. Update `manifest.json` — add `"assets/{pet-name}/*"` to `web_accessible_resources`
8. Update `README.md` — add to the pets table
9. Test: add the pet in popup, verify all animations, hover interaction, speech bubbles

## Adding New Features

- Keep the content script lightweight — it runs on every page at 60fps
- All DOM operations must use `textContent`, never `innerHTML` with user data
- Event listeners must be cleaned up in `src/content/events.ts` → `cleanup()`
- New interactive features should respect the `watches` array (per-pet event subscriptions)
- Test with 5+ pets to verify performance stays under 20ms/frame

## Pull Request Guidelines

- **One feature or fix per PR** — keep it focused and reviewable
- **Describe what changed and why** in the PR description
- **Test locally** before submitting — both build and manual extension testing
- **Don't break existing behavior** without discussion
- **Don't add analytics, tracking, or external network requests** — this is a privacy-first extension
- **Don't modify credits** without maintainer approval

## What We're Looking For

- New pet types (with original or properly licensed pixel art)
- Bug fixes (especially cross-site compatibility issues)
- Performance improvements
- Accessibility improvements (ARIA labels, keyboard navigation)
- New event types (scroll, focus — infrastructure exists, marked "Coming Soon")
- Domain blocking UI (config infrastructure exists, needs popup page)
- Tests

## What We Won't Accept

- Features that collect or transmit user data
- Ads, monetization, or tracking
- Dependencies that significantly increase bundle size
- Code that doesn't pass `tsc --noEmit` (strict mode)

## Reporting Bugs

Use the [Bug Report](../../issues/new?template=bug_report.md) issue template. Include:
- Chrome version
- What you expected vs what happened
- Steps to reproduce
- Which website the bug occurred on (if relevant)

## Requesting Features

Use the [Feature Request](../../issues/new?template=feature_request.md) issue template. Describe:
- What you want
- Why it would be useful
- Any ideas for how to implement it

## Questions?

Open an issue with the question label, or comment on an existing issue.
