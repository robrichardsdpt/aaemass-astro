import { getCollection } from 'astro:content';
import { path } from './site';

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

// Events created in the CMS (src/content/events). Past events are dropped.
export async function getCmsEvents(): Promise<AreaEvent[]> {
  const now = Date.now();
  return (await getCollection('events'))
    .filter((e) => (e.data.end ?? e.data.start).getTime() >= now)
    .map((e) => ({
      title: e.data.title,
      url: path(`/events/${e.id}/`),
      start: e.data.start,
      allDay: Boolean(e.data.all_day),
      venue: e.data.location_name,
    }));
}

// Runs at build time. A failed or empty response yields [] and the page
// renders its "nothing scheduled" state instead of breaking the build.
async function getWordPressEvents(limit: number): Promise<AreaEvent[]> {
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

// CMS events first, merged with the live WordPress calendar, soonest first.
export async function getUpcomingEvents(limit = 4): Promise<AreaEvent[]> {
  const [cms, wp] = await Promise.all([getCmsEvents(), getWordPressEvents(limit)]);
  return [...cms, ...wp].sort((a, b) => a.start.getTime() - b.start.getTime()).slice(0, limit);
}
