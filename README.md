# PMG Digital Toolbox

A touch-friendly collection of interactive classroom tools for the Philipp Melanchthon Gymnasium Meine. The interface is in German and runs entirely in the browser.

## Technology and development

React and TypeScript provide the interface and simulations, Vite builds the single-page application, and React Router provides hash-based navigation. Styling uses plain CSS and shared design tokens. No backend, accounts, database, or analytics are needed.

Use Node.js 24 (or a supported version >=22.23.4):

```bash
npm ci
npm run dev
npm run check
npm test
npm run build
npm run preview
```

Open the local URL printed by Vite. Direct links use routes such as `/#/werkzeuge/ohmsches-gesetz` and work on static hosting.

## Deployment

The GitHub Actions workflow deploys `main` to GitHub Pages; configure Pages to use GitHub Actions as its source. The default asset base is `/pmg-digital-toolbox/`. Override it when building for a different location, for example:

```bash
DEPLOY_BASE=/pmg-digital-toolbox/previews/pr-17/ npm run build
```

The hash routes are independent of the deployment base. The build output in `dist` is static.

## Adding a tool

Create a React component in `src/tools/<slug>/`, then add its metadata and lazy component import to the registry in `src/data/tools.ts`. For a new subject, extend `Subject`, `subjects`, and `subjectTheme` there. See [CONTRIBUTING.md](CONTRIBUTING.md) for design, accessibility, and testing conventions.

The included examples demonstrate Ohm's law, a stack, and fractions. They are demos and not a substitute for reviewed, curriculum-aligned lessons. Do not include personal student data or third-party tracking.

The CSS palette approximates PMG branding; the simplified wordmark is not the official school logo.
