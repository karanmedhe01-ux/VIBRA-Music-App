# VIBRA

VIBRA is a premium dark music-player web app packaged for Android with Capacitor.

## Stack

- Next.js + React + TypeScript
- Capacitor 7 for Android
- Tailwind CSS
- Lucide icons
- YouTube-backed playback integration

## Development

```bash
bun install
bun run dev
```

## Checks

```bash
bun run typecheck
bun run build
```

## Android debug build

The repository includes a build script at `scripts/build-android.sh`. It uses Java 21 when the bundled toolchain is available, syncs Capacitor, and builds the Android debug APK.

## Notes

- Keep API keys and other secrets out of source control.
- Do not commit `.env` files containing private credentials.
- The Android application ID is `com.vibra.music`.
