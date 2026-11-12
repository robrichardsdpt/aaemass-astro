// The English text of the Service page. The committee reports come from src/lib/mirror-data.ts.
import { services } from '../../lib/mirror-data.ts';

export const serviceEn = {
  title: 'Service in Area 30: Delegate, Committees, Reports',
  description: 'What the Delegate, Alternate Delegate, Secretary and each committee do in Area 30, when they meet and how to reach them.',
  heading: 'Services',
  eyebrow: 'Get involved',
  lede: 'Opportunity abounds for Eastern Massachusetts AA members who want to take part in service beyond their home group.',
  aboutHidden: 'About service in Area 30',
  intro1: 'The General Service Committee of Eastern Massachusetts, Area 30, supports the work of several varied committees, some whose reports can be read below. All members of Alcoholics Anonymous are welcome. Please consider making yourself available to help out where you can.',
  intro2: 'A complete list of conference and standing committees, with a way to reach each one, is on the [contact page](/contact).',
  jump: 'Jump to',
  full: 'Full {title} committee page',
  email: 'Email {email}',
  quoteNote: '',
  sections: services.sections.map((s) => ({ title: s.title, paras: s.paras })),
};
