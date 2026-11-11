// The event shape shared by the build (src/lib/all-events.ts) and the browser (src/scripts/event-*.ts), plus the pure
// helpers both need. No Astro or Node imports here: this file is bundled into client scripts.

export type EventSource = 'highlight' | 'google' | 'tribe';

export interface SearchEvent {
  id: string; // c-<cms id> | g-<ics uid>_<start> | t-<tribe id>
  source: EventSource;
  title: string;
  start: string; // ISO instant. All-day events start at midnight New York time.
  end?: string;
  allDay: boolean;
  venue?: string;
  address?: string;
  online?: string; // https URL to join
  description: string; // plain text, never HTML
  categories: string[];
  recurring?: boolean; // one date of a repeating Google Calendar event: shown in the search window only, never given its own page
  slug?: string; // static page at /events/e/<slug>/ (one-off Google and Tribe events known at build time)
  detail: string; // where the title links: the event's own page, or /calendar/#e=<id>, which opens it in the search window
  external?: string; // the event's page on the source site (Tribe only)
}

export const TZ = 'America/New_York';
export const TRIBE_API = 'https://aaemass.org/wp-json/tribe/events/v1';

const dateParts = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' });
// YYYY-MM-DD of an instant, in New York.
export const nyDate = (iso: string | number | Date): string => dateParts.format(new Date(iso));

const addDays = (ymd: string, n: number): string => {
  const d = new Date(`${ymd}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

const clockParts = new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
const isNyMidnight = (iso: string) => clockParts.format(new Date(iso)) === '00:00';

// Only http(s) links are ever followed or shown as links.
export const safeUrl = (u: unknown): string | undefined => {
  if (typeof u !== 'string') return undefined;
  try {
    const url = new URL(u.trim());
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : undefined;
  } catch {
    return undefined;
  }
};

const ONLINE = /https?:\/\/[^\s<>"')]*(zoom\.us|meet\.google\.com|teams\.microsoft\.com|webex\.com|gotomeeting\.com|whereby\.com)[^\s<>"')]*/i;
export const findOnlineUrl = (...texts: (string | undefined)[]): string | undefined => {
  for (const t of texts) {
    const m = t && ONLINE.exec(t);
    if (m) return safeUrl(m[0].replace(/[.,;]+$/, ''));
  }
  return undefined;
};

const decodeEntities = (s: string) =>
  s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, '&');

// Turns the HTML that Google and WordPress store into plain text, keeping line breaks and link addresses.
// `stripTags` is injected so the build can use sanitize-html and the browser can use DOMParser.
export function htmlToText(html: string, stripTags: (h: string) => string): string {
  const prepared = html
    .replace(/<a\s[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, (_, href, label) => {
      const text = String(label).replace(/<[^>]*>/g, '').trim();
      return !text || text === href || href.startsWith('mailto:') || href.startsWith('tel:') ? text || href : `${text} (${href})`;
    })
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|h[1-6]|tr)>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ');
  return decodeEntities(stripTags(prepared))
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// ---- Tribe (The Events Calendar) -------------------------------------------------------------------------------

const asString = (v: unknown) => (typeof v === 'string' ? v : '');

export function normalizeTribe(e: any, toText: (html: string) => string, detailFor: (id: string) => string): SearchEvent | undefined {
  if (!e || !e.id || !e.title || !e.utc_start_date) return undefined;
  const iso = (s: string) => new Date(s.replace(' ', 'T') + 'Z').toISOString();
  const v = e.venue && !Array.isArray(e.venue) ? e.venue : {};
  const address = [v.address, v.city, [v.stateprovince, v.zip].filter(Boolean).join(' ')].map(asString).filter(Boolean).join(', ');
  const description = toText(asString(e.description) || asString(e.excerpt));
  const allDay = Boolean(e.all_day);
  const start = iso(e.utc_start_date);
  return {
    id: `t-${e.id}`,
    source: 'tribe',
    title: toText(asString(e.title)),
    start,
    end: e.utc_end_date ? iso(e.utc_end_date) : undefined,
    allDay,
    venue: asString(v.venue) ? toText(asString(v.venue)) : undefined,
    address: address || undefined,
    online: findOnlineUrl(asString(e.website), description),
    description,
    categories: (Array.isArray(e.categories) ? e.categories : []).map((c: any) => toText(asString(c?.name))).filter(Boolean),
    detail: detailFor(`t-${e.id}`),
    external: safeUrl(e.url),
  };
}

// ---- Merging ----------------------------------------------------------------------------------------------------

const same = (a: SearchEvent, b: SearchEvent) =>
  a.title.trim().toLowerCase() === b.title.trim().toLowerCase() && Math.abs(Date.parse(a.start) - Date.parse(b.start)) < 60_000;

const rank: Record<EventSource, number> = { highlight: 0, tribe: 1, google: 2 };

// One list, soonest first. When the same event is in more than one source the highlighted copy wins, then Tribe.
export function mergeEvents(...lists: SearchEvent[][]): SearchEvent[] {
  const all = lists.flat().sort((a, b) => rank[a.source] - rank[b.source]);
  const kept: SearchEvent[] = [];
  for (const e of all) if (!kept.some((k) => same(k, e))) kept.push(e);
  return kept.sort((a, b) => Date.parse(a.start) - Date.parse(b.start) || a.title.localeCompare(b.title));
}

// ---- Add to calendar --------------------------------------------------------------------------------------------

const utcStamp = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
const compact = (ymd: string) => ymd.replace(/-/g, '');

// For all-day events: first day and the day after the last one (the exclusive end calendars expect).
function allDayRange(e: SearchEvent): [string, string] {
  const s = nyDate(e.start);
  if (!e.end) return [s, addDays(s, 1)];
  const last = nyDate(e.end);
  const exclusive = isNyMidnight(e.end) && Date.parse(e.end) > Date.parse(e.start) ? last : addDays(last, 1);
  return [s, exclusive > s ? exclusive : addDays(s, 1)];
}

const endOf = (e: SearchEvent) => {
  const end = e.end ? Date.parse(e.end) : NaN;
  return new Date(end > Date.parse(e.start) ? end : Date.parse(e.start) + 3_600_000);
};

const where = (e: SearchEvent) => [e.venue, e.address].filter(Boolean).join(', ');
const details = (e: SearchEvent) => [e.description, e.online ? `Join online: ${e.online}` : ''].filter(Boolean).join('\n\n');

export function googleCalendarUrl(e: SearchEvent): string {
  const dates = e.allDay
    ? allDayRange(e).map(compact).join('/')
    : `${utcStamp(new Date(e.start))}/${utcStamp(endOf(e))}`;
  const q = new URLSearchParams({ action: 'TEMPLATE', text: e.title, dates, details: details(e), location: where(e), ctz: TZ });
  return `https://calendar.google.com/calendar/render?${q}`;
}

export function outlookCalendarUrl(e: SearchEvent): string {
  const [s, x] = e.allDay ? allDayRange(e) : [new Date(e.start).toISOString(), endOf(e).toISOString()];
  const q = new URLSearchParams({
    path: '/calendar/action/compose', rru: 'addevent', subject: e.title, startdt: s, enddt: x, body: details(e), location: where(e),
    ...(e.allDay ? { allday: 'true' } : {}),
  });
  return `https://outlook.live.com/calendar/0/deeplink/compose?${q}`;
}

const escapeIcs = (s: string) => s.replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
// Lines are folded at 75 characters (spaces continue a line), as the format requires.
const fold = (line: string) => {
  const chars = [...line];
  if (chars.length <= 75) return line;
  const parts = [chars.slice(0, 75).join('')];
  for (let i = 75; i < chars.length; i += 74) parts.push(chars.slice(i, i + 74).join(''));
  return parts.join('\r\n ');
};

export function icsFile(e: SearchEvent): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Area 30 Eastern Mass. AA//Events//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${e.id}@aaemass.org`,
    `DTSTAMP:${utcStamp(new Date())}`,
    ...(e.allDay
      ? (([s, x]) => [`DTSTART;VALUE=DATE:${compact(s)}`, `DTEND;VALUE=DATE:${compact(x)}`])(allDayRange(e))
      : [`DTSTART:${utcStamp(new Date(e.start))}`, `DTEND:${utcStamp(endOf(e))}`]),
    `SUMMARY:${escapeIcs(e.title)}`,
    ...(where(e) ? [`LOCATION:${escapeIcs(where(e))}`] : []),
    ...(details(e) ? [`DESCRIPTION:${escapeIcs(details(e))}`] : []),
    ...(e.external ? [`URL:${e.external}`] : []),
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.map(fold).join('\r\n') + '\r\n';
}

export const icsFileName = (e: SearchEvent) =>
  `${e.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50) || 'event'}.ics`;

// ---- Display helpers ---------------------------------------------------------------------------------------------

// Splits plain text into paragraphs of text and links, so it can be rendered without ever being treated as HTML.
export interface Seg { t: string; href?: string }
export function paragraphs(text: string): Seg[][] {
  return text
    .split(/\n{2,}/)
    .map((block) => {
      const segs: Seg[] = [];
      let last = 0;
      for (const m of block.matchAll(/https?:\/\/[^\s<>"')]+/g)) {
        const raw = m[0].replace(/[.,;:!?]+$/, '');
        const href = safeUrl(raw);
        if (!href) continue;
        if (m.index! > last) segs.push({ t: block.slice(last, m.index) });
        segs.push({ t: raw, href });
        last = m.index! + raw.length;
      }
      if (last < block.length) segs.push({ t: block.slice(last) });
      return segs;
    })
    .filter((p) => p.length);
}

export const mapUrl = (e: SearchEvent) => {
  const q = [e.venue, e.address].filter(Boolean).join(', ');
  return q ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}` : undefined;
};

const dayFmt = new Intl.DateTimeFormat('en-US', { timeZone: TZ, weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
const timeFmt = new Intl.DateTimeFormat('en-US', { timeZone: TZ, hour: 'numeric', minute: '2-digit' });
export function whenText(e: SearchEvent): string {
  const s = new Date(e.start);
  if (e.allDay) return `${dayFmt.format(s)}, all day`;
  const end = e.end ? new Date(e.end) : undefined;
  const sameDay = end && nyDate(end) === nyDate(s);
  return `${dayFmt.format(s)}, ${timeFmt.format(s)}${end && sameDay && end > s ? ` – ${timeFmt.format(end)}` : ''} ET`;
}
