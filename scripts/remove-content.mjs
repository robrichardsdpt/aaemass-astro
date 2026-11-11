// Deletes CMS content that was marked "Remove from the website", together with its Spanish and French copies.
//
//   node scripts/remove-content.mjs                         every entry marked removed
//   node scripts/remove-content.mjs --entries "events/my-event, pages/old-page"      those entries (even if not marked)
//   node scripts/remove-content.mjs --dry-run               show what would be deleted
//
// Why this exists: Decap deletes a published entry by committing straight to main, which the branch rules (a pull
// request, owner approval and a finished preview) rightly refuse. So the CMS only *marks* an entry removed (the site
// already hides it), and the Remove content workflow runs this to delete the files in a pull request the owner approves.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';

// kind -> where the English files live, their extension, and where the translated copies live
export const KINDS = {
  events: { dir: 'src/content/events', ext: '.md', i18n: 'src/content/events-i18n' },
  pages: { dir: 'src/content/pages', ext: '.yml', i18n: 'src/content/pages-i18n' },
  committees: { dir: 'src/content/committees', ext: '.yml', i18n: 'src/content/committees-i18n' },
  districts: { dir: 'src/content/districts', ext: '.yml', i18n: null },
};
const LANGS = ['es', 'fr'];

/** The settings at the top of a content file: YAML for .yml, frontmatter for .md. */
function readData(file) {
  const raw = fs.readFileSync(file, 'utf8');
  if (file.endsWith('.md')) {
    const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    return (m ? parse(m[1]) : {}) ?? {};
  }
  return parse(raw) ?? {};
}

/** Every entry whose file says "removed: true". */
export function findRemoved(root) {
  const found = [];
  for (const [kind, k] of Object.entries(KINDS)) {
    const dir = path.join(root, k.dir);
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) {
      if (!f.endsWith(k.ext)) continue;
      if (readData(path.join(dir, f)).removed === true) found.push({ kind, name: f.slice(0, -k.ext.length) });
    }
  }
  return found;
}

/** Turns "events/my-event, src/content/pages/old.yml" (commas, spaces or new lines) into entries; throws on a bad one. */
export function resolveEntries(root, text) {
  const out = [];
  for (const raw of text.split(/[\s,]+/).filter(Boolean)) {
    const token = raw.replace(/^src\/content\//, '');
    const [kind, ...rest] = token.split('/');
    const k = KINDS[kind];
    if (!k || rest.length !== 1) throw new Error(`"${raw}" is not an entry. Use kind/name, for example events/2026-12-holiday-dinner (kinds: ${Object.keys(KINDS).join(', ')}).`);
    const name = rest[0].endsWith(k.ext) ? rest[0].slice(0, -k.ext.length) : rest[0];
    if (!/^[\w.-]+$/.test(name)) throw new Error(`"${raw}" has characters that are not allowed in an entry name.`);
    if (!fs.existsSync(path.join(root, k.dir, name + k.ext))) throw new Error(`"${raw}" does not exist (looked for ${k.dir}/${name}${k.ext}).`);
    out.push({ kind, name });
  }
  return out;
}

/** The files to delete for one entry: the English file plus whichever translated copies exist. */
export function filesFor(root, { kind, name }) {
  const k = KINDS[kind];
  const files = [path.join(k.dir, name + k.ext)];
  if (k.i18n) for (const lang of LANGS) files.push(path.join(k.i18n, lang, name + k.ext));
  return files.filter((f) => fs.existsSync(path.join(root, f)));
}

export function removeEntries(root, entries, { dryRun = false } = {}) {
  const deleted = [];
  for (const entry of entries) {
    for (const f of filesFor(root, entry)) {
      if (!dryRun) fs.rmSync(path.join(root, f));
      deleted.push(f);
    }
  }
  return deleted;
}

// ---------------------------------------------------------------- command line
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const given = args.includes('--entries') ? args[args.indexOf('--entries') + 1] : '';
  const dryRun = args.includes('--dry-run');
  const root = process.cwd();
  let entries;
  try {
    entries = given.trim() ? resolveEntries(root, given) : findRemoved(root);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
  if (!entries.length) {
    console.log('Nothing to remove.');
    process.exit(0);
  }
  const deleted = removeEntries(root, entries, { dryRun });
  console.log(`${dryRun ? 'Would remove' : 'Removed'} ${entries.length} entr${entries.length === 1 ? 'y' : 'ies'} (${deleted.length} files):`);
  for (const f of deleted) console.log(`  ${f}`);
  fs.writeFileSync(path.join(root, '.remove-report.md'), entries.map((e) => `- ${e.kind}/${e.name}`).join('\n'));
}
