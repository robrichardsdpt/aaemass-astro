import { site } from '../lib/site';

export const GET = () => {
  // The GitHub Pages preview must stay out of search; the real build allows everything.
  const preview = Boolean(import.meta.env.PUBLIC_NOINDEX);
  const body = preview
    ? 'User-agent: *\nDisallow: /\n'
    : `User-agent: *\nAllow: /\n\nSitemap: ${site.url}/sitemap.xml\n`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
