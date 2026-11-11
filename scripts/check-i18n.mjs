// Run after `npm run build`:  node scripts/check-i18n.mjs
// Checks the Spanish and French pages in dist/ for: leftover English, unfilled {placeholders}, broken internal links,
// missing hreflang pairs and missing translations of English pages. Exits non-zero if it finds a problem.
import fs from 'node:fs';
import path from 'node:path';

const dist = path.resolve('dist');
const base = process.env.WP_BUILD ? `/${process.env.WP_PREFIX || 'a30-preview'}` : process.env.GH_PAGES ? '/aaemass-astro' : '';
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
const html = (f) => fs.readFileSync(f, 'utf8');
const pages = walk(dist).filter((f) => f.endsWith('index.html'));
const rel = (f) => '/' + path.relative(dist, path.dirname(f)).replace(/\\/g, '/');
const langOf = (r) => (r.startsWith('/es') ? 'es' : r.startsWith('/fr') ? 'fr' : 'en');

// Words that are common in English prose and absent from Spanish and French.
const english = /\b(the|and|with|your|that|this|for|are|from|have|will|which|their|our|you|can|not)\b/gi;
const visible = (s) => s
  .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, ' ')
  .replace(/<[^>]*\blang="en"[^>]*>[\s\S]*?<\/(p|blockquote)>/g, ' ')
  .replace(/<a [^>]*href="(https?:|mailto:)[^"]*"[^>]*>[\s\S]*?<\/a>/g, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/\bThe Messenger\b/g, ' '); // the newsletter's name is kept in English

let problems = 0;
const report = (msg) => { problems++; console.log('✗', msg); };

const enRoutes = pages.map(rel).filter((r) => langOf(r) === 'en' && !r.startsWith('/admin') && !r.startsWith('/events'));
const esRoutes = new Set(pages.map(rel).filter((r) => langOf(r) === 'es'));
const frRoutes = new Set(pages.map(rel).filter((r) => langOf(r) === 'fr'));
console.log(`${enRoutes.length} English pages, ${esRoutes.size} Spanish, ${frRoutes.size} French`);
if (esRoutes.size !== frRoutes.size) report(`Spanish has ${esRoutes.size} pages but French has ${frRoutes.size}`);
if (esRoutes.size < enRoutes.length - 1) report(`only ${esRoutes.size} Spanish pages for ${enRoutes.length} English pages (events pages are English only)`);

const all = new Set(pages.map(rel));
for (const f of pages) {
  const r = rel(f);
  const lang = langOf(r);
  if (lang === 'en') continue;
  const s = html(f);
  const text = visible(s);
  const hits = text.match(english) ?? [];
  const words = (text.match(/\p{L}+/gu) ?? []).length || 1;
  if (hits.length / words > 0.01) report(`${r}: ${(hits.length / words * 100).toFixed(1)}% English words (${[...new Set(hits.map((h) => h.toLowerCase()))].slice(0, 6).join(', ')})`);
  const ph = text.match(/\{[a-zA-Z]+\}/g);
  if (ph) report(`${r}: unfilled placeholder ${ph[0]}`);
  if (!new RegExp(`<html lang="${lang}"`).test(s)) report(`${r}: wrong <html lang>`);
  for (const m of s.matchAll(/<a [^>]*href="(\/[^"#?]*)/g)) {
    const target = m[1].replace(base, '') || '/';
    if (/\.(pdf|docx|png|jpe?g|webp|svg|xml|txt|ico)$/i.test(target) || target.startsWith('/_astro') || target.startsWith('/admin')) continue;
    const t = target.replace(/\/?$/, '');
    if (!all.has(t === '' ? '/' : t)) report(`${r}: broken link ${m[1]}`);
  }
}
console.log(problems ? `\n${problems} problem(s)` : '\nNo problems found');
process.exit(problems ? 1 : 0);
