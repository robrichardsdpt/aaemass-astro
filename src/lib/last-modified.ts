import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';

// Where each page's own words and data live, relative to the repository root. The date a page was last changed is the
// date of the newest commit touching any of these files. Shared parts (header, footer, styles) are not counted, so
// "modified" means the page's content changed. A page not listed here has no date, which is better than a wrong one.
const fixed: Record<string, string[]> = {
  '': ['src/views/Home.astro', 'src/i18n/pages/home.ts'],
  'alcoholics-anonymous': ['src/pages/alcoholics-anonymous.astro', 'src/i18n/pages/aa.ts'],
  calendar: ['src/views/Calendar.astro', 'src/i18n/pages/calendar.ts'],
  committees: ['src/views/CommitteesIndex.astro', 'src/i18n/pages/committeesIndex.ts'],
  contact: ['src/views/Contact.astro', 'src/i18n/pages/contact.ts', 'src/content/site/contact.yml'],
  contribute: ['src/views/Contribute.astro', 'src/i18n/pages/contribute.ts'],
  districts: ['src/views/Districts.astro', 'src/i18n/pages/districts.ts', 'src/content/districts'],
  'districts/map': ['src/views/DistrictMap.astro', 'src/i18n/pages/districts.ts', 'src/content/site/district-towns.yml', 'src/data/area30-map.json'],
  literature: ['src/pages/literature.astro', 'src/i18n/pages/literature.ts'],
  resources: ['src/pages/resources.astro', 'src/i18n/pages/resources.ts'],
  service: ['src/views/Service.astro', 'src/i18n/pages/service.ts', 'src/i18n/pages/service-en.ts'],
  'committees/registrar': ['src/pages/committees/registrar.astro', 'src/i18n/pages/registrar.ts'],
  'committees/treatment-facilities/12th-step-volunteer': ['src/views/Volunteer.astro', 'src/i18n/pages/volunteer.ts'],
};

/** The source files behind a page, given its route key (no language prefix, no slashes at the ends). */
function sourcesOf(key: string): string[] {
  if (key in fixed) return fixed[key];
  const committee = key.match(/^committees\/([^/]+)$/)?.[1];
  if (committee) return [`src/content/committees/${committee}.yml`, 'src/views/Committee.astro', 'src/i18n/committees.ts'];
  if (!key.includes('/')) return [`src/content/pages/${key}.yml`];
  return [];
}

const cache = new Map<string, string | undefined>();

/**
 * The date (YYYY-MM-DD) the page's content last changed, from git history, or undefined when it can't be known
 * (a page with no known source, or a build without git history). Callers leave the date out rather than guess.
 */
export function lastModified(routeKey: string): string | undefined {
  const key = routeKey.replace(/^\/+|\/+$/g, '');
  if (!cache.has(key)) {
    const files = sourcesOf(key).filter((f) => existsSync(f));
    let date: string | undefined;
    if (files.length) {
      try {
        date = execFileSync('git', ['log', '-1', '--format=%cs', '--', ...files], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim() || undefined;
      } catch {
        date = undefined;
      }
    }
    cache.set(key, date);
  }
  return cache.get(key);
}
