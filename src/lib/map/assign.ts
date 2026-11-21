// Which district each town on the map belongs to. district-towns.yml lists towns, but also villages people use as addresses
// (Hyannis, Wollaston, Dorchester) and one island group, which are not towns on the state's map. A village stands for the town
// it is in; a town that its own list or its villages put in more than one district is shown as split.
import { townKey } from '../town-finder.ts';

/** Villages and islands named in district-towns.yml, and the towns of the state's map that they are part of. */
export const VILLAGES: Record<string, string[]> = {
  Allston: ['Boston'], Brighton: ['Boston'], Charlestown: ['Boston'], Dorchester: ['Boston'], 'East Boston': ['Boston'],
  'Hyde Park': ['Boston'], 'Jamaica Plain': ['Boston'], Roslindale: ['Boston'], Roxbury: ['Boston'], 'South Boston': ['Boston'],
  'West Roxbury': ['Boston'],
  Assonet: ['Freetown'], 'East Freetown': ['Freetown'],
  Auburndale: ['Newton'], Newtonville: ['Newton'],
  'Buzzards Bay': ['Bourne'], Cataumet: ['Bourne'], Pocasset: ['Bourne'], Sagamore: ['Bourne'],
  Byfield: ['Newbury'],
  Centerville: ['Barnstable'], Cotuit: ['Barnstable'], Hyannis: ['Barnstable'], Osterville: ['Barnstable'], 'West Barnstable': ['Barnstable'],
  Cuttyhunk: ['Gosnold'],
  'East Douglas': ['Douglas'],
  'East Falmouth': ['Falmouth'], 'North Falmouth': ['Falmouth'], Waquoit: ['Falmouth'], 'Woods Hole': ['Falmouth'],
  'East Wareham': ['Wareham'], Onset: ['Wareham'],
  'Harwich Port': ['Harwich'],
  Magnolia: ['Gloucester'],
  'Martha’s Vineyard': ['Aquinnah', 'Chilmark', 'Edgartown', 'Oak Bluffs', 'Tisbury', 'West Tisbury'],
  'North Dighton': ['Dighton'],
  Rochdale: ['Leicester'],
  'South Attleboro': ['Attleboro'], 'South Barre': ['Barre'], 'South Carver': ['Carver'], 'South Dartmouth': ['Dartmouth'],
  'South Dennis': ['Dennis'], 'West Dennis': ['Dennis'],
  'South Yarmouth': ['Yarmouth'], 'Yarmouth Port': ['Yarmouth'],
  'Vineyard Haven': ['Tisbury'],
  'West Groton': ['Groton'],
  Whitinsville: ['Northbridge'],
  Wollaston: ['Quincy'],
};

/** Names in the list that stand for no one town (the former Fort Devens lies in four towns, all in the same district). */
export const NO_TOWN = new Set(['Devens']);

export type Assignment =
  | { kind: 'solid'; district: number; alsoIn: number[] } // one district; alsoIn: villages of the town that are in another
  | { kind: 'split'; districts: number[] } // in several districts (Boston)
  | { kind: 'none' }; // not in the list yet

/** The assignment of each town on the map (in the order given), from the districts' lists of towns. */
export function assignMunicipalities(byDistrict: Record<string, string[]>, municipalities: string[]): Map<string, Assignment> {
  const own = new Map<string, Set<number>>(); // towns listed by their own name
  const viaVillage = new Map<string, Set<number>>(); // towns whose villages are listed
  const add = (map: Map<string, Set<number>>, town: string, district: number) =>
    (map.get(townKey(town)) ?? map.set(townKey(town), new Set()).get(townKey(town))!).add(district);

  for (const [number, list] of Object.entries(byDistrict)) {
    for (const name of list) {
      if (NO_TOWN.has(name)) continue;
      const parts = VILLAGES[name];
      if (parts) for (const town of parts) add(viaVillage, town, Number(number));
      else add(own, name, Number(number));
    }
  }

  const sorted = (set: Iterable<number>) => [...set].sort((a, b) => a - b);
  const result = new Map<string, Assignment>();
  for (const town of municipalities) {
    const mine = own.get(townKey(town)) ?? new Set<number>();
    const village = viaVillage.get(townKey(town)) ?? new Set<number>();
    if (mine.size === 1) {
      const [district] = mine;
      result.set(town, { kind: 'solid', district, alsoIn: sorted([...village].filter((d) => d !== district)) });
    } else if (mine.size > 1 || village.size > 1) {
      result.set(town, { kind: 'split', districts: sorted(new Set([...mine, ...village])) });
    } else if (village.size === 1) {
      result.set(town, { kind: 'solid', district: [...village][0], alsoIn: [] });
    } else {
      result.set(town, { kind: 'none' });
    }
  }
  return result;
}
