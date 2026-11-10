const base = 'https://aaemass.org';

// Internal links for this site. BASE_URL is '/' locally, '/aaemass-astro/' on GitHub Pages and the plugin path in WordPress.
export const path = (p: string) => {
  const [route, hash] = p.split('#');
  const withSlash = route === '/' || route.endsWith('/') || route.includes('.') ? route : `${route}/`;
  return `${import.meta.env.BASE_URL.replace(/\/$/, '')}${withSlash}${hash ? `#${hash}` : ''}`;
};

export const site = {
  name: 'Area 30, Eastern Massachusetts Alcoholics Anonymous',
  short: 'Area 30',
  url: 'https://aaemass.org',
  email: 'info@aaemass.org',
  // Add Area 30's own profile URLs here (social media, etc.) and they appear as schema.org sameAs.
  sameAs: [] as string[],
  // Base URL of the form endpoints provided by the aa30-home WordPress plugin ('/wp-json/aa30/v1' when the
  // site is served from WordPress). Empty everywhere else: forms then fall back to a plain mailto link.
  formsEndpoint: import.meta.env.PUBLIC_FORMS_ENDPOINT || '',
  // Area/Boston AA helpline number, e.g. { display: '(617) 555-0100', tel: '+16175550100' }. Shown in the home page help block when set.
  helpline: null as { display: string; tel: string } | null,
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

export const committees = [
  { name: 'Archives', href: path('/committees/archives'), slug: 'archives', image: 'archives' },
  { name: 'Cooperation with the Professional Community', short: 'C.P.C.', href: path('/committees/cpc'), slug: 'cpc', image: 'cpc' },
  { name: 'Corrections', href: path('/committees/corrections'), slug: 'corrections', image: 'corrections' },
  { name: 'Grapevine', href: path('/committees/grapevine'), slug: 'grapevine', image: 'grapevine' },
  { name: 'Literature', href: path('/committees/literature'), slug: 'literature', image: 'literature' },
  { name: 'Public Information', short: 'P.I.', href: path('/committees/public-information'), slug: 'public-information', image: 'pi' },
] as const;

export const moreCommittees = [
  { name: 'Accessibilities', href: path('/committees/accessibilities'), slug: 'accessibilities' },
  { name: 'Treatment Facilities', href: path('/committees/treatment-facilities'), slug: 'treatment-facilities' },
  { name: 'Mass. State Convention', href: path('/committees/state-convention'), slug: 'state-convention' },
  { name: 'Messenger', href: path('/committees/messenger'), slug: 'messenger' },
  { name: 'Registrar', href: path('/committees/registrar'), slug: 'registrar' },
  { name: 'Service Seminar', href: path('/committees/service-seminar'), slug: 'service-seminar' },
  { name: 'Website', href: path('/committees/website'), slug: 'website' },
];
