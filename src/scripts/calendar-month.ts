// The month view on the Calendar page, drawn from the site's own event list (events/calendar.json) instead of a Google frame.
// It is an enhancement: the page already has the next 30 days as a list. Only fetched when the screen is wide enough to show it.
// Earlier months (events/calendar-history.json) are fetched only if someone goes back past this month.
// Built with createElement and textContent only, so event text from Google or WordPress can never inject markup.
import { chipTime, indexByDay, isMultiDay, kindOf, monthCells, weekSpans, type CalItem, type Span } from '../lib/calendar-grid';
import { nyDate } from '../lib/event-model';

const root = document.getElementById('cal-month');
if (root) boot(root);

interface Raw { i: string; t: string; s: string; e?: string; a?: 1; r?: 1; o?: 1; x: string; d?: string }

function boot(root: HTMLElement) {
  const d = root.dataset;
  const locale = d.locale || 'en-US';
  const english = d.lang === 'en';
  const wide = matchMedia('(min-width: 56rem)');
  const fill = (s: string, n: number) => s.replace('{n}', String(n));
  const el = (tag: string, attrs: Record<string, string> = {}, ...kids: (Node | string)[]) => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    n.append(...kids);
    return n;
  };
  // An event that is over has no page and is not in the Explore events window, so it is plain text (href is empty).
  const toItem = (e: Raw): CalItem => ({
    id: e.i, title: e.t, start: e.s, end: e.e, allDay: Boolean(e.a), recurring: Boolean(e.r),
    source: e.x === 'h' ? 'highlight' : e.x === 't' ? 'tribe' : 'google', venue: undefined,
    href: e.o ? '' : e.d ?? `${d.page}#e=${encodeURIComponent(e.i)}`,
  });
  const linkable = (it: CalItem) => Boolean(it.href) && (english || !it.href.includes('#e='));
  // A plain click on an upcoming event opens its details in the Explore events window (the page address stays on the link, so
  // opening in a new tab or copying it still works). Only in English: that window is English only.
  const plain = (e: MouseEvent) => e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;
  const showEvent = (id: string) => dispatchEvent(new CustomEvent('area30:open-event', { detail: { id } }));

  let started = false;
  async function start() {
    if (started || !wide.matches) return;
    started = true;
    try {
      const data = (await (await fetch(d.src!)).json()) as { events: Raw[] };
      draw(data.events.map(toItem));
    } catch {
      root!.replaceChildren(el('p', { class: 'cal-note' }, d.failed || ''));
    } finally {
      root!.removeAttribute('aria-busy');
    }
  }

  function draw(initial: CalItem[]) {
    let items = initial;
    let index = indexByDay(items);
    let multi = items.filter(isMultiDay); // all-day events of 2+ days are drawn as bars across the week, not as a chip on every day
    const today = nyDate(new Date());
    const [ty, tm] = today.split('-').map(Number);
    const first = { y: ty, m: tm - 1 };
    const lastYmd = items.reduce((latest, it) => (nyDate(it.start) > latest ? nyDate(it.start) : latest), today);
    const [ly, lm] = lastYmd.split('-').map(Number);
    const lastMonth = { y: ly, m: lm - 1 };
    let min = { ...first }; // the earliest month there is data for; earlier months are loaded the first time someone goes back
    let history: 'idle' | 'loading' | 'done' = d.history ? 'idle' : 'done';
    let { y, m } = first;
    const open = new Set<string>();

    const title = el('h3', { class: 'cal-title', 'aria-live': 'polite' });
    const prev = el('button', { type: 'button', class: 'button button--quiet cal-nav', 'aria-label': d.prev || '' }, '‹') as HTMLButtonElement;
    const next = el('button', { type: 'button', class: 'button button--quiet cal-nav', 'aria-label': d.next || '' }, '›') as HTMLButtonElement;
    const now = el('button', { type: 'button', class: 'button button--quiet' }, d.today || '') as HTMLButtonElement;
    const bar = el('div', { class: 'cal-bar' }, title, el('div', { class: 'cal-bar__nav' }, now, prev, next));
    const holder = el('div', { class: 'cal-grid-wrap' });
    root!.replaceChildren(bar, holder);

    const monthName = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric', timeZone: 'UTC' });
    const weekday = new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: 'UTC' });

    // One event as a chip in a day, or (with a span) as a bar across several days.
    function chip(it: CalItem, span?: Span, day?: string) {
      const past = !it.href; // already over: it has no page and is not in the Explore events window, so it opens the day's list
      const link = linkable(it);
      const bar = span ? `${span.before ? ' is-before' : ''}${span.after ? ' is-after' : ''}` : '';
      const attrs = { class: `cal-chip k-${kindOf(it)}${past ? ' cal-chip--past' : ''}${span ? ' cal-span' : ''}${bar}`, title: it.title, ...(span ? { style: `--col: ${span.col}; --len: ${span.len}; --lane: ${span.lane}` } : {}) };
      const kids = [el('span', { class: 'cal-chip__time' }, it.allDay ? '' : chipTime(it.start, locale, true)), el('span', { class: 'cal-chip__title' }, it.title)];
      const node = past ? el('button', { type: 'button', ...attrs }, ...kids) : link ? el('a', { ...attrs, href: it.href }, ...kids) : el('span', attrs, ...kids);
      if (past) node.addEventListener('click', () => openDay(day ?? nyDate(it.start), node));
      else if (link && english) node.addEventListener('click', (e) => { if (plain(e as MouseEvent)) { e.preventDefault(); showEvent(it.id); } });
      return span ? node : el('li', {}, node);
    }

    // One small card for any day's full list (like Google's "+N more"): the grid keeps its height, and titles are shown in full.
    const dayCard = el('div', { class: 'cal-day', popover: '', role: 'dialog' });
    const canPopover = typeof dayCard.showPopover === 'function';
    root!.append(dayCard);
    const dayLong = new Intl.DateTimeFormat(locale, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
    const label = (ymd: string) => dayLong.format(new Date(`${ymd}T12:00:00Z`));
    let invoker: HTMLElement | undefined;
    dayCard.addEventListener('toggle', (e) => { if ((e as ToggleEvent).newState === 'closed') invoker?.focus(); });

    function openDay(ymd: string, from: HTMLElement) {
      invoker = from;
      const name = label(ymd);
      dayCard.setAttribute('aria-label', name);
      // autofocus moves keyboard focus into the popup when it opens (Escape or Close returns it to the button that opened it)
      const close = el('button', { type: 'button', class: 'button button--quiet cal-day__close', autofocus: '' }, d.close || 'Close');
      close.addEventListener('click', () => dayCard.hidePopover());
      dayCard.replaceChildren(
        el('h4', { class: 'cal-day__title' }, name),
        el('ul', { class: 'cal-day__list' }, ...(index.get(ymd) ?? []).map((it) => {
          const link = linkable(it);
          const what = el(link ? 'a' : 'span', link ? { href: it.href } : {}, it.title);
          if (link) what.addEventListener('click', (e) => {
            dayCard.hidePopover();
            if (english && plain(e as MouseEvent)) { e.preventDefault(); showEvent(it.id); }
          });
          return el('li', { class: `k-${kindOf(it)}` }, el('span', { class: 'cal-day__time' }, it.allDay ? d.allDay || '' : chipTime(it.start, locale)), what);
        })),
        close);
      dayCard.showPopover();
    }

    const atMin = () => y < min.y || (y === min.y && m <= min.m);
    function render(focusKey?: string) {
      title.textContent = monthName.format(new Date(Date.UTC(y, m, 1)));
      prev.disabled = atMin() && history !== 'idle'; // at the first month with data, Previous loads the earlier months
      next.disabled = y > lastMonth.y || (y === lastMonth.y && m >= lastMonth.m);
      const cells = monthCells(y, m);
      const head = el('tr', {}, ...Array.from({ length: 7 }, (_, i) => el('th', { scope: 'col' }, weekday.format(new Date(Date.UTC(2023, 0, 1 + i))))));
      const body = el('tbody');
      for (let w = 0; w < 6; w++) {
        const row = el('tr');
        const week = cells.slice(w * 7, w * 7 + 7);
        const { spans, lanes } = weekSpans(week.map((c) => c.ymd), multi);
        week.forEach((cell, col) => {
          const list = index.get(cell.ymd) ?? [];
          const singles = list.filter((it) => !isMultiDay(it)); // the bars cover the rest
          // Room in the cell: the date, the week's bars (each reserves a lane), then chips (1.7rem each) and a "more" button (1.5rem).
          const room = 8.5 - 1.7 - lanes * 1.7 - 0.2;
          const fits = Math.max(0, Math.floor((room + 0.01) / 1.7));
          const visible = singles.length <= fits ? singles.length : Math.max(0, Math.floor((room - 1.5 + 0.01) / 1.7));
          const hidden = singles.length - visible;
          const expanded = !canPopover && open.has(cell.ymd); // without the popup, "more" opens the row instead
          const shown = expanded ? singles : singles.slice(0, visible);
          const opener = (cls: string, text: string) => {
            const b = el('button', { type: 'button', class: cls, 'data-day': cell.ymd, 'aria-label': `${text}: ${(d.dayOpen || '{day}').replace('{day}', label(cell.ymd))}` }, text) as HTMLButtonElement;
            b.addEventListener('click', () => {
              if (canPopover) openDay(cell.ymd, b);
              else { if (open.has(cell.ymd)) open.delete(cell.ymd); else open.add(cell.ymd); render(cell.ymd); }
            });
            return b;
          };
          const num = list.length ? opener('cal-num cal-num--button', String(cell.day)) : el('span', { class: 'cal-num' }, String(cell.day));
          if (cell.ymd === today) num.setAttribute('aria-current', 'date');
          const td = el('td', { class: `cal-cell${cell.inMonth ? '' : ' is-out'}${cell.ymd === today ? ' is-today' : ''}`, style: `--lanes: ${lanes}` }, num,
            ...spans.filter((sp) => sp.col === col).map((sp) => chip(sp.item, sp, cell.ymd)),
            el('ul', { class: 'cal-events' }, ...shown.map((it) => chip(it))));
          if (hidden > 0) td.append(opener('cal-morebtn', expanded ? d.less || '' : fill(d.more || '{n}', hidden)));
          row.append(td);
        });
        body.append(row);
      }
      holder.replaceChildren(el('table', { class: 'cal-grid' }, el('caption', { class: 'visually-hidden' }, title.textContent), el('thead', {}, head), body));
      if (focusKey) holder.querySelector<HTMLElement>(`.cal-morebtn[data-day="${focusKey}"]`)?.focus();
    }

    async function loadHistory() {
      history = 'loading';
      prev.setAttribute('aria-busy', 'true');
      try {
        const data = (await (await fetch(d.history!)).json()) as { events: Raw[] };
        const have = new Set(items.map((it) => it.id));
        items = [...data.events.filter((e) => !have.has(e.i)).map(toItem), ...items];
        index = indexByDay(items);
        multi = items.filter(isMultiDay);
        const earliest = items.reduce((e, it) => (nyDate(it.start) < e ? nyDate(it.start) : e), today);
        const [ey, em] = earliest.split('-').map(Number);
        min = { y: ey, m: em - 1 };
      } catch {
        // the earlier months could not be loaded: stay on the months we have
      } finally {
        history = 'done';
        prev.removeAttribute('aria-busy');
      }
    }

    prev.addEventListener('click', async () => {
      if (history === 'idle' && atMin()) await loadHistory();
      if (history === 'loading' || atMin()) return render();
      m--;
      if (m < 0) { m = 11; y--; }
      render();
    });
    next.addEventListener('click', () => { m++; if (m > 11) { m = 0; y++; } render(); });
    now.addEventListener('click', () => { ({ y, m } = first); render(); });
    render();
  }

  void start();
  wide.addEventListener('change', () => void start());
}
