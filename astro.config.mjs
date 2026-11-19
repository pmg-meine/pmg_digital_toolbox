import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// Change PMG_GITHUB_OWNER to the GitHub account / organization that owns this repo.
const owner = process.env.PMG_GITHUB_OWNER || 'YOUR-GITHUB-OWNER';

export default defineConfig({
  site: `https://${owner}.github.io`,
  base: '/pmg-digital-toolbox',
  trailingSlash: 'always',
  output: 'static',
  integrations: [react()],
});
