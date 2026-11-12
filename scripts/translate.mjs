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
//   events/<name>.md       -> events-i18n/<lang>/<name>.md   (title, summary, image description and details)
//   site/<page>.yml        -> site-i18n/<lang>/<page>.yml    (Home, Contribute, Resources, ... and any "Extra sections"; only the texts
//                             whose English changed since the translation in src/i18n/pages/*.ts was written, one record per text)
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
import { ensureGlossary } from './glossary.mjs';
import { mask, unmask, markdownPieces } from './translate-text.mjs';
import { leavesOf, hashOf as leafHash } from '../src/lib/leaf-paths.ts';
import { SITE_PAGES } from '../src/lib/site-page-specs.ts';
import { pathToFileURL } from 'node:url';

const args = process.argv.slice(2);
const flag = (n) => args.includes(`--${n}`);
const opt = (n) => (args.includes(`--${n}`) ? args[args.indexOf(`--${n}`) + 1] : undefined);
const LANGS = (opt('lang') ?? 'es,fr').split(',');
const DRY = flag('dry-run');
const KEY = process.env.DEEPL_AUTH_KEY;
const MOCK = process.env.TRANSLATE_PROVIDER === 'mock';
const root = process.cwd();
let GLOSSARY_ID = process.env.DEEPL_GLOSSARY_ID || null; // normally found or created automatically from glossary/aa-terms.tsv

// ------------------------------------------------------------------ which files
function git(...a) {
  return execFileSync('git', a, { encoding: 'utf8' }).split('\n').filter(Boolean);
}
const sourceFiles = (dir) => (fs.existsSync(path.join(root, dir)) ? fs.readdirSync(path.join(root, dir)) : []).filter((f) => /\.(yml|md)$/.test(f)).map((f) => `${dir}/${f}`);
let files;
if (opt('files')) files = opt('files').split(',');
else if (flag('all')) files = [...sourceFiles('src/content/pages'), ...sourceFiles('src/content/committees'), ...sourceFiles('src/content/events'), ...Object.keys(SITE_PAGES).map((n) => `src/content/site/${n}.yml`)];
else files = git('diff', '--name-only', '--diff-filter=AM', `${opt('base') ?? 'origin/main'}...HEAD`);
files = files.filter((f) => /^src\/content\/((pages|committees)\/[^/]+\.yml|events\/[^/]+\.md|site\/(home|contribute|resources|literature|aa|registrar|volunteer|calendar|service)\.yml)$/.test(f) && fs.existsSync(path.join(root, f)));

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
        non_splitting_tags: ['l'],
        formality: 'prefer_more',
        ...(GLOSSARY_ID ? { glossary_id: GLOSSARY_ID } : {}),
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
  return raw.map((t, i) => {
    const out = unmask(t, prepared[i].kept);
    const marks = (x) => (x.match(/\*\*/g) ?? []).length;
    if (marks(out) !== marks(strings[i])) throw new Error(`bold markers were changed while translating ("${strings[i].slice(0, 40)}...")`);
    return out;
  });
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

/** Events are Markdown with YAML frontmatter. Only the words are translated; dates, places and links stay as written. */
function splitEvent(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) throw new Error('not an event file (no frontmatter)');
  return { data: parse(m[1]) ?? {}, body: m[2] };
}
async function translateEvent(raw, lang) {
  const { data, body } = splitEvent(raw);
  const front = await translateObject(drop({ title: data.title, summary: data.summary, image_alt: data.image_alt }), lang);
  // Headings and list items are translated line by line (markers kept), paragraphs whole, so the layout survives.
  const { pieces, assemble } = markdownPieces(body, translatable);
  const done = await translateStrings(pieces, lang);
  return { front, body: assemble(done) };
}

// ------------------------------------------------------------------ site pages (Site settings in the CMS)
// The wording of Home, Contribute and the other code-driven pages lives in src/i18n/pages/*.ts (English, Spanish, French).
// An editor's English goes in src/content/site/<page>.yml. For each text there that is not covered by the translation already
// in the code (new, or changed since), one machine translation is stored, with a hash of the English it was made from; the
// build uses it only while that hash still matches. A text a reviewer corrected by hand is kept until its English changes.
const SITE_CODE = { home: ['home', 'home'], contribute: ['contribute', 'contribute'], resources: ['resources', 'resources'], literature: ['literature', 'literatureMsgs'], aa: ['aa', 'aa'], registrar: ['registrar', 'registrar'], volunteer: ['volunteer', 'volunteer'], calendar: ['calendar', 'calendar'] };
const load = (rel) => import(pathToFileURL(path.join(root, rel)).href);
async function siteCode(name) {
  if (name === 'service') {
    const [{ serviceEn }, { service }] = await Promise.all([load('src/i18n/pages/service-en.ts'), load('src/i18n/pages/service.ts')]);
    return { en: serviceEn, es: service.es, fr: service.fr };
  }
  const [file, exportName] = SITE_CODE[name];
  return (await load(`src/i18n/pages/${file}.ts`))[exportName];
}

async function translateSite(name, raw, lang, target) {
  const { extra_blocks = [], ...text } = parse(raw) ?? {};
  const code = await siteCode(name);
  const leaves = [
    ...leavesOf(text, code.en, code[lang], { children: SITE_PAGES[name] }),
    ...leavesOf(extra_blocks, undefined, undefined, undefined, ['extra_blocks']),
  ];
  const old = fs.existsSync(path.join(root, target)) ? (parse(fs.readFileSync(path.join(root, target), 'utf8'))?.t ?? {}) : {};
  const kept = {};
  const todo = [];
  for (const l of leaves) {
    if (l.skip) continue;
    const h = leafHash(l.text);
    if (old[l.id]?.h === h) kept[l.id] = old[l.id]; // already translated from exactly this English (or corrected by a reviewer)
    else if (l.codeT !== undefined && l.code === l.text) continue; // the translation in the code is for exactly this English
    else todo.push({ id: l.id, h, text: l.text });
  }
  const changed = todo.length > 0 || Object.keys(old).length !== Object.keys(kept).length;
  if (!changed) return { changed: false, count: 0 };
  if (DRY) return { changed: true, count: todo.length };
  const done = await translateStrings(todo.map((x) => x.text), lang);
  todo.forEach((x, i) => (kept[x.id] = { h: x.h, t: done[i] }));
  // Keep the records in the order the texts appear on the page, so changes show up cleanly in a pull request.
  const ordered = Object.fromEntries(leaves.map((l) => l.id).filter((id) => kept[id]).map((id) => [id, kept[id]]));
  fs.mkdirSync(path.dirname(path.join(root, target)), { recursive: true });
  const note = '# Machine translation (DeepL) of text edited in the CMS. Each record is used only while its hash matches the English.\n# To correct a translation, edit t: and leave h: alone. Needs review by a bilingual AA member (docs/TRANSLATION.md).\n';
  fs.writeFileSync(path.join(root, target), note + stringify({ t: ordered }, { lineWidth: 0 }));
  return { changed: true, count: todo.length };
}

// ------------------------------------------------------------------ run
if (!MOCK && !KEY && !DRY) {
  console.log('DEEPL_AUTH_KEY is not set, so nothing was translated. (See docs/TRANSLATION.md.)');
  process.exit(0);
}

const needsTranslating = files.length > 0 && !DRY && !MOCK;
if (needsTranslating && !GLOSSARY_ID) GLOSSARY_ID = await ensureGlossary({ key: KEY });

const report = [];
let wrote = 0;
let failed = 0;
for (const file of files) {
  const raw = fs.readFileSync(path.join(root, file), 'utf8');
  if (file.startsWith('src/content/site/')) {
    const name = path.basename(file, '.yml');
    for (const lang of LANGS) {
      const target = `src/content/site-i18n/${lang}/${name}.yml`;
      try {
        const r = await translateSite(name, raw, lang, target);
        if (!r.changed) console.log(`skip   ${target} (nothing new to translate)`);
        else if (DRY) console.log(`would translate ${r.count} text(s) of ${file} -> ${target}`);
        else {
          console.log(`wrote  ${target} (${r.count} text(s))`);
          report.push(`- ${target}`);
          wrote++;
        }
      } catch (e) {
        failed++;
        console.log(`FAILED ${target}: ${e.message}`);
        report.push(`- ${target}: **${e.message}**`);
      }
    }
    continue;
  }
  const hash = hashOf(raw);
  const kind = file.includes('/committees/') ? 'committees' : file.includes('/events/') ? 'events' : 'pages';
  const en = kind === 'events' ? null : parse(raw);
  const name = path.basename(file).replace(/\.(yml|md)$/, '');
  if ((kind === 'events' ? splitEvent(raw).data.removed : en?.removed) === true) {
    console.log(`skip   ${file} (marked "Remove from the website")`);
    continue;
  }
  for (const lang of LANGS) {
    const target = `src/content/${kind}-i18n/${lang}/${name}.${kind === 'events' ? 'md' : 'yml'}`;
    const existingRaw = fs.existsSync(path.join(root, target)) ? fs.readFileSync(path.join(root, target), 'utf8') : null;
    const existing = existingRaw ? (kind === 'events' ? splitEvent(existingRaw).data : parse(existingRaw)) : null;
    if (existing?.sourceHash === hash) {
      console.log(`skip   ${target} (English unchanged)`);
      continue;
    }
    if (DRY) {
      console.log(`would translate ${file} -> ${target}`);
      continue;
    }
    try {
      fs.mkdirSync(path.dirname(path.join(root, target)), { recursive: true });
      if (kind === 'events') {
        const { front, body } = await translateEvent(raw, lang);
        fs.writeFileSync(path.join(root, target), `---\n${stringify({ sourceHash: hash, ...front }, { lineWidth: 0 })}---\n${body}`);
      } else {
        const result = kind === 'pages' ? await translatePage(en, lang) : await translateCommittee(en, lang);
        fs.writeFileSync(path.join(root, target), stringify({ sourceHash: hash, ...result }, { lineWidth: 0 }));
      }
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
