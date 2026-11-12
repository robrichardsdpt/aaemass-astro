// Text editors can change in the CMS (Site settings): the site notice and the wording of most pages.
// English comes from src/content/site/<page>.yml. Spanish and French come from, in this order, a fresh machine translation
// of exactly that English (src/content/site-i18n, made by scripts/translate.mjs), the translation already in
// src/i18n/pages/*.ts, or the English itself. Machine translations stay hidden from search until reviewed (docs/TRANSLATION.md).
import { parse } from 'yaml';
import { z } from 'astro/zod';
import { pick, type Lang } from '../i18n';
import { blockSchema, type Block } from './blocks-schema';
import { hashOf, localize, merge, type Entry } from './leaf-paths';
import { SITE_PAGES } from './site-page-specs';
import { home as homeCode } from '../i18n/pages/home';
import { contribute as contributeCode } from '../i18n/pages/contribute';
import { resources as resourcesCode } from '../i18n/pages/resources';
import { literatureMsgs as literatureCode } from '../i18n/pages/literature';
import { aa as aaCode } from '../i18n/pages/aa';
import { registrar as registrarCode } from '../i18n/pages/registrar';
import { volunteer as volunteerCode } from '../i18n/pages/volunteer';
import { calendar as calendarCode } from '../i18n/pages/calendar';
import { service as serviceCode } from '../i18n/pages/service';
import { serviceEn } from '../i18n/pages/service-en';

const files = import.meta.glob('../content/site/*.yml', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>;
const translated = import.meta.glob('../content/site-i18n/*/*.yml', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>;

function rawFile(name: string): string {
  const raw = Object.entries(files).find(([f]) => f.endsWith(`/${name}.yml`))?.[1];
  if (raw === undefined) throw new Error(`src/content/site/${name}.yml is missing`);
  return raw;
}

// ---- Site notice -------------------------------------------------------------------------------------------------
const opt = z.preprocess((v) => (v === '' || v === null ? undefined : v), z.string().trim().optional());
const ymd = z.preprocess((v) => (v instanceof Date ? v.toISOString().slice(0, 10) : v === '' || v === null ? undefined : v), z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Pick a date').optional());
const noticeSchema = z.object({ text: opt, link_text: opt, link_url: opt, until: ymd });
const ny = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' });
export function getNotice(): { text: string; linkText?: string; linkUrl?: string } | undefined {
  const r = noticeSchema.safeParse(parse(rawFile('notice')) ?? {});
  if (!r.success) throw new Error(`src/content/site/notice.yml is not valid: ${r.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')}`);
  const n = r.data;
  if (!n.text) return undefined;
  if (n.until && n.until < ny.format(new Date())) return undefined; // shown through the last day, gone at the next rebuild
  return { text: n.text, linkText: n.link_text, linkUrl: n.link_url };
}

// ---- Pages -------------------------------------------------------------------------------------------------------
type Json = unknown;

// Every value in the CMS file must exist in the code's English text and be the same kind of value.
function checkShape(code: Json, cms: Json, at: string, errors: string[]): void {
  if (Array.isArray(code)) {
    if (!Array.isArray(cms)) return void errors.push(`${at}: expected a list`);
    const model = code.find((c) => typeof c === 'object' && c !== null) ?? code[0];
    cms.forEach((item, i) => {
      if (typeof model === 'string') {
        if (typeof item !== 'string') errors.push(`${at}[${i}]: expected text`);
      } else checkShape(model, item, `${at}[${i}]`, errors);
    });
  } else if (typeof code === 'object' && code !== null) {
    if (typeof cms !== 'object' || cms === null || Array.isArray(cms)) return void errors.push(`${at}: expected a group of fields`);
    for (const [k, v] of Object.entries(cms)) {
      if (!(k in code)) {
        // Fields some list items have and others do not (a FAQ's link, a form's file) are allowed on list items.
        if (!/\[\d+\]$/.test(at)) errors.push(`${at ? at + '.' : ''}${k}: not a known field`);
        continue;
      }
      checkShape((code as Record<string, Json>)[k], v, `${at ? at + '.' : ''}${k}`, errors);
    }
  } else if (typeof cms !== typeof code) errors.push(`${at}: expected ${typeof code}`);
}

interface Saved { h: string; t: string }
const savedFor = (name: string, lang: Lang): Record<string, Saved> => {
  const raw = Object.entries(translated).find(([f]) => f.endsWith(`/${lang}/${name}.yml`))?.[1];
  return ((raw && parse(raw)?.t) ?? {}) as Record<string, Saved>;
};

const warned = new Set<string>();
function warn(name: string, lang: Lang, stale: number, missing: number) {
  const k = `${name}/${lang}`;
  if ((!stale && !missing) || warned.has(k)) return;
  warned.add(k);
  console.warn(`[i18n] ${name} (${lang}): ${stale} text(s) changed in English since the translation was written, ${missing} not translated yet. Run scripts/translate.mjs or see docs/TRANSLATION.md.`);
}

const blocksSchema = z.array(blockSchema);

function readPage(name: string, codeEn: Json) {
  const cms = (parse(rawFile(name)) ?? {}) as Record<string, Json>;
  const { extra_blocks, ...text } = cms;
  const errors: string[] = [];
  checkShape(codeEn, text, '', errors);
  const blocks = blocksSchema.safeParse(extra_blocks ?? []);
  if (!blocks.success) errors.push(...blocks.error.issues.map((i) => `extra_blocks.${i.path.join('.')}: ${i.message}`));
  if (errors.length) throw new Error(`src/content/site/${name}.yml is not valid: ${errors.join('; ')}`);
  return { text, blocks: blocks.success ? blocks.data : [] };
}

function page<T extends object>(name: string, all: Record<Lang, T>, lang: Lang): T {
  const spec = SITE_PAGES[name];
  const { text } = readPage(name, all.en);
  if (lang === 'en') return merge(all.en, text);
  const saved = savedFor(name, lang);
  let stale = 0;
  let missing = 0;
  const local = localize(text, all.en, pick(all, lang), { children: spec }, {
    fresh: (id, en) => (saved[id]?.h === hashOf(en) ? saved[id].t : undefined),
    leaf: (l) => {
      if (l.skip || saved[l.id]?.h === hashOf(l.text)) return; // translated from exactly this English
      if (l.codeT === undefined) missing++;
      else if (l.code !== l.text) stale++;
    },
  });
  warn(name, lang, stale, missing);
  return merge(pick(all, lang), local);
}

/** The "Extra sections" an editor added at the bottom of a page, in the page's language. */
export function getExtraBlocks(name: string, lang: Lang): Block[] {
  const { blocks } = readPage(name, PAGES[name].en);
  if (lang === 'en' || !blocks.length) return blocks;
  const saved = savedFor(name, lang);
  let missing = 0;
  const out = localize(blocks, undefined, undefined, undefined, {
    fresh: (id, en) => (saved[id]?.h === hashOf(en) ? saved[id].t : undefined),
    leaf: (l) => { if (!l.skip && saved[l.id]?.h !== hashOf(l.text)) missing++; },
  }, ['extra_blocks']) as Block[];
  warn(`${name} extra sections`, lang, 0, missing);
  return out;
}

const PAGES: Record<string, Record<Lang, object>> = {
  home: homeCode,
  contribute: contributeCode,
  resources: resourcesCode,
  literature: literatureCode,
  aa: aaCode,
  registrar: registrarCode,
  volunteer: volunteerCode,
  calendar: calendarCode,
  service: { en: serviceEn, es: serviceCode.es, fr: serviceCode.fr },
};

export const getHome = (lang: Lang) => page('home', homeCode, lang);
export const getContribute = (lang: Lang) => page('contribute', contributeCode, lang);
export const getResources = (lang: Lang) => page('resources', resourcesCode, lang);
type LiteratureEn = typeof literatureCode.en;
export type LiteraturePage = Omit<LiteratureEn, 'groups'> & { groups: (Omit<LiteratureEn['groups'][number], 'items'> & { items: (LiteratureEn['groups'][number]['items'][number] & { href: string })[] })[] };
export const getLiterature = (lang: Lang) => page('literature', literatureCode, lang) as unknown as LiteraturePage;
export const getAa = (lang: Lang) => page('aa', aaCode, lang);
export const getRegistrar = (lang: Lang) => page('registrar', registrarCode, lang);
export const getVolunteer = (lang: Lang) => page('volunteer', volunteerCode, lang);
export const getCalendar = (lang: Lang) => page('calendar', calendarCode, lang);
export type ServicePage = Omit<typeof serviceEn, 'sections'> & { sections: { title: string; paras: string[]; contact?: string }[] };
export const getService = (lang: Lang) => page('service', PAGES.service as Record<Lang, typeof serviceEn>, lang) as unknown as ServicePage;
