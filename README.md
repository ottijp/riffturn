# RiffTurn

An Electron desktop app for practicing local audio files with per-segment playback speed, volume, and loop ranges.

User-selected audio is played from its original location without being copied. Bundled sample audio is copied to and managed in the operating system's application-data directory on first launch. Project settings and waveform data are stored in SQLite in the same directory. If a user audio file is moved or deleted, it can be relinked to continue practicing.

See the [architecture decision record](docs/decisions/001-electron.md) for why Electron was chosen for the desktop implementation.

## Development

```sh
npm install
npm run desktop:dev
```

## Building packages

```sh
npm run desktop:build:mac
```

On macOS, this creates a DMG. When a Developer ID certificate is available in the keychain, Electron Builder signs the macOS build. Configure Apple credentials during release to notarize it.

Build Windows and Linux packages on their respective operating systems with the following commands.

```sh
npm run desktop:build:win   # Windows x64: NSIS installer
npm run desktop:build:linux # Linux x64: AppImage and Debian package
```

## Requirements

- Node.js 26 or later
- Xcode Command Line Tools for macOS packages
- Windows x64 for Windows packages
- Debian- or Ubuntu-based Linux x64 for Linux packages

Packages are published through GitHub Releases, and updates are installed by manual download.
