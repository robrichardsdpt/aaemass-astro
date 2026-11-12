// node scripts/translate.test.mjs : tests the text helpers used by the translation script (no network, no key).
import assert from 'node:assert/strict';
import { mask, unmask, markdownPieces } from './translate-text.mjs';

// links, addresses and placeholders survive a round trip, with the translated words changing around them
const src = 'Email [the committee](mailto:a@b.org) or see https://x.org/a?b=1&c=2 & write to {email}. Use <b> too.';
const m = mask(src);
assert.ok(!/mailto|https:\/\/|\{email\}|[\[\]]/.test(m.masked), 'no brackets, addresses or placeholders reach the translator');
assert.ok(m.masked.includes('<l id="0">the committee</l>'), 'the link text stays, wrapped in a tag');
assert.equal(unmask(m.masked, m.kept), src, 'unmasking restores the text exactly');
const translated = m.masked.replace('Email', 'Escriba a').replace('the committee', 'el comité').replace('or see', 'o vea').replace('write to', 'escriba a');
assert.equal(unmask(translated, m.kept), 'Escriba a [el comité](mailto:a@b.org) o vea https://x.org/a?b=1&c=2 & escriba a {email}. Use <b> too.', 'words change, links do not');
assert.equal(unmask(m.masked.replace('<l id="0">the committee</l>', '<l id="0"> the committee </l>'), m.kept), src, 'stray spaces inside a link tag are trimmed');
assert.throws(() => unmask(m.masked.replace('<l id="0">the committee</l>', 'the committee'), m.kept), /lost/, 'a lost link is an error, not silent damage');
assert.throws(() => unmask('lost it', m.kept), /lost/, 'a lost address is an error, not silent damage');
const two = mask('See [a](u1) and [b](u2).');
assert.equal(unmask(two.masked, two.kept), 'See [a](u1) and [b](u2).', 'several links in one sentence');

// glossary popovers keep their id, and only the label is translated
const term = mask('A General Service Conference [[delegate|Delegate]] comes from an area; see [[gsr|GSRs]].');
assert.ok(!/\[\[|\]\]|delegate\||gsr\|/.test(term.masked), 'the popover codes never reach the translator');
assert.equal(unmask(term.masked, term.kept), 'A General Service Conference [[delegate|Delegate]] comes from an area; see [[gsr|GSRs]].', 'round trip');
assert.equal(unmask(term.masked.replace('>Delegate<', '>delegado<'), term.kept), 'A General Service Conference [[delegate|delegado]] comes from an area; see [[gsr|GSRs]].', 'the label changes, the id does not');

// markdown layout
const body = 'Hello there.\n\n## What to bring\n\n- A dish\n- A plate\n\n1. First\n2. Second\n\nA paragraph\nover two lines.\n\n---\n\n> A quote';
const { pieces, assemble } = markdownPieces(body, (s) => /\p{L}/u.test(s));
assert.deepEqual(pieces, ['Hello there.', 'What to bring', 'A dish', 'A plate', 'First', 'Second', 'A paragraph\nover two lines.', 'A quote'], 'headings, list items and quotes are separate pieces without their markers');
assert.equal(assemble(pieces), body, 'putting the pieces back gives the original layout');
assert.equal(assemble(pieces.map((p) => p.toUpperCase())), body.replace('Hello there.', 'HELLO THERE.').replace('What to bring', 'WHAT TO BRING').replace('A dish', 'A DISH').replace('A plate', 'A PLATE').replace('First', 'FIRST').replace('Second', 'SECOND').replace('A paragraph\nover two lines.', 'A PARAGRAPH\nOVER TWO LINES.').replace('A quote', 'A QUOTE'), 'only the words change; markers, blank lines and rules stay');
console.log('translate text tests passed');
