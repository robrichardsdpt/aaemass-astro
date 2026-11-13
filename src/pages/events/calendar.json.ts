// The lean list for the Calendar page's month view: just what a chip needs, so it stays small (the full search index,
// with descriptions, is search.json). End times are only sent for all-day events, which can span several days.
// It also carries this month's events that are already over (marked o), so the month does not look empty up to today.
import { getAllEvents } from '../../lib/all-events';
import { getGoogleEvents } from '../../lib/gcal';
import { nyDate } from '../../lib/event-model';

const DAY = 86_400_000;

export async function GET() {
  const now = Date.now();
  const upcoming = await getAllEvents();
  const have = new Set(upcoming.map((e) => e.id));
  const monthStart = Date.parse(`${nyDate(new Date(now)).slice(0, 7)}-01T00:00:00Z`) - DAY;
  const over = (await getGoogleEvents(monthStart, Math.ceil((now - monthStart) / DAY) + 1)).filter((e) => !have.has(e.id) && Date.parse(e.end ?? e.start) < now);

  const lean = (e: (typeof upcoming)[number], past = false) => ({
    i: e.id,
    t: e.title,
    s: e.start,
    ...(e.allDay && e.end ? { e: e.end } : {}),
    ...(e.allDay ? { a: 1 } : {}),
    ...(e.recurring ? { r: 1 } : {}),
    x: e.source[0], // h = highlighted (CMS), g = Google Calendar, t = WordPress
    ...(past ? { o: 1 } : e.recurring ? {} : { d: e.detail }), // a repeating date opens in the Explore events window: /calendar/#e=<id>
  });
  const events = [...over.map((e) => lean(e, true)), ...upcoming.map((e) => lean(e))].sort((a, b) => Date.parse(a.s) - Date.parse(b.s));
  return new Response(JSON.stringify({ built: new Date(now).toISOString(), events }), { headers: { 'Content-Type': 'application/json' } });
}
