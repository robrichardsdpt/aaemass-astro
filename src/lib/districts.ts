// Districts, loaded from src/content/districts/<name>.yml (edited in the CMS at /admin/).
// Every file is validated at build time. `lines` keep the same wording as before so the Spanish and French
// translator (i18n/districts.ts) still recognizes them.
import { parse } from 'yaml';
import { z } from 'astro/zod';

const schema = z.object({
  name: z.string().trim().min(1),
  order: z.coerce.number().default(100),
  lines: z.array(z.string().trim().min(1)).min(1, 'add at least one line'),
});

export interface District { name: string; lines: string[] }

const files = import.meta.glob('../content/districts/*.yml', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>;

const parsed = Object.entries(files).map(([file, raw]) => {
  const slug = file.split('/').pop()!;
  const r = schema.safeParse(parse(raw));
  if (!r.success) {
    throw new Error(`District file src/content/districts/${slug} is not valid: ${r.error.issues.map((i) => `${i.path.join('.') || '(file)'}: ${i.message}`).join('; ')}`);
  }
  return r.data;
});

export const districts: District[] = parsed
  .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name, 'en', { numeric: true }))
  .map(({ name, lines }) => ({ name, lines }));
