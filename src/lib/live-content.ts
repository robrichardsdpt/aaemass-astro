// Content that has not been marked "Remove from the website" in the CMS. Everything that lists or routes CMS pages
// and events goes through these, so a removed entry disappears everywhere at once (and scripts/remove-content.mjs,
// run by the Remove content workflow, later deletes its files).
import { getCollection } from 'astro:content';

export const getLiveEvents = async () => (await getCollection('events')).filter((e) => !e.data.removed);
export const getLivePages = async () => (await getCollection('pages')).filter((p) => !p.data.removed);
export const getLivePagesI18n = async () => (await getCollection('pagesI18n')).filter((p) => !p.data.removed);
