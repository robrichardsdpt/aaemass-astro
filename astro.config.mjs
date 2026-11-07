// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://aaemass.org',
  compressHTML: true,
  // English at the root; Spanish and French under /es/ and /fr/ (see src/i18n).
  i18n: { defaultLocale: 'en', locales: ['en', 'es', 'fr'], routing: { prefixDefaultLocale: false } },
  // One canonical form per URL: directory-style with a trailing slash.
  trailingSlash: 'always',
  // Only the WordPress package is served from a plugin directory, so only it needs the prefix.
  base: process.env.WP_BUILD ? '/wp-content/plugins/aa30-home/' : process.env.GH_PAGES ? '/aaemass-astro/' : '/',
  // WordPress build: emit absolute asset URLs so the page works wherever the HTML is served from.
  build: process.env.WP_BUILD ? { assetsPrefix: 'https://aaemass.org/wp-content/plugins/aa30-home' } : {},
});
