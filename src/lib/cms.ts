import { marked } from 'marked';
import { path } from './site';
import { termify } from './term-match';
import { lp, type Lang } from '../i18n';

const base = import.meta.env.BASE_URL.replace(/\/$/, '');

// CMS links: "/contact/" becomes base-aware (and language-aware); full URLs and mailto: pass through.
export const href = (u?: string, lang: Lang = 'en') => (u ? (u.startsWith('/') && !u.startsWith('//') ? (lang === 'en' ? path(u) : lp(lang, u)) : u) : undefined);

// Markdown from the CMS to HTML. Internal links and uploaded images respect the site base path,
// and the first mention of each defined term becomes a popover.
export function md(text: string, seen: Set<string>, lang: Lang = 'en'): string {
  const html = marked.parse(text, { async: false, gfm: true }) as string;
  // lp() already applies the build base to localized links; English links and all image sources get it here.
  const based = html
    .replace(/href="(\/(?!\/)[^"]*)"/g, (_, u: string) => `href="${lang === 'en' ? base + u : lp(lang, u)}"`)
    .replace(/src="\/(?!\/)/g, `src="${base}/`);
  return termify(based, seen, lang);
}

export const slugify = (s: string) => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
