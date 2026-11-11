// Committee names per language. Keys are the English URL slugs. `tile` is the short label used on cards,
// `label` the full committee title. Terminology follows AA's Spanish and French literature.
import type { Lang } from './index';
import { committeeDirectory, committeeTranslations } from '../lib/committee-pages';

export interface CommitteeName { name: string; tile: string; label: string; short?: string }

const en = (name: string, short?: string): CommitteeName => ({ name, short, tile: `${short ?? name} Committee`, label: `${name} Committee` });

export const committeeNames: Record<Lang, Record<string, CommitteeName>> = {
  en: {
    archives: en('Archives'),
    cpc: en('Cooperation with the Professional Community', 'C.P.C.'),
    corrections: en('Corrections'),
    grapevine: en('Grapevine'),
    literature: en('Literature'),
    'public-information': en('Public Information', 'P.I.'),
    accessibilities: en('Accessibilities'),
    'treatment-facilities': en('Treatment Facilities'),
    'state-convention': en('Mass. State Convention'),
    messenger: en('Messenger'),
    registrar: en('Registrar'),
    'service-seminar': en('Service Seminar'),
    website: en('Website'),
    technology: en('Technology'),
  },
  es: {
    archives: { name: 'Archivos', tile: 'Comité de Archivos', label: 'Comité de Archivos' },
    cpc: { name: 'Cooperación con la Comunidad Profesional', short: 'CCP', tile: 'Comité CCP', label: 'Comité de Cooperación con la Comunidad Profesional (CCP)' },
    corrections: { name: 'Instituciones Correccionales', tile: 'Comité de Instituciones Correccionales', label: 'Comité de Instituciones Correccionales' },
    grapevine: { name: 'Grapevine y La Viña', tile: 'Comité de Grapevine y La Viña', label: 'Comité de Grapevine y La Viña' },
    literature: { name: 'Literatura', tile: 'Comité de Literatura', label: 'Comité de Literatura' },
    'public-information': { name: 'Información Pública', short: 'I.P.', tile: 'Comité I.P.', label: 'Comité de Información Pública (I.P.)' },
    accessibilities: { name: 'Accesibilidades', tile: 'Comité de Accesibilidades', label: 'Comité de Accesibilidades' },
    'treatment-facilities': { name: 'Centros de Tratamiento', tile: 'Comité de Centros de Tratamiento', label: 'Comité de Centros de Tratamiento' },
    'state-convention': { name: 'Convención Estatal de Massachusetts', tile: 'Comité de la Convención Estatal', label: 'Comité de la Convención Estatal de Massachusetts' },
    messenger: { name: 'Boletín Messenger', tile: 'Comité del Boletín Messenger', label: 'Comité del Boletín Messenger' },
    registrar: { name: 'Registrador', tile: 'Registrador', label: 'Registrador' },
    'service-seminar': { name: 'Seminario de Servicio', tile: 'Comité del Seminario de Servicio', label: 'Comité del Seminario de Servicio' },
    website: { name: 'Sitio web', tile: 'Comité del Sitio Web', label: 'Comité del Sitio Web' },
    technology: { name: 'Tecnología', tile: 'Comité de Tecnología', label: 'Comité de Tecnología' },
  },
  fr: {
    archives: { name: 'Archives', tile: 'Comité des archives', label: 'Comité des archives' },
    cpc: { name: 'Collaboration avec les milieux professionnels', short: 'CMP', tile: 'Comité CMP', label: 'Comité de collaboration avec les milieux professionnels (CMP)' },
    corrections: { name: 'Établissements correctionnels', tile: 'Comité des établissements correctionnels', label: 'Comité des établissements correctionnels' },
    grapevine: { name: 'Grapevine et La Vigne', tile: 'Comité de Grapevine et La Vigne', label: 'Comité de Grapevine et La Vigne' },
    literature: { name: 'Littérature', tile: 'Comité de la littérature', label: 'Comité de la littérature' },
    'public-information': { name: 'Information publique', short: 'I.P.', tile: 'Comité I.P.', label: 'Comité de l’information publique (I.P.)' },
    accessibilities: { name: 'Accessibilités', tile: 'Comité des accessibilités', label: 'Comité des accessibilités' },
    'treatment-facilities': { name: 'Centres de traitement', tile: 'Comité des centres de traitement', label: 'Comité des centres de traitement' },
    'state-convention': { name: 'Congrès d’État du Massachusetts', tile: 'Comité du Congrès d’État', label: 'Comité du Congrès d’État du Massachusetts' },
    messenger: { name: 'Bulletin Messenger', tile: 'Comité du bulletin Messenger', label: 'Comité du bulletin Messenger' },
    registrar: { name: 'Registraire', tile: 'Registraire', label: 'Registraire' },
    'service-seminar': { name: 'Séminaire de service', tile: 'Comité du séminaire de service', label: 'Comité du séminaire de service' },
    website: { name: 'Site web', tile: 'Comité du site web', label: 'Comité du site web' },
    technology: { name: 'Technologie', tile: 'Comité de la technologie', label: 'Comité de la technologie' },
  },
};

// Committees come from src/content/committees (CMS). English names follow the CMS title; a committee
// added in the CMS with no Spanish or French name yet shows its English name until one is added above.
for (const c of committeeDirectory) {
  const english = en(c.title, c.shortName);
  committeeNames.en[c.slug] = english;
  for (const lang of ['es', 'fr'] as const) {
    const t = committeeTranslations[lang][c.slug];
    if (t) committeeNames[lang][c.slug] = { name: t.name, short: t.short, tile: t.tile, label: t.label };
    else committeeNames[lang][c.slug] ??= english;
  }
}
