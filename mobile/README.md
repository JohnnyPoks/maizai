# MaizAI — Mobile Application

React Native (Expo SDK 56) app for offline-first maize leaf disease detection on Android.
Target: Android 7.0+ (API 24), arm64-v8a.

---

## Quick start (development)

```bash
cd mobile
npm install
npm start           # Metro dev server — open in Expo Go / dev client
```

For development you also need `mobile/.env.local` (never committed):

```bash
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000   # local web back-end (Android emulator)
EXPO_PUBLIC_DEBUG_MODE=true                # show the in-app debug tools
EXPO_PUBLIC_SUPPORT_EMAIL=you@example.com  # "Report a bug" address (optional)
```

> Image uploads now go through the web back-end (which holds the Cloudinary
> credentials), so the app no longer needs any Cloudinary environment variables.

---

## Building the APK (GitHub Actions — primary)

The release APK is built by the **`.github/workflows/build-apk.yml`** GitHub
Actions workflow on an Ubuntu runner (free and unlimited for public repos). This
avoids both the EAS free-tier build quota and the Windows local-build NDK linker
issues (the `C:\Users\…` path contains a space, which breaks the native build).

- **Automatic:** every push to `main` that touches `mobile/**` or the bundled
  model triggers a build that publishes a GitHub Release with `maizai.apk`.
- **Manual:** Actions tab → *Build Android APK* → *Run workflow* (lets you toggle
  debug tools and whether to publish a Release).

The workflow runs `expo prebuild` → `gradlew assembleRelease`, producing a
**release** APK with the JS bundled in (runs standalone, no Metro needed). The
API base URL is baked in from the workflow env (`EXPO_PUBLIC_API_URL`),
defaulting to the Vercel deployment; you can override it at runtime from the
in-app Debug screen without rebuilding.

EAS remains available (`npm run build:preview` / `build:production`) but is rate-
limited on the free tier, so GitHub Actions is the default.

---

## Installing & debugging on a device

With a phone connected over USB (USB debugging enabled):

```bash
npm run install:device     # installs the APK in build-output/ via adb
npm run logs:crash         # streams crash logs (adb logcat, filtered)
```

These work on any APK on a connected device, regardless of how it was built.

---

## Publishing a release for website download

This is **automatic**: the GitHub Actions build publishes a Release with
`maizai.apk` on every qualifying push to `main`. The website's "Download for
Android" button points at the stable
`https://github.com/JohnnyPoks/maizai/releases/latest/download/maizai.apk`,
which always serves the newest build — no manual step required.

---

## Smoke test (after a build)

Run this manual check on a connected Android device or emulator after installing
a new APK:

1. Install the APK and **sign in**.
2. **Capture a real maize leaf** → a result is shown with disease, confidence and
   a recommendation; it appears in History as "Pending sync".
3. **Capture a non-leaf object** (phone screen, hand, sky, plain wall) → the
   **"No maize leaf detected"** screen appears; nothing is saved to History.
4. Open **History** → only the real-leaf capture is listed.
5. Bring the device **online** and pull-to-sync (or use the Sync button) → the
   capture flips to "Synced" and appears on the cloud dashboard.

You can also use the **gallery button** on the capture screen to run the model
against the original dataset images (no re-photographing) to sanity-check
accuracy.

---

## Environment variables

| Variable | Purpose |
| --- | --- |
| `EXPO_PUBLIC_API_URL` | Web back-end base URL (set per build) |
| `EXPO_PUBLIC_DEBUG_MODE` | `"true"` shows the in-app debug tools (FAB + screen) |
| `EXPO_PUBLIC_SUPPORT_EMAIL` | Address for the "Report a bug" mailto (optional) |

Image uploads are handled by the web back-end, so no Cloudinary variables are
needed on the device.

---

## Project structure

```text
mobile/
├── assets/models/maize_classifier.tflite   # on-device classifier (5-class, ~4.84 MB)
├── src/
│   ├── app/            # expo-router screens (tabs, auth, debug, result)
│   ├── components/     # UI + feature components
│   ├── hooks/          # camera, inference, sync
│   ├── lib/            # api, database (SQLite), inference, sync, rule-engine
│   ├── stores/         # zustand auth store
│   └── strings.ts      # user-facing strings (British English)
├── eas.json            # EAS build profiles
└── app.json            # Expo config
```
