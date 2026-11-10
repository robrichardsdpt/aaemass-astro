// Committee page text in Spanish and French. Keys are the English URL slugs; hrefs, emails and schedules
// come from src/lib/committee-pages.ts. `links` holds link texts in the same order as the English links.
// Draft: have a bilingual AA member review before publishing.
import type { Lang } from '../index';

export interface CommitteeText {
  eyebrow: string;
  seoTitle?: string;
  lede: string;
  description: string;
  quote?: { text: string; by: string };
  sections: { title: string; paras?: string[]; items?: string[]; links?: string[] }[];
  meeting?: { intro?: string; lines: string[]; joinText?: string };
  cta: string;
  more?: string;
}

const es: Record<string, CommitteeText> = {
  archives: {
    eyebrow: 'Comité de la Conferencia',
    lede: 'El Este de Massachusetts tiene una rica historia en Alcohólicos Anónimos. La preservamos para poder compartirla con los alcohólicos que vengan después de nosotros.',
    description: 'El Comité de Archivos del Área 30 reúne, preserva y presenta la historia de A.A. en el Este de Massachusetts. Se reúne el tercer martes de cada mes a las 7:30 p. m.',
    quote: { text: 'Cuando una sociedad o una civilización perece, siempre hay una condición presente: olvidaron de dónde venían.', by: 'Carl Sandburg' },
    sections: [
      {
        title: 'Misión',
        paras: [
          'La misión de los Archivos de Alcohólicos Anónimos en el Área 30 es documentar de forma permanente la labor del Área 30 y sus distritos, hacer accesible la historia de la organización a los miembros de A.A. y a otros investigadores, y ofrecer un contexto para comprender la evolución, los principios y las tradiciones de A.A.',
          'El Comité de Archivos tiene el encargo de reunir, preservar y presentar materiales de interés histórico para Alcohólicos Anónimos. Lo invitamos a acompañarnos mientras descubrimos y celebramos la historia de A.A. en el Este de Massachusetts.',
        ],
      },
      {
        title: 'Responsabilidades',
        items: [
          'Clasificar, archivar y preservar los documentos ya reunidos y guardados',
          'Reunir y catalogar las nuevas aportaciones a medida que lleguen',
          'Comunicarnos con los distritos y otros grupos del Área 30 para darles noticias de nuestro trabajo de servicio y animarlos a preservar sus propios archivos',
          'Registrar las historias de grupos y de personas antes de que sea demasiado tarde',
          'Compartir nuestros archivos con usted, para que podamos «recorrer el camino» juntos',
        ],
        paras: ['Invitamos a los miembros que han vivido nuestra historia a compartirla con nosotros, para que los futuros miembros de A.A. se beneficien de su experiencia, fortaleza y esperanza. Con gusto haremos arreglos mutuamente convenientes para reunirnos.'],
      },
    ],
    meeting: { lines: ['De forma virtual, a las 7:30 p. m. el tercer martes de cada mes.', 'Venga a ayudarnos a mantener viva la historia del Área 30. Todos los miembros de A.A. son bienvenidos.'] },
    cta: 'Para comunicarse con el Comité de Archivos, escríbanos y le responderemos lo antes posible.',
  },
  cpc: {
    eyebrow: 'Comité de la Conferencia · CCP',
    seoTitle: 'Comité de CCP | Área 30 de A.A. del Este de Mass.',
    lede: 'El CCP es el contacto oficial de A.A. con los miembros de la comunidad profesional.',
    description: 'El comité de CCP del Área 30 lleva el mensaje de A.A. a profesionales de la salud, el derecho, el clero y la educación. Se reúne el segundo jueves a las 7 p. m.',
    sections: [
      {
        title: 'Con quiénes trabajamos',
        paras: [
          'Entre los profesionales están los de la salud, la salud mental, el trabajo social, los recursos humanos, el derecho, las instituciones correccionales, el personal de centros de tratamiento, los educadores, los miembros del clero y los agentes de policía.',
          'Los comités locales de CCP dan información sobre Alcohólicos Anónimos a miembros de la comunidad cuyo trabajo los pone en contacto habitual con personas que pueden padecer alcoholismo. Buscamos maneras sencillas y eficaces de trabajar con los profesionales bajo una política de «cooperación, pero no afiliación».',
        ],
      },
      {
        title: 'Misión',
        paras: [
          'El comité lleva el mensaje de A.A. a los profesionales y a los estudiantes de escuelas profesionales, ayudándoles a comprender cómo y por qué funciona A.A. A.A. siempre ha valorado a los amigos de todos los campos profesionales, y estas relaciones han sido mutuamente beneficiosas y acordes con las Tradiciones.',
          'Los miembros informan a los profesionales y a los futuros profesionales sobre A.A.: qué somos, dónde estamos, qué podemos hacer y qué no podemos hacer.',
        ],
        links: ['Recursos de CCP en aa.org'],
      },
    ],
    meeting: { lines: ['7:00 p. m. el segundo jueves de cada mes, por Zoom.', 'Todos los miembros de A.A. son bienvenidos.'] },
    cta: 'Para comunicarse con el Comité de CCP, escríbanos y le responderemos lo antes posible.',
  },
  corrections: {
    eyebrow: 'Comité de la Conferencia',
    lede: 'Llevando el mensaje de A.A. detrás de los muros.',
    description: 'El Comité de Instituciones Correccionales del Área 30 organiza reuniones de A.A. y literatura para prisiones, cárceles y casas de transición en el Este de Mass. Se reúne el cuarto jueves a las 7 p. m.',
    sections: [
      {
        title: 'Qué hacemos',
        paras: [
          'El Comité de Instituciones Correccionales trabaja con instituciones de todo el Este de Massachusetts para organizar reuniones, y los recursos para llevarlas a cabo, en prisiones, cárceles y casas de transición. Las reuniones son coordinadas y dirigidas por miembros y grupos de A.A. El comité también compra y distribuye literatura de A.A. para los miembros que viven en estas instituciones.',
          'Los miembros o grupos interesados en llevar el mensaje a estos centros pueden escribir al comité.',
        ],
      },
      {
        title: 'Programa de contacto previo a la liberación',
        paras: [
          'Ayudamos a las personas que salen de prisión a conectarse con miembros de A.A. de sus comunidades. Si desea escribir a una persona recluida, o formar parte de una lista de llamadas de Duodécimo Paso para servir de contacto a alguien que sale en libertad, escriba al comité.',
        ],
      },
      {
        title: 'Literatura para prisiones (LIPS)',
        paras: [
          'Los carteles de LIPS están disponibles para cualquier grupo del Este de Mass. que quiera reunir literatura aprobada por la Conferencia. El cartel cubre un lado de una caja de cartón, y las cajas llenas se llevan a Boston Central Service para redistribuirlas a los miembros de A.A. en prisiones donde se permita. Los Libros Grandes, los Doce Pasos y Doce Tradiciones, las revistas Grapevine y los folletos siempre hacen falta.',
        ],
      },
    ],
    meeting: {
      intro: 'El Comité Conjunto de Instituciones Correccionales del Área 30 y Boston Central Service se reúne el cuarto jueves de cada mes a las 7:00 p. m. por Zoom. Necesitamos su ayuda, y todos los miembros de A.A. son bienvenidos.',
      lines: ['Si usted o su grupo ya lleva el mensaje a una institución correccional, venga a compartir su experiencia con nosotros.'],
    },
    cta: 'Estamos disponibles para actividades de difusión en eventos de distritos o grupos. Escriba al comité para participar.',
  },
  grapevine: {
    eyebrow: 'Comité de la Conferencia',
    lede: 'AA Grapevine es la revista internacional de Alcohólicos Anónimos, nuestra «reunión impresa».',
    description: 'El Comité de Grapevine del Área 30 comparte AA Grapevine y La Viña con grupos de todo el Este de Massachusetts. Se reúne el primer miércoles de cada mes a las 7:00 p. m.',
    quote: { text: 'Como cada número del Grapevine no puede pasar por el proceso de aprobación de la Conferencia, la Conferencia reconoce a AA Grapevine como la revista internacional de Alcohólicos Anónimos.', by: 'Acción recomendada de la Conferencia, 1986' },
    sections: [
      {
        title: 'Acerca del Grapevine',
        paras: [
          'Escrito, editado, ilustrado y leído por miembros de A.A. y otras personas interesadas en el programa de A.A., el Grapevine es un salvavidas que une a un alcohólico con otro. Fundado en 1944, no recibe contribuciones de los grupos y se sostiene por completo con las suscripciones a la revista y la venta de artículos del Grapevine.',
          'Cada miembro tiene su manera propia de practicar el programa, y la revista siempre ha sido un foro para las opiniones variadas y a menudo divergentes de miembros de A.A. de todo el mundo. Los artículos no son declaraciones de la política de A.A., y su publicación no implica el respaldo de A.A. ni del Grapevine.',
        ],
        links: ['Más información sobre el Grapevine'],
      },
      {
        title: 'Nuestra misión',
        paras: [
          'El objetivo principal del comité es dar a conocer a las personas y a los grupos del Área 30 todo lo posible sobre el Grapevine mensual. Sus 64 páginas, escritas por miembros de A.A., se han convertido en la voz de A.A. de hoy. Por medio de ella, los miembros comparten su experiencia, fortaleza y esperanza, siempre procurando llevar el mensaje de recuperación, unidad y servicio.',
        ],
      },
      {
        title: 'Qué ofrecemos',
        paras: [
          'Si se solicita, el comité visita distritos y grupos del Este de Massachusetts para compartir parte de la historia que el Grapevine ha traído hasta hoy. El Preámbulo que se lee al comienzo de las reuniones de A.A. se imprimió por primera vez allí, y el libro El lenguaje del corazón es un regalo estupendo. Leer historias del Grapevine es una excelente manera de iniciar un debate en una reunión.',
          'Nuestro programa «Count On Us» ofrece suscripciones al Grapevine y a La Viña (la edición en español) para centros de tratamiento e instituciones correccionales de todos los distritos del Área.',
        ],
        links: ['Grapevine en YouTube'],
      },
    ],
    meeting: { lines: ['7:00 p. m. el primer miércoles de cada mes, por Zoom.'], joinText: 'Unirse por Zoom' },
    cta: 'Para comunicarse con el Comité de Grapevine con preguntas, o para participar, escríbanos.',
  },
  literature: {
    eyebrow: 'Comité de la Conferencia',
    lede: 'Dando a conocer a los miembros qué literatura aprobada por la Conferencia está disponible.',
    description: 'El Comité de Literatura del Área 30 revisa la literatura de A.A. y ayuda a los grupos a pedirla localmente. Se reúne el primer lunes de cada mes a las 7:00 p. m.',
    sections: [
      {
        title: 'Misión',
        paras: [
          'El comité informa a los grupos y a los miembros de las asambleas de distrito y de área, por medio de exhibiciones y otros métodos adecuados, sobre toda la literatura aprobada por la Conferencia, el material audiovisual y otros artículos especiales disponibles. Revisa tanto los materiales aprobados por la Conferencia como los materiales de servicio locales, e informa a la Comunidad dentro del Área 30.',
          'Usamos nuestras reuniones para revisar la literatura vigente aprobada por la Conferencia y la elaborada localmente, para asegurarnos de que el mensaje siga siendo coherente con los principios de los Pasos y las Tradiciones. Respondemos consultas sobre diversos temas y señalamos posibles fuentes de información. Nuestra meta es informar a los miembros sobre las herramientas disponibles para nuestra propia recuperación y para llevar el mensaje a otros.',
        ],
        links: ['Comités de literatura en aa.org'],
      },
      { title: 'Pedir literatura localmente', paras: ['Para pedir literatura localmente, o para más información, escriba al comité.'] },
    ],
    meeting: { lines: ['7:00 p. m. el primer lunes de cada mes, por Zoom.', 'ID de Zoom 864 3440 1757, código de acceso AA30.'] },
    cta: 'Para hacer una pregunta, participar o hacer un pedido local, escriba al Comité de Literatura.',
    more: 'Ver la literatura de A.A.',
  },
  'public-information': {
    eyebrow: 'Comité de la Conferencia · I.P.',
    lede: 'Llevando el mensaje de recuperación al alcohólico que aún sufre mediante la información al público sobre A.A.',
    description: 'El Comité de Información Pública (I.P.) del Área 30 ofrece a los medios, las escuelas y los grupos información precisa sobre A.A. Se reúne el primer jueves a las 7 p. m.',
    sections: [
      {
        title: '¿Qué es el trabajo de I.P.?',
        paras: [
          'La Información Pública en Alcohólicos Anónimos significa llevar el mensaje de recuperación al alcohólico que aún sufre, informando al público en general sobre el programa de A.A. Lo hacemos poniéndonos en contacto con los medios de comunicación, las escuelas, la industria y otras organizaciones que puedan informar sobre la naturaleza y el propósito de A.A. y sobre lo que puede hacer por los alcohólicos.',
          'El primer comité de I.P. de A.A. fue formado por la Junta de Servicios Generales en 1956.',
        ],
      },
      {
        title: 'Misión',
        paras: [
          'Este comité permanente lleva el mensaje de Alcohólicos Anónimos al alcohólico que aún sufre por medio de los medios de comunicación y de oradores públicos. Es la fuente central de la información sobre A.A. que se pone a disposición del público en el Este de Mass., y se asegura de que esa información sea correcta y se dé dentro de las pautas de las Doce Tradiciones.',
        ],
        links: ['Comités de I.P. en aa.org'],
      },
      {
        title: 'Nuestro enfoque',
        items: [
          'Dar presentaciones sobre A.A. en escuelas y organizaciones',
          'Ofrecer información sobre A.A. mediante materiales digitales e impresos',
          'Asegurarnos de que los medios locales tengan información precisa, mediante anuncios de servicio público, entrevistas que protegen el anonimato y paquetes de prensa',
        ],
      },
    ],
    meeting: { lines: ['7:00 p. m. el primer jueves de cada mes, por Zoom.'], joinText: 'Unirse por Zoom' },
    cta: 'Para comunicarse con el Comité de I.P. con preguntas, o para participar, escríbanos.',
  },
  'treatment-facilities': {
    eyebrow: 'Comité de la Conferencia',
    lede: 'Llevando reuniones de A.A. a las personas en hospitales y programas de tratamiento.',
    description: 'El Comité de Centros de Tratamiento del Área 30 coordina a los miembros de A.A. que llevan el mensaje a centros de tratamiento. Se reúne el tercer viernes a las 7 p. m.',
    sections: [
      {
        title: 'Misión',
        paras: [
          'El Comité de Centros de Tratamiento dirige y coordina el trabajo de los miembros y grupos de A.A. que llevan el mensaje a las personas en programas hospitalarios y de centros de tratamiento. Ejemplos de nuestro trabajo de Duodécimo Paso son coordinar una reunión en un centro de desintoxicación, coordinar reuniones en un centro de tratamiento y trabajar con el personal de un hospital para organizar una reunión.',
        ],
        links: ['Comités de tratamiento en aa.org', 'Reservar un compromiso: Calendario de Tratamiento'],
      },
      {
        title: 'Propósito',
        items: [
          'Los voluntarios se comunican con los centros de tratamiento de su distrito para que los administradores sepan que A.A. puede ayudar a sus clientes y a quienes quieran mantenerse sobrios a pasar a la Comunidad fuera del tratamiento',
          'Con la aprobación de la administración, llevar reuniones de A.A. a los centros de tratamiento',
          'Fomentar la participación de grupos y de personas. Muchos grupos «adoptan» un centro y ofrecen reuniones dentro de él',
          'Coordinar con programas de contacto temporal como Bridge the Gap (BTG)',
          'Trabajar con comités como el de CCP para ofrecer literatura, presentaciones y talleres a los administradores',
        ],
      },
    ],
    meeting: { lines: ['7:00 p. m. el tercer viernes de cada mes, por Zoom.'], joinText: 'Unirse por Zoom' },
    cta: 'Si desea llevar reuniones de A.A. a centros de tratamiento, o si es un centro que quiere reuniones de A.A., escriba al Comité de Tratamiento.',
    more: 'Ofrézcase como voluntario para llamadas de Duodécimo Paso',
  },
  accessibilities: {
    eyebrow: 'Comité de la Conferencia',
    lede: 'Trabajando por un futuro en el que todas las personas que quieran participar en A.A. en el Este de Massachusetts puedan hacerlo.',
    description: 'El Comité de Accesibilidades del Área 30 trabaja para eliminar las barreras a las reuniones y los servicios de A.A. Se reúne en línea el tercer lunes de cada mes a las 7:30 p. m.',
    sections: [
      {
        title: 'Propósito',
        paras: [
          'Algunos alcohólicos enfrentan barreras para participar en A.A. por razones culturales, geográficas, mentales, físicas o sociales, entre otras. Este comité trabaja por un futuro en el que todas las personas que quieran participar en las reuniones y otros servicios de A.A. en el Este de Massachusetts puedan hacerlo, en un ambiente acogedor y de aceptación.',
        ],
        links: ['Lista de verificación de accesibilidades (PDF)'],
      },
      {
        title: 'Participe',
        paras: [
          'El comité se reúne todos los meses. Usted es bienvenido a unirse, o simplemente a asistir como miembro de A.A. interesado.',
          '¿Está planeando un evento de distrito u otro evento de A.A. en el Área 30? Con gusto iremos a hacer labor de difusión.',
        ],
      },
      {
        title: 'Reuniones en línea y por teléfono',
        paras: [
          'No todos los miembros pueden o quieren asistir en línea. Algunos encuentran que la tecnología es una barrera y se sienten excluidos o juzgados. Los grupos base pueden comunicarse con esos miembros con cariño y apoyo, programar «horas de conversación» por teléfono, o hacer que un miembro «adopte» a un miembro poco familiarizado con la tecnología para mantenerlo al día.',
          'El comité reúne recursos compartidos de toda la Comunidad, incluida orientación sobre cómo realizar reuniones en línea y por teléfono protegiendo el anonimato y la seguridad. No podemos recomendar un recurso por encima de otro, y agradecemos las sugerencias que quiera que compartamos. Escriba al comité para enviar una.',
        ],
      },
    ],
    meeting: {
      lines: ['En línea, a las 7:30 p. m. el tercer lunes de cada mes.', 'Para obtener una copia del acta anterior y de la agenda próxima, o el acceso a la reunión, escriba al presidente.'],
    },
    cta: 'Únase al comité, asista a una reunión o invítenos a su evento: escriba al Comité de Accesibilidades.',
  },
  messenger: {
    eyebrow: 'Comité permanente',
    lede: 'El boletín del Área 30, publicado para cada Asamblea de Área.',
    description: 'El Comité del Boletín Messenger del Área 30 publica el boletín Messenger para cada Asamblea de Área. Envíe sus colaboraciones a messenger@aaemass.org.',
    sections: [
      {
        title: 'Misión',
        paras: [
          'El Comité del Messenger es responsable del boletín del Área 30, The Messenger, que se publica para cada una de las Asambleas de Área y se distribuye por la estructura de servicio y en las reuniones de comités.',
          'Se aceptan colaboraciones. Por favor, envíelas por correo electrónico e incluya su información de contacto confidencial.',
        ],
        links: ['Comités de literatura en aa.org'],
      },
    ],
    cta: 'Para enviar una colaboración, hacer una pregunta o participar, escriba al Comité del Messenger.',
  },
  'service-seminar': {
    eyebrow: 'Comité permanente',
    lede: 'Difusión e introducción a la estructura de servicio.',
    description: 'El Comité del Seminario de Servicio del Área 30 ofrece difusión e introducción a la estructura de servicio descrita en el Manual del Área 30 y en el Manual de Servicio de AAWS.',
    sections: [
      {
        title: 'Misión',
        paras: ['El Comité del Seminario de Servicio ofrece difusión e introducción a la estructura de servicio tal como se describe en el Manual del Área 30 y en el Manual de Servicio de AAWS.'],
      },
    ],
    cta: 'Solicite información al Comité del Seminario de Servicio, o haga una pregunta.',
  },
  'state-convention': {
    eyebrow: 'Comité permanente',
    lede: 'Compañerismo, comida y diversión, planeados por miembros de todo Massachusetts.',
    description: 'El Comité de la Convención Estatal de Massachusetts se reúne todos los meses para planear la convención anual: oradores, talleres, comida, compañerismo y diversión.',
    sections: [
      {
        title: 'Misión',
        paras: ['El Comité de la Convención se reúne todos los meses para organizar la Convención Estatal anual de Massachusetts, un fin de semana con oradores, talleres, comida, compañerismo y diversión.'],
        links: ['aamastateconvention.org'],
      },
    ],
    meeting: {
      intro: 'El Comité de Planificación de la Convención se reúne todos los meses, en modalidad híbrida, en persona y en línea. Consulte el calendario o el sitio web de la convención para conocer la fecha de la próxima reunión.',
      lines: ['En persona: Royal Plaza, 181 Boston Post Road W., Marlborough', 'En línea: ID de reunión 878 4199 4146, código de acceso hkJvj8'],
    },
    cta: 'Para hacer una pregunta o participar, escriba al Comité de la Convención.',
  },
  website: {
    eyebrow: 'Comité permanente',
    lede: 'El comité que mantiene este sitio web del Área 30.',
    description: 'El Comité del Sitio Web del Área 30 mantiene el sitio web del Área 30 y se reúne todos los meses. ¿Le interesan el servicio y la tecnología? Póngase en contacto.',
    sections: [
      {
        title: 'Misión',
        paras: [
          'Este comité mantiene el sitio web del Área 30 conforme a lo dispuesto por la asamblea y elabora recomendaciones sobre su mantenimiento futuro.',
          'Para solicitar cambios o ediciones en el sitio web, escriba al comité.',
        ],
      },
      {
        title: 'Participe',
        paras: ['¿Busca participar en el servicio? ¿Tiene habilidades técnicas, o interés en la tecnología y los sitios web? Venga a conocer el Comité del Sitio Web y póngase a disposición.'],
      },
    ],
    meeting: { lines: ['De forma virtual, a las 6:00 p. m. el primer lunes de cada mes.'] },
    cta: 'Para comunicarse con el Comité del Sitio Web con preguntas, o para participar, escríbanos.',
  },
};

const fr: Record<string, CommitteeText> = {
  archives: {
    eyebrow: 'Comité de la Conférence',
    lede: 'L’Est du Massachusetts a une riche histoire chez les Alcooliques anonymes. Nous la préservons pour pouvoir la transmettre aux alcooliques qui viendront après nous.',
    description: 'Le Comité des archives de la Région 30 recueille, préserve et présente l’histoire des A.A. dans l’Est du Massachusetts. Il se réunit le troisième mardi du mois à 19 h 30.',
    quote: { text: 'Chaque fois qu’une société ou une civilisation périt, une condition est toujours présente : elle a oublié d’où elle venait.', by: 'Carl Sandburg' },
    sections: [
      {
        title: 'Mission',
        paras: [
          'La mission des Archives des Alcooliques anonymes de la Région 30 est de documenter de façon permanente le travail de la Région 30 et de ses districts, de rendre l’histoire de l’organisation accessible aux membres des A.A. et à d’autres chercheurs, et d’offrir un contexte pour comprendre l’évolution, les principes et les traditions des A.A.',
          'Le Comité des archives a pour mandat de recueillir, de préserver et de présenter les documents d’intérêt historique pour les Alcooliques anonymes. Nous vous invitons à vous joindre à nous pour découvrir et célébrer l’histoire des A.A. dans l’Est du Massachusetts.',
        ],
      },
      {
        title: 'Responsabilités',
        items: [
          'Trier, classer et préserver les documents déjà recueillis et entreposés',
          'Recueillir et cataloguer les nouveaux ajouts à mesure qu’ils arrivent',
          'Communiquer avec les districts et les autres groupes de la Région 30 pour leur faire connaître notre travail de service et les encourager à préserver leurs propres archives',
          'Consigner l’histoire des groupes et des personnes avant qu’il ne soit trop tard',
          'Partager nos archives avec vous, afin que nous puissions « faire route » ensemble',
        ],
        paras: ['Nous invitons les membres qui ont vécu notre histoire à la partager avec nous, afin que les futurs membres des A.A. profitent de leur expérience, de leur force et de leur espoir. Nous prendrons volontiers des arrangements convenant à tous pour nous rencontrer.'],
      },
    ],
    meeting: { lines: ['Virtuellement, à 19 h 30 le troisième mardi du mois.', 'Venez nous aider à garder vivante l’histoire de la Région 30. Tous les membres des A.A. sont les bienvenus.'] },
    cta: 'Pour communiquer avec le Comité des archives, écrivez-nous et nous vous répondrons dans les meilleurs délais.',
  },
  cpc: {
    eyebrow: 'Comité de la Conférence · CMP',
    seoTitle: 'Comité CMP | Région 30 des A.A. de l’Est du Mass.',
    lede: 'Le CMP est le contact officiel des A.A. avec les membres des milieux professionnels.',
    description: 'Le comité CMP de la Région 30 transmet le message des A.A. aux professionnels de la santé, du droit, du clergé et de l’éducation. Il se réunit le deuxième jeudi à 19 h.',
    sections: [
      {
        title: 'Avec qui nous travaillons',
        paras: [
          'Parmi les professionnels, on compte les professionnels de la santé, de la santé mentale, du travail social, des ressources humaines, du droit, des services correctionnels, le personnel des centres de traitement, les éducateurs, les membres du clergé et les policiers.',
          'Les comités CMP locaux renseignent sur les Alcooliques anonymes les membres de la collectivité dont le travail les met régulièrement en contact avec des personnes qui peuvent souffrir d’alcoolisme. Nous cherchons des moyens simples et efficaces de travailler avec les professionnels selon une politique de « collaboration, mais non d’affiliation ».',
        ],
      },
      {
        title: 'Mission',
        paras: [
          'Le comité transmet le message des A.A. aux professionnels et aux étudiants des écoles professionnelles, en les aidant à comprendre comment et pourquoi les A.A. fonctionnent. Les A.A. ont toujours apprécié leurs amis de tous les milieux professionnels, et ces relations ont été mutuellement bénéfiques et conformes aux Traditions.',
          'Les membres renseignent les professionnels et les futurs professionnels sur les A.A. : ce que nous sommes, où nous sommes, ce que nous pouvons faire et ce que nous ne pouvons pas faire.',
        ],
        links: ['Ressources du CMP sur aa.org'],
      },
    ],
    meeting: { lines: ['19 h le deuxième jeudi du mois, sur Zoom.', 'Tous les membres des A.A. sont les bienvenus.'] },
    cta: 'Pour communiquer avec le Comité CMP, écrivez-nous et nous vous répondrons dans les meilleurs délais.',
  },
  corrections: {
    eyebrow: 'Comité de la Conférence',
    lede: 'Porter le message des A.A. derrière les murs.',
    description: 'Le Comité des établissements correctionnels de la Région 30 organise des réunions des A.A. et fournit de la documentation aux prisons, aux centres de détention et aux maisons de transition de l’Est du Mass. Il se réunit le quatrième jeudi à 19 h.',
    sections: [
      {
        title: 'Ce que nous faisons',
        paras: [
          'Le Comité des établissements correctionnels collabore avec des établissements de tout l’Est du Massachusetts pour organiser des réunions, et les ressources pour les tenir, dans les prisons, les centres de détention et les maisons de transition. Les réunions sont animées et dirigées par des membres et des groupes A.A. Le comité achète aussi de la documentation des A.A. et la distribue aux membres qui vivent dans ces établissements.',
          'Les membres ou les groupes qui souhaitent porter le message dans ces établissements peuvent écrire au comité.',
        ],
      },
      {
        title: 'Programme de contact avant la libération',
        paras: [
          'Nous aidons les personnes qui sortent de prison à entrer en contact avec des membres des A.A. de leur collectivité. Si vous souhaitez écrire à une personne détenue, ou figurer sur une liste d’appels de Douzième Étape pour servir de contact à une personne qui sort, écrivez au comité.',
        ],
      },
      {
        title: 'Documentation pour les prisons (LIPS)',
        paras: [
          'Des affiches LIPS sont offertes à tout groupe de l’Est du Mass. qui veut recueillir de la documentation approuvée par la Conférence. L’affiche couvre un côté d’une boîte en carton, et les boîtes remplies sont apportées à Boston Central Service pour être redistribuées aux membres des A.A. dans les prisons où cela est permis. Les Gros Livres, les Douze Étapes et les Douze Traditions, les revues Grapevine et les brochures sont toujours en demande.',
        ],
      },
    ],
    meeting: {
      intro: 'Le Comité conjoint des établissements correctionnels de la Région 30 et de Boston Central Service se réunit le quatrième jeudi de chaque mois à 19 h sur Zoom. Nous avons besoin de votre aide, et tous les membres des A.A. sont les bienvenus.',
      lines: ['Si vous ou votre groupe portez déjà le message dans un établissement correctionnel, venez partager votre expérience avec nous.'],
    },
    cta: 'Nous sommes disponibles pour des activités de sensibilisation lors d’événements de districts ou de groupes. Écrivez au comité pour vous engager.',
  },
  grapevine: {
    eyebrow: 'Comité de la Conférence',
    lede: 'Le AA Grapevine est la revue internationale des Alcooliques anonymes, notre « réunion imprimée ».',
    description: 'Le Comité du Grapevine de la Région 30 fait connaître le AA Grapevine et La Vigne aux groupes de tout l’Est du Massachusetts. Il se réunit le premier mercredi du mois à 19 h.',
    quote: { text: 'Comme chaque numéro du Grapevine ne peut passer par le processus d’approbation de la Conférence, la Conférence reconnaît le AA Grapevine comme la revue internationale des Alcooliques anonymes.', by: 'Recommandation de la Conférence, 1986' },
    sections: [
      {
        title: 'À propos du Grapevine',
        paras: [
          'Écrit, rédigé, illustré et lu par des membres des A.A. et d’autres personnes qui s’intéressent au programme des A.A., le Grapevine est un lien vital entre alcooliques. Fondé en 1944, il ne reçoit aucune contribution des groupes et vit entièrement des abonnements à la revue et de la vente d’articles du Grapevine.',
          'Chaque membre a sa propre façon de pratiquer le programme, et la revue a toujours été un forum pour les opinions variées et souvent divergentes des membres des A.A. du monde entier. Les articles ne sont pas des énoncés de politique des A.A., et leur publication n’implique pas l’approbation des A.A. ni du Grapevine.',
        ],
        links: ['En savoir plus sur le Grapevine'],
      },
      {
        title: 'Notre mission',
        paras: [
          'Le but principal du comité est de faire connaître aux personnes et aux groupes de la Région 30 tout ce que nous pouvons sur le Grapevine mensuel. Ses 64 pages, écrites par des membres des A.A., sont devenues la voix des A.A. d’aujourd’hui. Par son entremise, les membres partagent leur expérience, leur force et leur espoir, en s’efforçant toujours de transmettre le message de rétablissement, d’unité et de service.',
        ],
      },
      {
        title: 'Ce que nous offrons',
        paras: [
          'Sur demande, le comité rend visite aux districts et aux groupes de l’Est du Massachusetts pour partager une partie de l’histoire que le Grapevine a transmise jusqu’à nous. Le Préambule lu au début des réunions des A.A. y a été imprimé pour la première fois, et le livre Le langage du cœur fait un merveilleux cadeau. Lire des récits du Grapevine est une excellente façon de lancer une discussion en réunion.',
          'Notre programme « Count On Us » offre des abonnements au Grapevine et à La Vigne (l’édition française) aux centres de traitement et aux établissements correctionnels de chaque district de la Région.',
        ],
        links: ['Le Grapevine sur YouTube'],
      },
    ],
    meeting: { lines: ['19 h le premier mercredi du mois, sur Zoom.'], joinText: 'Se joindre sur Zoom' },
    cta: 'Pour communiquer avec le Comité du Grapevine au sujet de questions, ou pour vous engager, écrivez-nous.',
  },
  literature: {
    eyebrow: 'Comité de la Conférence',
    lede: 'Faire connaître aux membres la documentation approuvée par la Conférence qui est offerte.',
    description: 'Le Comité de la littérature de la Région 30 examine la littérature des A.A. et aide les groupes à la commander localement. Il se réunit le premier lundi du mois à 19 h.',
    sections: [
      {
        title: 'Mission',
        paras: [
          'Le comité informe les groupes et les membres des assemblées de district et de région, au moyen d’expositions et d’autres méthodes appropriées, de toute la documentation approuvée par la Conférence, du matériel audiovisuel et d’autres articles spéciaux offerts. Il examine à la fois la documentation approuvée par la Conférence et le matériel de service local, et renseigne la Fraternité de la Région 30.',
          'Nous utilisons nos réunions pour examiner la documentation en vigueur approuvée par la Conférence et celle qui est produite localement, afin de nous assurer que le message reste conforme aux principes des Étapes et des Traditions. Nous répondons à des demandes sur divers sujets et indiquons des sources d’information possibles. Notre objectif est de faire connaître aux membres les outils disponibles pour notre propre rétablissement et pour transmettre le message à d’autres.',
        ],
        links: ['Comités de la littérature sur aa.org'],
      },
      { title: 'Commander de la documentation localement', paras: ['Pour commander de la documentation localement, ou pour plus de renseignements, écrivez au comité.'] },
    ],
    meeting: { lines: ['19 h le premier lundi du mois, sur Zoom.', 'ID Zoom 864 3440 1757, code d’accès AA30.'] },
    cta: 'Pour poser une question, vous engager ou passer une commande locale, écrivez au Comité de la littérature.',
    more: 'Parcourir la littérature des A.A.',
  },
  'public-information': {
    eyebrow: 'Comité de la Conférence · I.P.',
    lede: 'Transmettre le message de rétablissement à l’alcoolique qui souffre encore en informant le public au sujet des A.A.',
    description: 'Le Comité d’information publique (I.P.) de la Région 30 fournit aux médias, aux écoles et aux groupes des renseignements exacts sur les A.A. Il se réunit le premier jeudi à 19 h.',
    sections: [
      {
        title: 'Qu’est-ce que le travail d’I.P.?',
        paras: [
          'L’information publique chez les Alcooliques anonymes consiste à transmettre le message de rétablissement à l’alcoolique qui souffre encore en renseignant le grand public sur le programme des A.A. Nous le faisons en entrant en contact avec les médias, les écoles, l’industrie et d’autres organisations qui peuvent faire connaître la nature et le but des A.A. et ce qu’ils peuvent faire pour les alcooliques.',
          'Le premier comité d’I.P. des A.A. a été formé par le Conseil des services généraux en 1956.',
        ],
      },
      {
        title: 'Mission',
        paras: [
          'Ce comité permanent transmet le message des Alcooliques anonymes à l’alcoolique qui souffre encore par l’entremise des médias et de conférenciers. Il est la source centrale des renseignements sur les A.A. mis à la disposition du public dans l’Est du Mass., et il veille à ce que ces renseignements soient exacts et donnés dans le respect des Douze Traditions.',
        ],
        links: ['Comités d’I.P. sur aa.org'],
      },
      {
        title: 'Notre champ d’action',
        items: [
          'Présenter des exposés sur les A.A. dans les écoles et les organisations',
          'Fournir des renseignements sur les A.A. au moyen de documents numériques et imprimés',
          'Veiller à ce que les médias locaux disposent de renseignements exacts, au moyen d’annonces d’intérêt public, d’entrevues protégeant l’anonymat et de dossiers de presse',
        ],
      },
    ],
    meeting: { lines: ['19 h le premier jeudi du mois, sur Zoom.'], joinText: 'Se joindre sur Zoom' },
    cta: 'Pour communiquer avec le Comité d’I.P. au sujet de questions, ou pour vous engager, écrivez-nous.',
  },
  'treatment-facilities': {
    eyebrow: 'Comité de la Conférence',
    lede: 'Apporter des réunions des A.A. aux personnes dans les hôpitaux et les programmes de traitement.',
    description: 'Le Comité des centres de traitement de la Région 30 coordonne les membres des A.A. qui portent le message dans les milieux de traitement. Il se réunit le troisième vendredi à 19 h.',
    sections: [
      {
        title: 'Mission',
        paras: [
          'Le Comité des centres de traitement dirige et coordonne le travail des membres et des groupes A.A. qui portent le message aux personnes dans les programmes hospitaliers et les centres de traitement. Parmi nos activités de Douzième Étape, on compte animer une réunion dans un centre de désintoxication, coordonner des réunions dans un centre de traitement et collaborer avec le personnel d’un hôpital pour organiser une réunion.',
        ],
        links: ['Comités de traitement sur aa.org', 'Réserver un engagement : calendrier du traitement'],
      },
      {
        title: 'Objectif',
        items: [
          'Les bénévoles communiquent avec les centres de traitement de leur district pour que les administrateurs sachent que les A.A. peuvent aider leurs clients, et aider ceux qui veulent rester sobres à rejoindre la Fraternité après le traitement',
          'Avec l’approbation de l’administration, apporter des réunions des A.A. dans les milieux de traitement',
          'Encourager la participation des groupes et des personnes. De nombreux groupes « adoptent » un établissement et y tiennent des réunions',
          'Coordonner avec des programmes de contact temporaire comme Bridge the Gap (BTG)',
          'Collaborer avec des comités comme le CMP pour offrir documentation, exposés et ateliers aux administrateurs',
        ],
      },
    ],
    meeting: { lines: ['19 h le troisième vendredi du mois, sur Zoom.'], joinText: 'Se joindre sur Zoom' },
    cta: 'Si vous souhaitez apporter des réunions des A.A. dans des centres de traitement, ou si vous êtes un établissement qui désire des réunions des A.A., écrivez au Comité des centres de traitement.',
    more: 'Se porter volontaire pour les appels de Douzième Étape',
  },
  accessibilities: {
    eyebrow: 'Comité de la Conférence',
    lede: 'Œuvrer pour un avenir où toute personne qui désire participer aux A.A. dans l’Est du Massachusetts puisse le faire.',
    description: 'Le Comité des accessibilités de la Région 30 s’emploie à éliminer les obstacles aux réunions et aux services des A.A. Il se réunit en ligne le troisième lundi du mois à 19 h 30.',
    sections: [
      {
        title: 'Objectif',
        paras: [
          'Certains alcooliques rencontrent des obstacles à leur participation aux A.A. pour des raisons culturelles, géographiques, mentales, physiques ou sociales, entre autres. Ce comité œuvre pour un avenir où toute personne qui désire participer aux réunions et aux autres services des A.A. dans l’Est du Massachusetts puisse le faire, dans un climat accueillant et bienveillant.',
        ],
        links: ['Liste de vérification des accessibilités (PDF)'],
      },
      {
        title: 'Engagez-vous',
        paras: [
          'Le comité se réunit chaque mois. Vous êtes invité à vous joindre à nous, ou simplement à assister à titre de membre des A.A. intéressé.',
          'Vous planifiez un événement de district ou un autre événement des A.A. dans la Région 30? Nous serons heureux de venir faire de la sensibilisation.',
        ],
      },
      {
        title: 'Réunions en ligne et par téléphone',
        paras: [
          'Tous les membres ne peuvent pas ou ne veulent pas assister aux réunions en ligne. Certains trouvent la technologie difficile et se sentent exclus ou jugés. Les groupes d’attache peuvent prendre des nouvelles de ces membres avec affection et soutien, prévoir des « moments de conversation » par téléphone, ou demander à un membre d’« adopter » un membre moins à l’aise avec la technologie pour le tenir au courant.',
          'Le comité recueille des ressources partagées de toute la Fraternité, y compris des conseils sur la tenue de réunions en ligne et par téléphone tout en protégeant l’anonymat et la sécurité. Nous ne pouvons pas recommander une ressource plutôt qu’une autre, et nous accueillons les suggestions que vous aimeriez que nous partagions. Écrivez au comité pour en envoyer une.',
        ],
      },
    ],
    meeting: {
      lines: ['En ligne, à 19 h 30 le troisième lundi du mois.', 'Pour obtenir une copie du procès-verbal précédent et de l’ordre du jour à venir, ou le lien de connexion à la réunion, écrivez au président.'],
    },
    cta: 'Joignez-vous au comité, assistez à une réunion ou invitez-nous à votre événement : écrivez au Comité des accessibilités.',
  },
  messenger: {
    eyebrow: 'Comité permanent',
    lede: 'Le bulletin de la Région 30, publié pour chaque assemblée de région.',
    description: 'Le Comité du bulletin Messenger de la Région 30 publie le bulletin Messenger pour chaque assemblée de région. Envoyez vos textes à messenger@aaemass.org.',
    sections: [
      {
        title: 'Mission',
        paras: [
          'Le Comité du Messenger est responsable du bulletin de la Région 30, The Messenger, publié pour chacune des assemblées de région et distribué dans la structure de service et lors des réunions de comités.',
          'Les textes sont les bienvenus. Veuillez les envoyer par courriel en indiquant vos coordonnées confidentielles.',
        ],
        links: ['Comités de la littérature sur aa.org'],
      },
    ],
    cta: 'Pour envoyer un texte, poser une question ou vous engager, écrivez au Comité du Messenger.',
  },
  'service-seminar': {
    eyebrow: 'Comité permanent',
    lede: 'Sensibilisation et initiation à la structure de service.',
    description: 'Le Comité du séminaire de service de la Région 30 assure la sensibilisation et l’initiation à la structure de service décrite dans le Manuel de la Région 30 et le Manuel du service d’AAWS.',
    sections: [
      {
        title: 'Mission',
        paras: ['Le Comité du séminaire de service assure la sensibilisation et l’initiation à la structure de service décrite dans le Manuel de la Région 30 et le Manuel du service d’AAWS.'],
      },
    ],
    cta: 'Demandez des renseignements au Comité du séminaire de service, ou posez une question.',
  },
  'state-convention': {
    eyebrow: 'Comité permanent',
    lede: 'Fraternité, repas et plaisir, planifiés par des membres de tout le Massachusetts.',
    description: 'Le Comité du Congrès d’État du Massachusetts se réunit chaque mois pour planifier le congrès annuel : conférenciers, ateliers, repas, fraternité et plaisir.',
    sections: [
      {
        title: 'Mission',
        paras: ['Le Comité du congrès se réunit chaque mois pour organiser le Congrès d’État annuel du Massachusetts, une fin de semaine de conférenciers, d’ateliers, de repas, de fraternité et de plaisir.'],
        links: ['aamastateconvention.org'],
      },
    ],
    meeting: {
      intro: 'Le Comité de planification du congrès se réunit chaque mois, en mode hybride, en personne et en ligne. Consultez le calendrier ou le site web du congrès pour connaître la date de la prochaine réunion.',
      lines: ['En personne : Royal Plaza, 181 Boston Post Road W., Marlborough', 'En ligne : ID de réunion 878 4199 4146, code d’accès hkJvj8'],
    },
    cta: 'Pour poser une question ou vous engager, écrivez au Comité du congrès.',
  },
  website: {
    eyebrow: 'Comité permanent',
    lede: 'Le comité qui tient à jour ce site web pour la Région 30.',
    description: 'Le Comité du site web de la Région 30 tient à jour le site web de la Région 30 et se réunit chaque mois. Le service et la technologie vous intéressent? Communiquez avec nous.',
    sections: [
      {
        title: 'Mission',
        paras: [
          'Ce comité tient à jour le site web de la Région 30 conformément à la décision de l’assemblée et formule des recommandations sur son entretien futur.',
          'Pour demander des changements ou des modifications au site web, écrivez au comité.',
        ],
      },
      {
        title: 'Engagez-vous',
        paras: ['Vous cherchez à vous engager dans le service? Avez-vous des compétences techniques, ou un intérêt pour la technologie et les sites web? Venez découvrir le Comité du site web et rendez-vous disponible.'],
      },
    ],
    meeting: { lines: ['Virtuellement, à 18 h le premier lundi du mois.'] },
    cta: 'Pour communiquer avec le Comité du site web au sujet de questions, ou pour vous engager, écrivez-nous.',
  },
};

export const committeeText: Record<Exclude<Lang, 'en'>, Record<string, CommitteeText>> = { es, fr };

// UI strings for the committee template.
const labels = {
  en: { email: 'Email the committee', all: 'All committees', meetTitle: 'When does the committee meet?', contactTitle: 'How do I contact the committee?', see: 'See the calendar', to: 'the {name}', meetingEvent: '{name} meeting' },
  es: { email: 'Escribir al comité', all: 'Todos los comités', meetTitle: '¿Cuándo se reúne el comité?', contactTitle: '¿Cómo me comunico con el comité?', see: 'Ver el calendario', to: 'el {name}', meetingEvent: 'Reunión del {name}' },
  fr: { email: 'Écrire au comité', all: 'Tous les comités', meetTitle: 'Quand le comité se réunit-il?', contactTitle: 'Comment communiquer avec le comité?', see: 'Voir le calendrier', to: 'le {name}', meetingEvent: 'Réunion du {name}' },
};
export const committeeLabels: Record<Lang, (typeof labels)['en']> = labels;
