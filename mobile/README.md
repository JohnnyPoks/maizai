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
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000          # local web back-end (Android emulator)
EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME=...
EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET=...
```

---

## Building the APK (cloud — EAS)

We build in the cloud with EAS. Local Gradle builds on Windows are not supported
(NDK linker issues), and a local **debug** APK cannot run standalone anyway — a
debug build fetches its JavaScript from Metro at runtime, so it shows the red
"Unable to load script" screen unless Metro is running on a connected PC.

EAS produces a **release** APK with the JS bundled in, which runs on its own.

```bash
npm run build:preview      # internal testing build (debug FAB enabled)
npm run build:production    # store-ready build (debug FAB disabled)
```

When the build finishes, EAS prints a download URL. The API base URL is baked in
per profile from `eas.json` (`EXPO_PUBLIC_API_URL`), defaulting to the Vercel
deployment. You can override it at runtime from the in-app Debug screen (e.g. to
point at a Cloudflare tunnel) without rebuilding.

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

The website's download button fetches the latest GitHub release asset. To publish:

```bash
# 1. build with EAS (above) and download the .apk
# 2. create a GitHub release with the APK attached
gh release create v0.1.0 maizai-v0.1.0.apk --title "MaizAI v0.1.0" --repo JohnnyPoks/maizai
```

---

## Environment variables

| Variable | Purpose |
| --- | --- |
| `EXPO_PUBLIC_API_URL` | Web back-end base URL (set per EAS profile) |
| `EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud for image uploads |
| `EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Unsigned upload preset |
| `EXPO_PUBLIC_DEBUG_MODE` | `"true"` shows the in-app debug FAB (set in `eas.json` preview) |
| `EXPO_PUBLIC_SUPPORT_EMAIL` | Address for the "Report a bug" mailto (optional) |

---

## Project structure

```text
mobile/
├── assets/models/maize_classifier.tflite   # on-device classifier (~2.8 MB)
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
