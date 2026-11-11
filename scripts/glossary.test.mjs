// node scripts/glossary.test.mjs : tests the glossary sync against a fake DeepL (no network, no key).
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { parseGlossary, ensureGlossary } from './glossary.mjs';

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'gl-'));
const file = path.join(tmp, 'g.tsv');
const write = (rows) => fs.writeFileSync(file, `# comment\nen\tes\tfr\n${rows}\n`);

// parsing
write('GSR\tRSG\tRSG\nDelegate\tDelegado\t\nDelegate\tOtro\tX\n\nBig Book\t\tGros Livre');
const p = parseGlossary(fs.readFileSync(file, 'utf8'));
assert.deepEqual(p.es, [['GSR', 'RSG'], ['Delegate', 'Delegado']], 'es: skips empty cells and duplicate English terms');
assert.deepEqual(p.fr, [['GSR', 'RSG'], ['Delegate', 'X'], ['Big Book', 'Gros Livre']], 'fr: skips empty cells, and dedupes per language (the first Delegate row had no French)');
assert.throws(() => parseGlossary('a\tb\tc\nx\ty\tz'), /header/, 'a wrong header is rejected');

// a fake DeepL
function fake({ existing = [], listStatus = 200, createStatus = 201 } = {}) {
  const calls = [];
  const impl = async (url, init) => {
    const u = new URL(url);
    calls.push(`${init.method} ${u.pathname}`);
    const reply = (status, body) => ({ ok: status < 300, status, json: async () => body, text: async () => JSON.stringify(body) });
    if (init.method === 'GET') return reply(listStatus, { glossaries: existing });
    if (init.method === 'DELETE') return reply(204, {});
    if (init.method === 'POST') { calls[calls.length - 1] += ` ${JSON.stringify(JSON.parse(init.body).dictionaries.map((d) => [d.target_lang, d.entries.split('\n').length]))}`; return reply(createStatus, { glossary_id: 'new-id' }); }
  };
  return { impl, calls };
}
const run = (f) => ensureGlossary({ key: 'k:fx', file, log: () => {}, fetchImpl: f.impl });

write('GSR\tRSG\tRSG\nDelegate\tDelegado\tDélégué');
let f = fake();
assert.equal(await run(f), 'new-id', 'creates a glossary when there is none');
assert.deepEqual(f.calls, ['GET /v3/glossaries', 'POST /v3/glossaries [["es",2],["fr",2]]'], 'one request creates both languages');

// the name embeds a hash of the file; reuse it when unchanged
let created;
const f2 = fake();
const orig = f2.impl;
f2.impl = async (url, init) => { if (init.method === 'POST') created = JSON.parse(init.body).name; return orig(url, init); };
await run(f2);
const f3 = fake({ existing: [{ glossary_id: 'same', name: created }] });
assert.equal(await run(f3), 'same', 'reuses the glossary when the file is unchanged');
assert.deepEqual(f3.calls, ['GET /v3/glossaries'], 'and uploads nothing');

const f4 = fake({ existing: [{ glossary_id: 'old', name: 'area30-aa-terms-000000000000' }, { glossary_id: 'other', name: 'someone-elses' }] });
assert.equal(await run(f4), 'new-id', 'replaces an outdated glossary');
assert.deepEqual(f4.calls.slice(0, 2), ['GET /v3/glossaries', 'DELETE /v3/glossaries/old'], 'deletes only our own old glossary, before creating (accounts limited to one)');

assert.equal(await run(fake({ listStatus: 403 })), null, 'carries on without a glossary when listing fails');
assert.equal(await run(fake({ createStatus: 400 })), null, 'carries on without a glossary when creating fails');
assert.equal(await ensureGlossary({ key: 'k', file: path.join(tmp, 'missing.tsv'), log: () => {}, fetchImpl: fake().impl }), null, 'no file means no glossary');

// the real file parses
const real = parseGlossary(fs.readFileSync('glossary/aa-terms.tsv', 'utf8'));
assert.ok(real.es.length > 20 && real.fr.length > 20, 'glossary/aa-terms.tsv parses');
console.log(`glossary tests passed (real file: ${real.es.length} Spanish, ${real.fr.length} French terms)`);
