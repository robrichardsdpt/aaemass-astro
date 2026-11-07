import type { TermId } from './content';
import type { Lang } from '../i18n';
import { ui } from '../i18n/ui';
import { termDefs, termPatterns } from '../i18n/terms';

// Per-language matching. Matching is case-sensitive; patterns live in src/i18n/terms.ts.
const L = '\\p{L}';
const cache = new Map<Lang, { regex: RegExp; matchers: (readonly [TermId, RegExp])[] }>();
function forLang(lang: Lang) {
  let c = cache.get(lang);
  if (!c) {
    const patterns = termPatterns[lang];
    c = {
      regex: new RegExp(`(?<!${L})(${patterns.map(([, p]) => p).join('|')})(?!${L})`, 'gu'),
      matchers: patterns.map(([id, p]) => [id, new RegExp(`^(?:${p})$`, 'u')] as const),
    };
    cache.set(lang, c);
  }
  return c;
}
export const termRegexFor = (lang: Lang) => forLang(lang).regex;
export const termIdFor = (text: string, lang: Lang = 'en'): TermId | undefined => forLang(lang).matchers.find(([, re]) => re.test(text))?.[0];

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Same markup as components/Term.astro, for strings that are rendered as HTML.
export function termMarkup(id: TermId, label: string, lang: Lang = 'en', closeLabel = 'Close'): string {
  const t = termDefs[lang][id];
  const pop = `term-${id}`;
  return `<button type="button" class="term" popovertarget="${pop}" aria-haspopup="dialog"><abbr title="${esc(t.full)}">${label}</abbr></button><span id="${pop}" popover class="term-card" role="dialog" aria-label="${esc(t.full)}"><strong>${esc(t.full)}</strong><span>${esc(t.def)}</span><button type="button" class="term-close" popovertarget="${pop}" popovertargetaction="hide">${esc(closeLabel)}</button></span>`;
}

// Wraps the first mention of each term in an HTML string, skipping tags and anchor text.
export function termify(html: string, seen: Set<string>, lang: Lang = 'en'): string {
  const regex = termRegexFor(lang);
  const closeLabel = ui[lang].close;
  let inAnchor = 0;
  return html
    .split(/(<[^>]+>)/)
    .map((chunk) => {
      if (chunk.startsWith('<')) {
        if (/^<a[\s>]/i.test(chunk)) inAnchor++;
        else if (/^<\/a>/i.test(chunk)) inAnchor = Math.max(0, inAnchor - 1);
        return chunk;
      }
      if (inAnchor) return chunk;
      return chunk.replace(regex, (m) => {
        const id = termIdFor(m, lang);
        if (!id || seen.has(id)) return m;
        seen.add(id);
        return termMarkup(id, m, lang, closeLabel);
      });
    })
    .join('');
}
