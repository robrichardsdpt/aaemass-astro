import { site } from '../lib/site';
import { getLiveEvents, getLivePages } from '../lib/live-content';
import { getAllEvents } from '../lib/all-events';
import { committees } from '../lib/committee-pages';
import { locales, otherLangs, publicPath, translatedKeys, isIndexable, seoAlternates, htmlLang } from '../i18n';

const pages = import.meta.glob('./**/*.astro');

export const GET = async () => {
  // The preview publishes no URLs for crawlers.
  if (import.meta.env.PUBLIC_NOINDEX) return new Response('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>\n', { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
  const routes = new Set<string>();
  for (const file of Object.keys(pages)) {
    let route = file.replace(/^\./, '').replace(/\.astro$/, '').replace(/\/index$/, '');
    if (route.includes('[...slug]') || route.includes('[id]')) continue;
    if (route.includes('[slug]')) {
      for (const slug of Object.keys(committees)) routes.add(route.replace('[slug]', slug));
      continue;
    }
    routes.add(route || '/');
  }
  for (const p of await getLivePages()) if (!p.data.noindex) routes.add(`/${p.id}`);
  const now = Date.now();
  for (const e of await getLiveEvents()) if ((e.data.end ?? e.data.start).getTime() >= now) routes.add(`/events/${e.id}`);
  // One-off Google Calendar and WordPress events have a page (the highlighted ones are listed just above). Repeating events do not.
  for (const e of await getAllEvents()) if (e.slug) routes.add(`/events/e/${e.slug}`);
  const lastmod = new Date().toISOString().slice(0, 10);
  const loc = (r: string) => `${site.url}${r === '/' ? '/' : `${r}/`}`;
  // Reviewed Spanish and French pages are listed too, and every page names its other-language versions.
  const all = new Set(routes);
  for (const key of translatedKeys)
    for (const lang of otherLangs) if (isIndexable(key, lang)) all.add(publicPath(key, lang).replace(/(.)\/$/, '$1'));
  const urls = [...all]
    .sort()
    .map((r) => {
      const alts = seoAlternates(r);
      const links = Object.keys(alts).length > 1
        ? Object.entries(alts).map(([l, p]) => `<xhtml:link rel="alternate" hreflang="${htmlLang[l as (typeof locales)[number]]}" href="${site.url}${p}"/>`).join('')
        : '';
      return `  <url><loc>${loc(r)}</loc><lastmod>${lastmod}</lastmod>${links}</url>`;
    })
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
