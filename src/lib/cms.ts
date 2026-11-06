import { marked } from 'marked';
import { path } from './site';
import { termify } from './term-match';

const base = import.meta.env.BASE_URL.replace(/\/$/, '');

// CMS links: "/contact/" becomes base-aware; full URLs and mailto: pass through.
export const href = (u?: string) => (u ? (u.startsWith('/') && !u.startsWith('//') ? path(u) : u) : undefined);

// Markdown from the CMS to HTML. Internal links and uploaded images respect the site base path,
// and the first mention of each defined term becomes a popover.
export function md(text: string, seen: Set<string>): string {
  const html = marked.parse(text, { async: false, gfm: true }) as string;
  const based = html.replace(/(href|src)="\/(?!\/)/g, `$1="${base}/`);
  return termify(based, seen);
}

export const slugify = (s: string) => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
