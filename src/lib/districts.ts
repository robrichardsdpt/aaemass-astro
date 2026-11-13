// Districts, loaded from src/content/districts/<name>.yml (edited in the CMS at /admin/).
// Every file is validated at build time. Editors fill in structured fields (when, online, in person, mail); this file turns
// them into the standard card lines, worded exactly as i18n/districts.ts expects, so the Spanish and French pages translate.
import { parse } from 'yaml';
import { z } from 'astro/zod';

const blank = (v: unknown) => (v === '' || v === null ? undefined : v);
const text = z.preprocess(blank, z.string().trim().optional());
const clock = z.preprocess(blank, z.string().regex(/^\d{2}:\d{2}$/, 'Pick a time').optional());

export const HOW = ['hybrid', 'virtually', 'in person'] as const;
export const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

const schema = z.object({
  name: z.string().trim().min(1),
  order: z.coerce.number().default(100),
  removed: z.boolean().optional(),
  meeting: z
    .object({
      how: z.enum(HOW),
      week: z.coerce.number().int().min(1).max(4),
      weekday: z.enum(WEEKDAYS),
      start: z.string().regex(/^\d{2}:\d{2}$/, 'Pick a start time'),
      end: clock,
      note: text,
    })
    .optional(),
  online: z
    .object({
      platform: text,
      id: text,
      password: text,
      password_label: z.preprocess(blank, z.enum(['Password', 'Passcode']).default('Password')),
      password_email: text,
      info_email: text,
    })
    .optional(),
  in_person: z.object({ place: text, address: text }).optional(),
  website: text,
  mail: text,
  payable_to: text,
  // Anything that does not fit the fields above, one line each (also the older all-lines format).
  extra_lines: z.array(z.string().trim().min(1)).default([]),
  lines: z.array(z.string().trim().min(1)).optional(),
});
type DistrictFile = z.infer<typeof schema>;

export interface District { name: string; lines: string[] }

// "19:30" -> "7:30pm", "19:00" -> "7pm"
export function clockText(hm: string): string {
  const [h, m] = hm.split(':').map(Number);
  const hour = h % 12 || 12;
  return `${hour}${m ? `:${String(m).padStart(2, '0')}` : ''}${h < 12 ? 'am' : 'pm'}`;
}
const ordinal = (n: number) => ['', '1st', '2nd', '3rd', '4th'][n];
const siteLabel = (url: string) => url.replace(/^https?:\/\//i, '').replace(/\/$/, '');

export function districtLines(d: DistrictFile): string[] {
  const out: string[] = [];
  const m = d.meeting;
  if (m) {
    const when = `${clockText(m.start)}${m.end ? ` to ${clockText(m.end)}` : ''}`;
    out.push(`Meets ${m.how} on the ${ordinal(m.week)} ${m.weekday} of the month at ${when}${m.note ? ` (${m.note})` : ''}`);
  }
  const o = d.online;
  if (o && (o.platform || o.id || o.password || o.password_email || o.info_email)) {
    out.push('Online:');
    if (o.platform) out.push(`Platform – ${o.platform}`);
    if (o.id) out.push(`ID – ${o.id}`);
    if (o.password) out.push(`${o.password_label} – ${o.password}`);
    if (o.password_email) out.push(`For password email – [${o.password_email}](mailto:${o.password_email})`);
    if (o.info_email) out.push(`For more info, email: [${o.info_email}](mailto:${o.info_email})`);
  }
  const p = d.in_person;
  if (p && (p.place || p.address)) {
    out.push(o && out.includes('Online:') ? 'In person:' : 'Address:');
    if (p.place) out.push(p.place);
    if (p.address) out.push(p.address);
  }
  if (d.website) out.push(`[${siteLabel(d.website)}](${d.website})`);
  if (d.mail) out.push(`Please mail contributions to: ${d.mail}`);
  if (d.payable_to) out.push(`Make checks payable to: ${d.payable_to}`);
  out.push(...(d.lines ?? []), ...d.extra_lines);
  return out;
}

const files = import.meta.glob('../content/districts/*.yml', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>;

const parsed = Object.entries(files).map(([file, raw]) => {
  const slug = file.split('/').pop()!;
  const r = schema.safeParse(parse(raw));
  if (!r.success) {
    throw new Error(`District file src/content/districts/${slug} is not valid: ${r.error.issues.map((i) => `${i.path.join('.') || '(file)'}: ${i.message}`).join('; ')}`);
  }
  const lines = districtLines(r.data);
  if (!lines.length) throw new Error(`District file src/content/districts/${slug} is empty: fill in when it meets, or add a line.`);
  return { ...r.data, resolved: lines };
});

export const districts: District[] = parsed
  .filter((d) => !d.removed)
  .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name, 'en', { numeric: true }))
  .map(({ name, resolved }) => ({ name, lines: resolved }));

// ---- Card layout -------------------------------------------------------------------------------------------------------
// The card is drawn as blocks (when it meets, online, in person, website, mailing address) instead of one long list. The
// English lines are grouped here and each line is translated afterwards, so the grouping never depends on the language.
export type DistrictBlock =
  | { kind: 'when'; lines: string[] }
  | { kind: 'online'; title: string; rows: string[] }
  | { kind: 'place'; title: string; lines: string[] }
  | { kind: 'link'; line: string }
  | { kind: 'mail'; lines: string[] }
  | { kind: 'text'; line: string };

const WHEN = /^(Meets |Reuniones )/;
const ONLINE = /^(Online|Join online|Join virtually):$/;
const PLACE = /^(In person|Join in person|Address|Dirección \/ Address):$/;
const ROW = /^(Platform|Zoom ID|ID|Password|Passcode|For password email|For more info, email)\b/;
const LINK = /^\[[^\]]+\]\([^)]*\)$/;
const MAIL = /^((Please )?[Mm]ail contributions to|Make checks payable to):/;

export function districtBlocks(lines: string[]): DistrictBlock[] {
  const out: DistrictBlock[] = [];
  const stop = (l: string) => WHEN.test(l) || ONLINE.test(l) || PLACE.test(l) || LINK.test(l) || MAIL.test(l);
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    const last = out[out.length - 1];
    if (WHEN.test(l)) {
      if (last?.kind === 'when') last.lines.push(l);
      else out.push({ kind: 'when', lines: [l] });
    } else if (ONLINE.test(l)) {
      const rows: string[] = [];
      while (i + 1 < lines.length && ROW.test(lines[i + 1])) rows.push(lines[++i]);
      out.push({ kind: 'online', title: l, rows });
    } else if (PLACE.test(l)) {
      const body: string[] = [];
      while (i + 1 < lines.length && !stop(lines[i + 1])) body.push(lines[++i]);
      out.push({ kind: 'place', title: l, lines: body });
    } else if (LINK.test(l)) out.push({ kind: 'link', line: l });
    else if (MAIL.test(l)) {
      if (last?.kind === 'mail') last.lines.push(l);
      else out.push({ kind: 'mail', lines: [l] });
    } else out.push({ kind: 'text', line: l });
  }
  return out;
}
