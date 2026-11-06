import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Editors build pages from these blocks in the CMS (public/admin/config.yml mirrors this schema).
const str = z.string();
const opt = z.string().optional();
const link = z.object({ label: str, url: str });

export const blockSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('text'), heading: opt, body: str }),
  z.object({
    type: z.literal('cards'),
    heading: opt,
    intro: opt,
    cards: z.array(z.object({ title: str, text: opt, link_text: opt, link_url: opt })).default([]),
  }),
  z.object({ type: z.literal('callout'), title: opt, body: str }),
  z.object({
    type: z.literal('split'),
    heading: opt,
    body: str,
    image: opt,
    image_alt: opt,
    flip: z.boolean().optional(),
    button_label: opt,
    button_url: opt,
  }),
  z.object({ type: z.literal('faq'), heading: opt, items: z.array(z.object({ q: str, a: str })).default([]) }),
  z.object({
    type: z.literal('directory'),
    heading: opt,
    intro: opt,
    items: z.array(z.object({ title: str, email: opt, url: opt, note: opt })).default([]),
  }),
  z.object({
    type: z.literal('meeting'),
    title: opt,
    lines: z.array(str).default([]),
    join_url: opt,
    show_calendar_link: z.boolean().optional(),
  }),
  z.object({ type: z.literal('links'), heading: opt, items: z.array(link).default([]) }),
  z.object({ type: z.literal('quote'), text: str, by: opt }),
  z.object({
    type: z.literal('buttons'),
    items: z.array(z.object({ label: str, url: str, style: z.enum(['primary', 'quiet']).optional() })).default([]),
  }),
  z.object({ type: z.literal('checklist'), heading: opt, items: z.array(str).default([]) }),
  z.object({ type: z.literal('events'), heading: opt, count: z.coerce.number().optional() }),
]);
export type Block = z.infer<typeof blockSchema>;

const pages = defineCollection({
  loader: glob({ pattern: '**/*.yml', base: './src/content/pages' }),
  schema: z.object({
    title: str,
    description: str,
    eyebrow: opt,
    lede: opt,
    noindex: z.boolean().optional(),
    blocks: z.array(blockSchema).default([]),
  }),
});

const events = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/events' }),
  schema: z.object({
    title: str,
    summary: str,
    start: z.coerce.date(),
    end: z.coerce.date().optional(),
    all_day: z.boolean().optional(),
    location_name: opt,
    address: opt,
    online_url: opt,
    image: opt,
    image_alt: opt,
  }),
});

const settings = defineCollection({
  loader: glob({ pattern: '**/*.yml', base: './src/content/settings' }),
  schema: z.object({
    items: z.array(z.object({ label: str, url: str })).default([]),
  }),
});

export const collections = { pages, events, settings };
