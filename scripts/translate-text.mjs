// Text helpers for scripts/translate.mjs, kept separate so they can be tested.

// Markdown links become <l id="n">words</l>: only the words are translated, and the "[", "]" and (url) never reach
// the translator (which can drop or move them). Bare URLs, emails and {placeholders} become <x id="n"/>.
const LINK = /\[([^\]]*)\]\(([^)]*)\)/g;
const TERM = /\[\[(\w+)\|([^\]]+)\]\]/g; // [[delegate|Delegate]]: a glossary popover; the id stays, the label is translated
const BARE = /https?:\/\/[^\s)<>"]+|[\w.+-]+@[\w-]+(?:\.[\w-]+)+|\{[A-Za-z]+\}/g;
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const unesc = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

/** Swaps protected spans for tags (DeepL is told to leave <x/> alone and to keep <l> around the words). */
export function mask(text) {
  const kept = [];
  // 1. glossary popovers and links, parked behind markers the escaping below cannot touch
  let t = text.replace(TERM, (_, id, label) => {
    kept.push(`[[${id}|`);
    return `\u0001${kept.length - 1}\u0002${label}\u0003${kept.length - 1}\u0004`;
  });
  t = t.replace(LINK, (_, label, url) => {
    kept.push(`(${url})`);
    return `\u0001${kept.length - 1}\u0002${label}\u0003${kept.length - 1}\u0004`;
  });
  t = esc(t).replace(BARE, (m) => {
    kept.push(unesc(m));
    return `<x id="${kept.length - 1}"/>`;
  });
  const masked = t.replace(/\u0001(\d+)\u0002/g, '<l id="$1">').replace(/\u0003(\d+)\u0004/g, '</l>');
  return { masked, kept };
}

/** Puts the protected spans back; throws if the translator lost one. */
export function unmask(translated, kept) {
  let out = translated;
  kept.forEach((k, i) => {
    if (k.startsWith('(') || k.startsWith('[[')) {
      const link = new RegExp(`<l id="${i}"\\s*>([\\s\\S]*?)</l>`);
      if (!link.test(out)) throw new Error(`a link was lost while translating ("${k}")`);
      out = out.replace(link, (_, words) => (k.startsWith('[[') ? `${k}${words.trim()}]]` : `[${words.trim()}]${k}`));
    } else {
      const tag = new RegExp(`<x id="${i}"\\s*/>|<x id="${i}"></x>`);
      if (!tag.test(out)) throw new Error(`a link or address was lost while translating ("${k}")`);
      out = out.replace(tag, () => k);
    }
  });
  return unesc(out);
}

const MARKED = /^(\s*(?:[-*+]|\d+[.)])\s+|\s*#{1,6}\s+|\s*>\s?)/;

/**
 * Splits markdown into pieces of text to translate. Headings, list items and quotes are translated line by line
 * with their markers kept out of the translator's hands; ordinary paragraphs are translated whole. Returns the
 * pieces and a function that puts translations back into the original layout.
 */
export function markdownPieces(body, isText) {
  const blocks = body.split(/(\n{2,})/);
  const pieces = [];
  const plan = blocks.map((block, i) => {
    if (i % 2 === 1 || !isText(block)) return { raw: block };
    const lines = block.split('\n');
    if (lines.every((l) => MARKED.test(l) || !l.trim())) {
      return { lines: lines.map((l) => { const m = l.match(MARKED); if (!m || !isText(l.slice(m[0].length))) return { raw: l }; pieces.push(l.slice(m[0].length)); return { pre: m[0], at: pieces.length - 1 }; }) };
    }
    pieces.push(block.trim());
    return { lead: block.match(/^\s*/)[0], trail: block.match(/\s*$/)[0], at: pieces.length - 1 };
  });
  const assemble = (done) =>
    plan
      .map((p) => {
        if (p.raw !== undefined) return p.raw;
        if (p.lines) return p.lines.map((l) => (l.raw !== undefined ? l.raw : l.pre + done[l.at])).join('\n');
        return p.lead + done[p.at] + p.trail;
      })
      .join('');
  return { pieces, assemble };
}
