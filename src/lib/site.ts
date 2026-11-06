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
  // Mailing-list signups POST here as JSON (e.g. a Formspree form that emails info@aaemass.org).
  // Leave empty until the endpoint exists: the page then shows a mailto link instead of a form.
  signupEndpoint: import.meta.env.PUBLIC_SIGNUP_ENDPOINT || '',
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
  { href: path('/alcoholics-anonymous'), label: 'What is AA?' },
  { href: path('/calendar'), label: 'Calendar' },
  { href: path('/committees/registrar'), label: 'Registrar' },
  { href: path('/committees'), label: 'Committees' },
  { href: path('/districts'), label: 'Districts' },
  { href: path('/literature'), label: 'Literature' },
  { href: path('/resources'), label: 'Resources' },
  { href: path('/contact'), label: 'Contact' },
  { href: path('/contribute'), label: 'Contribute' },
];

export const committees = [
  { name: 'Archives', href: path('/committees/archives'), image: 'archives' },
  { name: 'Cooperation with the Professional Community', short: 'C.P.C.', href: path('/committees/cpc'), image: 'cpc' },
  { name: 'Corrections', href: path('/committees/corrections'), image: 'corrections' },
  { name: 'Grapevine', href: path('/committees/grapevine'), image: 'grapevine' },
  { name: 'Literature', href: path('/committees/literature'), image: 'literature' },
  { name: 'Public Information', short: 'P.I.', href: path('/committees/public-information'), image: 'pi' },
] as const;

export const moreCommittees = [
  { name: 'Accessibilities', href: path('/committees/accessibilities') },
  { name: 'Treatment Facilities', href: path('/committees/treatment-facilities') },
  { name: 'Mass. State Convention', href: path('/committees/state-convention') },
  { name: 'Messenger', href: path('/committees/messenger') },
  { name: 'Registrar', href: path('/committees/registrar') },
  { name: 'Service Seminar', href: path('/committees/service-seminar') },
  { name: 'Website', href: path('/committees/website') },
];
