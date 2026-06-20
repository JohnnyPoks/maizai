#!/usr/bin/env bash
# Build the Android debug APK from WSL (Ubuntu on Windows).
# This avoids Windows ld.lld.exe + NDK ABI-tagging linker errors.
# Usage (from mobile/ on Windows): npm run build:apk
# Usage (directly in WSL):         bash scripts/build-android-wsl.sh
set -e

export ANDROID_HOME=/opt/android-sdk
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$JAVA_HOME/bin:$PATH"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MOBILE_DIR="$(dirname "$SCRIPT_DIR")"
ANDROID_DIR="$MOBILE_DIR/android"

echo "=== MaizAI Android build (WSL/Linux) ==="
java --version 2>&1 | head -1
node --version

# Point Gradle at the Linux SDK, not the Windows one in local.properties.
echo "sdk.dir=$ANDROID_HOME" > "$ANDROID_DIR/local.properties"

cd "$ANDROID_DIR"

echo ""
echo "=== Gradle clean + assembleDebug [arm64-v8a] ==="
./gradlew clean app:assembleDebug -PreactNativeArchitectures=arm64-v8a 2>&1

APK_SRC="$ANDROID_DIR/app/build/outputs/apk/debug/app-debug.apk"
if [ -f "$APK_SRC" ]; then
  VERSION=$(node -p "require('$MOBILE_DIR/package.json').version" 2>/dev/null || echo "dev")
  DEST_DIR="$MOBILE_DIR/build-output"
  mkdir -p "$DEST_DIR"
  DEST="$DEST_DIR/maizai-v${VERSION}-debug.apk"
  cp "$APK_SRC" "$DEST"
  echo ""
  echo "SUCCESS"
  echo "  APK:     $APK_SRC"
  echo "  Copied:  $DEST"
  ls -lh "$APK_SRC"
else
  echo "FAILED: APK not found"
  exit 1
fi
