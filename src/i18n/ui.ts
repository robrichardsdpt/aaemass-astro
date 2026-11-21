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
  share: string;
  copyLink: string;
  linkCopied: string;
  shareEvent: string; // heading above the share button on an event page
  allDay: string;
  noEventsShort: string;
  opensAaOrg: string;
  siteName: string;
  siteAlternate: string;
  ogImageAlt: string;
  footerMeetingTitle: string;
  footerMeets: string; // {when} {where}
  footerOrg: string;
  areaDocs: string;
  docs: string; // header menu: the short form of areaDocs
  footerLegal: string; // {year}
  meetingWhen: string;
  meetingWhere: string;
  addressOrg: string;
  nav: Record<string, string>; // menu labels, found by the link's address or by its English label
  navGroups: Record<string, string>; // menu group names, found by their English label
  formSending: string;
  formThanks: string;
  formError: string; // {email}
  formInvalid: string;
  formRedirecting: string;
  formChoose: string;
  formSubmit: string;
  formSendTo: string; // {to}
  formEmailInstead: string;
  formName: string;
  formEmail: string;
  formMessage: string;
  eventLabel: string;
  searchOpen: string; // the magnifying-glass button
  searchTitle: string;
  searchLabel: string;
  searchPlaceholder: string;
  searchHint: string; // shown before anything is typed
  searchLoading: string;
  searchError: string;
  searchNone: string; // {q}
  searchCount: string; // {n}
  searchTry: string; // label above the suggested words
  searchSuggestions: string[];
  backToTop: string;
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
  share: 'Share',
  copyLink: 'Copy link',
  linkCopied: 'Link copied.',
  shareEvent: 'Share this event',
  allDay: 'All day',
  noEventsShort: 'No events are posted right now. Check back soon.',
  opensAaOrg: ' (opens aa.org)',
  siteName: 'Area 30, Eastern Massachusetts Alcoholics Anonymous',
  siteAlternate: 'Alcoholics Anonymous General Service Committee of Eastern Massachusetts',
  ogImageAlt: 'Boston waterfront at dusk',
  footerMeetingTitle: 'Area 30 committee meetings',
  footerMeets: 'The committee meets {when} at the {where}.',
  areaDocs: 'Area 30 documents',
  docs: 'Documents',
  footerOrg: 'Alcoholics Anonymous General Service Committee of Eastern Massachusetts',
  footerLegal:
    'Join us on the broad highway. © {year} Area 30, Eastern Mass. Alcoholics Anonymous. Links to other websites are provided as a convenience only; Area 30 does not manage or control them.',
  meetingWhen: '4th Wednesday of even months at 7:30 PM',
  meetingWhere: 'Boston Central Service office, 12 Channel St, Boston, MA 02210',
  addressOrg: 'AA General Service Committee of Eastern Massachusetts',
  nav: {},
  navGroups: {},
  formSending: 'Sending…',
  formThanks: 'Thank you. Your message was sent.',
  formError: 'Sorry, that did not go through. Please email {email} instead.',
  formInvalid: 'Please check the highlighted fields.',
  formRedirecting: 'Taking you to PayPal…',
  formChoose: 'Choose…',
  formSubmit: 'Submit',
  formSendTo: 'Send to {to}',
  formEmailInstead: 'Or email',
  formName: 'Name',
  formEmail: 'Email address',
  formMessage: 'Message',
  eventLabel: 'Event',
  searchOpen: 'Search the site',
  searchTitle: 'Search',
  searchLabel: 'Search this site',
  searchPlaceholder: 'For example, “registrar”',
  searchHint: 'Type a word or two to search every page.',
  searchLoading: 'Loading search…',
  searchError: 'Search could not be loaded. Please try again later.',
  searchNone: 'No pages match “{q}”. Try a different word.',
  searchCount: '{n} pages found',
  searchTry: 'Or try one of these',
  searchSuggestions: ['Registrar', 'Districts', 'Contribute', 'Literature', 'Contact'],
  backToTop: 'Back to top',
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
  share: 'Compartir',
  copyLink: 'Copiar enlace',
  linkCopied: 'Enlace copiado.',
  shareEvent: 'Compartir este evento',
  allDay: 'Todo el día',
  noEventsShort: 'Por ahora no hay eventos publicados. Vuelva a consultar pronto.',
  opensAaOrg: ' (se abre en aa.org)',
  siteName: 'Área 30, Alcohólicos Anónimos del Este de Massachusetts',
  siteAlternate: 'Comité de Servicios Generales de Alcohólicos Anónimos del Este de Massachusetts',
  ogImageAlt: 'La costa de Boston al anochecer',
  footerMeetingTitle: 'Reuniones del comité del Área 30',
  footerMeets: 'El comité se reúne {when} en {where}.',
  areaDocs: 'Documentos del Área 30',
  docs: 'Documentos',
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
    'Ways to get involved': 'Maneras de participar',
    'New GSR guide': 'Guía para nuevos RSG',
    'Area Assembly guide': 'Guía de la Asamblea de Área',
    '/service/': 'Servicios',
    '/committees/treatment-facilities/12th-step-volunteer/': 'Voluntarios del Duodécimo Paso',
    'All resources': 'Todos los recursos',
  },
  navGroups: { 'Get involved': 'Participe', Resources: 'Recursos' },
  formSending: 'Enviando…',
  formThanks: 'Gracias. Su mensaje fue enviado.',
  formError: 'Lo sentimos, no se pudo enviar. Escriba a {email}.',
  formInvalid: 'Revise los campos resaltados.',
  formRedirecting: 'Llevándole a PayPal…',
  formChoose: 'Elija…',
  formSubmit: 'Enviar',
  formSendTo: 'Enviar a {to}',
  formEmailInstead: 'O escriba a',
  formName: 'Nombre',
  formEmail: 'Correo electrónico',
  formMessage: 'Mensaje',
  eventLabel: 'Evento',
  searchOpen: 'Buscar en el sitio',
  searchTitle: 'Buscar',
  searchLabel: 'Buscar en este sitio',
  searchPlaceholder: 'Por ejemplo, “registrador”',
  searchHint: 'Escriba una o dos palabras para buscar en todas las páginas.',
  searchLoading: 'Cargando la búsqueda…',
  searchError: 'No se pudo cargar la búsqueda. Inténtelo de nuevo más tarde.',
  searchNone: 'Ninguna página coincide con “{q}”. Pruebe otra palabra.',
  searchCount: '{n} páginas encontradas',
  searchTry: 'O pruebe una de estas',
  searchSuggestions: ['Registrador', 'Distritos', 'Contribuciones', 'Literatura', 'Contacto'],
  backToTop: 'Volver arriba',
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
  share: 'Partager',
  copyLink: 'Copier le lien',
  linkCopied: 'Lien copié.',
  shareEvent: 'Partager cet événement',
  allDay: 'Toute la journée',
  noEventsShort: 'Aucun événement n’est annoncé pour le moment. Revenez bientôt.',
  opensAaOrg: ' (s’ouvre sur aa.org)',
  siteName: 'Région 30, Alcooliques anonymes de l’Est du Massachusetts',
  siteAlternate: 'Comité des services généraux des Alcooliques anonymes de l’Est du Massachusetts',
  ogImageAlt: 'Le front de mer de Boston au crépuscule',
  footerMeetingTitle: 'Réunions du comité de la Région 30',
  footerMeets: 'Le comité se réunit {when} au {where}.',
  areaDocs: 'Documents de la Région 30',
  docs: 'Documents',
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
    'Ways to get involved': 'Façons de s’engager',
    'New GSR guide': 'Guide du nouveau RSG',
    'Area Assembly guide': 'Guide de l’assemblée de région',
    '/service/': 'Services',
    '/committees/treatment-facilities/12th-step-volunteer/': 'Bénévoles de la douzième étape',
    'All resources': 'Toutes les ressources',
  },
  navGroups: { 'Get involved': 'S’engager', Resources: 'Ressources' },
  formSending: 'Envoi en cours…',
  formThanks: 'Merci. Votre message a été envoyé.',
  formError: 'Désolé, l’envoi a échoué. Écrivez plutôt à {email}.',
  formInvalid: 'Vérifiez les champs en surbrillance.',
  formRedirecting: 'Redirection vers PayPal…',
  formChoose: 'Choisir…',
  formSubmit: 'Envoyer',
  formSendTo: 'Envoyer à {to}',
  formEmailInstead: 'Ou écrivez à',
  formName: 'Nom',
  formEmail: 'Adresse courriel',
  formMessage: 'Message',
  eventLabel: 'Événement',
  searchOpen: 'Rechercher sur le site',
  searchTitle: 'Rechercher',
  searchLabel: 'Rechercher sur ce site',
  searchPlaceholder: 'Par exemple, « registraire »',
  searchHint: 'Saisissez un ou deux mots pour chercher dans toutes les pages.',
  searchLoading: 'Chargement de la recherche…',
  searchError: 'La recherche n’a pas pu être chargée. Veuillez réessayer plus tard.',
  searchNone: 'Aucune page ne correspond à « {q} ». Essayez un autre mot.',
  searchCount: '{n} pages trouvées',
  searchTry: 'Ou essayez l’un de ces mots',
  searchSuggestions: ['Registraire', 'Districts', 'Contributions', 'Littérature', 'Contact'],
  backToTop: 'Haut de page',
};

export const ui: Record<Lang, Ui> = { en, es, fr };
