// Recurring monthly meetings ("2nd Thursday at 7:00 PM") as structured data.
export interface MonthlySchedule {
  weekday: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday
  week: 1 | 2 | 3 | 4;
  time: string; // 24h "HH:MM", America/New_York
}
const tz = 'America/New_York';
const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function nthWeekday(year: number, month: number, weekday: number, n: number): Date {
  const first = new Date(Date.UTC(year, month, 1)).getUTCDay();
  return new Date(Date.UTC(year, month, 1 + ((weekday - first + 7) % 7) + (n - 1) * 7));
}

function offsetFor(date: Date): string {
  const part = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'longOffset' }).formatToParts(date).find((p) => p.type === 'timeZoneName')?.value ?? 'GMT-05:00';
  return part.replace('GMT', '') || '+00:00';
}

// Next occurrence on or after `from`, as an ISO string with the correct Eastern offset.
export function nextOccurrence(s: MonthlySchedule, from = new Date()): string {
  for (let i = 0; i < 3; i++) {
    const base = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth() + i, 1));
    const d = nthWeekday(base.getUTCFullYear(), base.getUTCMonth(), s.weekday, s.week);
    const iso = `${d.toISOString().slice(0, 10)}T${s.time}:00${offsetFor(d)}`;
    if (new Date(iso).getTime() >= from.getTime()) return iso;
  }
  return from.toISOString();
}

export const scheduleLd = (s: MonthlySchedule) => ({
  '@type': 'Schedule',
  repeatFrequency: 'P1M',
  byDay: `https://schema.org/${days[s.weekday]}`,
  byMonthWeek: s.week,
  startTime: `${s.time}:00`,
  scheduleTimezone: tz,
});
