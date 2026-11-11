import { parse } from 'yaml';
import { z } from 'astro/zod';

const base = 'https://aaemass.org';

// Contact details and officer emails live in src/content/site/contact.yml (edited in the CMS).
const email = z.string().trim().email();
const contactSchema = z.object({
  email,
  registrar_email: email,
  address: z.object({ street: z.string().trim().min(1), city: z.string().trim().min(1), region: z.string().trim().min(1), postal_code: z.coerce.string().trim().min(1) }),
  officers: z.object({ delegate: email, altdelegate: email, chair: email, altchair: email, secretary: email, treasurer: email }),
});
const contactRaw = Object.values(import.meta.glob('../content/site/contact.yml', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>)[0];
const parsedContact = contactSchema.safeParse(parse(contactRaw));
if (!parsedContact.success) {
  throw new Error(`src/content/site/contact.yml is not valid: ${parsedContact.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')}`);
}
const contact = parsedContact.data;

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
  email: contact.email,
  // Add Area 30's own profile URLs here (social media, etc.) and they appear as schema.org sameAs.
  sameAs: [] as string[],
  // Base URL of the form endpoints provided by the aa30-home WordPress plugin ('/wp-json/aa30/v1' when the
  // site is served from WordPress). Empty everywhere else: forms then fall back to a plain mailto link.
  formsEndpoint: import.meta.env.PUBLIC_FORMS_ENDPOINT || '',
  // Area/Boston AA helpline number, e.g. { display: '(617) 555-0100', tel: '+16175550100' }. Shown in the home page help block when set.
  helpline: null as { display: string; tel: string } | null,
  registrarEmail: contact.registrar_email,
  officers: contact.officers,
  address: {
    street: contact.address.street,
    city: contact.address.city,
    region: contact.address.region,
    postalCode: contact.address.postal_code,
  },
  meeting: {
    when: '4th Wednesday of even months at 7:30 PM',
    where: 'Boston Central Service office, 12 Channel St, Boston, MA 02210',
    map: 'https://www.google.com/maps/search/?api=1&query=12+Channel+St+Boston+MA+02210',
  },
  links: {
    findMeeting: 'https://aaboston.org/meetings',
    registerForm:
      'https://drive.google.com/file/d/1nT4Sv1NXQQ8uSwO3t4Gh7Wq2MCc3AYV-/view?usp=drive_link',
    areaFolder: 'https://drive.google.com/drive/folders/14RcIZzknJIGU3-q5WoCqIu4_aAcoksrE',
  },
};

