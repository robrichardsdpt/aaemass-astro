import type { Lang } from '../index';

const en = {
  title: 'AA Resources and Links | Area 30 Eastern Mass.',
  description: 'Useful links for Area 30 members: the General Service Office, AA Grapevine, AA Guidelines, Box 459 and other area web sites.',
  heading: 'Resources',
  eyebrow: 'Links',
  lede: 'Useful Alcoholics Anonymous links for members in Area 30.',
  officialTitle: 'Official Alcoholics Anonymous',
  official: [
    { name: 'AA General Service Office (G.S.O.)', href: 'https://www.aa.org/' },
    { name: 'AA Grapevine Magazine', href: 'https://www.aagrapevine.org/' },
  ],
  quickTitle: 'Frequently requested information',
  quickIntro: 'Direct links to information on the AAWS and AA Grapevine web sites that is often requested by members in Area 30.',
  quick: [
    { title: 'AA Guidelines', href: 'http://www.aa.org/pages/en_US/aa-guidelines', text: 'Download or view the AA Guidelines. They represent the shared experience of AA members and groups throughout the service areas in the United States and Canada, and reflect guidance from the Twelve Traditions and the General Service Conference. The purpose of the Guidelines is to help a group reach an informed group conscience.' },
    { title: 'Box 459', href: 'https://www.aa.org/news-and-announcements', text: 'News and Notes from G.S.O. Download or view Box 459.' },
    { title: 'Area web sites', href: 'https://www.aa.org/list-of-general-service-conference-area-web-sites-uscanada', text: 'AAWS’s list of General Service Conference area web sites.' },
    { title: 'Fact sheets and pamphlets', href: 'https://www.aa.org/resources/literature', text: 'Information on AA from AAWS, including fact sheets and some pamphlets.' },
  ],
};
type R = typeof en;

const es: R = {
  title: 'Recursos y enlaces de A.A. | Área 30 del Este de Mass.',
  description: 'Enlaces útiles para los miembros del Área 30: la Oficina de Servicios Generales, AA Grapevine, los Lineamientos de A.A., Box 459 y otros sitios web de áreas.',
  heading: 'Recursos',
  eyebrow: 'Enlaces',
  lede: 'Enlaces útiles de Alcohólicos Anónimos para los miembros del Área 30.',
  officialTitle: 'Sitios oficiales de Alcohólicos Anónimos',
  official: [
    { name: 'Oficina de Servicios Generales de A.A. (OSG)', href: 'https://www.aa.org/' },
    { name: 'Revista AA Grapevine', href: 'https://www.aagrapevine.org/' },
  ],
  quickTitle: 'Información que se solicita con frecuencia',
  quickIntro: 'Enlaces directos a información de los sitios web de AAWS y de AA Grapevine que los miembros del Área 30 solicitan a menudo.',
  quick: [
    { title: 'Lineamientos de A.A.', href: 'http://www.aa.org/pages/en_US/aa-guidelines', text: 'Descargue o consulte los Lineamientos de A.A. Representan la experiencia compartida de los miembros y grupos de A.A. de las áreas de servicio de Estados Unidos y Canadá, y reflejan la orientación de las Doce Tradiciones y de la Conferencia de Servicios Generales. El propósito de los Lineamientos es ayudar a un grupo a llegar a una conciencia de grupo informada.' },
    { title: 'Box 459', href: 'https://www.aa.org/news-and-announcements', text: 'Noticias y notas de la OSG. Descargue o consulte Box 459.' },
    { title: 'Sitios web de áreas', href: 'https://www.aa.org/list-of-general-service-conference-area-web-sites-uscanada', text: 'La lista de AAWS de los sitios web de las áreas de la Conferencia de Servicios Generales.' },
    { title: 'Hojas informativas y folletos', href: 'https://www.aa.org/resources/literature', text: 'Información sobre A.A. de AAWS, incluidas hojas informativas y algunos folletos.' },
  ],
};

const fr: R = {
  title: 'Ressources et liens A.A. | Région 30 de l’Est du Mass.',
  description: 'Des liens utiles pour les membres de la Région 30 : le Bureau des services généraux, AA Grapevine, les Lignes directrices des A.A., Box 459 et d’autres sites web de régions.',
  heading: 'Ressources',
  eyebrow: 'Liens',
  lede: 'Des liens utiles des Alcooliques anonymes pour les membres de la Région 30.',
  officialTitle: 'Sites officiels des Alcooliques anonymes',
  official: [
    { name: 'Bureau des services généraux des A.A. (BSG)', href: 'https://www.aa.org/' },
    { name: 'Revue AA Grapevine', href: 'https://www.aagrapevine.org/' },
  ],
  quickTitle: 'Renseignements fréquemment demandés',
  quickIntro: 'Des liens directs vers des renseignements des sites web d’AAWS et d’AA Grapevine que les membres de la Région 30 demandent souvent.',
  quick: [
    { title: 'Lignes directrices des A.A.', href: 'http://www.aa.org/pages/en_US/aa-guidelines', text: 'Téléchargez ou consultez les Lignes directrices des A.A. Elles représentent l’expérience partagée des membres et des groupes A.A. des régions de service des États-Unis et du Canada, et reflètent les orientations des Douze Traditions et de la Conférence des services généraux. Le but des Lignes directrices est d’aider un groupe à parvenir à une conscience de groupe éclairée.' },
    { title: 'Box 459', href: 'https://www.aa.org/news-and-announcements', text: 'Nouvelles et notes du BSG. Téléchargez ou consultez Box 459.' },
    { title: 'Sites web des régions', href: 'https://www.aa.org/list-of-general-service-conference-area-web-sites-uscanada', text: 'La liste d’AAWS des sites web des régions de la Conférence des services généraux.' },
    { title: 'Fiches d’information et brochures', href: 'https://www.aa.org/resources/literature', text: 'Des renseignements sur les A.A. d’AAWS, y compris des fiches d’information et quelques brochures.' },
  ],
};

export const resources: Record<Lang, R> = { en, es, fr };
