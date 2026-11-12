// node --test scripts/leaf-paths.test.mjs : how the build and the translation script match an editor's English to translations.
import test from 'node:test';
import assert from 'node:assert/strict';
import { localize, leavesOf, translatable, hashOf, merge } from '../src/lib/leaf-paths.ts';

const entry = { children: { steps: { key: 'title' }, gives: { key: null } } };
const codeEn = { h1: 'Hello', steps: [{ title: 'One', text: 'First' }, { title: 'Two', text: 'Second' }], gives: ['A', 'B'] };
const codeEs = { h1: 'Hola', steps: [{ title: 'Uno', text: 'Primero' }, { title: 'Dos', text: 'Segundo' }], gives: ['a', 'b'] };
const none = { fresh: () => undefined };

test('unchanged English uses the translation in the code', () => {
  assert.deepEqual(localize(codeEn, codeEn, codeEs, entry, none), codeEs);
});

test('reordering, removing and adding list items keeps translations attached', () => {
  const en = { h1: 'Hello', steps: [{ title: 'Two', text: 'Second' }, { title: 'Three', text: 'Third' }], gives: ['B', 'C'] };
  const out = localize(en, codeEn, codeEs, entry, none);
  assert.deepEqual(out.steps, [{ title: 'Dos', text: 'Segundo' }, { title: 'Three', text: 'Third' }], 'a new item stays in English');
  assert.deepEqual(out.gives, ['b', 'C']);
});

test('changed English with no new translation keeps the old translation; with a fresh one, uses it', () => {
  const en = { ...codeEn, h1: 'Hello there' };
  assert.equal(localize(en, codeEn, codeEs, entry, none).h1, 'Hola');
  const fresh = (id, text) => (id === '["h1"]' && text === 'Hello there' ? 'Hola a todos' : undefined);
  assert.equal(localize(en, codeEn, codeEs, entry, { fresh }).h1, 'Hola a todos');
  assert.equal(localize({ ...codeEn, h1: 'Hello there again' }, codeEn, codeEs, entry, { fresh }).h1, 'Hola', 'a translation made for older English is ignored');
});

test('links, addresses and quotations are never translated', () => {
  const en = { href: 'https://x.org', email: 'a@b.org', label: 'Email {email}', quote: '@en:Keep me', to: 'findMeeting', title: '12 & 12' };
  const es = { href: 'XX', email: 'XX', label: 'Escribir a {email}', quote: 'XX', to: 'XX', title: 'Doce y doce' };
  const out = localize(en, en, es, undefined, none);
  assert.equal(out.href, 'https://x.org');
  assert.equal(out.email, 'a@b.org', 'an email address stays, though a field called email can hold words');
  assert.equal(out.label, 'Escribir a {email}');
  assert.equal(out.quote, '@en:Keep me');
  assert.equal(out.to, 'findMeeting');
  assert.equal(out.title, 'Doce y doce', 'text with no letters keeps the translation the code has');
  assert.ok(!translatable('mailto:a@b.org') && !translatable('/contact/') && !translatable('') && translatable('Hello'));
});

test('blocks an editor adds have no code translation: fresh translation or English', () => {
  const blocks = [{ type: 'callout', title: 'Hi', body: 'Body' }];
  const fresh = (id, text) => (id === '["extra_blocks",0,"title"]' ? 'Hola' : undefined);
  const out = localize(blocks, undefined, undefined, undefined, { fresh }, ['extra_blocks']);
  assert.deepEqual(out, [{ type: 'callout', title: 'Hola', body: 'Body' }]);
  const leaves = leavesOf(blocks, undefined, undefined, undefined, ['extra_blocks']).filter((l) => !l.skip);
  assert.deepEqual(leaves.map((l) => l.id), ['["extra_blocks",0,"title"]', '["extra_blocks",0,"body"]']);
});

test('merge replaces lists and merges groups', () => {
  assert.deepEqual(merge({ a: { b: 1, c: 2 }, l: [1, 2] }, { a: { b: 9 }, l: [3] }), { a: { b: 9, c: 2 }, l: [3] });
  assert.equal(hashOf('x'), hashOf('x'));
  assert.notEqual(hashOf('x'), hashOf('y'));
});
