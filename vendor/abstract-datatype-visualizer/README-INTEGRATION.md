# Abstract datatype visualizer integration

This directory contains the source of https://github.com/twyleg/edu_abstract_datatype_visualizer (including its vendored Online-IDE). See `UPSTREAM.md`, `LICENSE`, `upstream/LICENSE`, and `docs/` for provenance and license notices.

The root `npm ci` installs the visualizer's locked dependencies. `npm run dev` and `npm run build` first build it into `public/abstract-datatype-visualizer`; the toolbox serves that same-origin build in the tool page. The generated directory is not source and is ignored by Git. To run the visualizer's focused tests, run `npx vitest run src/visualizer/visualizer.test.ts` in `upstream`.
