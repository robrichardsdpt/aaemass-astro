// Shared interface strings (header, footer, breadcrumbs, popovers). Page copy lives in src/i18n/pages/.
// Spanish and French follow the terminology of AA World Services' Spanish and French literature.
// Draft: have a bilingual AA member review before publishing (see docs/TRANSLATION.md).
import type { Lang } from './index';

export interface Ui {
  skip: string;
  home: string;
  menu: string;
  mainNav: string;
  breadcrumb: string;
  brand: [string, string];
  themeToggle: string;
  switchToLight: string;
  switchToDark: string;
  language: string;
  faqHeading: string;
  close: string;
  allDay: string;
  noEventsShort: string;
  opensAaOrg: string;
  siteName: string;
  siteAlternate: string;
  ogImageAlt: string;
  footerMeetingTitle: string;
  footerMeets: string; // {when} {where}
  footerOrg: string;
  footerLegal: string; // {year}
  meetingWhen: string;
  meetingWhere: string;
  addressOrg: string;
  nav: Record<string, string>;
  formNotLive: string;
  formNotLiveBody: string;
  formPreview: string;
  formChoose: string;
  formSubmit: string;
  formSendTo: string; // {to}
  formReachToday: string;
  formName: string;
  formEmail: string;
  formMessage: string;
  eventLabel: string;
}

const en: Ui = {
  skip: 'Skip to main content',
  home: 'Home',
  menu: 'Menu',
  mainNav: 'Main',
  breadcrumb: 'Breadcrumb',
  brand: ['Area 30', 'Eastern Massachusetts AA'],
  themeToggle: 'Switch color theme',
  switchToLight: 'Switch to light mode',
  switchToDark: 'Switch to dark mode',
  language: 'Language',
  faqHeading: 'Frequently asked questions',
  close: 'Close',
  allDay: 'All day',
  noEventsShort: 'No events are posted right now. Check back soon.',
  opensAaOrg: ' (opens aa.org)',
  siteName: 'Area 30, Eastern Massachusetts Alcoholics Anonymous',
  siteAlternate: 'Alcoholics Anonymous General Service Committee of Eastern Massachusetts',
  ogImageAlt: 'Boston waterfront at dusk',
  footerMeetingTitle: 'Area 30 committee meetings',
  footerMeets: 'The committee meets {when} at the {where}.',
  footerOrg: 'Alcoholics Anonymous General Service Committee of Eastern Massachusetts',
  footerLegal:
    'Join us on the broad highway. © {year} Area 30, Eastern Mass. Alcoholics Anonymous. Links to other websites are provided as a convenience only; Area 30 does not manage or control them.',
  meetingWhen: '4th Wednesday of even months at 7:30 PM',
  meetingWhere: 'Boston Central Service office, 12 Channel St, Boston, MA 02210',
  addressOrg: 'AA General Service Committee of Eastern Massachusetts',
  nav: {},
  formNotLive: 'Not functional yet',
  formNotLiveBody: 'This form shows what is coming. Nothing you type here is sent.',
  formPreview: 'Preview of the form, not functional yet',
  formChoose: 'Choose…',
  formSubmit: 'Submit',
  formSendTo: 'Send to {to}',
  formReachToday: 'To reach them today, email',
  formName: 'Name',
  formEmail: 'Email address',
  formMessage: 'Message',
  eventLabel: 'Event',
};

const es: Ui = {
  skip: 'Saltar al contenido principal',
  home: 'Inicio',
  menu: 'Menú',
  mainNav: 'Principal',
  breadcrumb: 'Ruta de navegación',
  brand: ['Área 30', 'A.A. del Este de Massachusetts'],
  themeToggle: 'Cambiar el tema de color',
  switchToLight: 'Cambiar a modo claro',
  switchToDark: 'Cambiar a modo oscuro',
  language: 'Idioma',
  faqHeading: 'Preguntas frecuentes',
  close: 'Cerrar',
  allDay: 'Todo el día',
  noEventsShort: 'Por ahora no hay eventos publicados. Vuelva a consultar pronto.',
  opensAaOrg: ' (se abre en aa.org)',
  siteName: 'Área 30, Alcohólicos Anónimos del Este de Massachusetts',
  siteAlternate: 'Comité de Servicios Generales de Alcohólicos Anónimos del Este de Massachusetts',
  ogImageAlt: 'La costa de Boston al anochecer',
  footerMeetingTitle: 'Reuniones del comité del Área 30',
  footerMeets: 'El comité se reúne {when} en {where}.',
  footerOrg: 'Comité de Servicios Generales de Alcohólicos Anónimos del Este de Massachusetts',
  footerLegal:
    'Acompáñenos en la ancha carretera. © {year} Área 30, Alcohólicos Anónimos del Este de Massachusetts. Los enlaces a otros sitios web se ofrecen solo como una comodidad; el Área 30 no los administra ni los controla.',
  meetingWhen: 'el cuarto miércoles de los meses pares a las 7:30 p. m.',
  meetingWhere: 'la oficina de Boston Central Service, 12 Channel St, Boston, MA 02210',
  addressOrg: 'Comité de Servicios Generales de A.A. del Este de Massachusetts',
  nav: {
    '/alcoholics-anonymous/': '¿Qué es A.A.?',
    '/calendar/': 'Calendario',
    '/committees/registrar/': 'Registrador',
    '/committees/': 'Comités',
    '/districts/': 'Distritos',
    '/literature/': 'Literatura',
    '/resources/': 'Recursos',
    '/contact/': 'Contacto',
    '/contribute/': 'Contribuciones',
    '/get-involved/': 'Participe en el servicio',
  },
  formNotLive: 'Todavía no funciona',
  formNotLiveBody: 'Este formulario muestra lo que viene. Nada de lo que escriba aquí se envía.',
  formPreview: 'Vista previa del formulario, todavía no funciona',
  formChoose: 'Elija…',
  formSubmit: 'Enviar',
  formSendTo: 'Enviar a {to}',
  formReachToday: 'Para comunicarse hoy mismo, escriba a',
  formName: 'Nombre',
  formEmail: 'Correo electrónico',
  formMessage: 'Mensaje',
  eventLabel: 'Evento',
};

const fr: Ui = {
  skip: 'Passer au contenu principal',
  home: 'Accueil',
  menu: 'Menu',
  mainNav: 'Principale',
  breadcrumb: 'Fil d’Ariane',
  brand: ['Région 30', 'A.A. de l’Est du Massachusetts'],
  themeToggle: 'Changer le thème de couleur',
  switchToLight: 'Passer en mode clair',
  switchToDark: 'Passer en mode sombre',
  language: 'Langue',
  faqHeading: 'Questions fréquentes',
  close: 'Fermer',
  allDay: 'Toute la journée',
  noEventsShort: 'Aucun événement n’est annoncé pour le moment. Revenez bientôt.',
  opensAaOrg: ' (s’ouvre sur aa.org)',
  siteName: 'Région 30, Alcooliques anonymes de l’Est du Massachusetts',
  siteAlternate: 'Comité des services généraux des Alcooliques anonymes de l’Est du Massachusetts',
  ogImageAlt: 'Le front de mer de Boston au crépuscule',
  footerMeetingTitle: 'Réunions du comité de la Région 30',
  footerMeets: 'Le comité se réunit {when} au {where}.',
  footerOrg: 'Comité des services généraux des Alcooliques anonymes de l’Est du Massachusetts',
  footerLegal:
    'Rejoignez-nous sur la grande route. © {year} Région 30, Alcooliques anonymes de l’Est du Massachusetts. Les liens vers d’autres sites sont offerts à titre de commodité seulement; la Région 30 ne les gère ni ne les contrôle.',
  meetingWhen: 'le quatrième mercredi des mois pairs à 19 h 30',
  meetingWhere: 'bureau de Boston Central Service, 12 Channel St, Boston, MA 02210',
  addressOrg: 'Comité des services généraux des A.A. de l’Est du Massachusetts',
  nav: {
    '/alcoholics-anonymous/': 'Qu’est-ce que les A.A.?',
    '/calendar/': 'Calendrier',
    '/committees/registrar/': 'Registraire',
    '/committees/': 'Comités',
    '/districts/': 'Districts',
    '/literature/': 'Littérature',
    '/resources/': 'Ressources',
    '/contact/': 'Contact',
    '/contribute/': 'Contributions',
    '/get-involved/': 'S’engager dans le service',
  },
  formNotLive: 'Pas encore fonctionnel',
  formNotLiveBody: 'Ce formulaire montre ce qui s’en vient. Rien de ce que vous saisissez ici n’est envoyé.',
  formPreview: 'Aperçu du formulaire, pas encore fonctionnel',
  formChoose: 'Choisir…',
  formSubmit: 'Envoyer',
  formSendTo: 'Envoyer à {to}',
  formReachToday: 'Pour les joindre dès aujourd’hui, écrivez à',
  formName: 'Nom',
  formEmail: 'Adresse courriel',
  formMessage: 'Message',
  eventLabel: 'Événement',
};

export const ui: Record<Lang, Ui> = { en, es, fr };
