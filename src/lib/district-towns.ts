// Which district each town is in. Loaded from src/content/site/district-towns.yml and checked against the district cards,
// so a district number with no card (a typo, or a district that was removed) stops the build with a plain message.
import { parse } from 'yaml';
import { z } from 'astro/zod';
import { districts } from './districts';
import { buildTownEntries } from './town-finder';

const raw = Object.values(import.meta.glob('../content/site/district-towns.yml', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>)[0];
const schema = z.record(z.string().regex(/^\d{1,2}$/, 'the keys must be district numbers'), z.array(z.string().trim().min(1)).min(1));
const parsed = schema.safeParse(parse(raw));
if (!parsed.success) {
  throw new Error(`src/content/site/district-towns.yml is not valid: ${parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')}`);
}
const byDistrict = parsed.data;

/** The towns of every district, by district number, as written in the file (used by the district map). */
export const districtTownLists: Record<string, string[]> = byDistrict;

// A district's number appears in its card's name: "District 14", or "District 1 & 2" for a card that serves both.
const cardFor = new Map<number, { id: string; name: string }>();
for (const d of districts) for (const n of d.name.match(/\d+/g) ?? []) cardFor.set(Number(n), { id: d.id, name: d.name });

for (const [number, towns] of Object.entries(byDistrict)) {
  if (!cardFor.has(Number(number))) {
    throw new Error(`src/content/site/district-towns.yml lists towns for district ${number}, but the Districts page has no card for it. Remove the list or add the district.`);
  }
  const twice = towns.find((t, i) => towns.indexOf(t) !== i);
  if (twice) throw new Error(`src/content/site/district-towns.yml lists ${twice} twice under district ${number}.`);
}

/** Every town, in name order, with the district numbers it belongs to. */
export const townEntries = buildTownEntries(byDistrict);

/** The card that shows a district, so a number can link to it. */
export const districtCard = (number: number) => cardFor.get(number);

/** The towns of one district card, by district number, in name order: a card serving two districts has two lists. */
export function townsOfCard(cardId: string): { number: number; towns: string[] }[] {
  return Object.entries(byDistrict)
    .filter(([n]) => cardFor.get(Number(n))?.id === cardId)
    .map(([n, towns]) => ({ number: Number(n), towns: [...towns].sort((a, b) => a.localeCompare(b)) }))
    .sort((a, b) => a.number - b.number);
}
