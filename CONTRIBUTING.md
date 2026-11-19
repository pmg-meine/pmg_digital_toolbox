# Contributing a classroom tool

Small tools should be understandable without documentation, but should include a teaching note on the tool's page.

## Code conventions

- TypeScript + React function components; no direct DOM manipulation for tool state.
- Keep tools in `src/tools/<slug>`; put pure mathematical and algorithmic logic in plain TypeScript modules, and use React for interaction, state, and rendering.
- Register metadata and a lazy component import together in `src/data/tools.ts`. Extend the subject type, filter list, and theme for new subjects.
- Keep simulations independent of routing and deployment configuration. Extract shared code only when it is genuinely reusable.
- No duplicate headers, footers, or bespoke color systems; reuse `src/styles/global.css` tokens.
- Use a proper `<label>` for controls; mouse, keyboard, and touch must all work.
- Prefer semantic HTML and text alternatives for charts or color-driven information.
- Buttons and sliders should offer at least 44×44 CSS pixel targets on touchscreens.
- Avoid services that require sending student data or persisting it off device.
- No new runtime dependencies without justification.
- Include title, short description, grade levels, subject, searchable tags, learning goal, and an activity suggestion.
- Keep resource-heavy animation optional and respect `prefers-reduced-motion`.

## Acceptance checks

Run `npm run check`, `npm test`, and `npm run build`. In Chrome/Firefox desktop and Safari on iPad, check 768px and 1024px widths, scrolling, orientation changes, and pinch zoom. Confirm that the browser back action returns to the catalogue. Test a keyboard-only navigation path and sufficient contrast.

## Ideas and review

Open a GitHub issue explaining the subject, target grade, pedagogical objective, and requested interactions. A maintainer reviews educational content and usability before merging. The `master` branch auto-deploys.

## Preview deployments

Open a pull request from a branch in this repository to request a public preview. See the deployment section of [README.md](README.md) for URLs, developer mode, required Pages settings, and a manual lifecycle check. Forks do not receive automatic previews. Check both stable and preview deep links when changing routing or deployment paths.
