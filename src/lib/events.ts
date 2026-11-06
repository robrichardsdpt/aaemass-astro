export interface AreaEvent {
  title: string;
  url: string;
  start: Date;
  allDay: boolean;
  venue?: string;
}

const API = 'https://aaemass.org/wp-json/tribe/events/v1/events';

const decode = (s: string) =>
  s
    .replace(/&#8211;/g, '–')
    .replace(/&#8217;/g, '’')
    .replace(/&amp;/g, '&')
    .replace(/&#038;/g, '&');

// Runs at build time. A failed or empty response yields [] and the page
// renders its "nothing scheduled" state instead of breaking the build.
export async function getUpcomingEvents(limit = 4): Promise<AreaEvent[]> {
  try {
    const res = await fetch(`${API}?per_page=${limit}`, { signal: AbortSignal.timeout(10_000) });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.events ?? []).map((e: any) => ({
      title: decode(e.title),
      url: e.url,
      start: new Date(e.utc_start_date.replace(' ', 'T') + 'Z'),
      allDay: Boolean(e.all_day),
      venue: e.venue?.venue ? decode(e.venue.venue) : undefined,
    }));
  } catch {
    return [];
  }
}
