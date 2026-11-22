// The big events for the home page's "Upcoming events" list: assemblies, conferences, conventions and forums, not the
// routine committee and district meetings. Pure, so it is easy to test.
import type { SearchEvent } from './event-model.ts';

/** How far ahead the list looks, so it never shows something years away. */
export const MAJOR_LOOKAHEAD_DAYS = 366;

const DAY_MS = 86_400_000;
const MAJOR = /\b(assembly|conference|convention|forum)\b/i;
const ROUTINE = /\b(meeting|roundtable|orientation|planning|committee)\b/i;

export const isMajorEvent = (e: SearchEvent): boolean => !e.recurring && MAJOR.test(e.title) && !ROUTINE.test(e.title);

/** The next big events that have not finished yet, soonest first. */
export function majorEvents(events: SearchEvent[], now: Date = new Date(), limit = 5): SearchEvent[] {
  const horizon = now.getTime() + MAJOR_LOOKAHEAD_DAYS * DAY_MS;
  return events
    .filter((e) => isMajorEvent(e) && Date.parse(e.end ?? e.start) >= now.getTime() && Date.parse(e.start) <= horizon)
    .sort((a, b) => Date.parse(a.start) - Date.parse(b.start))
    .slice(0, limit);
}
