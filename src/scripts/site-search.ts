// The site search window. Loaded on demand (first hover, focus or click on the header's magnifying glass), never with the page.
// Data: search-index-<lang>.json, written after the build by integrations/search-index.mjs (one record per page).
const dlg = document.getElementById('site-search') as HTMLDialogElement;
const input = document.getElementById('ss-q') as HTMLInputElement;
const status = document.getElementById('ss-status')!;
const list = document.getElementById('ss-results')!;
const text = dlg.dataset;

interface PageRecord { u: string; t: string; d: string; h: string; b: string }
interface Indexed extends PageRecord { title: string; head: string; desc: string; body: string }
interface Hit { page: Indexed; score: number; at: number }

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
    .then((rows) => rows.map((r) => ({ ...r, title: norm(r.t), head: norm(r.h), desc: norm(r.d), body: norm(r.b) })))
    .catch((e) => { pages = undefined; throw e; }));

/** Every word must start a word somewhere on the page. Title matches count most, then headings, description, body. */
function rank(page: Indexed, terms: string[]): Hit | undefined {
  let score = 0;
  let at = -1;
  for (const t of terms) {
    const needle = ' ' + t;
    const inBody = page.body.indexOf(needle);
    const s = (page.title.includes(needle) ? 10 : 0) + (page.head.includes(needle) ? 5 : 0) + (page.desc.includes(needle) ? 3 : 0) + (inBody >= 0 ? 1 : 0);
    if (!s) return undefined;
    score += s;
    if (at < 0 && inBody >= 0) at = inBody + 1;
  }
  return { page, score, at };
}

function snippet(hit: Hit, terms: string[]): Node[] {
  const raw = hit.page.b;
  if (hit.at < 0 || raw.length !== hit.page.body.length - 1) return [document.createTextNode(hit.page.d || raw.slice(0, SNIPPET))];
  const start = Math.max(0, hit.at - 40);
  const end = Math.min(raw.length, start + SNIPPET);
  const lower = hit.page.body.slice(1 + start, 1 + end);
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

function render(hits: Hit[], terms: string[]) {
  list.replaceChildren(...hits.map((hit) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = text.base! + hit.page.u.replace(/^\//, '');
    a.textContent = hit.page.t.replace(/\s*\|\s*[^|]*$/, '') || hit.page.t;
    const p = document.createElement('p');
    p.append(...snippet(hit, terms));
    li.append(a, p);
    return li;
  }));
}

async function run() {
  const terms = words(input.value);
  if (!terms.length) { list.replaceChildren(); status.textContent = text.hint!; return; }
  try {
    const hits = (await load())
      .map((p) => rank(p, terms))
      .filter((h): h is Hit => Boolean(h))
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_RESULTS);
    if (words(input.value).join(' ') !== terms.join(' ')) return; // a newer keystroke is already being handled
    render(hits, terms);
    status.textContent = hits.length ? text.count!.replace('{n}', String(hits.length)) : text.none!.replace('{q}', input.value.trim());
  } catch {
    list.replaceChildren();
    status.textContent = text.error!;
  }
}

export function openSearch() {
  if (!dlg.open) dlg.showModal();
  input.focus();
  input.select();
  if (!status.textContent) status.textContent = text.hint!;
  void load().catch(() => {});
}

input.addEventListener('input', () => void run());
dlg.querySelector('form')!.addEventListener('submit', (e) => { e.preventDefault(); list.querySelector('a')?.click(); });
dlg.querySelector('[data-close]')!.addEventListener('click', () => dlg.close());
// A click on the dimmed backdrop (the dialog element itself, outside its content) closes it.
dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
// Following a result to the page you are already on would leave the window open over it.
list.addEventListener('click', () => dlg.close());
