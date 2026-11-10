// Locale layer: language codes, translated URL slugs, hreflang alternates and localized links.
// English stays at the site root; Spanish and French live under /es/ and /fr/.
import { path } from '../lib/site';
import reviewed from './reviewed.json';

export const locales = ['en', 'es', 'fr'] as const;
export type Lang = (typeof locales)[number];
export const defaultLang: Lang = 'en';
export const otherLangs = ['es', 'fr'] as const;

export const htmlLang: Record<Lang, string> = { en: 'en', es: 'es', fr: 'fr' };
export const ogLocale: Record<Lang, string> = { en: 'en_US', es: 'es_US', fr: 'fr_FR' };
export const langName: Record<Lang, string> = { en: 'English', es: 'Español', fr: 'Français' };

export const getLang = (astro: { currentLocale?: string }): Lang =>
  (locales as readonly string[]).includes(astro.currentLocale ?? '') ? (astro.currentLocale as Lang) : 'en';

// URL segment translations. Spanish and French slugs help local search and read naturally.
// Any English route made only of segments listed here can be localized.
const segments: Record<string, { es: string; fr: string }> = {
  'alcoholics-anonymous': { es: 'alcoholicos-anonimos', fr: 'alcooliques-anonymes' },
  calendar: { es: 'calendario', fr: 'calendrier' },
  committees: { es: 'comites', fr: 'comites' },
  districts: { es: 'distritos', fr: 'districts' },
  literature: { es: 'literatura', fr: 'litterature' },
  resources: { es: 'recursos', fr: 'ressources' },
  contact: { es: 'contacto', fr: 'contact' },
  contribute: { es: 'contribuciones', fr: 'contributions' },
  service: { es: 'servicio', fr: 'service' },
  'get-involved': { es: 'participe', fr: 'sengager' },
  // committees
  archives: { es: 'archivos', fr: 'archives' },
  cpc: { es: 'ccp', fr: 'cmp' },
  corrections: { es: 'correccionales', fr: 'etablissements-correctionnels' },
  grapevine: { es: 'la-vina', fr: 'la-vigne' },
  'public-information': { es: 'informacion-publica', fr: 'information-publique' },
  'treatment-facilities': { es: 'centros-de-tratamiento', fr: 'centres-de-traitement' },
  accessibilities: { es: 'accesibilidades', fr: 'accessibilites' },
  messenger: { es: 'mensajero', fr: 'messager' },
  'service-seminar': { es: 'seminario-de-servicio', fr: 'seminaire-de-service' },
  'state-convention': { es: 'convencion-estatal', fr: 'congres-de-letat' },
  website: { es: 'sitio-web', fr: 'site-web' },
  registrar: { es: 'registrador', fr: 'registraire' },
  '12th-step-volunteer': { es: 'voluntarios-duodecimo-paso', fr: 'benevoles-douzieme-etape' },
};

// English route keys ('' is the home page) that have Spanish and French pages.
export const translatedKeys = [
  '',
  'alcoholics-anonymous',
  'calendar',
  'committees',
  'districts',
  'literature',
  'resources',
  'contact',
  'contribute',
  'service',
  'get-involved',
  'committees/registrar',
  'committees/archives',
  'committees/cpc',
  'committees/corrections',
  'committees/grapevine',
  'committees/literature',
  'committees/public-information',
  'committees/treatment-facilities',
  'committees/treatment-facilities/12th-step-volunteer',
  'committees/accessibilities',
  'committees/messenger',
  'committees/service-seminar',
  'committees/state-convention',
  'committees/website',
];

const keySlug = (key: string, lang: Lang): string | undefined => {
  if (lang === 'en' || key === '') return key;
  const parts = key.split('/').map((s) => segments[s]?.[lang]);
  return parts.every(Boolean) ? parts.join('/') : undefined;
};

// Public path (no base) for a route key in a language: '/es/calendario/'.
export const publicPath = (key: string, lang: Lang): string => {
  const slug = keySlug(key, lang);
  if (slug === undefined) return `/${key}${key ? '/' : ''}`;
  if (lang === 'en') return key === '' ? '/' : `/${slug}/`;
  return slug === '' ? `/${lang}/` : `/${lang}/${slug}/`;
};

const keyOf = (p: string) => p.replace(/^\/+|\/+$/g, '');

// Links inside translated pages. Pass the English path ('/calendar', '/committees/cpc#x');
// pages without a translation fall back to their English URL.
export function lpPublic(lang: Lang, p: string): string {
  const [route, hash] = p.split('#');
  if (lang === 'en' || /^(https?:|mailto:|tel:|\/\/)/.test(route) || !translatedKeys.includes(keyOf(route))) return p;
  return `${publicPath(keyOf(route), lang)}${hash ? `#${hash}` : ''}`;
}
// Same, with the build base (GitHub Pages / WordPress plugin path) applied.
export const lp = (lang: Lang, p: string): string => path(lpPublic(lang, p));

// Reverse lookup: which route key does a public path (no base) belong to, and in which language?
export function resolve(pathname: string): { key: string; lang: Lang } | null {
  const trimmed = keyOf(pathname);
  const [first, ...rest] = trimmed.split('/');
  const lang = (otherLangs as readonly string[]).includes(first) ? (first as Lang) : 'en';
  const local = lang === 'en' ? trimmed : rest.join('/');
  for (const key of translatedKeys) if (keySlug(key, lang) === local) return { key, lang };
  return lang === 'en' ? { key: local, lang } : null;
}

// Every language version of the page at this public path, or only the page itself when it has none.
export function alternates(pathname: string): Partial<Record<Lang, string>> {
  const r = resolve(pathname);
  if (!r) return {};
  if (!translatedKeys.includes(r.key)) return { [r.lang]: publicPath(r.key, r.lang) };
  return Object.fromEntries(locales.map((l) => [l, publicPath(r.key, l)])) as Record<Lang, string>;
}

export const fmt = (s: string, vars: Record<string, string | number>) =>
  s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));

// Spanish and French pages are indexed only after a bilingual AA member has reviewed them.
export function isIndexable(key: string, lang: Lang): boolean {
  if (lang === 'en') return true;
  const list = reviewed[lang] as string[] | 'all';
  return list === 'all' || list.includes(key);
}

// hreflang targets for search engines: English plus every reviewed translation of the page.
export function seoAlternates(pathname: string): Partial<Record<Lang, string>> {
  const r = resolve(pathname);
  const all = alternates(pathname);
  if (!r) return all;
  return Object.fromEntries(Object.entries(all).filter(([l]) => isIndexable(r.key, l as Lang))) as Partial<Record<Lang, string>>;
}

// French typography: no-break space before ? ! : ; » and after «, and inside "19 h 30".
const frTypo = (s: string) =>
  s
    .replace(/ ([?!:;»])/g, ' $1')
    .replace(/« /g, '« ')
    .replace(/(\d) h (\d)/g, '$1 h $2');
function deep(v: unknown): unknown {
  if (typeof v === 'string') return frTypo(v);
  if (Array.isArray(v)) return v.map(deep);
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, deep(x)]));
  return v;
}

// Pick a page's messages for a language (French gets typographic spacing).
export function pick<T>(all: Record<Lang, T>, lang: Lang): T {
  return (lang === 'fr' ? deep(all.fr) : all[lang]) as T;
}
