import { site } from '../lib/site';
import { committees } from '../lib/committee-pages';

const pages = import.meta.glob('./**/*.astro');

export const GET = () => {
  const routes = new Set<string>();
  for (const file of Object.keys(pages)) {
    let route = file.replace(/^\./, '').replace(/\.astro$/, '').replace(/\/index$/, '');
    if (route.includes('[slug]')) {
      for (const slug of Object.keys(committees)) routes.add(route.replace('[slug]', slug));
      continue;
    }
    routes.add(route || '/');
  }
  const lastmod = new Date().toISOString().slice(0, 10);
  const urls = [...routes]
    .sort()
    .map((r) => `  <url><loc>${site.url}${r === '/' ? '/' : `${r}/`}</loc><lastmod>${lastmod}</lastmod></url>`)
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
