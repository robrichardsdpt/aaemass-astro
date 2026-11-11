// Keeps one DeepL glossary in step with glossary/aa-terms.tsv, so the machine translation uses AA's own wording.
//
// The file has three tab-separated columns: English, Spanish, French (lines starting with # are comments). It is
// uploaded as a single multilingual glossary (one dictionary per language), named after a hash of the file, so:
//   - nothing is uploaded when the file has not changed;
//   - when it changes, the old glossary is deleted and a new one is created (never more than one is kept, which
//     also fits DeepL accounts that are limited to a single glossary).
// If anything goes wrong (for example the plan does not allow glossaries) translation carries on without one.
import crypto from 'node:crypto';
import fs from 'node:fs';

const NAME = 'area30-aa-terms';

/** Parses the TSV into { es: [[en, es], ...], fr: [[en, fr], ...] }, skipping blanks, comments and duplicates. */
export function parseGlossary(text) {
  const out = { es: [], fr: [] };
  const seen = { es: new Set(), fr: new Set() };
  const lines = text.split(/\r?\n/).filter((l) => l.trim() && !l.startsWith('#'));
  const [header, ...rows] = lines;
  if (!/^en\tes\tfr\s*$/i.test(header ?? '')) throw new Error('glossary/aa-terms.tsv must start with the header "en<TAB>es<TAB>fr"');
  for (const row of rows) {
    const [en, es, fr] = row.split('\t').map((c) => (c ?? '').trim());
    if (!en) continue;
    for (const [lang, term] of [['es', es], ['fr', fr]]) {
      if (term && !seen[lang].has(en.toLowerCase())) {
        seen[lang].add(en.toLowerCase());
        out[lang].push([en, term]);
      }
    }
  }
  return out;
}

const tsv = (pairs) => pairs.map(([a, b]) => `${a}\t${b}`).join('\n');

/**
 * Makes sure the glossary on the DeepL account matches the file. Returns its id, or null when there is none.
 * @param {{ key: string, file?: string, log?: (m: string) => void, fetchImpl?: typeof fetch }} o
 */
export async function ensureGlossary({ key, file = 'glossary/aa-terms.tsv', log = console.log, fetchImpl = fetch }) {
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, 'utf8');
  const hash = crypto.createHash('sha256').update(raw).digest('hex').slice(0, 12);
  const name = `${NAME}-${hash}`;
  const host = key.endsWith(':fx') ? 'api-free.deepl.com' : 'api.deepl.com';
  const call = (method, path, body) =>
    fetchImpl(`https://${host}${path}`, {
      method,
      headers: { Authorization: `DeepL-Auth-Key ${key}`, 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
  try {
    const parsed = parseGlossary(raw);
    const dictionaries = ['es', 'fr']
      .filter((l) => parsed[l].length)
      .map((l) => ({ source_lang: 'en', target_lang: l, entries: tsv(parsed[l]), entries_format: 'tsv' }));
    if (!dictionaries.length) return null;

    const list = await call('GET', '/v3/glossaries');
    if (!list.ok) throw new Error(`could not list glossaries (${list.status})`);
    const data = await list.json();
    const ours = (data.glossaries ?? data ?? []).filter((g) => typeof g.name === 'string' && g.name.startsWith(NAME));

    const current = ours.find((g) => g.name === name);
    if (current) {
      log(`glossary: up to date (${name})`);
      return current.glossary_id;
    }
    for (const old of ours) {
      const del = await call('DELETE', `/v3/glossaries/${old.glossary_id}`);
      if (!del.ok) throw new Error(`could not remove the old glossary (${del.status})`);
    }
    const res = await call('POST', '/v3/glossaries', { name, dictionaries });
    if (!res.ok) throw new Error(`could not create the glossary (${res.status}: ${(await res.text()).slice(0, 160)})`);
    const made = await res.json();
    log(`glossary: uploaded ${name} (${dictionaries.map((d) => `${d.target_lang} ${parsed[d.target_lang].length}`).join(', ')} terms)`);
    return made.glossary_id;
  } catch (e) {
    log(`glossary: skipped, translating without it (${e.message})`);
    return null;
  }
}
