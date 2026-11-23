# Virtual Memory Visualizer integration

`index.html` is based on https://github.com/twyleg/edu_virtual_memory_visualizer at commit `5841419ea7a17227ef88f563d86b4002cfc69bd6`. The upstream repository did not contain a license file at the time of integration. Its README is included as `UPSTREAM-README.md`.

The toolbox serves the standalone application locally. Integration changes adapt its colors and synchronize its theme with the toolbox when embedded; standalone use retains its own theme switch. The visualizer uses predefined memory snapshots and does not execute Java.

The application markup, styles, behavior, and built-in examples live in `index.html`, `styles.css`, `app.js`, and `examples.js`, respectively. The snapshot format is documented in `CONFIGURATION.md`.
