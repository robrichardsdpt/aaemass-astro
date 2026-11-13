// The month grid and the "coming up" list on the Calendar page, as plain data. Used when the site is built (the list) and in the
// browser (the month), so both agree on which day an event is on. All dates are New York dates (YYYY-MM-DD).
import { addDays, allDayRange, nyDate, type SearchEvent } from './event-model.ts';

export type CalItem = Pick<SearchEvent, 'id' | 'title' | 'start' | 'end' | 'allDay' | 'source' | 'venue'> & { recurring: boolean; href: string };
export interface Cell { ymd: string; day: number; inMonth: boolean }

export type Kind = 'district' | 'committee' | 'event';
/**
 * What sort of event this is, for the colour: a district meeting, a committee or service meeting, or an area event (assemblies,
 * conferences, Alcathons, dinners). Worked out from the title, because the Google Calendar has no categories.
 */
export function kindOf(e: Pick<CalItem, 'title' | 'source' | 'recurring'>): Kind {
  if (e.source === 'highlight') return 'event';
  if (/^district\s+[\d&\s/]+\s+meeting$/i.test(e.title.trim())) return 'district';
  if (/alcathon|alkathon|assembl|conference|convention|forum|cypaa|dinner|lottery|feedback session|kickoff/i.test(e.title)) return 'event';
  if (/committee|delegates|roundtable|area meeting|intergroup/i.test(e.title)) return 'committee';
  return e.recurring ? 'committee' : 'event';
}

/** 6 weeks of 7 days (Sunday first) that contain the month, so the grid is always the same height. */
export function monthCells(year: number, month0: number): Cell[] {
  const first = new Date(Date.UTC(year, month0, 1));
  const start = new Date(first);
  start.setUTCDate(1 - first.getUTCDay());
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setUTCDate(start.getUTCDate() + i);
    return { ymd: d.toISOString().slice(0, 10), day: d.getUTCDate(), inMonth: d.getUTCMonth() === month0 };
  });
}

/** Every New York day an event is on. All-day events cover each of their days; a timed event is on the day it starts. */
export function daysOf(e: Pick<CalItem, 'start' | 'end' | 'allDay'>): string[] {
  const first = nyDate(e.start);
  if (!e.allDay) return [first];
  const [s, exclusiveEnd] = allDayRange(e as SearchEvent);
  const days: string[] = [];
  for (let d = s; d < exclusiveEnd && days.length < 60; d = addDays(d, 1)) days.push(d);
  return days.length ? days : [first];
}

/** An all-day event that lasts more than one day: drawn as one bar across the days, like Google Calendar. */
export const isMultiDay = (e: Pick<CalItem, 'start' | 'end' | 'allDay'>) => e.allDay && daysOf(e).length > 1;

/** One multi-day event as it appears in one week: which columns (0 = Sunday) and which lane (row) it sits in. */
export interface Span { item: CalItem; col: number; len: number; lane: number; before: boolean; after: boolean }

/**
 * The bars for one week (7 New York dates, Sunday first). An event that runs on into the next or previous week is cut at the
 * week's edge and marked, so it continues on the next row. Overlapping events go in separate lanes; ones that do not
 * overlap share a lane. `lanes` is how many rows the week needs for them.
 */
export function weekSpans(week: string[], multiDay: CalItem[]): { spans: Span[]; lanes: number } {
  const found: Omit<Span, 'lane'>[] = [];
  for (const item of multiDay) {
    const days = daysOf(item);
    const first = days[0];
    const last = days[days.length - 1];
    if (last < week[0] || first > week[6]) continue;
    const col = first < week[0] ? 0 : week.indexOf(first);
    const end = last > week[6] ? 6 : week.indexOf(last);
    found.push({ item, col, len: end - col + 1, before: first < week[0], after: last > week[6] });
  }
  // Longer first, then by title, so the same bars land in the same lanes every time.
  found.sort((a, b) => a.col - b.col || b.len - a.len || a.item.title.localeCompare(b.item.title));
  const laneEnds: number[] = []; // the last column each lane is used up to
  const spans = found.map((f) => {
    let lane = laneEnds.findIndex((end) => end < f.col);
    if (lane < 0) lane = laneEnds.length;
    laneEnds[lane] = f.col + f.len - 1;
    return { ...f, lane };
  });
  return { spans, lanes: laneEnds.length };
}

/** All-day first, then by start time, then by title. */
export const byTime = (a: CalItem, b: CalItem) => Number(b.allDay) - Number(a.allDay) || Date.parse(a.start) - Date.parse(b.start) || a.title.localeCompare(b.title);

export function indexByDay(items: CalItem[]): Map<string, CalItem[]> {
  const map = new Map<string, CalItem[]>();
  for (const item of items) for (const day of daysOf(item)) (map.get(day) ?? map.set(day, []).get(day)!).push(item);
  for (const list of map.values()) list.sort(byTime);
  return map;
}

/** The days from `from` for `days` days that have events, each with its events in order. */
export function agenda(items: CalItem[], from: string, days: number): { ymd: string; items: CalItem[] }[] {
  const index = indexByDay(items);
  const out: { ymd: string; items: CalItem[] }[] = [];
  for (let i = 0; i < days; i++) {
    const ymd = addDays(from, i);
    const list = index.get(ymd);
    if (list?.length) out.push({ ymd, items: list });
  }
  return out;
}

const chipFormats = new Map<string, Intl.DateTimeFormat>();
/** "7 pm", "7:30 pm" ("7pm" when compact), or "19:00" in 24-hour languages: short enough for a calendar chip. */
export function chipTime(iso: string, locale: string, compact = false): string {
  let f = chipFormats.get(locale); // one formatter per language: making one is slow, and a month has dozens of chips
  if (!f) chipFormats.set(locale, (f = new Intl.DateTimeFormat(locale, { timeZone: 'America/New_York', hour: 'numeric', minute: '2-digit' })));
  const parts = f.formatToParts(new Date(iso));
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  const period = get('dayPeriod');
  if (!period) return `${get('hour').padStart(2, '0')}:${get('minute')}`;
  return `${get('hour')}${get('minute') === '00' ? '' : `:${get('minute')}`}${compact ? '' : ' '}${period.toLowerCase().replace(/\./g, '')}`;
}
