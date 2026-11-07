// Literature page copy. Items align by index with `literature.groups` in src/lib/mirror-data.ts (which holds the aa.org links).
// Titles of Spanish and French editions follow AA World Services where known; where unsure, the English title is kept in parentheses.
import type { Lang } from '../index';

interface Item { title: string; sub: string; description: string }
interface Group { title: string; intro: string; items: Item[] }
interface Lit { title: string; description: string; heading: string; eyebrow: string; lede: string; aboutHeading: string; intro: string; groups: Group[] }

const en: Lit = {
  title: 'AA Literature: Big Book, Pamphlets and More',
  description: 'Conference-approved AA literature: the Big Book, Twelve and Twelve, service manual and pamphlets, with links to read each on aa.org.',
  heading: 'AA literature',
  eyebrow: 'Resources',
  lede: 'Literature published by AA World Services is a resource for recovering alcoholics and other individuals.',
  aboutHeading: 'About AA literature',
  intro: 'In these materials you can find out more about Alcoholics Anonymous, its history and how it works. Items are published in English, Spanish and French. Each link opens the item on aa.org.',
  groups: [
    {
      title: 'Alcoholics Anonymous (Big Book)',
      intro: 'The basic text of AA, in print, American Sign Language and audio.',
      items: [
        { title: 'AA Big Book', sub: 'Fourth Edition', description: 'The basic text of AA. It explains how the AA program of recovery works and includes the personal stories of men and women who found sobriety.' },
        { title: 'AA Big Book (ASL)', sub: 'Fourth Edition (Deaf)', description: 'The Big Book in American Sign Language, for Deaf members and anyone who prefers to read it in ASL.' },
        { title: 'AA Big Book (Audio)', sub: 'Fourth Edition Audio', description: 'Listen to the Big Book read aloud, for members who prefer audio or cannot read print.' },
      ],
    },
    {
      title: 'AA Literature',
      intro: 'Books on the Steps and Traditions, AA’s service structure and the history of the Fellowship.',
      items: [
        { title: '12 & 12', sub: '', description: 'Twelve Steps and Twelve Traditions. Explains each Step and Tradition and how it applies to personal recovery and to life in a group.' },
        { title: 'AA Service Manual', sub: '', description: 'How AA’s service structure works, with the Twelve Concepts for World Service: groups, districts, areas and the General Service Conference.' },
        { title: 'AA Comes of Age', sub: '', description: 'A history of AA from its beginnings in 1935 through its first International Convention in 1955.' },
        { title: 'Dr. Bob & Good Oldtimers', sub: '', description: 'The story of co-founder Dr. Bob and the early members who helped carry the message.' },
        { title: 'Pass It On', sub: '', description: 'The story of co-founder Bill W. and how the AA message of recovery spread around the world.' },
      ],
    },
    {
      title: 'AA Pamphlets',
      intro: 'Short reads on sponsorship, anonymity, groups, service and members’ stories.',
      items: [
        { title: 'The Twelve Traditions Illustrated', sub: '', description: 'An illustrated look at each of the Twelve Traditions and how they keep groups united.' },
        { title: 'Q&A On Sponsorship', sub: '', description: 'Answers to common questions about sponsorship: what a sponsor does, how to find one and how it works.' },
        { title: 'The AA Group', sub: '', description: 'How AA groups are formed and run, and how each group stays connected to AA as a whole.' },
        { title: 'General Service Representative', sub: '', description: 'What a GSR does: carrying the group’s conscience to district meetings and Area Assemblies and bringing news back.' },
        { title: 'Understanding Anonymity', sub: '', description: 'The spiritual meaning of anonymity in AA and how it protects members and the Fellowship, including in the media and online.' },
        { title: 'Young People in AA', sub: '', description: 'Personal stories from young members, showing that alcoholism can affect people at any age.' },
        { title: 'Black in AA – Experience Strength and Hope', sub: '', description: 'Black members share their experience, strength and hope in recovery.' },
        { title: 'LGBTQ Alcoholics in AA', sub: '', description: 'LGBTQ members share their stories of finding acceptance and recovery in AA.' },
        { title: 'Indigenous People in AA', sub: '', description: 'Indigenous members share their experience of recovery in AA.' },
      ],
    },
  ],
};

const es: Lit = {
  title: 'Literatura de A.A.: Libro Grande, folletos y más',
  description: 'Literatura de A.A. aprobada por la Conferencia: el Libro Grande, Doce Pasos y Doce Tradiciones, el manual de servicio y folletos, con enlaces para leer cada uno en aa.org.',
  heading: 'Literatura de A.A.',
  eyebrow: 'Recursos',
  lede: 'La literatura publicada por Servicios Mundiales de A.A. es un recurso para alcohólicos en recuperación y otras personas.',
  aboutHeading: 'Acerca de la literatura de A.A.',
  intro: 'En estos materiales puede conocer más sobre Alcohólicos Anónimos, su historia y cómo funciona. Los materiales se publican en inglés, español y francés. Cada enlace abre el material en aa.org.',
  groups: [
    {
      title: 'Alcohólicos Anónimos (Libro Grande)',
      intro: 'El texto básico de A.A., en versión impresa, en lengua de señas estadounidense y en audio.',
      items: [
        { title: 'Libro Grande de A.A.', sub: 'Cuarta edición', description: 'El texto básico de A.A. Explica cómo funciona el programa de recuperación de A.A. e incluye las historias personales de hombres y mujeres que encontraron la sobriedad.' },
        { title: 'Libro Grande de A.A. (ASL)', sub: 'Cuarta edición (sordos)', description: 'El Libro Grande en lengua de señas estadounidense (ASL), para miembros sordos y para quien prefiera leerlo en ASL.' },
        { title: 'Libro Grande de A.A. (audio)', sub: 'Cuarta edición en audio', description: 'Escuche el Libro Grande leído en voz alta, para los miembros que prefieren el audio o no pueden leer texto impreso.' },
      ],
    },
    {
      title: 'Literatura de A.A.',
      intro: 'Libros sobre los Pasos y las Tradiciones, la estructura de servicio de A.A. y la historia de la Comunidad.',
      items: [
        { title: 'Doce Pasos y Doce Tradiciones', sub: '', description: 'Explica cada Paso y cada Tradición y cómo se aplican a la recuperación personal y a la vida en un grupo.' },
        { title: 'Manual de Servicio de A.A. (AA Service Manual)', sub: '', description: 'Cómo funciona la estructura de servicio de A.A., con los Doce Conceptos para el Servicio Mundial: grupos, distritos, áreas y la Conferencia de Servicios Generales.' },
        { title: 'A.A. llega a su mayoría de edad', sub: '', description: 'Una historia de A.A. desde sus comienzos en 1935 hasta su primera Convención Internacional en 1955.' },
        { title: 'El Doctor Bob y los Buenos Veteranos', sub: '', description: 'La historia del cofundador, el Dr. Bob, y de los primeros miembros que ayudaron a llevar el mensaje.' },
        { title: 'Transmítelo (Pass It On)', sub: '', description: 'La historia del cofundador Bill W. y de cómo el mensaje de recuperación de A.A. se extendió por el mundo.' },
      ],
    },
    {
      title: 'Folletos de A.A.',
      intro: 'Lecturas breves sobre el apadrinamiento, el anonimato, los grupos, el servicio y las historias de los miembros.',
      items: [
        { title: 'Las Doce Tradiciones ilustradas', sub: '', description: 'Una mirada ilustrada a cada una de las Doce Tradiciones y a cómo mantienen unidos a los grupos.' },
        { title: 'Preguntas y respuestas sobre el apadrinamiento (Q&A on Sponsorship)', sub: '', description: 'Respuestas a preguntas comunes sobre el apadrinamiento: qué hace un padrino, cómo encontrar uno y cómo funciona.' },
        { title: 'El grupo de A.A. (The AA Group)', sub: '', description: 'Cómo se forman y funcionan los grupos de A.A., y cómo cada grupo se mantiene conectado con A.A. en su conjunto.' },
        { title: 'Representante de Servicios Generales (General Service Representative)', sub: '', description: 'Qué hace un RSG: llevar la conciencia del grupo a las reuniones de distrito y a las asambleas de área, y traer noticias de vuelta.' },
        { title: 'Entendiendo el anonimato (Understanding Anonymity)', sub: '', description: 'El significado espiritual del anonimato en A.A. y cómo protege a los miembros y a la Comunidad, también en los medios de comunicación y en línea.' },
        { title: 'Jóvenes en A.A. (Young People in AA)', sub: '', description: 'Historias personales de miembros jóvenes que muestran que el alcoholismo puede afectar a personas de cualquier edad.' },
        { title: 'Afroamericanos en A.A. – Experiencia, fortaleza y esperanza (Black in AA)', sub: '', description: 'Miembros afroamericanos comparten su experiencia, fortaleza y esperanza en la recuperación.' },
        { title: 'Alcohólicos LGBTQ en A.A. (LGBTQ Alcoholics in AA)', sub: '', description: 'Miembros LGBTQ comparten sus historias de aceptación y recuperación en A.A.' },
        { title: 'Pueblos indígenas en A.A. (Indigenous People in AA)', sub: '', description: 'Miembros indígenas comparten su experiencia de recuperación en A.A.' },
      ],
    },
  ],
};

const fr: Lit = {
  title: 'Littérature des A.A. : Gros Livre, brochures et plus',
  description: 'La littérature des A.A. approuvée par la Conférence : le Gros Livre, Les Douze Étapes et les Douze Traditions, le manuel du service et des brochures, avec des liens pour lire chaque titre sur aa.org.',
  heading: 'Littérature des A.A.',
  eyebrow: 'Ressources',
  lede: 'La littérature publiée par les Services mondiaux des A.A. est une ressource pour les alcooliques en rétablissement et d’autres personnes.',
  aboutHeading: 'À propos de la littérature des A.A.',
  intro: 'Ces documents vous permettent d’en apprendre davantage sur les Alcooliques anonymes, leur histoire et leur fonctionnement. Les titres sont publiés en anglais, en espagnol et en français. Chaque lien ouvre le document sur aa.org.',
  groups: [
    {
      title: 'Alcooliques anonymes (Gros Livre)',
      intro: 'Le texte de base des A.A., en version imprimée, en langue des signes américaine et en version audio.',
      items: [
        { title: 'Le Gros Livre des A.A.', sub: 'Quatrième édition', description: 'Le texte de base des A.A. Il explique comment fonctionne le programme de rétablissement des A.A. et comprend les récits personnels d’hommes et de femmes qui ont trouvé la sobriété.' },
        { title: 'Le Gros Livre des A.A. (ASL)', sub: 'Quatrième édition (personnes sourdes)', description: 'Le Gros Livre en langue des signes américaine (ASL), pour les membres sourds et pour toute personne qui préfère le lire en ASL.' },
        { title: 'Le Gros Livre des A.A. (audio)', sub: 'Quatrième édition audio', description: 'Écoutez le Gros Livre lu à voix haute, pour les membres qui préfèrent l’audio ou qui ne peuvent pas lire le texte imprimé.' },
      ],
    },
    {
      title: 'Littérature des A.A.',
      intro: 'Des livres sur les Étapes et les Traditions, sur la structure de service des A.A. et sur l’histoire de la Fraternité.',
      items: [
        { title: 'Les Douze Étapes et les Douze Traditions (12 & 12)', sub: '', description: 'Explique chaque Étape et chaque Tradition et la façon dont elles s’appliquent au rétablissement personnel et à la vie en groupe.' },
        { title: 'Manuel du service chez les A.A. (AA Service Manual)', sub: '', description: 'Comment fonctionne la structure de service des A.A., avec les Douze Concepts pour le service mondial : groupes, districts, régions et Conférence des services généraux.' },
        { title: 'Les A.A. atteignent leur majorité (AA Comes of Age)', sub: '', description: 'Une histoire des A.A. depuis leurs débuts en 1935 jusqu’à leur premier Congrès international en 1955.' },
        { title: 'Dr Bob et les bons vieux compagnons (Dr. Bob & Good Oldtimers)', sub: '', description: 'L’histoire du cofondateur, le Dr Bob, et des premiers membres qui ont aidé à transmettre le message.' },
        { title: 'Pass It On', sub: '', description: 'L’histoire du cofondateur Bill W. et de la façon dont le message de rétablissement des A.A. s’est répandu dans le monde.' },
      ],
    },
    {
      title: 'Brochures des A.A.',
      intro: 'De courtes lectures sur le parrainage, l’anonymat, les groupes, le service et les récits de membres.',
      items: [
        { title: 'Les Douze Traditions illustrées (The Twelve Traditions Illustrated)', sub: '', description: 'Un regard illustré sur chacune des Douze Traditions et sur la façon dont elles assurent l’unité des groupes.' },
        { title: 'Questions et réponses sur le parrainage (Q&A on Sponsorship)', sub: '', description: 'Des réponses aux questions courantes sur le parrainage : ce que fait un parrain, comment en trouver un et comment cela fonctionne.' },
        { title: 'Le groupe A.A. (The AA Group)', sub: '', description: 'Comment les groupes A.A. se forment et fonctionnent, et comment chaque groupe reste relié aux A.A. dans leur ensemble.' },
        { title: 'Le représentant des services généraux (General Service Representative)', sub: '', description: 'Ce que fait un RSG : porter la conscience du groupe aux réunions de district et aux assemblées de région, et rapporter les nouvelles.' },
        { title: 'Comprendre l’anonymat (Understanding Anonymity)', sub: '', description: 'Le sens spirituel de l’anonymat chez les A.A. et la façon dont il protège les membres et la Fraternité, y compris dans les médias et en ligne.' },
        { title: 'Les jeunes et les A.A. (Young People in AA)', sub: '', description: 'Des récits personnels de jeunes membres, qui montrent que l’alcoolisme peut toucher des personnes de tout âge.' },
        { title: 'Noirs chez les A.A. – Expérience, force et espoir (Black in AA)', sub: '', description: 'Des membres noirs partagent leur expérience, leur force et leur espoir dans le rétablissement.' },
        { title: 'Alcooliques LGBTQ chez les A.A. (LGBTQ Alcoholics in AA)', sub: '', description: 'Des membres LGBTQ racontent comment ils ont trouvé acceptation et rétablissement chez les A.A.' },
        { title: 'Les Autochtones chez les A.A. (Indigenous People in AA)', sub: '', description: 'Des membres autochtones partagent leur expérience du rétablissement chez les A.A.' },
      ],
    },
  ],
};

export const literatureMsgs: Record<Lang, Lit> = { en, es, fr };
