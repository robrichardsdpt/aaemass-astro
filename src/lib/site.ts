const base = 'https://aaemass.org';

export const site = {
  name: 'Area 30, Eastern Massachusetts Alcoholics Anonymous',
  short: 'Area 30',
  url: 'https://aaemass.org',
  email: 'info@aaemass.org',
  registrarEmail: 'registrar@aaemass.org',
  address: {
    street: 'P.O. Box 51411',
    city: 'Boston',
    region: 'MA',
    postalCode: '02205-1411',
  },
  meeting: {
    when: '4th Wednesday of even months at 7:30 PM',
    where: 'Boston Central Service office, 12 Channel St, Boston, MA 02210',
    map: 'https://www.google.com/maps/search/?api=1&query=12+Channel+St+Boston+MA+02210',
  },
  links: {
    findMeeting: 'https://www.aa.org/find-aa/north-america',
    registerForm:
      'https://drive.google.com/file/d/1nT4Sv1NXQQ8uSwO3t4Gh7Wq2MCc3AYV-/view?usp=drive_link',
    areaFolder: 'https://drive.google.com/drive/folders/14RcIZzknJIGU3-q5WoCqIu4_aAcoksrE',
  },
};

export const nav = [
  { href: `${base}/alcoholics-anonymous`, label: 'What is AA?' },
  { href: `${base}/cal`, label: 'Calendar' },
  { href: `${base}/committees/registrar`, label: 'Registrar' },
  { href: `${base}/services`, label: 'Committees' },
  { href: `${base}/districts`, label: 'Districts' },
  { href: `${base}/literature`, label: 'Literature' },
  { href: `${base}/links`, label: 'Resources' },
  { href: `${base}/contacts`, label: 'Contact' },
];

export const committees = [
  { name: 'Archives', href: `${base}/committees/archives`, image: 'archives' },
  { name: 'Cooperation with the Professional Community', short: 'C.P.C.', href: `${base}/committees/cpc`, image: 'cpc' },
  { name: 'Corrections', href: `${base}/districts/corrections`, image: 'corrections' },
  { name: 'Grapevine', href: `${base}/committees/grapevine`, image: 'grapevine' },
  { name: 'Literature', href: `${base}/committees/literature`, image: 'literature' },
  { name: 'Public Information', short: 'P.I.', href: `${base}/committees/public-information`, image: 'pi' },
] as const;

export const moreCommittees = [
  { name: 'Accessibilities', href: `${base}/committees/accessibilities` },
  { name: 'Treatment Facilities', href: `${base}/committees/treatment-facilities` },
  { name: 'Mass. State Convention', href: `${base}/committees/state-convention` },
  { name: 'Messenger', href: `${base}/committees/messenger` },
  { name: 'Registrar', href: `${base}/committees/registrar` },
  { name: 'Service Seminar', href: `${base}/committees/service-seminar` },
  { name: 'Website', href: `${base}/committees/website` },
];
