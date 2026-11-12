import { z } from 'astro/zod';

// Editors build pages from these blocks in the CMS (public/admin/config.yml mirrors this schema).
export const str = z.string();
export const opt = z.string().optional();
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
