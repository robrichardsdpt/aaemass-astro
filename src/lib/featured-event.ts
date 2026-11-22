// Picks the one event the home page promotes under the banner. Pure, so it is easy to test.
// An event an editor ticked "Feature on the home page" wins. Otherwise the next Area 30 Assembly is promoted
// automatically once it is close enough to matter. Nothing is promoted when neither applies.
import type { SearchEvent } from './event-model.ts';
import { nextAssembly } from './next-assembly.ts';

/** How far ahead an Area Assembly is promoted without anyone choosing it. */
export const ASSEMBLY_LEAD_DAYS = 120;

const DAY_MS = 86_400_000;

export interface FeaturedEvent {
  event: SearchEvent;
  /** 'chosen' by an editor in the CMS, or 'assembly' because it is the next Area 30 Assembly. */
  kind: 'chosen' | 'assembly';
}

const hasNotFinished = (e: SearchEvent, now: Date) => Date.parse(e.end ?? e.start) >= now.getTime();

export function pickFeatured(events: SearchEvent[], now: Date = new Date()): FeaturedEvent | undefined {
  const chosen = events
    .filter((e) => e.featured && hasNotFinished(e, now))
    .sort((a, b) => Date.parse(a.start) - Date.parse(b.start))[0];
  if (chosen) return { event: chosen, kind: 'chosen' };

  const assembly = nextAssembly(events, now);
  if (assembly && Date.parse(assembly.start) - now.getTime() <= ASSEMBLY_LEAD_DAYS * DAY_MS) {
    return { event: assembly, kind: 'assembly' };
  }
  return undefined;
}
