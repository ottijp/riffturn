# Why I Chose Electron

## Decision

Electron is adopted for the RiffTurn desktop application.

Audio segment practice continuously handles playback-position changes, pre-roll, segment boundaries, and post-roll at short intervals. Uninterrupted audio during these operations is a core application requirement.

## Evaluation Results

In the Tauri implementation, playback-start delays and audio dropouts occurred in macOS WKWebView during the following operations:

- After seeking the playback position
- When crossing a segment boundary
- When entering the loop range from pre-roll
- When entering post-roll from the loop range

Loading audio into a Blob URL before playback, rather than playing it directly through Tauri's asset protocol, did not improve the issue. The likely cause is therefore WKWebView's media-playback implementation rather than the local-file loading path.

Running the same UI and playback controls in Electron produced neither seek delays nor audio dropouts between playback sections. Because Electron uses Chromium's media implementation, it provides behavior as stable as running the web version in Chrome.

## Trade-offs

Electron produces larger distribution artifacts and uses more memory than Tauri. SQLite also requires its native addon to be rebuilt for Electron's Node ABI.

However, RiffTurn prioritizes a low-latency, uninterrupted practice experience. The additional distribution size and memory usage are acceptable costs for this requirement.
