// The district map on its page. Its geometry (src/data/area30-map.json) is fetched only when the map comes into view. Choosing a town on
// the map, or a district in the "Jump to a district" list, shows that district's meeting time and place in one panel beside the map.
// The space for the map and for the panel is fixed by the page's styles, so nothing moves as the map loads or the panel changes.
import type { MapView, Label } from '../lib/map/district-map';
import type { Assignment } from '../lib/map/assign';

interface Card {
  when: string[];
  next?: string;
  place: string[];
  directions?: string;
  zoom?: string;
}
interface Data {
  towns: Record<string, Assignment>;
  colors: Record<string, number>;
  labels: { main: Record<string, Label>; inset: Record<string, Label> };
  names: Record<string, Label>;
  districts: Record<string, { href?: string; card?: string; label: string; region: string }>;
  cards: Record<string, Card>;
  text: Record<'hint' | 'hintTouch' | 'solid' | 'also' | 'split' | 'none' | 'goTo' | 'error' | 'pickOne' | 'full' | 'nextMeeting' | 'directions' | 'openZoom' | 'choose' | 'zoomIn' | 'zoomOut', string>;
}

const root = document.getElementById('dist-map');
const dataEl = document.getElementById('dm-data');
const views = document.getElementById('dm-views');
const info = document.getElementById('dm-info');
const status = document.getElementById('dm-status');
const jump = document.getElementById('dm-jump') as HTMLSelectElement | null;

const SVG = 'http://www.w3.org/2000/svg';
const fill = (s: string, vars: Record<string, string>) => s.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');
const el = <K extends keyof HTMLElementTagNameMap>(tag: K, props: Partial<HTMLElementTagNameMap[K]> = {}) => Object.assign(document.createElement(tag), props);

if (root && dataEl && views && info && status && jump) {
  const data = JSON.parse(dataEl.textContent || '{}') as Data;
  const label = (n: number) => data.districts[n]?.label ?? `District ${n}`;

  // A phone has no pointer to point with, so it is told to tap.
  const touch = matchMedia('(hover: none)');
  const hint = () => (touch.matches ? data.text.hintTouch : data.text.hint);
  info.textContent = hint();

  // ---- Drawing -----------------------------------------------------------------------------------------------------------
  const regionOf = (town: string): number | 'split' | 'none' => {
    const a = data.towns[town];
    return a.kind === 'solid' ? a.district : a.kind === 'split' ? 'split' : 'none';
  };
  const make = (name: string, attrs: Record<string, string | number>, parent?: Element) => {
    const node = document.createElementNS(SVG, name);
    for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
    parent?.append(node);
    return node;
  };

  function draw(view: MapView, labels: Record<string, Label>, names?: Record<string, Label>): SVGSVGElement {
    const svg = make('svg', { viewBox: `0 0 ${view.w} ${view.h}`, class: 'dm-svg', 'aria-hidden': 'true', focusable: 'false' }) as SVGSVGElement;
    const towns = make('g', {}, svg);
    for (const t of view.towns) {
      const r = regionOf(t.n);
      const cls = r === 'split' ? 'dm-split' : r === 'none' ? 'dm-none' : `dm-c${data.colors[r]}`;
      make('path', { d: t.p, class: `dm-town ${cls}`, 'fill-rule': 'evenodd', 'data-town': t.n, 'data-d': typeof r === 'number' ? r : '' }, towns);
    }
    const lines = make('g', { 'pointer-events': 'none' }, svg);
    for (const a of view.arcs) {
      const [p, q] = a.u.map((i) => regionOf(view.towns[i].n));
      const kind = a.u.length === 1 ? 'dm-coast' : p !== q ? 'dm-border' : 'dm-line';
      make('path', { d: a.d, class: kind, fill: 'none' }, lines);
    }
    if (names) {
      const group = make('g', { 'pointer-events': 'none' }, svg);
      for (const [town, [x, y, r]] of Object.entries(names)) {
        make('text', { x, y, class: 'dm-name', 'data-r': r, 'text-anchor': 'middle', 'dominant-baseline': 'central', display: 'none' }, group).textContent = town;
      }
    }
    const numbers = make('g', { 'pointer-events': 'none' }, svg);
    for (const [d, [x, y, r]] of Object.entries(labels)) {
      make('text', { x, y, class: 'dm-num', 'data-r': r, 'text-anchor': 'middle', 'dominant-baseline': 'central' }, numbers).textContent = d;
    }
    return svg;
  }

  // On a narrow screen the map is drawn small, so its numbers are made larger, and those that would not then fit are left out.
  // Zooming in gives each number more room, so more of them fit.
  const narrow = matchMedia('(max-width: 40rem)');
  let zoom = 1;
  function sizeNumbers() {
    const big = narrow.matches;
    root!.style.setProperty('--dm-font', big ? `${30 / zoom}px` : '17px');
    for (const n of root!.querySelectorAll<SVGTextElement>('.dm-num')) n.style.display = Number(n.dataset.r) >= (big ? 18 / zoom : 0) ? '' : 'none';
  }
  narrow.addEventListener('change', sizeNumbers);

  // Zoomed in, each town's name is written on it, where it fits. Names are drawn at a size that is readable on the screen (about 10px),
  // so on the map's own scale the size shrinks as the zoom grows, and so does the room a name needs.
  const NAME_PX = 10;
  const CHAR_WIDTH = 0.58; // average letter width as a share of the font size
  function sizeNames() {
    const scale = (views!.querySelector('.dist-map__main svg')?.getBoundingClientRect().width ?? 0) / 1000 || 1; // screen px per map unit
    const font = NAME_PX / scale;
    root!.style.setProperty('--dm-name-font', `${font}px`);
    // A district's number takes priority: a name whose box would touch a number that is showing is left out.
    const numberSize = (narrow.matches ? 30 : 17) / (narrow.matches ? zoom : 1);
    const numbers = [...root!.querySelectorAll<SVGTextElement>('.dist-map__main .dm-num')]
      .filter((n) => n.style.display !== 'none')
      .map((n) => [Number(n.getAttribute('x')), Number(n.getAttribute('y')), (n.textContent?.length ?? 1) * CHAR_WIDTH * numberSize / 2 + numberSize * 0.3, numberSize * 0.8]);
    for (const n of root!.querySelectorAll<SVGTextElement>('.dm-name')) {
      const width = CHAR_WIDTH * font * (n.textContent?.length ?? 0);
      const [x, y] = [Number(n.getAttribute('x')), Number(n.getAttribute('y'))];
      const touchesNumber = numbers.some(([nx, ny, halfW, halfH]) => Math.abs(nx - x) < halfW + width / 2 && Math.abs(ny - y) < halfH + font * 0.6);
      n.setAttribute('display', zoom > 1 && 2 * Number(n.dataset.r) >= width && !touchesNumber ? 'inline' : 'none');
    }
  }

  const ZOOMS = [1, 2, 4, 6];
  function setZoom(next: number) {
    zoom = next;
    const frame = views!.querySelector<HTMLElement>('.dist-map__main .dist-map__frame')!;
    frame.style.setProperty('--zoom', String(zoom));
    frame.toggleAttribute('data-zoomed', zoom > 1);
    sizeNumbers();
    sizeNames();
  }

  // ---- The panel -----------------------------------------------------------------------------------------------------------
  const line = (text: string, className = 'dm-info__line') => el('span', { className, textContent: text });
  const link = (href: string, text: string, newTab = false) => {
    const a = el('a', { href, textContent: text });
    if (newTab) Object.assign(a, { target: '_blank', rel: 'noopener noreferrer' });
    return a;
  };

  // The district's meeting time and place, as on its card, with links to get there, join, or read the rest.
  function districtNodes(n: number): Node[] {
    const d = data.districts[n];
    const card = d?.card ? data.cards[d.card] : undefined;
    const nodes: Node[] = [line(label(n), 'dm-info__title')];
    if (d?.region) nodes.push(line(d.region, 'dm-info__region'));
    if (card) {
      nodes.push(...card.when.map((w) => line(w, 'dm-info__when')));
      if (card.next) nodes.push(line(`${data.text.nextMeeting} ${card.next}`, 'dm-info__next'));
      if (card.place.length) nodes.push(line(card.place.join(', '), 'dm-info__place'));
      const links = el('span', { className: 'dist-map__links' });
      if (card.directions) links.append(link(card.directions, data.text.directions, true));
      if (card.zoom) links.append(link(card.zoom, data.text.openZoom, true));
      if (d?.href) links.append(link(d.href, data.text.full));
      if (links.hasChildNodes()) nodes.push(links);
    }
    return nodes;
  }

  function highlight(select: (path: SVGPathElement) => boolean) {
    let any = false;
    for (const p of views!.querySelectorAll<SVGPathElement>('.dm-town')) {
      const on = select(p);
      p.classList.toggle('dm-active', on);
      any ||= on;
    }
    root!.toggleAttribute('data-active', any);
  }

  const inDistrict = (name: string, n: number) => {
    const a = data.towns[name];
    return a.kind === 'solid' ? a.district === n : a.kind === 'split' && a.districts.includes(n);
  };

  // What is chosen now: a town (for a town split between districts, also which of its districts), or a district alone.
  let town = '';
  let chosen = 0;

  function render() {
    const nodes: Node[] = [];
    const a = town ? data.towns[town] : undefined;
    if (a?.kind === 'solid') {
      nodes.push(line(fill(data.text.solid, { town, district: label(a.district) })));
      if (a.alsoIn.length) nodes.push(line(fill(data.text.also, { districts: a.alsoIn.map(label).join(', ') })));
    } else if (a?.kind === 'split') {
      nodes.push(line(fill(data.text.split, { town, districts: a.districts.map(label).join(', ') })));
      const row = el('span', { className: 'dist-map__links' });
      for (const d of a.districts) {
        const b = el('button', { type: 'button', className: 'dist-map__chip', textContent: String(d) });
        b.setAttribute('aria-label', label(d));
        b.setAttribute('aria-pressed', String(d === chosen));
        b.addEventListener('click', () => {
          chosen = d;
          jump!.value = String(d);
          render();
        });
        row.append(b);
      }
      nodes.push(row);
      if (!chosen) nodes.push(line(data.text.pickOne, 'dm-info__muted'));
    } else if (a) {
      nodes.push(line(fill(data.text.none, { town })));
    }
    if (chosen) nodes.push(...districtNodes(chosen));
    info!.replaceChildren(...nodes);
    if (!town) highlight((p) => inDistrict(p.dataset.town!, chosen));
    else highlight((p) => p.dataset.town === town || (a?.kind === 'solid' && p.dataset.d === String(a.district)));
  }

  function chooseTown(name: string) {
    town = name;
    const a = data.towns[name];
    chosen = a.kind === 'solid' ? a.district : 0;
    jump!.value = chosen ? String(chosen) : '';
    render();
  }

  jump.addEventListener('change', () => {
    town = '';
    chosen = Number(jump.value);
    if (chosen) render();
    else {
      info!.textContent = hint();
      highlight(() => false);
    }
  });

  // A small label follows the mouse over the map. It does not change the panel: pointing is only for looking, choosing is a click or tap.
  const tip = el('div', { className: 'dist-map__tip', hidden: true });
  tip.setAttribute('aria-hidden', 'true');
  views.append(tip);
  const tipText = (name: string) => {
    const a = data.towns[name];
    return a.kind === 'solid' ? `${name}: ${label(a.district)}` : a.kind === 'split' ? `${name}: ${a.districts.map(label).join(', ')}` : name;
  };
  views.addEventListener('pointermove', (e) => {
    const name = e.pointerType === 'mouse' ? (e.target as Element).closest<SVGPathElement>('.dm-town')?.dataset.town : undefined;
    if (!name) {
      tip.hidden = true;
      return;
    }
    tip.textContent = tipText(name);
    tip.hidden = false;
    const box = views.getBoundingClientRect();
    const x = e.clientX - box.left;
    tip.style.left = `${x + 14 + tip.offsetWidth > box.width ? x - 14 - tip.offsetWidth : x + 14}px`;
    tip.style.top = `${e.clientY - box.top + 16}px`;
  });
  views.addEventListener('pointerleave', () => {
    tip.hidden = true;
  });
  views.addEventListener('click', (e) => {
    const name = (e.target as Element).closest<SVGPathElement>('.dm-town')?.dataset.town;
    if (name) chooseTown(name);
  });

  // ---- Zoom (phones): the map is drawn larger inside its frame, which scrolls, so a finger can move around it ----------------
  const zoomBar = el('div', { className: 'dist-map__zoom' });
  for (const step of [1, -1]) {
    const b = el('button', { type: 'button', textContent: step > 0 ? '+' : '−' });
    b.setAttribute('aria-label', step > 0 ? data.text.zoomIn : data.text.zoomOut);
    b.addEventListener('click', () => setZoom(ZOOMS[Math.min(ZOOMS.length - 1, Math.max(0, ZOOMS.indexOf(zoom) + step))]));
    zoomBar.append(b);
  }

  // ---- Loading -------------------------------------------------------------------------------------------------------------
  let started = false;
  async function load() {
    if (started) return;
    started = true;
    status!.textContent = root!.dataset.loading ?? '';
    try {
      const res = await fetch(root!.dataset.src!, { credentials: 'omit' });
      if (!res.ok) throw new Error('map unavailable');
      const geometry = (await res.json()) as { main: MapView; inset: MapView };
      views!.querySelector('.dist-map__main .dist-map__frame')!.append(draw(geometry.main, data.labels.main, data.names));
      views!.querySelector('.dist-map__main')!.append(zoomBar);
      views!.querySelector('.dist-map__inset .dist-map__frame')!.append(draw(geometry.inset, data.labels.inset));
      sizeNumbers();
      status!.textContent = '';
    } catch {
      status!.textContent = data.text.error;
    }
  }

  if ('IntersectionObserver' in window) {
    const watcher = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        watcher.disconnect();
        void load();
      }
    }, { rootMargin: '400px' });
    watcher.observe(root);
  } else {
    void load();
  }
}
