// Committees, loaded from src/content/committees/<slug>.yml (edited in the CMS at /admin/).
// Every file is validated at build time, so a bad edit fails the build instead of reaching the live site.
import { parse } from 'yaml';
import { z } from 'astro/zod';
import { path } from './site';
import type { MonthlySchedule } from './schedule';

export interface CommitteePage {
  title: string;
  eyebrow: string;
  email: string;
  lede: string;
  description: string;
  quote?: { text: string; by: string };
  sections: { title: string; paras?: string[]; items?: string[]; links?: { text: string; href: string }[] }[];
  seoTitle?: string;
  schedule?: MonthlySchedule;
  meeting?: { intro?: string; chips?: string[]; lines: string[]; join?: { text: string; href: string }; calendar?: boolean };
  cta: string;
  more?: { text: string; href: string };
}

const str = z.string().trim().min(1);
const opt = z.string().trim().optional();
// Decap writes empty optional lists/strings as '' or [] — treat those as "not set".
const blank = (v: unknown) => (v === '' || v === null || (Array.isArray(v) && v.length === 0) ? undefined : v);
const optional = <T extends z.ZodTypeAny>(schema: T) => z.preprocess(blank, schema.optional());

const link = z.object({ text: str, href: str });

const schema = z.object({
  title: str,
  removed: z.boolean().optional(),
  short_name: optional(str),
  group: z.enum(['conference', 'standing']),
  order: z.coerce.number().default(100),
  // tile: picture tile on the home and Committees pages; list: a text link in "also"; hidden: Contact page only.
  listing: z.enum(['tile', 'list', 'hidden']).default('list'),
  tile_image: optional(z.enum(['archives', 'cpc', 'corrections', 'grapevine', 'literature', 'pi'])),
  // standard: page built from this file; custom: a page built in code (Registrar); none: no page of its own.
  page_type: z.enum(['standard', 'custom', 'none']).default('standard'),
  email: z.string().trim().email(),
  seo_title: optional(str),
  eyebrow: optional(str),
  lede: optional(str),
  description: optional(str),
  quote: optional(z.object({ text: str, by: str })),
  sections: z.preprocess(
    (v) => v ?? [],
    z.array(
      z.object({
        title: str,
        paras: optional(z.array(str)),
        items: optional(z.array(str)),
        links: optional(z.array(link)),
      }),
    ),
  ),
  schedule: optional(
    z.object({
      weekday: z.coerce.number().int().min(0).max(6),
      week: z.coerce.number().int().min(1).max(4),
      time: z.coerce.string().regex(/^\d{2}:\d{2}$/, 'time must look like 19:30'),
    }),
  ),
  meeting: optional(
    z.object({
      intro: optional(str),
      chips: optional(z.array(str)),
      lines: z.preprocess((v) => v ?? [], z.array(str)),
      join: optional(link),
      calendar: z.boolean().optional(),
    }),
  ),
  cta: optional(str),
  more: optional(link),
});

// Spanish and French committee text, from src/content/committees-i18n/<lang>/<slug>.yml. These files are written
// by scripts/translate.mjs (machine translation, hidden from search until reviewed) and can be edited by hand.
// They take precedence over the older translations in src/i18n/pages/committees.ts.
const translationSchema = z.object({
  sourceHash: opt,
  name: str,
  short: optional(str),
  tile: str,
  label: str,
  eyebrow: str,
  seoTitle: optional(str),
  lede: str,
  description: str,
  quote: optional(z.object({ text: str, by: str })),
  sections: z.preprocess(
    (v) => v ?? [],
    z.array(z.object({ title: str, paras: optional(z.array(str)), items: optional(z.array(str)), links: optional(z.array(str)) })),
  ),
  meeting: optional(z.object({ intro: optional(str), lines: z.preprocess((v) => v ?? [], z.array(str)), joinText: optional(str) })),
  cta: str,
  more: optional(str),
});
export type CommitteeTranslation = z.infer<typeof translationSchema>;

export const committeeTranslations: Record<'es' | 'fr', Record<string, CommitteeTranslation>> = { es: {}, fr: {} };
const translationFiles = import.meta.glob('../content/committees-i18n/*/*.yml', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>;
for (const [file, raw] of Object.entries(translationFiles)) {
  const [, lang, name] = file.match(/committees-i18n\/(es|fr)\/([^/]+)\.yml$/) ?? [];
  if (!lang) continue;
  const r = translationSchema.safeParse(parse(raw));
  if (!r.success) {
    throw new Error(`Translation file src/content/committees-i18n/${lang}/${name}.yml is not valid: ${r.error.issues.map((i) => `${i.path.join('.') || '(file)'}: ${i.message}`).join('; ')}`);
  }
  committeeTranslations[lang as 'es' | 'fr'][name] = r.data;
}

export interface DirectoryEntry {
  slug: string;
  title: string;
  shortName?: string;
  group: 'conference' | 'standing';
  order: number;
  listing: 'tile' | 'list' | 'hidden';
  tileImage?: 'archives' | 'cpc' | 'corrections' | 'grapevine' | 'literature' | 'pi';
  pageType: 'standard' | 'custom' | 'none';
  email: string;
}

const files = import.meta.glob('../content/committees/*.yml', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>;

const entries: DirectoryEntry[] = [];
export const committees: Record<string, CommitteePage> = {};

for (const [file, raw] of Object.entries(files)) {
  const slug = file.split('/').pop()!.replace(/\.yml$/, '');
  const result = schema.safeParse(parse(raw));
  if (!result.success) {
    const problems = result.error.issues.map((i) => `${i.path.join('.') || '(file)'}: ${i.message}`).join('; ');
    throw new Error(`Committee file src/content/committees/${slug}.yml is not valid: ${problems}`);
  }
  const d = result.data;
  if (d.removed) continue; // "Remove from the website": see scripts/remove-content.mjs
  if (d.listing === 'tile' && !d.tile_image) throw new Error(`Committee ${slug}: listing "tile" needs a tile image.`);
  if (d.listing !== 'hidden' && d.page_type === 'none') throw new Error(`Committee ${slug}: only "hidden" committees can have no page.`);
  entries.push({
    slug,
    title: d.title,
    shortName: d.short_name,
    group: d.group,
    order: d.order,
    listing: d.listing,
    tileImage: d.tile_image,
    pageType: d.page_type,
    email: d.email,
  });
  if (d.page_type === 'standard') {
    for (const k of ['eyebrow', 'lede', 'description', 'cta'] as const) {
      if (!d[k]) throw new Error(`Committee ${slug}: "${k}" is required for committees that have a page.`);
    }
    committees[slug] = {
      title: d.title,
      eyebrow: d.eyebrow!,
      email: d.email,
      lede: d.lede!,
      description: d.description!,
      quote: d.quote,
      sections: d.sections.map((s) => ({
        ...s,
        links: s.links?.map((l) => ({ ...l, href: l.href.startsWith('/') ? path(l.href) : l.href })),
      })),
      seoTitle: d.seo_title,
      schedule: d.schedule as MonthlySchedule | undefined,
      meeting: d.meeting,
      cta: d.cta!,
      more: d.more,
    };
  }
}

/** Every committee, in display order: Contact page, tiles and lists all read from this. */
export const committeeDirectory: DirectoryEntry[] = entries.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));

/** Picture tiles (home and Committees pages). */
export const featuredCommittees = committeeDirectory.filter((c) => c.listing === 'tile');
/** Text links under "also". */
export const listedCommittees = committeeDirectory.filter((c) => c.listing === 'list');
