// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://aaemass.org',
  compressHTML: true,
  // Only the WordPress package is served from a plugin directory, so only it needs the prefix.
  base: process.env.WP_BUILD ? '/wp-content/plugins/aa30-home/' : '/',
});
