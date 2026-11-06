export const site = {
  name: 'Area 30, Eastern Mass. Alcoholics Anonymous',
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
  { href: '/alcoholics-anonymous', label: 'What is AA?' },
  { href: '/cal', label: 'Calendar' },
  { href: '/committees/registrar', label: 'Registrar' },
  { href: '/committees', label: 'Committees' },
  { href: '/districts', label: 'Districts' },
  { href: '/literature', label: 'Literature' },
  { href: '/links', label: 'Resources' },
  { href: '/contacts', label: 'Contact' },
];

export const committees = [
  { name: 'Archives', href: '/committees/archives', image: 'archives' },
  { name: 'Cooperation with the Professional Community', short: 'C.P.C.', href: '/committees/cpc', image: 'cpc' },
  { name: 'Corrections', href: '/districts/corrections', image: 'corrections' },
  { name: 'Grapevine', href: '/committees/grapevine', image: 'grapevine' },
  { name: 'Literature', href: '/committees/literature', image: 'literature' },
  { name: 'Public Information', short: 'P.I.', href: '/committees/public-information', image: 'pi' },
] as const;

export const moreCommittees = [
  { name: 'Accessibilities', href: '/committees/accessibilities' },
  { name: 'Treatment Facilities', href: '/committees/treatment-facilities' },
  { name: 'Mass. State Convention', href: '/committees/state-convention' },
  { name: 'Messenger', href: '/committees/messenger' },
  { name: 'Registrar', href: '/committees/registrar' },
  { name: 'Service Seminar', href: '/committees/service-seminar' },
  { name: 'Website', href: '/committees/website' },
];
