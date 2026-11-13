// Earlier months for the Calendar page's month view, so you can browse back like in Google Calendar. Fetched only when someone
// goes back past the current month. These are over, so there is no link to follow: just what was on, and when.
import { getGoogleEvents } from '../../lib/gcal';
import { nyDate } from '../../lib/event-model';

const DAY = 86_400_000;
const FEED_START = Date.UTC(2020, 0, 1); // before the calendar was started; nothing is found earlier

export async function GET() {
  const now = Date.now();
  // Everything before this month; the current month's earlier days are already in calendar.json.
  const boundary = Date.parse(`${nyDate(new Date(now)).slice(0, 7)}-01T00:00:00Z`) - DAY;
  const events = (await getGoogleEvents(FEED_START, Math.ceil((boundary - FEED_START) / DAY)))
    .filter((e) => Date.parse(e.end ?? e.start) < now)
    .map((e) => ({
      i: e.id,
      t: e.title,
      s: e.start,
      ...(e.allDay && e.end ? { e: e.end } : {}),
      ...(e.allDay ? { a: 1 } : {}),
      x: 'g',
      o: 1,
    }))
    .sort((a, b) => Date.parse(a.s) - Date.parse(b.s));
  return new Response(JSON.stringify({ events }), { headers: { 'Content-Type': 'application/json' } });
}
