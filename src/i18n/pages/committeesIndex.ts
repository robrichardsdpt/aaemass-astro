import type { Lang } from '../index';

const en = {
  title: 'AA Committees in Eastern Massachusetts | Area 30',
  description: 'Meet the Area 30 conference and standing committees: Archives, C.P.C., Corrections, Grapevine, Literature, P.I., Treatment and more.',
  heading: 'Committees',
  eyebrow: 'Service',
  lede: 'Committees carry the AA message to the people who meet alcoholics first. Every AA member is welcome to help.',
  confTitle: 'Conference committees',
  reports: 'Read committee reports',
  moreTitle: 'Also in Area 30',
  email: 'Looking for an email address? The [contact page](/contact) lists every officer and committee.',
};
type C = typeof en;
const es: C = {
  title: 'Comités de A.A. en el Este de Massachusetts | Área 30',
  description: 'Conozca los comités de la Conferencia y los comités permanentes del Área 30: Archivos, CCP, Instituciones Correccionales, Grapevine, Literatura, I.P., Tratamiento y más.',
  heading: 'Comités',
  eyebrow: 'Servicio',
  lede: 'Los comités llevan el mensaje de A.A. a las personas que se encuentran primero con los alcohólicos. Todos los miembros de A.A. son bienvenidos a ayudar.',
  confTitle: 'Comités de la Conferencia',
  reports: 'Leer los informes de los comités',
  moreTitle: 'También en el Área 30',
  email: '¿Busca una dirección de correo electrónico? La [página de contacto](/contact) enumera a todos los oficiales y comités.',
};
const fr: C = {
  title: 'Comités des A.A. dans l’Est du Massachusetts | Région 30',
  description: 'Découvrez les comités de la Conférence et les comités permanents de la Région 30 : archives, CMP, établissements correctionnels, Grapevine, littérature, I.P., traitement et plus.',
  heading: 'Comités',
  eyebrow: 'Service',
  lede: 'Les comités transmettent le message des A.A. aux personnes qui rencontrent les alcooliques en premier. Tous les membres des A.A. sont invités à aider.',
  confTitle: 'Comités de la Conférence',
  reports: 'Lire les rapports des comités',
  moreTitle: 'Aussi dans la Région 30',
  email: 'Vous cherchez une adresse courriel? La [page de contact](/contact) répertorie tous les officiers et tous les comités.',
};
export const committeesIndex: Record<Lang, C> = { en, es, fr };
