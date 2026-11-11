import { getCollection } from 'astro:content';
import { path } from './site';
import type { Lang } from '../i18n';

export interface AreaEvent {
  id?: string; // CMS events only (src/content/events/<id>.md)
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
      id: e.id,
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

// Lists in Spanish and French use the translated title and link to the translated event page when one exists.
export async function localizeEvents(events: AreaEvent[], lang: Lang): Promise<AreaEvent[]> {
  if (lang === 'en') return events;
  const translated = new Map((await getCollection('eventsI18n')).map((t) => [t.id, t.data.title]));
  return events.map((e) => {
    const title = e.id && translated.get(`${lang}/${e.id}`);
    return title ? { ...e, title, url: path(`/${lang}/events/${e.id}/`) } : e;
  });
}
