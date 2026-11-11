// Reads Area 30's public Google Calendar (the one embedded on /calendar/) from its public ICS feed, at build time,
// and expands recurring events into individual dates.
import rrulePkg from 'rrule';
const { RRule } = rrulePkg;
import sanitizeHtml from 'sanitize-html';
import { findOnlineUrl, htmlToText, nyDate, safeUrl, TZ, type SearchEvent } from './event-model';

export const CALENDAR_ID = 'c_e40e30ffd5eb9230c6b99adbf408b50dcb0ac722b49d236f958d2865eb9dfabd@group.calendar.google.com';
const FEED = `https://calendar.google.com/calendar/ical/${encodeURIComponent(CALENDAR_ID)}/public/basic.ics`;

interface Prop { params: Record<string, string>; value: string }
interface Raw {
  uid: string;
  props: Map<string, Prop[]>;
}

const unescapeText = (s: string) => s.replace(/\\n/gi, '\n').replace(/\\([,;\\])/g, '$1');
const text = (html: string) => htmlToText(html, (h) => sanitizeHtml(h, { allowedTags: [], allowedAttributes: {} }));

function parseVEvents(ics: string): Raw[] {
  const lines = ics.replace(/\r?\n[ \t]/g, '').split(/\r?\n/);
  const out: Raw[] = [];
  let cur: Raw | undefined;
  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') cur = { uid: '', props: new Map() };
    else if (line === 'END:VEVENT') {
      if (cur?.uid) out.push(cur);
      cur = undefined;
    } else if (cur) {
      const colon = line.indexOf(':');
      if (colon < 0) continue;
      const [name, ...rest] = line.slice(0, colon).split(';');
      const params = Object.fromEntries(rest.map((p) => p.split('=') as [string, string]));
      const key = name.toUpperCase();
      const value = line.slice(colon + 1);
      if (key === 'UID') cur.uid = value;
      (cur.props.get(key) ?? cur.props.set(key, []).get(key)!).push({ params, value });
    }
  }
  return out;
}

// Offset (ms) of a time zone from UTC at a given instant.
const offsetFmt = new Map<string, Intl.DateTimeFormat>();
function tzOffset(at: number, tz: string): number {
  let f = offsetFmt.get(tz);
  if (!f) offsetFmt.set(tz, (f = new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })));
  const p = Object.fromEntries(f.formatToParts(new Date(at)).map((x) => [x.type, x.value]));
  return Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second) - at;
}

// "Wall clock" time in a zone to a real instant (two passes to land correctly across a DST change).
function zonedToInstant(wall: number, tz: string): number {
  const first = wall - tzOffset(wall, tz);
  return wall - tzOffset(first, tz);
}

interface When { wall: number; tz?: string; utc: boolean; allDay: boolean }

function parseWhen(p: Prop | undefined): When | undefined {
  const m = p && /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z)?)?$/.exec(p.value);
  if (!p || !m) return undefined;
  const wall = Date.UTC(+m[1], +m[2] - 1, +m[3], +(m[4] ?? 0), +(m[5] ?? 0), +(m[6] ?? 0));
  const allDay = p.params.VALUE === 'DATE' || m[4] === undefined;
  return { wall, utc: m[7] === 'Z', tz: p.params.TZID, allDay };
}

function instant(w: When): number {
  if (w.utc) return w.wall;
  // Zones this feed might name that Intl does not know fall back to New York.
  let tz = w.tz ?? TZ;
  try { new Intl.DateTimeFormat('en-US', { timeZone: tz }); } catch { tz = TZ; }
  return zonedToInstant(w.wall, tz);
}

const first = (r: Raw, k: string) => r.props.get(k)?.[0];
const val = (r: Raw, k: string) => unescapeText(first(r, k)?.value ?? '');

const DAY = 86_400_000;

export async function getGoogleEvents(from = Date.now(), days = 548): Promise<SearchEvent[]> {
  let ics: string;
  try {
    const res = await fetch(FEED, { signal: AbortSignal.timeout(15_000) });
    if (!res.ok) return [];
    ics = await res.text();
  } catch {
    return [];
  }
  const to = from + days * DAY;
  const raw = parseVEvents(ics);
  const overrides = new Set<string>();
  for (const r of raw) {
    const id = parseWhen(first(r, 'RECURRENCE-ID'));
    if (id) overrides.add(`${r.uid}|${instant(id)}`);
  }

  const events: SearchEvent[] = [];
  const add = (r: Raw, startMs: number, endMs: number | undefined, allDay: boolean, recurring = false) => {
    if ((endMs ?? startMs) < from || startMs > to) return;
    if (val(r, 'STATUS') === 'CANCELLED') return;
    const title = text(val(r, 'SUMMARY')) || 'Area 30 event';
    const description = text(val(r, 'DESCRIPTION')).slice(0, 2000);
    const location = text(val(r, 'LOCATION'));
    const online = findOnlineUrl(location, val(r, 'DESCRIPTION'), description) ?? safeUrl(location);
    const iso = new Date(startMs).toISOString();
    events.push({
      id: `g-${r.uid.replace(/@google\.com$/, '')}_${iso.replace(/\D/g, '').slice(0, 12)}`,
      source: 'google',
      title,
      start: iso,
      end: endMs ? new Date(endMs).toISOString() : undefined,
      allDay,
      address: online && location === online ? undefined : location || undefined,
      online,
      description,
      categories: [],
      recurring,
      detail: '',
    });
  };

  for (const r of raw) {
    const s = parseWhen(first(r, 'DTSTART'));
    if (!s) continue;
    const e = parseWhen(first(r, 'DTEND'));
    const startMs = instant(s);
    const length = e ? instant(e) - startMs : undefined;
    const rule = first(r, 'RRULE')?.value;
    if (first(r, 'RECURRENCE-ID') || !rule) {
      add(r, startMs, length === undefined ? undefined : startMs + length, s.allDay, Boolean(first(r, 'RECURRENCE-ID')));
      continue;
    }
    // Expand in wall-clock time (as if UTC) so "1st Monday at 7:30 PM" stays at 7:30 PM across daylight saving.
    let rrule: InstanceType<typeof RRule>;
    try {
      rrule = RRule.fromString(`DTSTART:${new Date(s.wall).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}\nRRULE:${rule}`);
    } catch {
      add(r, startMs, length === undefined ? undefined : startMs + length, s.allDay, true);
      continue;
    }
    const skipped = new Set((r.props.get('EXDATE') ?? []).flatMap((p) => p.value.split(',').map((v) => parseWhen({ params: p.params, value: v }))).filter(Boolean).map((w) => instant(w!)));
    const slack = 2 * DAY; // rule is in wall-clock time, window is in real time
    for (const wall of rrule.between(new Date(from - slack), new Date(to + slack), true)) {
      const w: When = { ...s, wall: wall.getTime() };
      const at = instant(w);
      if (skipped.has(at) || overrides.has(`${r.uid}|${at}`)) continue;
      add(r, at, length === undefined ? undefined : at + length, s.allDay, true);
    }
  }
  return events;
}

// Re-exported so pages can show an all-day Google event on the right New York date.
export { nyDate };
