// Finding an AA group on the contribution form. The list (public/data/area30-groups.json) comes from the
// contribution page on contributions.aa.org: group number, name and district for every Area 30 group. Addresses
// come from published meeting lists and are only suggestions: see docs/GROUP-LOOKUP.md.

/** One weekly meeting: day 0 is Sunday, time is 24-hour "19:30". */
export interface GroupMeeting {
  day: number;
  time: string;
}

export interface GroupOption {
  street: string;
  town: string;
  zip: string;
  place?: string; // the location's name in the listing ("Old South Church"), so people can recognise the address
  meetings?: GroupMeeting[]; // what the listings show at this address; absent when they did not say
}

/**
 * How sure we are of the address:
 * fill   - one match, confirmed by the group's name or district; fill the fields (still editable)
 * offer  - one match with no confirmation; show it and let the person accept it
 * choose - a few possible places; let the person pick
 * none   - nothing reliable; the person types it in
 */
export type AddressConfidence = 'fill' | 'offer' | 'choose' | 'none';

export interface GroupEntry {
  id: string; // GSO number as shown on aa.org, zero padded: "000043137"
  name: string;
  district: string;
  address: 'prefill' | 'offer' | 'choose' | 'none';
  options: GroupOption[];
}

export type AddressPlan =
  | { mode: 'fill'; option: GroupOption }
  | { mode: 'offer'; option: GroupOption }
  | { mode: 'choose'; options: GroupOption[] }
  | { mode: 'none' };

const words = (s: string): string[] =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean);

/** The group number written the way aa.org shows it, zero padded: "000043137". */
export const groupNumber = (g: Pick<GroupEntry, 'id'>): string => g.id;

// People search for "43137" as often as "000043137", so numbers are compared without their leading zeros.
const withoutZeros = (digits: string): string => digits.replace(/^0+(?=\d)/, '');

/** One line for a result list. District and number tell apart groups that share a name. */
export const groupLabel = (g: GroupEntry): string => `${g.name} · ${g.district} · #${groupNumber(g)}`;

/** "Old South Church, 31 Main St, Marlborough 01752" (the place and the zip are left off when we do not have them). */
export const addressLine = (o: GroupOption): string => `${o.place ? `${o.place}, ` : ''}${o.street}, ${o.town}${o.zip ? ` ${o.zip}` : ''}`;

// Lower is better: 0 the name starts with the query, 1 a word in the name starts with it, 2 it is a number match.
function rank(g: GroupEntry, query: string[], digits: string | null): number | null {
  if (digits !== null) return withoutZeros(g.id).startsWith(withoutZeros(digits)) ? 2 : null;
  const nameWords = words(g.name);
  const allMatch = query.every((q) => nameWords.some((w) => w.startsWith(q)));
  if (!allMatch) return null;
  return words(g.name).join(' ').startsWith(query.join(' ')) ? 0 : 1;
}

/** Groups whose name (every typed word, as the start of a word) or number matches what was typed. */
export function searchGroups(groups: GroupEntry[], text: string, limit = 8): GroupEntry[] {
  const query = words(text);
  if (query.length === 0) return [];
  const digits = /^\d+$/.test(query.join('')) && query.length === 1 ? query[0] : null;
  return groups
    .map((g) => ({ g, r: rank(g, query, digits) }))
    .filter((x): x is { g: GroupEntry; r: number } => x.r !== null)
    .sort((a, b) => a.r - b.r || a.g.name.localeCompare(b.g.name) || a.g.id.localeCompare(b.g.id))
    .slice(0, limit)
    .map((x) => x.g);
}

export type MeetingPlan = { mode: 'fill'; meeting: GroupMeeting } | { mode: 'choose'; meetings: GroupMeeting[] } | { mode: 'none' };

// A group that meets every day is not helped by a seven-way pick-list; the person is better off choosing themselves.
const MAX_PICK_LIST = 7;

/** "19:30" becomes "7:30 pm". */
export function clock(hm: string): string {
  const [h, m] = hm.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'am' : 'pm'}`;
}

/** What the form should do with the day and time of the meeting at a chosen address. */
export function meetingPlan(o: GroupOption): MeetingPlan {
  const meetings = [...(o.meetings ?? [])].sort((a, b) => a.day - b.day || a.time.localeCompare(b.time));
  if (meetings.length === 0 || meetings.length > MAX_PICK_LIST) return { mode: 'none' };
  return meetings.length === 1 ? { mode: 'fill', meeting: meetings[0] } : { mode: 'choose', meetings };
}

/** What the form should do with a group's address. */
export function addressPlan(g: GroupEntry): AddressPlan {
  if (g.options.length === 0 || g.address === 'none') return { mode: 'none' };
  if (g.address === 'choose') return { mode: 'choose', options: g.options };
  const option = g.options[0];
  return g.address === 'prefill' ? { mode: 'fill', option } : { mode: 'offer', option };
}
