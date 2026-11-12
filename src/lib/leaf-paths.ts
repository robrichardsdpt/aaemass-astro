// Shared by the build (src/lib/editable-pages.ts) and the translation script (scripts/translate.mjs), so both agree on
// what counts as translatable text and on how a piece of text is identified. No imports from Astro or Vite here.
import { createHash } from 'node:crypto';

/** Lists an editor can add to, remove from or reorder. `key` is the field that identifies an item (null: the item is the text). */
export interface Entry { key?: string | null; children?: Record<string, Entry> }

// Fields that hold links, settings or file names, never words.
export const SKIP_KEYS = new Set(['type', 'url', 'link_url', 'href', 'join_url', 'image', 'file', 'style', 'flip', 'count', 'show_calendar_link', 'noindex', 'by', 'sourceHash']);
// Wording kept in English on purpose (quotations), and the names of link targets used by the home page FAQ.
const KEEP = /^(@en:|findMeeting$|registerForm$)/;

const ADDRESS = /^(https?:\/\/|mailto:|\/)\S*$|^[^\s@]+@[^\s@]+\.[^\s@]+$/; // a link or an email address on its own
export const translatable = (s: unknown): s is string =>
  typeof s === 'string' && /\p{L}/u.test(s) && !ADDRESS.test(s.trim()) && !KEEP.test(s);

export const hashOf = (text: string): string => createHash('sha256').update(text).digest('hex').slice(0, 16);

export interface LeafInfo {
  id: string; // stable identity of this piece of text: the path to it, with list items named by their title/question
  text: string;
  skip: boolean; // a link, setting or quotation: never translated
  code?: string; // the English the code's translation was written for, when this item exists there
  codeT?: string; // that translation
}

export interface Hooks {
  /** A machine translation made for exactly this English text, if there is one. */
  fresh(id: string, text: string): string | undefined;
  leaf?(info: LeafInfo): void;
}

/**
 * Builds the text of a page in one language from the editor's English: each piece of text is a fresh machine translation
 * of exactly this English, else the translation that already lives in the code, else the English. Lists are matched to the
 * code by their identifying field, so adding, removing or reordering items never mixes translations up.
 */
export function localize(en: unknown, codeEn: unknown, codeT: unknown, entry: Entry | undefined, hooks: Hooks, path: (string | number)[] = [], field = ''): unknown {
  if (typeof en === 'string') {
    const info: LeafInfo = {
      id: JSON.stringify(path),
      text: en,
      skip: SKIP_KEYS.has(field) || !translatable(en),
      code: typeof codeEn === 'string' ? codeEn : undefined,
      codeT: typeof codeT === 'string' ? codeT : undefined,
    };
    hooks.leaf?.(info);
    // A link, setting or quotation is used as the editor wrote it. Text with no letters (a title like "12 & 12") keeps the
    // translation the code already has, if it was written for this same text.
    if (SKIP_KEYS.has(field) || KEEP.test(en) || ADDRESS.test(en.trim())) return en;
    if (info.skip) return info.code === en && info.codeT !== undefined ? info.codeT : en;
    return hooks.fresh(info.id, en) ?? info.codeT ?? en;
  }
  if (Array.isArray(en)) {
    const idKey = entry?.key;
    const idOf = (x: unknown) => (idKey ? (x as Record<string, unknown> | undefined)?.[idKey] : x);
    return en.map((item, i) => {
      let cE: unknown;
      let cT: unknown;
      if (entry && Array.isArray(codeEn) && Array.isArray(codeT) && idKey !== undefined) {
        const j = codeEn.findIndex((c) => idOf(c) === idOf(item));
        if (j >= 0) [cE, cT] = [codeEn[j], codeT[j]];
      }
      const name = entry && idKey !== undefined ? String(idOf(item)) : i;
      return localize(item, cE, cT, entry && { children: entry.children }, hooks, [...path, name], field);
    });
  }
  if (en && typeof en === 'object') {
    return Object.fromEntries(
      Object.entries(en).map(([k, v]) => [
        k,
        localize(v, (codeEn as Record<string, unknown> | undefined)?.[k], (codeT as Record<string, unknown> | undefined)?.[k], entry?.children?.[k], hooks, [...path, k], k),
      ]),
    );
  }
  return en;
}

/** Every piece of text on a page with what it is compared to; used to find what needs translating. */
export function leavesOf(en: unknown, codeEn: unknown, codeT: unknown, entry?: Entry, path: (string | number)[] = []): LeafInfo[] {
  const out: LeafInfo[] = [];
  localize(en, codeEn, codeT, entry, { fresh: () => undefined, leaf: (l) => out.push(l) }, path);
  return out;
}

/** Recursively merges `over` onto `base`; lists in `over` replace the list in `base`. */
export function merge<T>(base: T, over: unknown): T {
  if (over === undefined) return base;
  if (Array.isArray(over) || Array.isArray(base)) return over as T;
  if (base && typeof base === 'object' && over && typeof over === 'object') {
    const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
    for (const [k, v] of Object.entries(over)) out[k] = merge(out[k], v);
    return out as T;
  }
  return over as T;
}
