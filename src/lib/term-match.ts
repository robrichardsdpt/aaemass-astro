import { terms, type TermId } from './content';

// Source patterns for each defined term. Matching is case-sensitive.
const patterns: [TermId, string][] = [
  ['gsr', 'GSRs?|G\\.S\\.R\\.s?'],
  ['dcm', 'DCMs?|D\\.C\\.M\\.s?'],
  ['delegate', 'Delegates?'],
  ['seventh', 'Seventh Tradition'],
  ['gso', 'General Service Office|G\\.S\\.O\\.|GSO'],
  ['gsc', 'General Service Conference'],
  ['aaws', 'AAWS|AA World Services'],
  ['cpc', 'C\\.P\\.C\\.'],
  ['pi', 'P\\.I\\.'],
  ['lips', 'LIPS'],
  ['btg', 'Bridge the Gap'],
  ['assembly', 'Area Assembl(?:y|ies)'],
  ['conscience', 'group conscience'],
  ['steps', 'Twelve Steps'],
  ['traditions', 'Twelve Traditions'],
  ['bigbook', 'Big Book'],
];

export const termRegex = new RegExp(`(?<![A-Za-z])(${patterns.map(([, p]) => p).join('|')})(?![A-Za-z])`, 'g');
const matchers = patterns.map(([id, p]) => [id, new RegExp(`^(?:${p})$`)] as const);
export const termIdFor = (text: string): TermId | undefined => matchers.find(([, re]) => re.test(text))?.[0];

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Same markup as components/Term.astro, for strings that are rendered as HTML.
export function termMarkup(id: TermId, label: string): string {
  const t = terms[id];
  const pop = `term-${id}`;
  return `<button type="button" class="term" popovertarget="${pop}" aria-haspopup="dialog"><abbr title="${esc(t.full)}">${label}</abbr></button><span id="${pop}" popover class="term-card" role="dialog" aria-label="${esc(t.full)}"><strong>${esc(t.full)}</strong><span>${esc(t.def)}</span><button type="button" class="term-close" popovertarget="${pop}" popovertargetaction="hide">Close</button></span>`;
}

// Wraps the first mention of each term in an HTML string, skipping tags and anchor text.
export function termify(html: string, seen: Set<string>): string {
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
      return chunk.replace(termRegex, (m) => {
        const id = termIdFor(m);
        if (!id || seen.has(id)) return m;
        seen.add(id);
        return termMarkup(id, m);
      });
    })
    .join('');
}
