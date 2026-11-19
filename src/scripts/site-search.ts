// The site search window. Loaded on demand (first hover, focus or click on the header's magnifying glass), never with the page.
// Data: search-index-<lang>.json, written after the build by integrations/search-index.mjs (one record per page).
import { phoneSheet } from './sheet';

const dlg = document.getElementById('site-search') as HTMLDialogElement;
const input = document.getElementById('ss-q') as HTMLInputElement;
const status = document.getElementById('ss-status')!;
const list = document.getElementById('ss-results')!;
const empty = document.getElementById('ss-empty')!;
const emptyText = document.getElementById('ss-empty-text')!;
const text = dlg.dataset;

interface SectionRecord { i: string; h: string; b: string }
interface PageRecord { u: string; t: string; d: string; s: SectionRecord[] }
interface Section extends SectionRecord { head: string; body: string }
interface Indexed extends PageRecord { title: string; desc: string; secs: Section[] }
interface Hit { page: Indexed; score: number; section: Section; at: number }

const MAX_RESULTS = 20;
const SNIPPET = 160;

// Accents and capitals are ignored ("registrar" finds "Registrar", "comites" finds "comités"). Each character maps to
// one character, so a position in the normalized text is the same position in the original.
const norm = (s: string) => ' ' + s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^\p{L}\p{N}]/gu, ' ');
const words = (q: string) => norm(q).split(' ').filter(Boolean);

let pages: Promise<Indexed[]> | undefined;
const load = () =>
  (pages ??= fetch(text.index!)
    .then((r) => { if (!r.ok) throw new Error(String(r.status)); return r.json() as Promise<PageRecord[]>; })
    .then((rows) => rows.map((r) => ({ ...r, title: norm(r.t), desc: norm(r.d), secs: r.s.map((x) => ({ ...x, head: norm(x.h), body: norm(x.b) })) })))
    .catch((e) => { pages = undefined; throw e; }));

/**
 * Every word must start a word somewhere on the page. Title matches count most, then headings, description, body.
 * The hit points at the section that matches the most words, so the result can link to it.
 */
function rank(page: Indexed, terms: string[]): Hit | undefined {
  let score = 0;
  for (const t of terms) {
    const needle = ' ' + t;
    const s = (page.title.includes(needle) ? 10 : 0) + (page.desc.includes(needle) ? 3 : 0)
      + (page.secs.some((x) => x.head.includes(needle)) ? 5 : 0) + (page.secs.some((x) => x.body.includes(needle)) ? 1 : 0);
    if (!s) return undefined;
    score += s;
  }
  let best = page.secs[0];
  let bestCount = 0;
  for (const sec of page.secs) {
    const count = terms.filter((t) => (sec.head + sec.body).includes(' ' + t)).length;
    if (count > bestCount) { best = sec; bestCount = count; }
  }
  const at = best ? best.body.indexOf(' ' + terms.find((t) => best.body.includes(' ' + t))!) : -1;
  return { page, score, section: best, at: at < 0 ? -1 : at + 1 };
}

function snippet(hit: Hit, terms: string[]): Node[] {
  const raw = hit.section?.b ?? '';
  if (hit.at < 0 || raw.length !== hit.section.body.length - 1) return [document.createTextNode(raw ? raw.slice(0, SNIPPET) : hit.page.d)];
  const start = Math.max(0, hit.at - 40);
  const end = Math.min(raw.length, start + SNIPPET);
  const lower = hit.section.body.slice(1 + start, 1 + end);
  const out: Node[] = [document.createTextNode(start > 0 ? '… ' : '')];
  let cursor = 0;
  const re = new RegExp(`(?<=^| )(${terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})[\\p{L}\\p{N}]*`, 'gu');
  for (const m of lower.matchAll(re)) {
    out.push(document.createTextNode(raw.slice(start + cursor, start + m.index)));
    const mark = document.createElement('mark');
    mark.textContent = raw.slice(start + m.index, start + m.index + m[0].length);
    out.push(mark);
    cursor = m.index + m[0].length;
  }
  out.push(document.createTextNode(raw.slice(start + cursor, end) + (end < raw.length ? ' …' : '')));
  return out;
}

/** Shows the centered panel with a message (nothing typed, no match, error) instead of the results list. */
function showEmpty(message: string) {
  list.replaceChildren();
  list.hidden = true;
  empty.hidden = false;
  emptyText.textContent = message;
  status.textContent = message;
  status.classList.add('visually-hidden');
}

function render(hits: Hit[], terms: string[]) {
  empty.hidden = true;
  list.hidden = false;
  list.replaceChildren(...hits.map((hit) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    // ?q= lets the page highlight the words (see find-on-page.ts); #id scrolls to the section that matched.
    a.href = text.base! + hit.page.u.replace(/^\//, '') + '?q=' + encodeURIComponent(terms.join(' ')) + (hit.section?.i ? '#' + hit.section.i : '');
    a.textContent = hit.page.t.replace(/\s*\|\s*[^|]*$/, '') || hit.page.t;
    li.append(a);
    if (hit.section?.h) {
      const where = document.createElement('p');
      where.className = 'site-search__where';
      where.textContent = '› ' + hit.section.h;
      li.append(where);
    }
    const p = document.createElement('p');
    p.append(...snippet(hit, terms));
    li.append(p);
    return li;
  }));
}

async function run() {
  const terms = words(input.value);
  if (!terms.length) return showEmpty(text.hint!);
  try {
    const hits = (await load())
      .map((p) => rank(p, terms))
      .filter((h): h is Hit => Boolean(h))
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_RESULTS);
    if (words(input.value).join(' ') !== terms.join(' ')) return; // a newer keystroke is already being handled
    if (!hits.length) return showEmpty(text.none!.replace('{q}', input.value.trim()));
    render(hits, terms);
    status.textContent = text.count!.replace('{n}', String(hits.length));
    status.classList.remove('visually-hidden');
  } catch {
    showEmpty(text.error!);
  }
}

export function openSearch() {
  if (!dlg.open) dlg.showModal();
  // On phones the keyboard would cover the results and fight the sheet's slide-up, so the box is not focused for you (as in the events window).
  if (phoneSheet.matches) {
    dlg.querySelector<HTMLElement>('#ss-title')!.focus({ preventScroll: true });
  } else {
    input.focus();
    input.select();
  }
  void load().catch(() => {});
}

input.addEventListener('input', () => void run());
// A suggested word fills the box and searches it.
empty.addEventListener('click', (e) => {
  const word = (e.target as HTMLElement).closest<HTMLElement>('[data-q]')?.dataset.q;
  if (!word) return;
  input.value = word;
  input.focus();
  void run();
});
dlg.querySelector('form')!.addEventListener('submit', (e) => { e.preventDefault(); list.querySelector('a')?.click(); });
dlg.querySelector('[data-close]')!.addEventListener('click', () => dlg.close());
// A click on the dimmed backdrop closes it. Empty space inside the window also targets the dialog element, so the
// click position is compared with the window's box instead.
dlg.addEventListener('click', (e) => {
  const box = dlg.getBoundingClientRect();
  const outside = e.clientX < box.left || e.clientX > box.right || e.clientY < box.top || e.clientY > box.bottom;
  if (e.target === dlg && outside) dlg.close();
});
// Following a result to the page you are already on would leave the window open over it.
list.addEventListener('click', () => dlg.close());
// Touching the results puts the keyboard away so they can be read.
list.addEventListener('touchstart', () => { if (phoneSheet.matches && document.activeElement === input) input.blur(); }, { passive: true });
