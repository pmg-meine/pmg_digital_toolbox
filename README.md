# PMG Digital Toolbox

A central, static, touch-friendly library of interactive classroom tools for the Philipp Melanchthon Gymnasium Meine.

## Tech stack

- **Astro** for static site generation, subject catalogue, and real routes
- **React + TypeScript** for interactive simulations
- **Plain CSS with design tokens** for a consistent school identity
- **GitHub Pages** for free static deployment from GitHub Actions

No backend, accounts, database, or analytics.

## Get started

Requires **Node.js 24** (or a supported version >=22.23.4).

```bash
npm install
npm run dev
```

Open the local URL Astro prints (normally `http://localhost:4321/pmg-digital-toolbox/`).

Validation:

```bash
npm run check
npm run build
```

## Deploy on GitHub Pages

1. Create a repository named **`pmg-digital-toolbox`** in the desired GitHub account or organization.
2. Copy/push this starter to the repo's `main` branch.
3. Run `npm install` locally and **commit `package-lock.json`** for reproducible dependency resolution. The starter workflows also work before it exists; after committing the lockfile, you may switch CI from `npm install` to `npm ci`.
4. In **Settings → Pages → Build and deployment**, set the source to **GitHub Actions**.
5. The workflow publishes to `https://<owner>.github.io/pmg-digital-toolbox/`.

The GitHub Actions build reads `github.repository_owner` to set the Astro `site` URL automatically. For local builds, set `PMG_GITHUB_OWNER` to preview the final canonical URL:

```bash
PMG_GITHUB_OWNER=my-organization npm run build
```

If the school later uses `toolbox.pmg-meine.de`, adjust `site` and `base` and configure the domain as documented by Astro and GitHub Pages.

## Adding a tool

1. Create `src/tools/<slug>/MyTool.tsx`. Use React for interactive behavior, imported shared styling and standard controls.
2. Add an entry to `src/data/tools.ts`: title, subject, grades, description, tags, learning goal, example activity, and icon. For a **new subject**, extend `Subject`, `subjects`, and `subjectTheme` in the same file.
3. Import and render your component in `src/pages/werkzeuge/[slug].astro` (the existing tools illustrate the pattern).
4. Test on iPad Safari (portrait and landscape), desktop, keyboard, and touch.
5. Run the build checks, then open a pull request.

For a larger toolbox, the conditional component mapping in `[slug].astro` should be factored into a dedicated registry; intentionally simple in this MVP.

## Examples included

- Physics: Ohm's law with interactive U–I diagram
- Computer Science: push/pop in an 8-element stack
- Mathematics: fractional parts with a visual bar

These are **demo tools** illustrating the shared architecture; they are not a substitute for reviewed, curriculum-aligned lessons.

## Contributing / privacy

Read [CONTRIBUTING.md](CONTRIBUTING.md). Do not include names, photos, assessment results, or other personal student data. Keep simulations client-only and avoid third-party analytics/tracking.

## Branding

The CSS palette is an **approximation** inspired by public PMG branding, not a verified official color specification. The typographic wordmark is an original simplified interpretation and **not** the official school logo. Replace it with an approved logo asset if permission is granted.
