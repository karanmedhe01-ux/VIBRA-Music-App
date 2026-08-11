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
bun run build:web
bun x cap sync android
./android/gradlew -p android assembleDebug

printf '\nVIBRA debug APK: %s\n' "$ROOT_DIR/android/app/build/outputs/apk/debug/app-debug.apk"
