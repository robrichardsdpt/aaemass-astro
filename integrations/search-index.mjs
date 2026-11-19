// Builds the site search index after the pages are written. It reads the finished HTML in dist/, so every page is
// covered, including pages whose words live in .astro files rather than in content files. One small JSON file per
// language (search-index-en.json, -es, -fr) is written; the search window fetches only the one for its page.
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join, relative, sep } from 'node:path';
import sanitizeHtml from 'sanitize-html';

const LANGS = ['en', 'es', 'fr'];
// Event pages have their own "Explore events" window, and the rest are not pages a visitor searches for.
const SKIP = [/^404\.html$/, /^admin\//, /^events\//, /^forms\//, /^_astro\//];
const BODY_LIMIT = 20000;

const entities = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&nbsp;': ' ' };
const toText = (html) =>
  sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} })
    .replace(/&(?:amp|lt|gt|quot|#39|nbsp);/g, (m) => entities[m])
    .replace(/\s+/g, ' ')
    .trim();

async function* htmlFiles(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) yield* htmlFiles(full);
    else if (entry.name.endsWith('.html')) yield full;
  }
}

/** The page's language, from its URL: Spanish and French live under /es/ and /fr/, English at the root. */
export const langOf = (route) => LANGS.find((l) => l !== 'en' && (route === l || route.startsWith(`${l}/`))) ?? 'en';

const slug = (text) =>
  text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'section';

/**
 * Gives every h2 and h3 in <main> an id (keeping the ones that already have one), so search results can link to the
 * section that matched. Returns the changed HTML.
 */
export function addHeadingIds(html) {
  const taken = new Set([...html.matchAll(/\bid="([^"]*)"/g)].map((m) => m[1]));
  return html.replace(/(<main\b[^>]*>)([\s\S]*?)(<\/main>)/i, (_, open, main, close) =>
    open + main.replace(/<(h[23])\b([^>]*)>([\s\S]*?)<\/\1>/gi, (whole, tag, attrs, inner) => {
      if (/\bid="/.test(attrs)) return whole;
      const base = slug(toText(inner));
      let id = base;
      for (let n = 2; taken.has(id); n++) id = `${base}-${n}`;
      taken.add(id);
      return `<${tag} id="${id}"${attrs}>${inner}</${tag}>`;
    }) + close);
}

/** Splits <main> at its h2 and h3 headings: the text before the first one, then one section per heading. */
function sectionsOf(main) {
  const parts = main.split(/(?=<h[23]\b)/i);
  let budget = BODY_LIMIT;
  return parts
    .map((part) => {
      const head = part.match(/^<h[23]\b([^>]*)>([\s\S]*?)<\/h[23]>/i);
      const id = head?.[1].match(/\bid="([^"]*)"/)?.[1] ?? '';
      const body = toText(head ? part.slice(head[0].length) : part).slice(0, Math.max(0, budget));
      budget -= body.length;
      return { i: id, h: head ? toText(head[2]) : '', b: body };
    })
    .filter((sec) => sec.h || sec.b);
}

/** Turns one built page (with heading ids already added) into an index record, or undefined if it has no main content. */
export function toRecord(route, html) {
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1];
  if (!main) return undefined;
  const title = toText(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? '');
  const description = html.match(/<meta name="description" content="([^"]*)"/i)?.[1] ?? '';
  return { u: route === '' ? '/' : `/${route}/`, t: title, d: toText(description), s: sectionsOf(main) };
}

async function build(distDir) {
  const byLang = Object.fromEntries(LANGS.map((l) => [l, []]));
  for await (const file of htmlFiles(distDir)) {
    const rel = relative(distDir, file).split(sep).join('/');
    if (SKIP.some((re) => re.test(rel))) continue;
    const route = rel.replace(/(^|\/)index\.html$/, '').replace(/\.html$/, '');
    const original = await readFile(file, 'utf8');
    const html = addHeadingIds(original);
    if (html !== original) await writeFile(file, html);
    const record = toRecord(route, html);
    if (record) byLang[langOf(route)].push(record);
  }
  for (const l of LANGS) {
    byLang[l].sort((a, b) => a.u.localeCompare(b.u));
    await writeFile(join(distDir, `search-index-${l}.json`), JSON.stringify(byLang[l]));
  }
  return byLang;
}

export default function searchIndex() {
  return {
    name: 'search-index',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const byLang = await build(fileURLToPath(dir));
        logger.info(`search index: ${LANGS.map((l) => `${l} ${byLang[l].length}`).join(', ')} pages`);
      },
    },
  };
}
