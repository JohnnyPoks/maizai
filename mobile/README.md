# MaizAI — Mobile Application

React Native (Expo SDK 56) app for offline-first maize leaf disease detection on Android.  
Target: Android 7.0+ (API 24), arm64-v8a.

---

## Quick start

```bash
cd mobile
npm install
```

---

## Building the APK locally

### Windows 11 (via WSL2) — Recommended

The standard Windows Gradle build fails because `ld.lld.exe` + NDK 27 produces ABI-tagged C++ symbol errors. WSL2 (Ubuntu 24.04) uses the Linux linker, which works correctly.

#### One-time WSL setup (run once as administrator)

```powershell
# Install Java 17, Node.js 22, and Android SDK inside WSL
wsl -d Ubuntu -u root -- apt-get update -qq
wsl -d Ubuntu -u root -- apt-get install -y openjdk-17-jdk-headless unzip wget

wsl -d Ubuntu -u root -- bash -c "curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && apt-get install -y nodejs"

wsl -d Ubuntu -u root -- bash -c "
  mkdir -p /opt/android-sdk/cmdline-tools
  cd /tmp
  wget -q https://dl.google.com/android/repository/commandlinetools-linux-13114758_latest.zip -O ct.zip
  unzip -q ct.zip -d /opt/android-sdk/cmdline-tools/
  mv /opt/android-sdk/cmdline-tools/cmdline-tools /opt/android-sdk/cmdline-tools/latest
"

wsl -d Ubuntu -u root -- /bin/bash -c "yes | /opt/android-sdk/cmdline-tools/latest/bin/sdkmanager --licenses"
wsl -d Ubuntu -u root -- /bin/bash -c "
  /opt/android-sdk/cmdline-tools/latest/bin/sdkmanager \
    'build-tools;35.0.0' 'platforms;android-35' 'ndk;27.1.12297006' 'cmake;3.31.6'
"
```

> **C: drive space:** The WSL virtual disk (`ext4.vhdx`) grows to ~15 GB (Android SDK 3 GB + Gradle caches 5–7 GB). To move it to D: after setup:

```powershell
wsl --shutdown
mkdir D:\WSL
wsl --export Ubuntu D:\WSL\Ubuntu.tar
wsl --unregister Ubuntu
wsl --import Ubuntu D:\WSL\Ubuntu D:\WSL\Ubuntu.tar --version 2
```

#### Build the debug APK

```bash
npm run build:apk
```

First run downloads Gradle dependencies (~5 GB, ~60 min). Subsequent builds: 5–10 min.

Output:

- `android/app/build/outputs/apk/debug/app-debug.apk`
- `build-output/maizai-v<version>-debug.apk` (copy)

#### Install to a connected device

1. Enable **USB Debugging** on your phone (Settings → Developer Options → USB Debugging).
2. Connect via USB.
3. Run:

```bash
npm run install:device
```

Installs the APK and launches the app via ADB.

#### Monitor crash logs

While the app is running on the connected device:

```bash
npm run logs:crash
```

Streams `AndroidRuntime` (JVM crashes) and `ReactNativeJS` (JS errors). Press **Ctrl+C** to stop.

---

### Linux / macOS — Native build

No WSL needed:

```bash
export ANDROID_HOME=~/Android/Sdk   # adjust to your path
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
cd android
./gradlew clean app:assembleDebug -PreactNativeArchitectures=arm64-v8a
```

---

### macOS (Apple Silicon)

Same as Linux. Use Homebrew:

```bash
brew install --cask android-commandlinetools
sdkmanager "ndk;27.1.12297006" "cmake;3.31.6" "build-tools;35.0.0" "platforms;android-35"
```

---

## Development server

```bash
npm start     # starts Metro bundler
```

> This project uses `react-native-fast-tflite` which requires native code.  
> It **will not run in Expo Go**. Use a custom development build.

### USB-connected device (development)

```bash
npm run android     # build dev APK + install via ADB (Windows — may hit NDK issue)
```

Or run `npm run build:apk` via WSL, then `npm run install:device`.

### Android emulator mock camera

Extended Controls → Camera → Virtual scene. Drag a maize leaf PNG onto the emulator window.

---

## EAS cloud builds

Use EAS when you need a signed multi-ABI APK or when doing CI releases:

```bash
npx eas build -p android --profile preview      # debug-capable APK with debug FAB
npx eas build -p android --profile production   # signed release APK
```

EAS limit: 30 builds/month on the free tier.

---

## Releasing a new version

Requires [GitHub CLI](https://cli.github.com/) (`gh auth login` once):

```powershell
npm run release:create                       # patch bump: 0.1.0 → 0.1.1
npm run release:create -- -Bump minor        # minor bump: 0.1.0 → 0.2.0
```

This script: builds APK via WSL → bumps version → commits → creates git tag → pushes → creates GitHub release with APK attached.

---

## Environment variables

Copy `.env.example` to `.env.local` (never committed). All mobile env vars use `EXPO_PUBLIC_` — they are baked into the JS bundle at build time.

| Variable | Purpose |
|---|---|
| `EXPO_PUBLIC_API_URL` | Back-end API base URL (defaults to production Vercel URL) |
| `EXPO_PUBLIC_DEBUG_MODE` | Set `true` in EAS preview builds to show the debug FAB |
| `EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Unsigned Cloudinary upload preset |

**Never put secrets here.** The Cloudinary preset must be **Unsigned**.

---

## Project structure

```
mobile/
├── app.json              Expo config (splash, icons, plugins, EAS project ID)
├── eas.json              EAS build profiles (development / preview / production)
├── src/
│   ├── app/              Expo Router file-based routes
│   │   ├── _layout.tsx   Root layout — splash screen management, auth hydration
│   │   ├── index.tsx     Entry redirect (→ sign-in or capture tab)
│   │   ├── (auth)/       Sign-in and change-password screens
│   │   ├── (tabs)/       Main tab navigator (Capture, History, Settings)
│   │   ├── result/[id]   Classification result modal
│   │   └── debug/        Debug dashboard (dev + preview builds only)
│   ├── components/       Shared and screen-specific components
│   ├── stores/           Zustand state (auth, captures)
│   ├── lib/              API client, SQLite, TFLite inference, debug tools
│   └── theme/            Colours, spacing, typography constants
├── assets/               App icons and splash image
├── android/              Generated native Android project (committed)
└── scripts/
    ├── build-android-wsl.sh   WSL build entrypoint
    ├── install-device.ps1     ADB install to USB-connected device (Windows)
    ├── crash-log.ps1          ADB crash log stream (Windows)
    └── create-release.ps1     Version bump + GitHub release creation (Windows)
```

---

## Splash screen

The native splash shows the MaizAI leaf logo (200dp wide) centred on `#f0f9f2` (light green).  
`SplashScreen.preventAutoHideAsync()` is called at app startup; the splash hides when auth hydration from SecureStore completes (typically < 300 ms).

---

## Key architectural decisions

| Decision | Rationale |
| --- | --- |
| TFLite on-device only | Works offline; no cloud inference cost; model < 5 MB |
| arm64-v8a only locally | Fastest build; covers all modern Android phones |
| WSL2 for Windows builds | `ld.lld.exe` + NDK 27 ABI-tagging incompatibility |
| `EXPO_PUBLIC_DEBUG_MODE` | Enables debug FAB in preview APKs where `__DEV__` is false |
| Zustand + SQLite buffer | Captures persist offline; synced when network available |
| JWT in SecureStore | Tokens survive app restart without re-login |
