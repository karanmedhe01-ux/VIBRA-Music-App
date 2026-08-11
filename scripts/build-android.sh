#!/usr/bin/env sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)

if [ -x "$ROOT_DIR/.toolchain/jdk-21.0.12+8/bin/java" ]; then
  export JAVA_HOME="$ROOT_DIR/.toolchain/jdk-21.0.12+8"
fi
if [ -d "$ROOT_DIR/.toolchain/android-sdk" ]; then
  export ANDROID_HOME="$ROOT_DIR/.toolchain/android-sdk"
  export ANDROID_SDK_ROOT="$ANDROID_HOME"
fi

if [ -z "${JAVA_HOME:-}" ] && ! command -v java >/dev/null 2>&1; then
  printf '%s\n' "Java 21 is required to build the Android APK." >&2
  exit 1
fi

cd "$ROOT_DIR"
if [ -f "$ROOT_DIR/.attachments/VIBRA-debug.apk" ] && [ ! -f "$ROOT_DIR/public/VIBRA-debug.apk" ]; then
  cp "$ROOT_DIR/.attachments/VIBRA-debug.apk" "$ROOT_DIR/public/VIBRA-debug.apk"
fi
bun run build:web
# Keep the downloadable web APK out of the Android bundle to avoid recursive packaging.
rm -f "$ROOT_DIR/out/VIBRA-debug.apk"
bun x cap sync android
./android/gradlew -p android assembleDebug

cp "$ROOT_DIR/android/app/build/outputs/apk/debug/app-debug.apk" "$ROOT_DIR/.attachments/VIBRA-debug.apk"
cp "$ROOT_DIR/android/app/build/outputs/apk/debug/app-debug.apk" "$ROOT_DIR/public/VIBRA-debug.apk"
cp "$ROOT_DIR/android/app/build/outputs/apk/debug/app-debug.apk" "$ROOT_DIR/out/VIBRA-debug.apk"

printf '\nVIBRA debug APK: %s\n' "$ROOT_DIR/android/app/build/outputs/apk/debug/app-debug.apk"
