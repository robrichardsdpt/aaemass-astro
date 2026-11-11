// node scripts/remove-content.test.mjs : tests the removal logic on a temporary content tree (nothing real is touched).
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { findRemoved, resolveEntries, filesFor, removeEntries } from './remove-content.mjs';

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'rm-'));
const put = (f, text) => { fs.mkdirSync(path.dirname(path.join(root, f)), { recursive: true }); fs.writeFileSync(path.join(root, f), text); };
put('src/content/events/a.md', '---\ntitle: A\nremoved: true\n---\nBody\n');
put('src/content/events/b.md', '---\ntitle: B\nremoved: false\n---\nBody\n');
put('src/content/events/.gitkeep', '');
put('src/content/events-i18n/es/a.md', '---\ntitle: A\n---\n');
put('src/content/events-i18n/fr/a.md', '---\ntitle: A\n---\n');
put('src/content/events-i18n/es/b.md', '---\ntitle: B\n---\n');
put('src/content/pages/old.yml', 'title: Old\nremoved: true\nblocks: []\n');
put('src/content/pages/keep.yml', 'title: Keep\nblocks: []\n');
put('src/content/pages-i18n/es/old.yml', 'title: Old\n');
put('src/content/committees/c1.yml', 'title: C1\nremoved: true\n');
put('src/content/districts/district-3.yml', 'name: D3\nlines: [x]\n');

assert.deepEqual(findRemoved(root).map((e) => `${e.kind}/${e.name}`).sort(), ['committees/c1', 'events/a', 'pages/old'], 'finds exactly the entries marked removed (not false, not unmarked, not .gitkeep)');
assert.deepEqual(filesFor(root, { kind: 'events', name: 'a' }).sort(), ['src/content/events-i18n/es/a.md', 'src/content/events-i18n/fr/a.md', 'src/content/events/a.md'], 'an entry includes its translated copies');
assert.deepEqual(filesFor(root, { kind: 'pages', name: 'old' }).sort(), ['src/content/pages-i18n/es/old.yml', 'src/content/pages/old.yml'], 'only translated copies that exist');

const picked = resolveEntries(root, 'events/b, src/content/districts/district-3.yml\npages/keep');
assert.deepEqual(picked.map((e) => `${e.kind}/${e.name}`), ['events/b', 'districts/district-3', 'pages/keep'], 'a pasted list works with commas, new lines and full paths');
assert.throws(() => resolveEntries(root, 'events/nope'), /does not exist/, 'a missing entry is an error');
assert.throws(() => resolveEntries(root, 'blog/x'), /not an entry/, 'an unknown kind is an error');
assert.throws(() => resolveEntries(root, '../../etc/passwd'), /not an entry|not allowed/, 'path tricks are rejected');
assert.throws(() => resolveEntries(root, 'events/../pages/keep'), /not an entry/, 'extra path parts are rejected');

const dry = removeEntries(root, [{ kind: 'events', name: 'a' }], { dryRun: true });
assert.equal(dry.length, 3, 'a dry run lists the files');
assert.ok(fs.existsSync(path.join(root, 'src/content/events/a.md')), 'and deletes nothing');
removeEntries(root, findRemoved(root));
assert.ok(!fs.existsSync(path.join(root, 'src/content/events/a.md')) && !fs.existsSync(path.join(root, 'src/content/events-i18n/fr/a.md')), 'a removed event and its translations are gone');
assert.ok(fs.existsSync(path.join(root, 'src/content/events/b.md')) && fs.existsSync(path.join(root, 'src/content/events-i18n/es/b.md')), 'other events and their translations are untouched');
assert.ok(fs.existsSync(path.join(root, 'src/content/events/.gitkeep')), 'the folder keeper stays');
assert.deepEqual(findRemoved(root), [], 'nothing is left marked');
console.log('remove-content tests passed');
