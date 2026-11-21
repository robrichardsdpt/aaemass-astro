// Finds the next Area 30 Assembly in the calendar and says what kind it is. Pure, so it is easy to test.
// Only Area 30's own assemblies count: "Area 30 Kickoff & Budget Assembly" does, "Northeast Regional ... Assembly" (NERAASA) does not.
import type { SearchEvent } from './event-model';

export type AssemblyKind = 'kickoff' | 'pre' | 'post' | 'workshop' | 'election' | 'other';

export const isAreaAssembly = (title: string): boolean => /^area\s*30\b.*\bassembly\b/i.test(title);

export function assemblyKind(title: string): AssemblyKind {
  if (/kick-?off|budget/i.test(title)) return 'kickoff';
  if (/post-?\s?conference/i.test(title)) return 'post';
  if (/pre-?\s?conference/i.test(title)) return 'pre';
  if (/election/i.test(title)) return 'election';
  if (/workshop/i.test(title)) return 'workshop';
  return 'other';
}

/** The soonest Area 30 Assembly that has not finished yet. */
export function nextAssembly(events: SearchEvent[], now: Date = new Date()): SearchEvent | undefined {
  return events
    .filter((e) => isAreaAssembly(e.title) && new Date(e.end ?? e.start).getTime() >= now.getTime())
    .sort((a, b) => a.start.localeCompare(b.start))[0];
}
