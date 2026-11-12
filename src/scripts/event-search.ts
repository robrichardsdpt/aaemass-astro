// The "Explore events" window. Loaded on demand (first hover, focus or click on its button, or a /calendar/#e=<id> link),
// never with the page. Two views live inside one dialog: the results list and one event's details. Moving between them
// keeps the list exactly as it was (query, filters, how many are shown, scroll position).
// Data: the build's snapshot (highlighted + Google Calendar + WordPress), then the live WordPress calendar on top of it.
import { calendarLinks, el, htmlStrip, shortDay, shortWhen, textBlocks } from './event-dom';
import { htmlToText, mapUrl, mergeEvents, normalizeTribe, nyDate, safeUrl, TRIBE_API, whenText, type SearchEvent } from '../lib/event-model';

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const dlg = $<HTMLDialogElement>('event-search');
const title = $('es-title');
const listView = $('es-list-view');
const detailView = $('es-detail');
const q = $<HTMLInputElement>('es-q');
const from = $<HTMLInputElement>('es-from');
const to = $<HTMLInputElement>('es-to');
const type = $<HTMLSelectElement>('es-type');
const format = $<HTMLSelectElement>('es-format');
const cat = $<HTMLSelectElement>('es-cat');
const catField = $('es-cat-field');
const hl = $<HTMLInputElement>('es-hl');
const status = $('es-status');
const list = $('es-results');
const more = $<HTMLButtonElement>('es-more');
const clearBtn = $<HTMLButtonElement>('es-reset');
const eventsBase = dlg.dataset.events!;

type Indexed = SearchEvent & { hay: string; head: string };

const PAGE = 40;
let events: Indexed[] = [];
let shown = PAGE;
let static_: SearchEvent[] = [];
let live: SearchEvent[] | undefined;
let ready: Promise<boolean> | undefined;
let livePromise: Promise<void> | undefined;
let current: SearchEvent | undefined;
let lastTrigger: HTMLElement | undefined;
let listScroll = 0;

// Words are matched from their start ("dist 9" finds "District 9" but "9" does not match inside "02150").
const norm = (s: string) => ' ' + s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ');
const withHay = (e: SearchEvent): Indexed => ({ ...e, head: norm(e.title), hay: norm([e.title, e.venue, e.address, e.description, e.categories.join(' ')].join(' ')) });

function setEvents() {
  const tribeStatic = static_.filter((e) => e.source === 'tribe');
  const detail = new Map(tribeStatic.map((e) => [e.id, e.detail]));
  const liveEvents = (live ?? []).map((e) => ({ ...e, detail: detail.get(e.id) ?? e.detail }));
  // The live WordPress feed replaces the build's copy of it, so events added since the last build show up.
  const merged = mergeEvents(static_.filter((e) => e.source !== 'tribe'), live ? liveEvents : tribeStatic);
  events = merged.map(withHay);
  const cats = [...new Set(merged.flatMap((e) => e.categories))].sort();
  const keep = cat.value;
  cat.replaceChildren(el('option', { value: '' }, 'All categories'), ...cats.map((c) => el('option', { value: c }, c)));
  cat.value = cats.includes(keep) ? keep : '';
  catField.hidden = cats.length === 0;
  lastDay = merged.length ? nyDate(merged[merged.length - 1].start) : '';
  syncDates();
}

// From and To work as a pair: neither can be before today or after the last event, From cannot be after To, and To
// cannot be before From. The native pickers grey out the days that are not allowed; typed values are clamped.
let lastDay = '';
function syncDates() {
  const today = nyDate(Date.now());
  for (const input of [from, to]) {
    input.min = today;
    input.max = lastDay;
    if (input.value && input.value < today) input.value = today;
    if (lastDay && input.value > lastDay) input.value = lastDay;
  }
  // Whichever one was just changed, To never ends up before From.
  if (from.value && to.value && to.value < from.value) to.value = from.value;
  to.min = from.value || today;
  from.max = to.value || lastDay;
}

const filtersActive = () => Boolean(q.value || from.value || to.value || type.value || format.value || cat.value || hl.checked);

function matches(e: Indexed, terms: string[], f: string, t: string): boolean {
  const day = nyDate(e.start);
  if (day < f || (t && day > t)) return false;
  if (hl.checked && e.source !== 'highlight') return false;
  if (type.value === 'recurring' && !e.recurring) return false;
  if (type.value === 'one-time' && e.recurring) return false;
  if (cat.value && !e.categories.includes(cat.value)) return false;
  if (format.value === 'online' && !e.online) return false;
  if (format.value === 'in-person' && !(e.venue || e.address)) return false;
  return terms.every((w) => e.hay.includes(' ' + w));
}

// The entrance animation is tied to a one-shot attribute, not to [open], so it never replays (for example when the
// keyboard closes and the sheet changes layout).
function openDialog() {
  if (dlg.open) return;
  dlg.showModal();
  dlg.dataset.opening = '';
  setTimeout(() => { delete dlg.dataset.opening; }, 400);
}

// ---- Results list ---------------------------------------------------------------------------------------------

const plainClick = (ev: MouseEvent) => !ev.defaultPrevented && ev.button === 0 && !(ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey);

function row(e: SearchEvent): HTMLElement {
  const place = [e.venue, e.address].filter(Boolean).join(', ');
  const link = el('a', { href: e.detail }, e.title);
  // A plain click opens the details inside this window. The real address stays on the link for new tabs and no-JS.
  link.addEventListener('click', (ev) => {
    if (!plainClick(ev)) return;
    ev.preventDefault();
    lastTrigger = link;
    showDetail(e);
  });
  const menu = el('details', { class: 'addcal' }, el('summary', {}, 'Add to calendar'));
  // The links are built the first time the menu is opened, not for every row up front.
  menu.addEventListener('toggle', () => { if (menu.open && menu.childElementCount === 1) menu.append(el('div', { class: 'cal-links' }, ...calendarLinks(e))); });
  return el('li', e.source === 'highlight' ? { class: 'is-highlight' } : {},
    el('time', { datetime: e.start }, shortDay(e.start)),
    el('div', {},
      link,
      ...(e.source === 'highlight' ? [' ', el('span', { class: 'badge' }, 'Highlighted')] : []),
      ...(e.recurring ? [' ', el('span', { class: 'badge badge--quiet' }, 'Repeats')] : []),
      el('p', { class: 'when' }, `${shortWhen(e)}${place ? `, ${place}` : e.online ? ', online' : ''}`),
      menu,
    ),
  );
}

function render(reset = true) {
  if (reset) shown = PAGE;
  const f = from.value || nyDate(Date.now());
  const terms = norm(q.value).split(' ').filter(Boolean);
  const found = events.filter((e) => matches(e, terms, f, to.value));
  // With a search, events with every word in the title come first (the sort is stable, so each group stays in date order).
  if (terms.length) {
    const inTitle = (e: Indexed) => terms.every((w) => e.head.includes(' ' + w));
    found.sort((a, b) => Number(inTitle(b)) - Number(inTitle(a)));
  }
  const frag = document.createDocumentFragment();
  for (const e of found.slice(0, shown)) frag.append(row(e));
  if (!found.length) frag.append(el('li', { class: 'esearch__empty' }, 'No events match. Try fewer words or a wider date range.'));
  list.replaceChildren(frag);
  list.removeAttribute('aria-busy');
  more.hidden = found.length <= shown;
  clearBtn.hidden = !filtersActive();
  status.textContent = found.length
    ? `${found.length} ${found.length === 1 ? 'event' : 'events'}${found.length > shown ? `, showing the first ${shown}` : ''}`
    : 'No events found';
}

// ---- One event's details --------------------------------------------------------------------------------------

const hasPage = (e: SearchEvent) => !e.detail.includes('#e=');
const shareUrl = (e: SearchEvent) => (hasPage(e) ? new URL(e.detail, location.href).href : `${location.origin}${eventsBase}#e=${encodeURIComponent(e.id)}`);

function renderDetail(e: SearchEvent) {
  const where = [e.venue, e.address].filter(Boolean).join(', ');
  const map = mapUrl(e);
  const online = safeUrl(e.online);
  const back = el('button', { type: 'button', class: 'button button--quiet esearch__back' }, '← Back to results');
  back.addEventListener('click', goBack);
  const copy = el('button', { type: 'button', class: 'button button--quiet' }, 'Copy link');
  const copied = el('span', { role: 'status', 'aria-live': 'polite', class: 'when' });
  copy.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(shareUrl(e));
      copied.textContent = 'Link copied.';
    } catch {
      copied.textContent = shareUrl(e);
    }
  });
  const heading = el('h2', { id: 'es-detail-title', class: 'esearch__dtitle', tabindex: '-1' }, e.title);
  detailView.replaceChildren(
    back,
    el('div', {}, heading,
      ...(e.source === 'highlight' ? [el('span', { class: 'badge' }, 'Highlighted')] : []),
      ...(e.recurring ? [' ', el('span', { class: 'badge badge--quiet' }, 'Repeats')] : []),
    ),
    el('div', { class: 'notice stack' },
      el('p', {}, el('strong', {}, 'When: '), whenText(e)),
      ...(where ? [el('p', {}, el('strong', {}, 'Where: '), map ? el('a', { href: map, target: '_blank', rel: 'noopener noreferrer' }, where) : where)] : []),
      ...(online ? [el('p', {}, el('strong', {}, 'Online: '), el('a', { href: online, target: '_blank', rel: 'noopener noreferrer' }, 'Join online'))] : []),
      ...(e.categories.length ? [el('p', {}, el('strong', {}, 'Category: '), e.categories.join(', '))] : []),
    ),
    ...(e.description ? [el('div', { class: 'stack prose-body' }, ...textBlocks(e.description))] : []),
    el('div', {}, el('h3', { class: 'event-sub' }, 'Add to your calendar'), el('div', { class: 'cal-links' }, ...calendarLinks(e))),
    el('div', { class: 'esearch__actions' },
      ...(hasPage(e) ? [el('a', { class: 'button button--quiet', href: e.detail, target: '_blank', rel: 'noopener' }, 'Open full page')] : []),
      copy, copied,
      ...(safeUrl(e.external) ? [el('a', { href: safeUrl(e.external)!, target: '_blank', rel: 'noopener noreferrer' }, 'View on the original calendar')] : []),
    ),
  );
}

function showDetail(e: SearchEvent, push = true) {
  if (current?.id === e.id && !detailView.hidden) return;
  if (detailView.hidden) listScroll = dlg.scrollTop;
  renderDetail(e);
  current = e;
  listView.hidden = true;
  detailView.hidden = false;
  dlg.scrollTop = 0;
  if (push) history.pushState({ es: e.id }, '', `#e=${encodeURIComponent(e.id)}`);
  $('es-detail-title').focus({ preventScroll: true });
}

function showList() {
  detailView.hidden = true;
  listView.hidden = false;
  current = undefined;
  dlg.scrollTop = listScroll;
  (lastTrigger?.isConnected ? lastTrigger : sheet.matches ? title : q).focus({ preventScroll: true });
}

// Back from details: the history entry pushed when the details opened is undone, so the browser's Back button and this
// button do the same thing. A link opened straight into the details has no such entry, so it just clears the address.
function goBack() {
  if (history.state?.es) history.back();
  else {
    history.replaceState(null, '', location.pathname + location.search);
    showList();
  }
}

const idFromHash = () => {
  const m = /^#e=(.+)$/.exec(location.hash);
  try { return m ? decodeURIComponent(m[1]) : null; } catch { return null; }
};

async function openById(id: string, push: boolean) {
  openDialog();
  await start();
  let hit = events.find((e) => e.id === id);
  // An event added to WordPress since the last build is only in the live feed.
  if (!hit && livePromise) { await livePromise; hit = events.find((e) => e.id === id); }
  if (hit) return showDetail(hit, push);
  current = undefined;
  listView.hidden = true;
  detailView.hidden = false;
  const back = el('button', { type: 'button', class: 'button button--quiet esearch__back' }, '← Back to results');
  back.addEventListener('click', goBack);
  detailView.replaceChildren(back, el('p', {}, 'That event could not be found. It may have passed or been removed.'));
}

// ---- Loading ---------------------------------------------------------------------------------------------------

async function fetchLive(): Promise<SearchEvent[] | undefined> {
  try {
    const out: SearchEvent[] = [];
    for (let page = 1; page <= 3; page++) {
      const res = await fetch(`${TRIBE_API}/events?per_page=100&page=${page}`);
      if (!res.ok) return undefined;
      const data = await res.json();
      for (const e of data.events ?? []) {
        const n = normalizeTribe(e, (h) => htmlToText(h, htmlStrip), (id) => `${eventsBase}#e=${encodeURIComponent(id)}`);
        if (n) out.push(n);
      }
      if (page >= (data.total_pages ?? 0)) break;
    }
    return out;
  } catch {
    return undefined; // The snapshot already has the WordPress events as of the last build.
  }
}

function start(): Promise<boolean> {
  ready ??= (async () => {
    try {
      const data = await (await fetch(dlg.dataset.index!)).json();
      const table: string[] = data.descriptions ?? [];
      static_ = (data.events as any[]).map(({ di, ...e }) => ({ description: di === undefined ? '' : table[di], categories: [], ...e }));
    } catch {
      status.textContent = 'Events could not be loaded';
      list.replaceChildren(el('li', { class: 'esearch__empty' }, 'Close this window and try again, or use the calendar below.'));
      list.removeAttribute('aria-busy');
      ready = undefined;
      return false;
    }
    setEvents();
    render();
    livePromise = fetchLive().then((l) => {
      live = l;
      if (l) { setEvents(); render(false); }
    });
    return true;
  })();
  return ready;
}

// ---- Wiring ----------------------------------------------------------------------------------------------------

let timer: number | undefined;
// Filtering and drawing the list takes a few milliseconds, so the wait only needs to skip keystrokes typed in quick succession.
const later = () => { clearTimeout(timer); timer = window.setTimeout(() => render(), 60); };
q.addEventListener('input', later);
from.addEventListener('input', () => { syncDates(); later(); });
to.addEventListener('input', () => { syncDates(); later(); });
clearBtn.addEventListener('click', () => {
  q.value = from.value = to.value = type.value = format.value = cat.value = '';
  hl.checked = false;
  syncDates();
  render();
  q.focus({ preventScroll: true });
});
for (const c of [type, format, cat, hl]) c.addEventListener('change', () => render());
more.addEventListener('click', () => { shown += PAGE; render(false); });

dlg.querySelector('[data-es-close]')!.addEventListener('click', () => dlg.close());
// A click on the backdrop (the dialog element itself, outside its content) closes it.
dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
// Escape in the details goes back to the list; Escape in the list closes the window.
dlg.addEventListener('cancel', (e) => {
  if (!detailView.hidden) {
    e.preventDefault();
    goBack();
  }
});
dlg.addEventListener('close', () => {
  if (idFromHash()) history.replaceState(null, '', location.pathname + location.search);
  detailView.hidden = true;
  listView.hidden = false;
  current = undefined;
});
// The browser's Back and Forward buttons move between the list and an event's details.
addEventListener('popstate', () => {
  const id = idFromHash();
  if (id) void openById(id, false);
  else if (dlg.open && !detailView.hidden) showList();
});

// Phones: the window is a bottom sheet, and dragging its header down dismisses it.
const sheet = matchMedia('(max-width: 39.99rem)');
const bar = dlg.querySelector<HTMLElement>('.esearch__bar')!;
let dragStart = 0;
let dragged = 0;
let dragging = false;
const settle = () => { dlg.style.transform = ''; dlg.style.transition = ''; };
bar.addEventListener('pointerdown', (e) => {
  if (!sheet.matches || (e.target as HTMLElement).closest('button')) return;
  (document.activeElement as HTMLElement | null)?.blur?.();
  dragging = true;
  dragStart = e.clientY;
  dragged = 0;
  bar.setPointerCapture(e.pointerId);
  dlg.style.transition = 'none';
});
bar.addEventListener('pointermove', (e) => {
  if (!dragging) return;
  dragged = Math.max(0, e.clientY - dragStart);
  dlg.style.transform = `translateY(${dragged}px)`;
});
const endDrag = () => {
  if (!dragging) return;
  dragging = false;
  dlg.style.transition = 'transform 180ms ease-out';
  if (dragged > 110) {
    dlg.style.transform = 'translateY(100%)';
    setTimeout(() => { dlg.close(); settle(); }, 180);
  } else {
    dlg.style.transform = '';
    setTimeout(settle, 180);
  }
};
bar.addEventListener('pointerup', endDrag);
bar.addEventListener('pointercancel', endDrag);

// iOS Safari: the on-screen keyboard covers the page without resizing it, and Safari pans the visual viewport to reveal
// the focused field, reporting the new size only after the keyboard has finished animating. A bottom-anchored sheet sized
// with dvh therefore ends up behind the keyboard or pushed off screen. While the keyboard is open, the sheet is pinned
// to exactly what is visible (top and height taken from the visual viewport), and it re-checks every frame while the
// keyboard animates, so it never waits on a late event.
const vv = window.visualViewport;
let follow = 0;
function syncViewport() {
  const keyboard = Boolean(vv) && sheet.matches && dlg.open && window.innerHeight - vv!.height > 120;
  if (!keyboard) {
    delete dlg.dataset.kb;
    dlg.style.removeProperty('--es-top');
    dlg.style.removeProperty('--es-vh');
    return;
  }
  dlg.dataset.kb = '';
  dlg.style.setProperty('--es-top', `${Math.round(vv!.offsetTop)}px`);
  dlg.style.setProperty('--es-vh', `${Math.round(vv!.height)}px`);
  const active = document.activeElement;
  if (active instanceof HTMLElement && dlg.contains(active) && active.matches('input, select')) active.scrollIntoView({ block: 'nearest' });
}
// Sync on every frame for a short while after focus changes (the keyboard is animating), then settle.
function track(ms = 900) {
  cancelAnimationFrame(follow);
  const until = performance.now() + ms;
  const tick = () => {
    syncViewport();
    if (performance.now() < until) follow = requestAnimationFrame(tick);
  };
  tick();
}
vv?.addEventListener('resize', () => track(300));
vv?.addEventListener('scroll', syncViewport);
dlg.addEventListener('focusin', () => track());
dlg.addEventListener('focusout', () => track());
sheet.addEventListener('change', syncViewport);
dlg.addEventListener('close', () => { cancelAnimationFrame(follow); syncViewport(); });
// Return closes the keyboard so the results are visible, and so does touching the results.
q.addEventListener('keydown', (e) => { if (e.key === 'Enter' && sheet.matches) { e.preventDefault(); q.blur(); } });
list.addEventListener('touchstart', () => { if (sheet.matches && document.activeElement === q) q.blur(); }, { passive: true });

export function openSearch(query = '') {
  openDialog();
  if (query.trim()) q.value = query.trim();
  syncViewport();
  // On phones the keyboard would cover the results and fight the sheet's slide-up, so the search box is not focused for you.
  if (sheet.matches) title.focus({ preventScroll: true });
  else q.focus();
  void start().then((ok) => { if (ok) render(); });
}

export function openFromHash() {
  syncViewport();
  const id = idFromHash();
  if (id) void openById(id, false);
}
