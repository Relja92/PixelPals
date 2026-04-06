# Privacy Policy for PixelPals

**Effective Date:** April 2026

## Summary

PixelPals is designed with privacy-first principles. We do **not** collect, store, or transmit any personal data about you or your browsing activity.

---

## Data Collection

**PixelPals collects ZERO data.**

- No analytics
- No crash reporting
- No user tracking
- No browsing history
- No keylogging
- No personal information

---

## What Data Is Stored

All data is stored **locally on your device** in your browser's storage:

### Configuration Storage
Your pet settings are saved locally using Chrome's Storage API:
- Pet types, colors, and names
- Which events each pet watches (keyboard typing, video playback)
- Speed settings
- Enable/disable status

**This data:**
- Never leaves your device
- Is NOT sent to any server
- Is NOT shared with third parties
- Is deleted when you uninstall the extension

### Storage Sync (Optional)
If you sign into Chrome with a Google account, your settings may sync across your devices using Chrome's native sync feature. This is controlled by your Google account settings, not PixelPals.

---

## Permissions Explained

PixelPals requests the following permissions:

### `storage`
- **Why:** To save your pet configuration locally
- **What it accesses:** Only the extension's own storage, not your browser history or other data

### `scripting`
- **Why:** To inject the pet container and animation script into web pages
- **What it accesses:** The DOM of pages you visit, to render pets

### `<all_urls>`
- **Why:** To work on every website you visit
- **What it monitors:** Keyboard typing activity (timing only, not keystrokes) and video playback state
- **What it records:** NOTHING — events are processed immediately and discarded
- **What it skips:** Password fields and credit card inputs are automatically ignored

---

## No Third-Party Services

PixelPals does not use:
- Google Analytics
- Sentry or crash reporting
- Amplitude or event tracking
- Advertisements
- External APIs
- External fonts or CDNs

All assets (images, styles, scripts) are bundled with the extension. No network requests are made.

---

## Your Control

You have complete control:

- **Disable the extension:** Turn it off anytime in `chrome://extensions/`
- **Disable per pet:** Toggle individual pets on/off in the popup
- **Choose what pets react to:** Configure which events each pet watches
- **Delete data:** Uninstalling the extension automatically deletes all local data
- **View stored data:** Open DevTools → Application → Chrome Storage → inspect `pets_extension_config`

---

## Security

- The extension runs entirely client-side (on your device)
- All assets are loaded from the extension package, not external servers
- No external network requests are made
- Your configuration is never transmitted
- All user input (pet names) is sanitized to prevent injection attacks
- Config data is validated on every load to prevent tampering
- Service worker validates message senders to prevent spoofing

---

## Changes to This Policy

If we make changes to this privacy policy, we'll update this document. Since the extension is open-source, you can always review the code on [GitHub](https://github.com/Relja92/PixelPals).

---

## Questions?

If you have concerns about privacy, you can:
- Review the source code on [GitHub](https://github.com/Relja92/PixelPals)
- Open an issue on GitHub
- Inspect the extension's activity in Chrome DevTools
- Uninstall the extension anytime

---

**Last updated:** April 2026
