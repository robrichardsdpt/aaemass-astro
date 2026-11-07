// AA glossary, per language: patterns that find each term in running text, and the popover definitions.
// This is also the canonical translation glossary. Use these renderings everywhere (see docs/TRANSLATION.md).
// Draft: have a bilingual AA member review before publishing.
import { terms as en, type TermId } from '../lib/content';
import type { Lang } from './index';

type Defs = Record<TermId, { full: string; def: string }>;

const es: Defs = {
  gsr: {
    full: 'Representante de Servicios Generales (RSG)',
    def: 'El miembro que un grupo elige para ser su enlace con el distrito, el área y el resto de A.A.',
  },
  dcm: {
    full: 'Miembro del Comité de Distrito (MCD)',
    def: 'Elegido por los RSG de un distrito para enlazar a los grupos del distrito con el área.',
  },
  delegate: {
    full: 'Delegado',
    def: 'El miembro que un área elige para representarla en la Conferencia de Servicios Generales anual.',
  },
  seventh: {
    full: 'Séptima Tradición',
    def: 'Todo grupo de A.A. debe mantenerse completamente a sí mismo, negándose a recibir contribuciones de afuera.',
  },
  gso: {
    full: 'Oficina de Servicios Generales (OSG)',
    def: 'La oficina en Nueva York que presta servicio a los grupos de A.A. en todo el mundo: mantiene el registro de grupos, publica la literatura y responde a las solicitudes de ayuda.',
  },
  gsc: {
    full: 'Conferencia de Servicios Generales',
    def: 'La reunión anual donde los delegados de las áreas de Estados Unidos y Canadá consideran las necesidades de A.A. en su conjunto.',
  },
  aaws: {
    full: 'Servicios Mundiales de A.A. (AAWS)',
    def: 'La corporación que publica la literatura de A.A. aprobada por la Conferencia y administra la Oficina de Servicios Generales.',
  },
  cpc: {
    full: 'Cooperación con la Comunidad Profesional (CCP)',
    def: 'El comité que ofrece información sobre A.A. a médicos, clérigos, educadores, tribunales y otros profesionales. Cooperación, pero no afiliación.',
  },
  pi: {
    full: 'Información Pública (I.P.)',
    def: 'El comité que lleva el mensaje de A.A. al público por medio de los medios de comunicación, las escuelas y las organizaciones comunitarias.',
  },
  lips: {
    full: 'Servicio de Literatura para Prisiones (LIPS)',
    def: 'Un programa que reúne literatura aprobada por la Conferencia de parte de los grupos y la envía a miembros de A.A. en prisiones.',
  },
  btg: {
    full: 'Bridge the Gap (Tendiendo Puentes)',
    def: 'Un programa de contacto temporal que une a la persona recién salida de un centro de tratamiento con un miembro de A.A. que la acompaña a sus primeras reuniones.',
  },
  assembly: {
    full: 'Asamblea de Área',
    def: 'Una reunión de RSG, MCD, presidentes de comités y oficiales donde el Área 30 conduce sus asuntos y elige a sus oficiales.',
  },
  conscience: {
    full: 'Conciencia de grupo',
    def: 'La conciencia colectiva de un grupo de A.A.: los miembros escuchan todos los puntos de vista y luego deciden juntos, guiados por las Tradiciones.',
  },
  steps: {
    full: 'Los Doce Pasos',
    def: 'El programa sugerido de recuperación del alcoholismo, practicado como una forma de vida.',
  },
  traditions: {
    full: 'Las Doce Tradiciones',
    def: 'Los principios que mantienen unidos a los grupos de A.A. y describen cómo se relaciona A.A. con el mundo que lo rodea.',
  },
  bigbook: {
    full: 'El Libro Grande',
    def: 'El libro Alcohólicos Anónimos, que describe el programa de recuperación de A.A. y contiene historias personales de miembros.',
  },
};

const fr: Defs = {
  gsr: {
    full: 'Représentant des services généraux (RSG)',
    def: 'Le membre qu’un groupe élit pour être son lien avec le district, la région et le reste des A.A.',
  },
  dcm: {
    full: 'Membre du comité de district (MCD)',
    def: 'Élu par les RSG d’un district pour relier les groupes du district à la région.',
  },
  delegate: {
    full: 'Délégué',
    def: 'Le membre qu’une région élit pour la représenter à la Conférence des services généraux annuelle.',
  },
  seventh: {
    full: 'Septième Tradition',
    def: 'Chaque groupe devrait subvenir entièrement à ses besoins et refuser les contributions de l’extérieur.',
  },
  gso: {
    full: 'Bureau des services généraux (BSG)',
    def: 'Le bureau de New York qui sert les groupes A.A. du monde entier : il tient le registre des groupes, publie la documentation et répond aux demandes d’aide.',
  },
  gsc: {
    full: 'Conférence des services généraux',
    def: 'La réunion annuelle où les délégués des régions des États-Unis et du Canada examinent les besoins des A.A. dans leur ensemble.',
  },
  aaws: {
    full: 'Services mondiaux des A.A. (AAWS)',
    def: 'La société qui publie la documentation des A.A. approuvée par la Conférence et administre le Bureau des services généraux.',
  },
  cpc: {
    full: 'Collaboration avec les milieux professionnels (CMP)',
    def: 'Le comité qui renseigne les médecins, le clergé, les éducateurs, les tribunaux et d’autres professionnels sur les A.A. Collaboration, mais non affiliation.',
  },
  pi: {
    full: 'Information publique (I.P.)',
    def: 'Le comité qui transmet le message des A.A. au public par l’entremise des médias, des écoles et des organismes communautaires.',
  },
  lips: {
    full: 'Service de documentation pour les prisons (LIPS)',
    def: 'Un programme qui recueille auprès des groupes la documentation approuvée par la Conférence et l’envoie à des membres des A.A. en prison.',
  },
  btg: {
    full: 'Bridge the Gap (« Jeter un pont »)',
    def: 'Un programme de contact temporaire qui jumelle une personne qui quitte un centre de traitement à un membre des A.A. qui l’accompagne à ses premières réunions.',
  },
  assembly: {
    full: 'Assemblée de région',
    def: 'Une réunion de RSG, de MCD, de présidents de comités et d’officiers où la Région 30 mène ses affaires et élit ses officiers.',
  },
  conscience: {
    full: 'Conscience de groupe',
    def: 'La conscience collective d’un groupe A.A. : les membres entendent tous les points de vue, puis décident ensemble, guidés par les Traditions.',
  },
  steps: {
    full: 'Les Douze Étapes',
    def: 'Le programme de rétablissement de l’alcoolisme suggéré, pratiqué comme une façon de vivre.',
  },
  traditions: {
    full: 'Les Douze Traditions',
    def: 'Les principes qui assurent l’unité des groupes A.A. et décrivent les rapports des A.A. avec le monde qui les entoure.',
  },
  bigbook: {
    full: 'Le Gros Livre',
    def: 'Le livre Alcooliques anonymes, qui décrit le programme de rétablissement des A.A. et renferme des histoires personnelles de membres.',
  },
};

export const termDefs: Record<Lang, Defs> = { en, es, fr };

export const termPatterns: Record<Lang, [TermId, string][]> = {
  en: [
    ['gsr', 'GSRs?|G\\.S\\.R\\.s?'],
    ['dcm', 'DCMs?|D\\.C\\.M\\.s?'],
    ['delegate', 'Delegates?'],
    ['seventh', 'Seventh Tradition'],
    ['gso', 'General Service Office|G\\.S\\.O\\.|GSO'],
    ['gsc', 'General Service Conference'],
    ['aaws', 'AAWS|AA World Services'],
    ['cpc', 'C\\.P\\.C\\.'],
    ['pi', 'P\\.I\\.'],
    ['lips', 'LIPS'],
    ['btg', 'Bridge the Gap'],
    ['assembly', 'Area Assembl(?:y|ies)'],
    ['conscience', 'group conscience'],
    ['steps', 'Twelve Steps'],
    ['traditions', 'Twelve Traditions'],
    ['bigbook', 'Big Book'],
  ],
  es: [
    ['gsr', 'RSG'],
    ['dcm', 'MCD'],
    ['delegate', '[Dd]elegad[oa]s?'],
    ['seventh', 'Séptima Tradición'],
    ['gso', 'Oficina de Servicios Generales|OSG'],
    ['gsc', 'Conferencia de Servicios Generales'],
    ['aaws', 'Servicios Mundiales de A\\.A\\.|AAWS'],
    ['cpc', 'CCP'],
    ['pi', 'I\\.P\\.'],
    ['lips', 'LIPS'],
    ['btg', 'Bridge the Gap'],
    ['assembly', 'Asambleas? de Área'],
    ['conscience', 'conciencia de grupo'],
    ['steps', 'Doce Pasos'],
    ['traditions', 'Doce Tradiciones'],
    ['bigbook', 'Libro Grande'],
  ],
  fr: [
    ['gsr', 'RSG'],
    ['dcm', 'MCD'],
    ['delegate', '[Dd]élégué(?:e)?s?'],
    ['seventh', 'Septième Tradition'],
    ['gso', 'Bureau des services généraux|BSG'],
    ['gsc', 'Conférence des services généraux'],
    ['aaws', 'Services mondiaux des A\\.A\\.|AAWS'],
    ['cpc', 'CMP'],
    ['pi', 'I\\.P\\.'],
    ['lips', 'LIPS'],
    ['btg', 'Bridge the Gap'],
    ['assembly', 'Assemblées? de région'],
    ['conscience', 'conscience de groupe'],
    ['steps', 'Douze Étapes'],
    ['traditions', 'Douze Traditions'],
    ['bigbook', 'Gros Livre'],
  ],
};
