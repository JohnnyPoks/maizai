#!/usr/bin/env bash
# Run this from WSL to build the Android APK on Linux (avoids Windows ld.lld.exe NDK ABI issues).
# Usage:  bash scripts/build-android-wsl.sh
set -e

export ANDROID_HOME=/opt/android-sdk
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$JAVA_HOME/bin:$PATH"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MOBILE_DIR="$(dirname "$SCRIPT_DIR")"
ANDROID_DIR="$MOBILE_DIR/android"

echo "=== MaizAI Android build (WSL/Linux) ==="
echo "ANDROID_HOME: $ANDROID_HOME"
echo "JAVA_HOME:    $JAVA_HOME"
java --version
node --version

# local.properties must point to the Linux SDK, not the Windows one.
# The file is gitignored so writing it here is safe.
echo "sdk.dir=$ANDROID_HOME" > "$ANDROID_DIR/local.properties"
echo "local.properties set to: $ANDROID_HOME"

cd "$ANDROID_DIR"

echo ""
echo "=== Building arm64-v8a debug APK ==="
./gradlew app:assembleDebug -PreactNativeArchitectures=arm64-v8a --stacktrace 2>&1

APK_PATH="$ANDROID_DIR/app/build/outputs/apk/debug/app-debug.apk"
if [ -f "$APK_PATH" ]; then
  echo ""
  echo "SUCCESS: APK built at $APK_PATH"
  ls -lh "$APK_PATH"
else
  echo "FAILED: APK not found at expected path"
  exit 1
fi
