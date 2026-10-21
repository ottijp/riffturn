<center><img src="src/assets/logo.svg" alt="RiffTurn logo" width="180"></center>

# RiffTurn

[日本語](README-ja.md) | English

RiffTurn is a desktop app for practicing by repeatedly playing your favorite parts of an audio track.

**RiffTurn is still in beta. The UI may change significantly in the future. The author uses macOS, so the app has not been thoroughly tested on Windows or Linux. Instructions on how to use the app are not yet available.**

![Main screen](docs/images/main-screen.png)

## Download

Download the package for your OS from the [releases page](https://github.com/ottijp/riffturn/releases).

## Motivation

I recently started playing guitar and needed an app that would let me practice difficult parts by playing them repeatedly. I created RiffTurn so I could practice phrases at my own pace.

## Features

- Load local audio, create segments, and adjust playback speed and volume for each segment.
- Loop a segment or a specified time range.
- Add a wait before playback starts, giving you time to pick up your instrument or prepare for the next loop.
- Play a few extra seconds before and after the loop range (pre-roll and post-roll).

## Data management

- Imported audio is played from its original location without being copied. If the file is moved or deleted, it must be relinked.
- Bundled sample audio is copied to the OS application data directory on first launch and managed there. Project settings are also stored in a SQLite database in the same directory.

## Sample audio

The bundled sample audio is [Monplaisir - 06 - Juillet · nullrights](https://nullrights.com/track/3gqt6bs0qc). Thanks to the artist for sharing it under CC0.

## Development

```sh
npm install
npm run desktop:dev
```

### Building packages

```sh
# macOS arm64: DMG package
# Code signing and notarization require an Apple Developer certificate and credentials.
npm run desktop:build:mac
# Windows x64: NSIS installer
npm run desktop:build:win
# Linux x64: AppImage and Debian package
npm run desktop:build:linux
```

### Requirements

- Node.js 24 or later
- Xcode Command Line Tools to build macOS packages
- Windows x64 to build Windows packages
- Debian- or Ubuntu-based Linux x64 to build Linux packages

### License

[MIT](LICENSE.txt)
