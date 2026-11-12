import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { nyInstant } from './lib/event-model';

import { blockSchema, str, opt } from './lib/blocks-schema';
export { blockSchema };
export type { Block } from './lib/blocks-schema';


const pageSchema = z.object({
  title: str,
  description: str,
  eyebrow: opt,
  lede: opt,
  noindex: z.boolean().optional(),
  // "Remove from the website": hidden everywhere, and a workflow then opens a pull request that deletes the files.
  removed: z.boolean().optional(),
  blocks: z.array(blockSchema).default([]),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.yml', base: './src/content/pages' }),
  schema: pageSchema,
});

// Spanish and French copies of CMS pages: src/content/pages-i18n/<lang>/<same-file-name>.yml (see docs/TRANSLATION.md).
const pagesI18n = defineCollection({
  loader: glob({ pattern: '**/*.yml', base: './src/content/pages-i18n' }),
  schema: pageSchema,
});

// Editors type an Eastern date and clock times (native pickers, see public/admin/widgets.js). They are turned into the
// real instants the rest of the site uses as `start` and `end`, so a time never depends on the editor's own time zone.
// Older files that carry a full `start` timestamp still work.
const ymd = z.preprocess((v) => (v instanceof Date ? v.toISOString().slice(0, 10) : v), z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Pick a date'));
const hm = z.preprocess((v) => (v === '' || v === null ? undefined : v), z.string().regex(/^\d{2}:\d{2}$/, 'Pick a time').optional());

const events = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/events' }),
  schema: z
    .object({
      title: str,
      summary: str,
      date: ymd.optional(),
      end_date: ymd.optional(),
      start_time: hm,
      end_time: hm,
      start: z.coerce.date().optional(), // legacy
      end: z.coerce.date().optional(), // legacy
      all_day: z.boolean().optional(),
      location_name: opt,
      address: opt,
      online_url: opt,
      image: opt,
      image_alt: opt,
      removed: z.boolean().optional(),
    })
    .superRefine((e, ctx) => {
      if (!e.date && !e.start) ctx.addIssue({ code: 'custom', path: ['date'], message: 'Pick the event date' });
      if (e.date && !e.all_day && !e.start_time) ctx.addIssue({ code: 'custom', path: ['start_time'], message: 'Add a start time, or tick All-day event' });
      if (e.date) {
        const start = nyInstant(e.date, e.all_day ? undefined : e.start_time);
        const end = e.end_date || e.end_time ? nyInstant(e.end_date ?? e.date, e.all_day ? undefined : e.end_time ?? e.start_time) : undefined;
        if (end && end < start) ctx.addIssue({ code: 'custom', path: ['end_time'], message: 'The end is before the start' });
      }
    })
    .transform(({ date, end_date, start_time, end_time, start, end, all_day, ...rest }) => {
      if (!date) return { ...rest, all_day, start: start!, end };
      const clock = all_day ? undefined : start_time;
      const closes = end_date || end_time ? nyInstant(end_date ?? date, all_day ? undefined : end_time ?? start_time) : undefined;
      return { ...rest, all_day, start: nyInstant(date, clock), end: closes };
    }),
});

// Spanish and French copies of CMS events, written by scripts/translate.mjs:
// src/content/events-i18n/<lang>/<same-file-name>.md. Only the words change; dates and places come from the English event.
const eventsI18n = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/events-i18n' }),
  schema: z.object({ sourceHash: opt, title: str, summary: str, image_alt: opt }),
});

const settings = defineCollection({
  loader: glob({ pattern: '**/*.yml', base: './src/content/settings' }),
  schema: z.object({
    items: z.array(z.object({ label: str, url: str })).default([]),
  }),
});

export const collections = { pages, pagesI18n, events, eventsI18n, settings };
