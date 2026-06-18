# MaizAI — Mobile Application

React Native (Expo SDK 56) app for offline-first maize leaf disease detection on Android.

## Prerequisites

- Node.js 20+
- Android Studio with Android SDK (for emulator or USB debugging)
- Java 17 (required by Gradle)
- A running instance of the web back-end (see `../web/`)

## Setup

```bash
cd mobile

# Copy environment variables
cp .env.example .env.local
# Edit .env.local and set EXPO_PUBLIC_API_URL:
#   Android emulator  → http://10.0.2.2:3000
#   Physical device   → http://<your-machine-ip>:3000
#   Production        → https://your-vercel-app.vercel.app

npm install
```

The TFLite model is already bundled at `assets/models/maize_classifier.tflite`.

## Development

### Start dev server

```bash
npm start          # Expo dev server (requires a custom development build — see below)
```

> **Note:** This project uses `react-native-fast-tflite` which requires native code.  
> It will not run in Expo Go. You need a custom development build (see below).

### Custom development build (run once)

```bash
# Generate native android/ folder
npx expo prebuild --platform android

# Build and install the development APK on a connected device or emulator
npm run android
```

### Testing on a physical Android phone (USB)

1. Enable Developer Options on the phone: **Settings → About phone → tap Build number 7×**.
2. Enable USB Debugging: **Settings → Developer Options → USB Debugging**.
3. Connect via USB cable.
4. Run `adb devices` to confirm the phone is listed.
5. Run `npm run android` — Expo builds and installs the dev APK directly.

### Testing on a physical Android phone (Wi-Fi)

1. Connect phone to the same Wi-Fi network as your development machine.
2. Enable Wi-Fi Debugging in Developer Options (Android 11+).
3. Pair via `adb pair <ip>:<port>` (shown in Developer Options).
4. Run `npm run android`.
5. Set `EXPO_PUBLIC_API_URL=http://<your-machine-ip>:3000` in `.env.local`.

### Android emulator mock camera

The emulator does not have a real camera. To test capture:

1. Open the **Extended Controls** in the emulator (three-dot menu).
2. Go to **Camera → Virtual scene**.
3. Drag a maize leaf image (PNG/JPG) onto the emulator window — it appears in the virtual scene.
4. Point the in-app camera at the image and capture.

## Building a release APK

```bash
npm run build:apk
```

This runs `expo prebuild`, compiles with Gradle, and copies the APK to `build-output/`.  
Upload `build-output/maizai-vX.Y.Z.apk` to GitHub Releases manually.

## EAS Build (cloud builds — for CI or contributors)

```bash
npm install -g eas-cli
eas login
eas build:configure          # First time only — sets projectId in app.json

# Debug development APK
eas build --profile development --platform android

# Release APK
eas build --profile production --platform android
```

## Environment variables

| Variable | Description |
|---|---|
| `EXPO_PUBLIC_API_URL` | Web back-end base URL |
| `EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Unsigned upload preset name |

All `EXPO_PUBLIC_` variables are embedded at build time — not runtime.  
**Never put secrets here.** The Cloudinary preset must be set to **Unsigned** in the Cloudinary dashboard.

## Architecture

```
src/
├── app/           Expo Router screens (file-based routing)
│   ├── (auth)/    Sign-in, request access, change password
│   ├── (tabs)/    Capture (default), History, Settings
│   └── result/    Classification result modal
├── components/    Reusable UI components
├── lib/           Core logic — inference, database, API, sync, rule engine
├── stores/        Zustand state stores
├── hooks/         Composable React hooks
├── theme/         Colours, typography, spacing
└── strings.ts     All user-facing copy (localisation-ready)
```

## Key design decisions

- **Offline-first:** every capture is persisted to SQLite before network is touched.
- **On-device inference:** `react-native-fast-tflite` runs the quantised TFLite model — no cloud round-trip.
- **Unsigned Cloudinary upload:** no API secret in the app; the upload preset enforces security server-side.
- **JWT auth:** tokens from `/api/auth/mobile-signin` stored in `expo-secure-store`.
- **Phase 2 (sensor):** the rule engine is wired to accept `SensorContext | null`. Sensor integration (mDNS + ESP32 Wi-Fi) will be added when firmware is complete.
