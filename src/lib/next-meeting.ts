// "The 2nd Tuesday of the month at 7pm" -> the next date it happens, in New York time. Pure, no imports: used when the
// site is built (so the date is in the page for search engines and for visitors without JavaScript) and again in the
// browser (so it is right between the daily rebuilds).
export interface Schedule { week: number; weekday: number; start: string; end?: string } // weekday 0 = Sunday; start/end "HH:MM"

const TZ = 'America/New_York';
const parts = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
const pad = (n: number) => String(n).padStart(2, '0');
const minutes = (hm: string) => Number(hm.slice(0, 2)) * 60 + Number(hm.slice(3, 5));

/** Day of the month of the nth (1-4) given weekday of a month. */
export function nthWeekday(year: number, month0: number, weekday: number, nth: number): number {
  const firstWeekday = new Date(Date.UTC(year, month0, 1)).getUTCDay();
  return 1 + ((weekday - firstWeekday + 7) % 7) + (nth - 1) * 7;
}

/** The next meeting on or after now, as YYYY-MM-DD. `today` is true while today's meeting has not finished (one hour if no end time). */
export function nextMeeting(s: Schedule, now: Date = new Date()): { ymd: string; today: boolean } {
  const p = Object.fromEntries(parts.formatToParts(now).map((x) => [x.type, x.value]));
  const todayYmd = `${p.year}-${p.month}-${p.day}`;
  const nowMin = Number(p.hour) * 60 + Number(p.minute);
  let y = Number(p.year);
  let m = Number(p.month);
  for (let i = 0; i < 14; i++) {
    const ymd = `${y}-${pad(m)}-${pad(nthWeekday(y, m - 1, s.weekday, s.week))}`;
    if (ymd > todayYmd) return { ymd, today: false };
    if (ymd === todayYmd && nowMin < (s.end ? minutes(s.end) : minutes(s.start) + 60)) return { ymd, today: true };
    if (++m > 12) { m = 1; y++; }
  }
  throw new Error('no next meeting found');
}

const labelFormats = new Map<string, Intl.DateTimeFormat>();
/** "Tue, Dec 8" in the visitor's language. The date is read at noon UTC so no time zone can move it to another day. */
export function dayLabel(ymd: string, locale: string): string {
  let f = labelFormats.get(locale);
  if (!f) labelFormats.set(locale, (f = new Intl.DateTimeFormat(locale, { timeZone: 'UTC', weekday: 'short', month: 'short', day: 'numeric' })));
  return f.format(new Date(`${ymd}T12:00:00Z`));
}
