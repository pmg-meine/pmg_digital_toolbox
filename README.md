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

The Pages workflow rebuilds `master` and all open same-repository pull requests into a single artifact. Each preview uses its PR number, for example `https://OWNER.github.io/pmg-digital-toolbox/previews/pr-17/`. Share that URL with colleagues after the workflow completes. A new commit updates the same URL; closing or merging the PR removes it on the next deployment. Fork PRs are excluded because their code is not trusted for public preview builds, though they can run the normal checks.

The workflow builds each eligible head independently. A failed preview is reported in the workflow log and omitted; a failed stable build stops deployment. It generates `versions.json` at the site root from successful builds. The selector fetches this catalogue and preserves the hash route when switching, for example:

- Stable: `https://OWNER.github.io/pmg-digital-toolbox/#/werkzeuge/ohmsches-gesetz`
- Preview: `https://OWNER.github.io/pmg-digital-toolbox/previews/pr-17/#/werkzeuge/ohmsches-gesetz`

A tool missing in the target version shows a link back to its catalogue. Previews show the selector automatically. On stable, tap or click **PMG Digital Toolbox** in the footer five times within three seconds to enable it. Use **Ausblenden** to hide it. The setting lasts for the current browser tab; switching from a preview to stable enables it for that tab. Preview URLs are public, and this setting is not access control.

Configure Pages to use **GitHub Actions** as its source and enable Actions. The PR event workflow explicitly requests `actions: write` for its `GITHUB_TOKEN`; the repository's default workflow permissions normally do not need changing. If an organization or enterprise policy restricts that permission, an administrator must adjust the applicable policy. Repository defaults are under **Settings → Actions → General → Workflow permissions**; they need not be changed to broad read and write access for this workflow. Protect the `github-pages` environment as appropriate; required approvals will delay deployment. The trusted `pull_request_target` workflow only dispatches the default-branch publication workflow, which builds PR code with read-only permissions; the separate deploy job has Pages and OIDC permissions. No personal access token is needed. The workflow assumes a public repository for unauthenticated preview checkouts. The root path is configured by `TOOLBOX_ROOT` in `deploy.yml`; change it to match the Pages path, including leading and trailing slashes. Vite uses `DEPLOY_BASE` for each build.

To rebuild manually, run **Build and deploy PMG Digital Toolbox** using Actions → Run workflow on the default branch. For an end-to-end check, open a same-repository test PR, wait for both workflows, open its preview and a deep link, and check stable and another open preview. Push a change and verify the same URL updates. Close the PR and verify its catalogue entry and URL disappear, then reopen it and verify restoration. Also verify a fork PR is absent and test the selector on desktop and iPad. Actual Pages deployment requires repository settings and cannot be verified by local builds alone.

## Adding a tool

Create a React component in `src/tools/<slug>/`, then add its metadata and lazy component import to the registry in `src/data/tools.ts`. For a new subject, extend `Subject`, `subjects`, and `subjectTheme` there. See [CONTRIBUTING.md](CONTRIBUTING.md) for design, accessibility, and testing conventions.

The included examples demonstrate Ohm's law, a stack, and fractions. They are demos and not a substitute for reviewed, curriculum-aligned lessons. Do not include personal student data or third-party tracking.

The CSS palette approximates PMG branding; the simplified wordmark is not the official school logo.
