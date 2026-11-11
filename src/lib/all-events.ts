// Every event the site knows about at build time, in one list: highlighted (CMS) events, the Google Calendar and
// the WordPress (Tribe) calendar. Fetched once per build and shared by the search index, the /events/ page and the
// static event pages.
import sanitizeHtml from 'sanitize-html';
import { getLiveEvents } from './live-content';
import { getGoogleEvents } from './gcal';
import { htmlToText, mergeEvents, normalizeTribe, nyDate, TRIBE_API, type SearchEvent } from './event-model';
import { path } from './site';

const slugify = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').slice(0, 60).replace(/^-|-$/g, '');
const toText = (h: string) => htmlToText(h, (x) => sanitizeHtml(x, { allowedTags: [], allowedAttributes: {} }));
export const eventPath = (slug: string) => path(`/events/e/${slug}/`);

async function highlighted(): Promise<SearchEvent[]> {
  const now = Date.now();
  return (await getLiveEvents())
    .filter((e) => (e.data.end ?? e.data.start).getTime() >= now)
    .map((e) => ({
      id: `c-${e.id}`,
      source: 'highlight' as const,
      title: e.data.title,
      start: e.data.start.toISOString(),
      end: e.data.end?.toISOString(),
      allDay: Boolean(e.data.all_day),
      venue: e.data.location_name,
      address: e.data.address,
      online: e.data.online_url,
      description: e.data.summary ?? '',
      categories: [],
      detail: path(`/events/${e.id}/`),
    }));
}

async function tribe(): Promise<SearchEvent[]> {
  const out: SearchEvent[] = [];
  try {
    for (let page = 1; page <= 5; page++) {
      const res = await fetch(`${TRIBE_API}/events?per_page=100&page=${page}`, { signal: AbortSignal.timeout(10_000) });
      if (!res.ok) break;
      const data = await res.json();
      for (const e of data.events ?? []) {
        const n = normalizeTribe(e, toText, () => '');
        if (n) out.push(n);
      }
      if (page >= (data.total_pages ?? 0)) break;
    }
  } catch {
    // The WordPress calendar is optional: an unreachable or empty feed just means fewer events.
  }
  return out;
}

let cached: Promise<SearchEvent[]> | undefined;

export function getAllEvents(): Promise<SearchEvent[]> {
  cached ??= (async () => {
    const [cms, google, wp] = await Promise.all([highlighted(), getGoogleEvents(), tribe()]);
    const merged = mergeEvents(cms, wp, google);
    const used = new Set<string>();
    for (const e of merged) {
      if (e.source === 'highlight') continue;
      // A repeating event's dates live in the search window, at /calendar/#e=<id>. Only one-off events get a page of their own.
      if (e.recurring) {
        e.detail = `${path('/calendar/')}#e=${encodeURIComponent(e.id)}`;
        continue;
      }
      const base = `${slugify(e.title) || 'event'}-${nyDate(e.start)}`;
      let slug = base;
      for (let i = 2; used.has(slug); i++) slug = `${base}-${i}`;
      used.add(slug);
      e.slug = slug;
      e.detail = eventPath(slug);
    }
    return merged;
  })();
  return cached;
}
