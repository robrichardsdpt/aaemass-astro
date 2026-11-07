// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://aaemass.org',
  compressHTML: true,
  // English at the root; Spanish and French under /es/ and /fr/ (see src/i18n).
  i18n: { defaultLocale: 'en', locales: ['en', 'es', 'fr'], routing: { prefixDefaultLocale: false } },
  // One canonical form per URL: directory-style with a trailing slash.
  trailingSlash: 'always',
  // The WordPress package is served by the aa30-home plugin under a private prefix, so it never collides
  // with a real WordPress URL. Change it in one place: WP_PREFIX here and AA30_PREFIX in the plugin.
  base: process.env.WP_BUILD ? `/${process.env.WP_PREFIX || 'a30-preview'}/` : process.env.GH_PAGES ? '/aaemass-astro/' : '/',
});
