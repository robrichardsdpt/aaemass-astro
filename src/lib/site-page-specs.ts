// Which pages are edited in the CMS (Site settings), and which of their lists editors can change. A list names the field
// that identifies each item, so Spanish and French items stay matched to them. No imports: scripts/translate.mjs reads this too.
import type { Entry } from './leaf-paths';

export const SITE_PAGES: Record<string, Record<string, Entry>> = {
  home: { steps: { key: 'title' }, faqs: { key: 'q' } },
  contribute: { faqs: { key: 'q' }, gives: { key: null } },
  resources: { official: { key: 'href' }, quick: { key: 'href' } },
  literature: { groups: { key: 'title', children: { items: { key: 'title' } } } },
  aa: { faqs: { key: 'q' } },
  registrar: { forms: { key: 'title' }, faqs: { key: 'q' } },
  volunteer: { how: { key: null } },
  calendar: { faqs: { key: 'q' } },
  service: { sections: { key: 'title', children: { paras: { key: null } } } },
};
