// Automatic Spanish and French for CMS content, using the free DeepL API (500,000 characters a month on the Free plan).
//
//   node scripts/translate.mjs --base origin/main        translate English files changed since that ref
//   node scripts/translate.mjs --files src/content/committees/archives.yml
//   node scripts/translate.mjs --all                      translate everything (only files whose English changed)
//   node scripts/translate.mjs --base origin/main --dry-run
//
// What it translates (English -> src/content/...):
//   pages/<name>.yml       -> pages-i18n/<lang>/<name>.yml
//   committees/<slug>.yml  -> committees-i18n/<lang>/<slug>.yml
// Each output stores a hash of the English it came from (sourceHash), so unchanged files are skipped and a hand edit
// by a bilingual reviewer is kept until the English changes again.
//
// It translates one piece of text at a time and puts the result back in the same place, so structure, links, emails
// and settings can never be mangled. URLs, emails and {placeholders} are masked while translating and checked afterwards.
// Machine translations stay hidden from search until a bilingual AA member lists them in src/i18n/reviewed.json.
//
// Needs DEEPL_AUTH_KEY (a ":fx" key means the Free plan). TRANSLATE_PROVIDER=mock translates nothing and is for tests.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { parse, stringify } from 'yaml';

const args = process.argv.slice(2);
const flag = (n) => args.includes(`--${n}`);
const opt = (n) => (args.includes(`--${n}`) ? args[args.indexOf(`--${n}`) + 1] : undefined);
const LANGS = (opt('lang') ?? 'es,fr').split(',');
const DRY = flag('dry-run');
const KEY = process.env.DEEPL_AUTH_KEY;
const MOCK = process.env.TRANSLATE_PROVIDER === 'mock';
const root = process.cwd();

// ------------------------------------------------------------------ which files
function git(...a) {
  return execFileSync('git', a, { encoding: 'utf8' }).split('\n').filter(Boolean);
}
const sourceFiles = (dir) => fs.readdirSync(path.join(root, dir)).filter((f) => f.endsWith('.yml')).map((f) => `${dir}/${f}`);
let files;
if (opt('files')) files = opt('files').split(',');
else if (flag('all')) files = [...sourceFiles('src/content/pages'), ...sourceFiles('src/content/committees')];
else files = git('diff', '--name-only', '--diff-filter=AM', `${opt('base') ?? 'origin/main'}...HEAD`);
files = files.filter((f) => /^src\/content\/(pages|committees)\/[^/]+\.yml$/.test(f) && fs.existsSync(path.join(root, f)));

// ------------------------------------------------------------------ masking
// Things that must come back exactly as they went in.
const MASK = /\]\([^)]*\)|https?:\/\/[^\s)<>"]+|[\w.+-]+@[\w-]+(?:\.[\w-]+)+|\{[A-Za-z]+\}/g;
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const unesc = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

function mask(text) {
  const kept = [];
  const masked = esc(text).replace(MASK, (m) => {
    // The mask matched the escaped text, so un-escape what we store.
    kept.push(unesc(m));
    const isLinkTail = m.startsWith('](');
    return isLinkTail ? `]<x id="${kept.length - 1}"/>` : `<x id="${kept.length - 1}"/>`;
  });
  return { masked, kept };
}
function unmask(translated, kept) {
  let out = translated;
  kept.forEach((k, i) => {
    const tag = new RegExp(`<x id="${i}"\\s*/>|<x id="${i}"></x>`);
    if (!tag.test(out)) throw new Error(`a link or address was lost while translating ("${k}")`);
    out = out.replace(tag, () => k);
  });
  return unesc(out);
}

// ------------------------------------------------------------------ DeepL
const TARGET = { es: 'ES', fr: 'FR' };
async function deepl(texts, lang) {
  const host = KEY.endsWith(':fx') ? 'api-free.deepl.com' : 'api.deepl.com';
  const out = [];
  for (let i = 0; i < texts.length; i += 40) {
    const chunk = texts.slice(i, i + 40);
    const res = await fetch(`https://${host}/v2/translate`, {
      method: 'POST',
      headers: { Authorization: `DeepL-Auth-Key ${KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: chunk,
        source_lang: 'EN',
        target_lang: TARGET[lang],
        tag_handling: 'xml',
        ignore_tags: ['x'],
        formality: 'prefer_more',
        ...(process.env.DEEPL_GLOSSARY_ID ? { glossary_id: process.env.DEEPL_GLOSSARY_ID } : {}),
      }),
    });
    if (res.status === 456) throw new Error('DeepL free monthly limit reached; try again next month');
    if (!res.ok) throw new Error(`DeepL error ${res.status}: ${(await res.text()).slice(0, 200)}`);
    out.push(...(await res.json()).translations.map((t) => t.text));
  }
  return out;
}
const mock = async (texts, lang) => texts.map((t) => `[${lang}] ${t}`);

/** Translates plain strings (with links and emails masked), returning them in order. */
async function translateStrings(strings, lang) {
  if (!strings.length) return [];
  const prepared = strings.map(mask);
  const raw = await (MOCK ? mock : deepl)(prepared.map((p) => p.masked), lang);
  return raw.map((t, i) => unmask(t, prepared[i].kept));
}

// ------------------------------------------------------------------ what counts as text
// Keys whose values are settings, links or names of files, never words.
const SKIP_KEYS = new Set(['type', 'url', 'link_url', 'href', 'join_url', 'image', 'email', 'style', 'flip', 'count', 'show_calendar_link', 'noindex', 'by', 'sourceHash']);
const translatable = (s) => typeof s === 'string' && /\p{L}/u.test(s) && !/^(https?:\/\/|mailto:|\/)\S*$/.test(s.trim());

/** Walks an object, returning the leaf strings worth translating with a setter for each. */
function leaves(node, key = '', parent = null, slot = null, acc = []) {
  if (typeof node === 'string') {
    if (!SKIP_KEYS.has(key) && translatable(node)) acc.push({ text: node, set: (v) => (parent[slot] = v) });
  } else if (Array.isArray(node)) {
    node.forEach((v, i) => leaves(v, key, node, i, acc));
  } else if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) leaves(v, k, node, k, acc);
  }
  return acc;
}
async function translateObject(obj, lang) {
  const copy = structuredClone(obj);
  const found = leaves(copy);
  const done = await translateStrings(found.map((l) => l.text), lang);
  found.forEach((l, i) => l.set(done[i]));
  return copy;
}

// ------------------------------------------------------------------ per kind
const hashOf = (text) => crypto.createHash('sha256').update(text).digest('hex').slice(0, 16);
const drop = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== null));

async function translatePage(en, lang) {
  const { sourceHash, ...rest } = await translateObject(en, lang);
  return rest;
}

async function translateCommittee(en, lang) {
  // Shape matches CommitteeText in src/i18n/pages/committees.ts.
  const src = {
    name: en.title,
    tile: `${en.title} Committee`,
    label: `${en.title} Committee`,
    eyebrow: en.eyebrow,
    seoTitle: en.seo_title,
    lede: en.lede,
    description: en.description,
    quote: en.quote,
    sections: (en.sections ?? []).map((s) => drop({ title: s.title, paras: s.paras, items: s.items, links: s.links?.map((l) => l.text) })),
    meeting: en.meeting && drop({ intro: en.meeting.intro, lines: en.meeting.lines, joinText: en.meeting.join?.text }),
    cta: en.cta,
    more: en.more?.text,
  };
  const out = await translateObject(drop(src), lang);
  // A committee with no page of its own only needs its name; the page text is not required.
  if (en.page_type !== 'standard') {
    return drop({ name: out.name, tile: out.tile, label: out.label, eyebrow: out.name, lede: out.name, description: out.name, cta: out.name });
  }
  return out;
}

// ------------------------------------------------------------------ run
if (!MOCK && !KEY && !DRY) {
  console.log('DEEPL_AUTH_KEY is not set, so nothing was translated. (See docs/TRANSLATION.md.)');
  process.exit(0);
}

const report = [];
let wrote = 0;
let failed = 0;
for (const file of files) {
  const raw = fs.readFileSync(path.join(root, file), 'utf8');
  const hash = hashOf(raw);
  const en = parse(raw);
  const kind = file.includes('/committees/') ? 'committees' : 'pages';
  const name = path.basename(file, '.yml');
  for (const lang of LANGS) {
    const target = `src/content/${kind}-i18n/${lang}/${name}.yml`;
    const existing = fs.existsSync(path.join(root, target)) ? parse(fs.readFileSync(path.join(root, target), 'utf8')) : null;
    if (existing?.sourceHash === hash) {
      console.log(`skip   ${target} (English unchanged)`);
      continue;
    }
    if (DRY) {
      console.log(`would translate ${file} -> ${target}`);
      continue;
    }
    try {
      const result = kind === 'pages' ? await translatePage(en, lang) : await translateCommittee(en, lang);
      fs.mkdirSync(path.dirname(path.join(root, target)), { recursive: true });
      fs.writeFileSync(path.join(root, target), stringify({ sourceHash: hash, ...result }, { lineWidth: 0 }));
      console.log(`wrote  ${target}`);
      report.push(`- ${target}`);
      wrote++;
    } catch (e) {
      failed++;
      console.log(`FAILED ${target}: ${e.message}`);
      report.push(`- ${target}: **${e.message}**`);
    }
  }
}
console.log(`\n${files.length} English file(s) checked, ${wrote} translation(s) written, ${failed} failed`);
if (process.env.GITHUB_STEP_SUMMARY && report.length) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `### Translations\n${report.join('\n')}\n`);
fs.writeFileSync(path.join(root, '.translate-report.md'), report.join('\n'));
process.exit(failed ? 1 : 0);
