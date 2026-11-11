// node scripts/sanitize.test.mjs : tests the HTML cleaner for editor text (src/lib/sanitize.ts, run directly by Node).
import assert from 'node:assert/strict';
import { cleanHtml } from '../src/lib/sanitize.ts';

const gone = (html, ...needles) => { const out = cleanHtml(html); for (const n of needles) assert.ok(!out.toLowerCase().includes(n.toLowerCase()), `"${n}" survived in: ${out}`); return out; };

// script and event handlers
gone('<p>hi</p><script>alert(1)</script>', 'script', 'alert');
gone('<img src="x" onerror="alert(1)">', 'onerror', 'alert');
gone('<p onclick="alert(1)">x</p>', 'onclick', 'alert');
gone('<a href="https://ok.example" onmouseover="alert(1)">x</a>', 'onmouseover');
gone('<svg onload="alert(1)"><circle/></svg>', 'svg', 'onload', 'alert');
gone('<style>body{display:none}</style>x', 'style', 'display');
gone('<iframe src="https://evil.example"></iframe>', 'iframe', 'evil');
gone('<form action="https://evil.example"><input name="card"></form>', 'form', 'input', 'evil');
gone('<object data="x"></object><embed src="x">', 'object', 'embed');
gone('<meta http-equiv="refresh" content="0;url=https://evil.example">', 'meta', 'evil');
gone('<base href="https://evil.example/">', 'base', 'evil');
// dangerous links, in every spelling
gone('<a href="javascript:alert(1)">x</a>', 'javascript', 'alert');
gone('<a href="JaVaScRiPt:alert(1)">x</a>', 'javascript', 'alert');
gone('<a href="  javascript:alert(1)">x</a>', 'javascript', 'alert');
gone('<a href="java\tscript:alert(1)">x</a>', 'alert');
gone('<a href="&#106;avascript:alert(1)">x</a>', 'alert');
gone('<a href="data:text/html;base64,PHNjcmlwdD4=">x</a>', 'data:');
gone('<a href="vbscript:msgbox(1)">x</a>', 'vbscript');
gone('<img src="javascript:alert(1)">', 'javascript');
gone('<img src="data:image/svg+xml;base64,PHN2Zz4=">', 'data:');
assert.ok(!cleanHtml('<a href="//evil.example/x">x</a>').includes('evil.example'), 'a protocol-relative link is dropped');

// what editors legitimately write must survive
const keep = [
  '<p>Plain <strong>bold</strong> and <em>italic</em> text.</p>',
  '<h2>Heading</h2>',
  '<ul><li>One</li><li>Two</li></ul>',
  '<ol start="3"><li>Three</li></ol>',
  '<blockquote><p>Quote</p></blockquote>',
  '<p><a href="https://example.org/page?a=1&amp;b=2">External</a></p>',
  '<p><a href="mailto:info@aaemass.org">Email</a></p>',
  '<p><a href="tel:+16175550100">Call</a></p>',
  '<p><a href="/contact/">Internal</a></p>',
  '<p><a href="#section">Anchor</a></p>',
  '<p><img src="/uploads/photo.jpg" alt="A photo" width="400" height="300" loading="lazy" /></p>',
  '<p><img src="https://example.org/p.png" alt="Remote" /></p>',
  '<table><thead><tr><th>A</th></tr></thead><tbody><tr><td colspan="2">B</td></tr></tbody></table>',
  '<pre><code>code</code></pre>',
];
for (const html of keep) assert.equal(cleanHtml(html), html, `legitimate content was changed: ${html}`);
assert.equal(cleanHtml('Tom &amp; Jerry &lt;3'), 'Tom &amp; Jerry &lt;3', 'text entities are kept as they are');
assert.equal(cleanHtml(''), '', 'empty stays empty');
console.log('sanitize tests passed');
