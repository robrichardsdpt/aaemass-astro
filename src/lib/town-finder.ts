// Finding which district a town is in: the "Find your district by town" box on the Districts page. The towns come from
// src/content/site/district-towns.yml (loaded by district-towns.ts); everything here is plain logic with no page in it.

export interface TownEntry {
  town: string;
  districts: number[]; // ascending; more than one for a town split between districts (Boston)
}

const plain = (s: string): string => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
const words = (s: string): string[] => plain(s).replace(/[^a-z0-9]+/g, ' ').trim().split(' ').filter(Boolean);
const compact = (s: string): string => plain(s).replace(/[^a-z0-9]/g, '');
const boro = (s: string): string => s.replace(/borough/g, 'boro');

/** What spellings of one place share: case, accents, spaces and punctuation ignored, and "borough" shortened to "boro". */
export const townKey = (name: string): string => boro(compact(name));

/** One entry per town, in name order, from a district-number to towns map. A town in several districts lists them all. */
export function buildTownEntries(byDistrict: Record<string, string[]>): TownEntry[] {
  const districts = new Map<string, Set<number>>();
  for (const [number, towns] of Object.entries(byDistrict)) {
    for (const town of towns) districts.set(town, (districts.get(town) ?? new Set()).add(Number(number)));
  }
  return [...districts]
    .map(([town, numbers]) => ({ town, districts: [...numbers].sort((a, b) => a - b) }))
    .sort((a, b) => a.town.localeCompare(b.town));
}

// Lower is better: 0 the name starts with what was typed (as one run, so "harwich port" finds "Harwichport" too),
// 1 every typed word starts some word of the name ("bridgewater" finds "West Bridgewater"). null: no match.
// "Boro" and "borough" count as the same, in the name or in what was typed, including half-typed ("marlborou").
function rank(entry: TownEntry, typed: string[], run: string): number | null {
  const name = compact(entry.town);
  if (name.startsWith(run) || boro(name).startsWith(boro(run)) || name.startsWith(boro(run)) || boro(name).startsWith(run)) return 0;
  const nameWords = words(entry.town);
  const found = typed.every((t) => nameWords.some((w) => w.startsWith(t) || boro(w).startsWith(boro(t))));
  return found ? 1 : null;
}

/** Towns matching what was typed, best matches first. */
export function searchTowns(entries: TownEntry[], text: string, limit = 8): TownEntry[] {
  const typed = words(text);
  if (typed.length === 0) return [];
  const run = compact(text);
  return entries
    .map((e) => ({ e, r: rank(e, typed, run) }))
    .filter((x): x is { e: TownEntry; r: number } => x.r !== null)
    .sort((a, b) => a.r - b.r || a.e.town.localeCompare(b.e.town))
    .slice(0, limit)
    .map((x) => x.e);
}
