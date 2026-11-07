// Service page: committee and officer reports. Sections align by index with `services.sections` in src/lib/mirror-data.ts.
// A paragraph starting with "@en:" is AA World Services text (the Public Information policy statement, Bill W.'s
// words, Dr. Bob's 1950 address) that is shown in the original English until the official Spanish and French
// editions can be quoted with AAWS permission. The view marks it lang="en".
// Draft: have a bilingual AA member review before publishing.
import type { Lang } from '../index';

interface Section { title: string; paras: string[] }
interface Svc {
  title: string;
  description: string;
  heading: string;
  eyebrow: string;
  lede: string;
  aboutHidden: string;
  intro1: string;
  intro2: string;
  jump: string;
  full: string; // {title}
  email: string; // {email}
  quoteNote: string;
  sections: Section[];
}

const es: Svc = {
  title: 'Servicio en el Área 30: delegado, comités, informes',
  description: 'Qué hacen el delegado, el delegado suplente, el secretario y cada comité del Área 30, cuándo se reúnen y cómo comunicarse con ellos.',
  heading: 'Servicios',
  eyebrow: 'Participe',
  lede: 'Hay abundantes oportunidades para los miembros de A.A. del Este de Massachusetts que quieren prestar servicio más allá de su grupo base.',
  aboutHidden: 'Acerca del servicio en el Área 30',
  intro1: 'El Comité de Servicios Generales del Este de Massachusetts, Área 30, apoya el trabajo de varios comités, algunos de los cuales tienen informes que se pueden leer a continuación. Todos los miembros de Alcohólicos Anónimos son bienvenidos. Por favor, considere ponerse a disposición para ayudar donde pueda.',
  intro2: 'Una lista completa de los comités de la Conferencia y los comités permanentes, con una forma de comunicarse con cada uno, está en la [página de contacto](/contact).',
  jump: 'Ir a',
  full: 'Página completa del {title}',
  email: 'Escribir a {email}',
  quoteNote: 'Texto en inglés. Consulte las ediciones en español de la literatura de A.A. en aa.org.',
  sections: [
    {
      title: 'Delegado',
      paras: [
        'El delegado trabaja en estrecha colaboración con el delegado suplente y el presidente del área, y a menudo asisten a los mismos eventos (incluidas las reuniones de comités, las Asambleas de Área, la Asamblea Regional de Servicio de A.A. del Noreste, la Reunión Regional de Delegados del Noreste, la Convención Estatal de Massachusetts y el Foro Regional del Noreste). Dentro del Este de Massachusetts, el delegado es miembro con voto del Comité de Finanzas del Área 30.',
        'Como miembro con voto de la Conferencia de Servicios Generales (CSG), el delegado aporta a sus deliberaciones las experiencias y los puntos de vista del Este de Massachusetts. Sin embargo, el delegado no es un representante del Área 30 en el sentido político habitual; después de escuchar todos los puntos de vista y de informarse plenamente durante las discusiones de la CSG, el delegado vota en el mejor interés de A.A. en su conjunto.',
        'Después de la CSG, los delegados informan a sus áreas sobre las acciones tomadas y las recomendaciones ofrecidas. Así, el delegado sirve principalmente de conducto entre el Área 30 y A.A. en su conjunto. No obstante, el delegado mantiene al delegado suplente plenamente informado y activo, para que el suplente pueda suceder al delegado, si fuera necesario.',
        'Por diversión, el delegado sirve como tesorero del Comité de Planificación de la Convención Estatal de Massachusetts (organizada conjuntamente con miembros del Este y del Oeste de Massachusetts).',
      ],
    },
    {
      title: 'Delegado suplente',
      paras: [
        'El delegado suplente trabaja en estrecha colaboración con el delegado del área y a menudo asiste a los mismos eventos que el delegado (incluidos la Asamblea Regional de Servicio de A.A. del Noreste, la Reunión Regional de Delegados del Noreste, la Convención Estatal de Massachusetts y el Foro Regional del Noreste), con excepción de la Conferencia de Servicios Generales, y está preparado para servir como delegado, si fuera necesario.',
        'El delegado suplente también forma parte del Comité de Planificación de la Convención Estatal de Massachusetts como copresidente del programa en su primer año y como presidente del programa en su segundo año. Además, el delegado suplente puede desempeñar algunas funciones especiales del Comité de Área.',
        'En los últimos años, el delegado suplente ha planeado y organizado un viaje en autobús, financiado por los propios participantes, a la Oficina de Servicios Generales en Nueva York.',
        'Por lo demás, el delegado suplente sirve al Área 30 como miembro con voto del Comité de Finanzas y como enlace con otras entidades de A.A. cuando se solicite.',
      ],
    },
    {
      title: 'Archivos',
      paras: [
        'Cuando una sociedad o una civilización perece, siempre hay una condición presente: olvidaron de dónde venían. – Carl Sandburg',
        'El Comité de Archivos tiene el encargo de reunir, preservar y presentar materiales de interés histórico para Alcohólicos Anónimos. Lo invitamos a acompañarnos mientras continuamos nuestros esfuerzos por descubrir y celebrar la historia de A.A. en el Este de Massachusetts.',
        'Una lista preliminar de nuestras responsabilidades futuras incluye:',
        'clasificar, archivar y preservar los documentos ya reunidos y guardados;',
        'reunir y catalogar las nuevas aportaciones a medida que lleguen;',
        'comunicarnos con los distritos y con otros grupos del Área 30 para darles noticias y opiniones sobre nuestro trabajo de servicio y animarlos a preservar sus respectivos archivos;',
        'registrar las historias de los grupos y de las personas antes de que sea demasiado tarde; y',
        'compartir nuestros archivos con usted, para que podamos «recorrer el camino» juntos.',
        'Además, y quizá lo más importante, invitamos a los miembros que han vivido nuestra historia a compartirla con nosotros para que los futuros miembros de A.A. se beneficien de su considerable experiencia, fortaleza y esperanza. Con gusto haremos arreglos mutuamente convenientes para reunirnos. El Comité de Archivos del Área 30 se reúne a las 7:30 p. m. el tercer jueves de cada mes en la Iglesia St. John’s, 80 Mt. Auburn St., Watertown. Hay muchas ideas viejas y nuevas para discutir. Todos los miembros de A.A. son bienvenidos a asistir.',
        '¡Esté atento a esta página para conocer los informes sobre los avances y los planes futuros!',
      ],
    },
    {
      title: 'Secretario del Área',
      paras: [
        'El secretario es responsable de levantar las actas de las reuniones mensuales del comité de área, de las asambleas de área y de las reuniones del comité de finanzas del área, y de distribuir esas actas a los oficiales del área, los presidentes de comités, los MCD y los asistentes a la asamblea que decidan recibir una copia. El Registrador del Área mantiene una lista de los destinatarios. Las actas se envían por correo electrónico a quienes proporcionan una dirección, conforme a la conciencia de grupo del Área. El secretario también sirve de conducto de información hacia y desde los oficiales del área y los presidentes de comités.',
        'El secretario suplente es responsable de reunir los informes de los comités de la Conferencia y de los comités permanentes, de enviar una copia de las actas a quienes no tienen acceso al correo electrónico y de ayudar al secretario en sus funciones. El suplente está listo para sustituir al secretario si fuera necesario.',
      ],
    },
    {
      title: 'Instituciones Correccionales',
      paras: [
        'El Comité Conjunto* de Instituciones Correccionales del Área 30 y Boston Central Service se reúne el cuarto jueves del mes en Central Service, en Boston. Entre nuestras responsabilidades está colaborar con las instituciones correccionales del Área 30 para llevar el mensaje de A.A. detrás de los muros. Actualmente ofrecemos un servicio que ayuda a las personas recluidas que van a salir de prisión a conectarse con miembros de A.A. de sus comunidades, llamado Programa de Contacto Previo a la Liberación. Los miembros de A.A. interesados en escribir cartas a una persona recluida o en figurar en una lista de llamadas de Duodécimo Paso para servir de punto de contacto a quienes salen de prisión deben comunicarse con Boston Central Service para conocer los detalles.',
        'Tenemos carteles de LIPS (Servicio de Literatura para Prisiones) para cualquier grupo del Este de Massachusetts que desee reunir literatura aprobada por la Conferencia, que se puede llevar a Boston Central Service para redistribuirla a miembros de A.A. en prisiones, donde se permita. El cartel cubre un lado de una caja de cartón. Los Libros Grandes, los Doce Pasos y Doce Tradiciones, las revistas Grapevine, los folletos o cualquier otra literatura aprobada por la Conferencia siempre hacen mucha falta.',
        'Estamos disponibles para actividades de difusión en eventos de distritos o grupos. Pueden comunicarse con nosotros en [cf@aaemass.org](mailto:cf@aaemass.org). Si usted o su grupo ya lleva el mensaje a una institución correccional, lo animamos a asistir a la reunión mensual y a compartir su experiencia con nosotros.',
      ],
    },
    {
      title: 'Cooperación con la Comunidad Profesional',
      paras: [
        'El comité de Cooperación con la Comunidad Profesional (CCP) puede llevar el mensaje de A.A. a los profesionales y a los estudiantes de escuelas profesionales, ayudándoles a comprender cómo y por qué funciona A.A.',
        'A.A. siempre ha valorado a los amigos de todos los campos profesionales. Estas relaciones han sido mutuamente beneficiosas y totalmente acordes con las Tradiciones de A.A.',
        'Los miembros de los comités de CCP informan a los profesionales y a los futuros profesionales sobre A.A.: qué somos, dónde estamos, qué podemos hacer y qué no podemos hacer. Procuran establecer una mejor comunicación entre los miembros de A.A. y los profesionales, y encontrar maneras sencillas y eficaces de cooperar sin afiliarse.',
        'Todos los miembros de A.A. son bienvenidos a asistir a la reunión mensual del comité de CCP, que se celebra el segundo jueves del mes, a las 7:00 p. m., en Central Service, 12 Channel Street, Suite 604, Boston, MA, 02210.',
      ],
    },
    {
      title: 'Grapevine',
      paras: [
        'Uno de los objetivos principales del Comité de Grapevine es dar a conocer a las personas y a sus grupos en el Área 30 todo lo posible sobre nuestra «reunión impresa». Como nuestras reuniones, la revista mensual Grapevine es tan diversa como cada uno de nosotros. Sus 64 páginas, escritas por amigos y miembros de A.A., se han convertido en la voz de A.A. de hoy. Por medio del Grapevine, los miembros comparten su experiencia, fortaleza y esperanza, siempre procurando llevar el mensaje de Recuperación, Unidad y Servicio a todos los que lo leen. Como consideramos que la revista Grapevine es una herramienta espiritual para nuestra Comunidad de hoy, nuestro comité ofrece actividades de difusión, si se solicitan, a distritos y grupos del Este de Massachusetts, en las que procuramos compartir parte de la historia que el Grapevine ha traído hasta hoy. Por ejemplo, el Preámbulo de Alcohólicos Anónimos, que se lee al comienzo de las reuniones de A.A., se imprimió por primera vez en el Grapevine para decir qué es y qué hace A.A., y también qué no es y qué no hace. El libro El lenguaje del corazón es una publicación del Grapevine que hace un regalo estupendo que crece con nosotros. Leer historias como temas de discusión en las reuniones es una gran idea. En el Área 30, nuestro programa «Count On Us» ofrece suscripciones a las revistas Grapevine y La Viña (versión en español) a centros de tratamiento e instituciones correccionales de todos los distritos de nuestra Área. Muchos de los que se han beneficiado de esta herramienta del Duodécimo Paso comparten con gusto su gratitud con nosotros. Por cierto, ¡el humor manda en nuestras obras y exhibiciones mientras recorremos el Camino del Feliz Destino! Escriba a [grapevine@aaemass.org](mailto:grapevine@aaemass.org) para obtener más información.',
      ],
    },
    {
      title: 'Comité Conjunto de Centros de Tratamiento',
      paras: [
        'El Comité Conjunto de Centros de Tratamiento se reúne el tercer viernes del mes en la Iglesia St. Paul’s, 59 Court St., Dedham, MA, a las 7 p. m. El propósito del comité es coordinar el trabajo de los miembros y grupos de A.A. interesados en llevar nuestro mensaje de recuperación a los alcohólicos en centros de tratamiento, y establecer medios para «tender el puente» desde el centro hasta la comunidad en general. El comité ofrece información sobre A.A., así como literatura y lineamientos para organizar reuniones de A.A. en centros de tratamiento y de atención ambulatoria. Su objetivo es asegurar que se atienda a todos los centros de tratamiento que quieran que participen reuniones de A.A.',
        'Todos los miembros de A.A. interesados son bienvenidos. Se anima a que participen representantes de distritos y grupos. La palabra «conjunto» indica que hay miembros de las intergrupos del área.',
        'Siempre estamos disponibles para actividades de difusión. Pueden comunicarse con nosotros en: [treatment@aaemass.org](mailto:treatment@aaemass.org)',
      ],
    },
    {
      title: 'Literatura',
      paras: [
        'Además del propósito y las metas de nuestro comité que figuran en la página de CONTACTO de este sitio web, usamos el tiempo de nuestra reunión para revisar la literatura vigente aprobada por la Conferencia y la elaborada localmente, a fin de poder informar a la membresía sobre lo que está disponible y de asegurar que el mensaje sea coherente con los principios de nuestros Pasos y Tradiciones. Respondemos consultas que solicitan información sobre diversos temas y proporcionamos posibles fuentes de información.',
        'Nuestra meta es informar a la membresía sobre las herramientas disponibles para nuestra propia recuperación, así como para llevar el mensaje a otros.',
      ],
    },
    {
      title: 'Messenger',
      paras: [
        'El Comité del Messenger del Área 30 publica un boletín, The Messenger, cinco veces al año. Está disponible en todas las Asambleas de Área y, por medio de la estructura de servicio, en las numerosas y variadas reuniones de comités, cuyos horarios se publican en otras partes de este sitio. El Messenger contiene noticias, historias y eventos especiales que ocurren en el Este de Massachusetts.',
        'Se aceptan colaboraciones, que pueden enviarse por correo electrónico a messenger@aaemass.org. Por favor, incluya su información de contacto confidencial.',
      ],
    },
    {
      title: 'Comité de Información Pública',
      paras: [
        '¿Qué es el trabajo de Información Pública y por qué deben hacerlo los miembros de A.A.?',
        'La Información Pública (I.P.) en Alcohólicos Anónimos significa llevar el mensaje de recuperación al alcohólico que aún sufre, informando al público en general sobre el programa de A.A. Llevamos el mensaje poniéndonos en contacto con los medios de comunicación, las escuelas, la industria y otras organizaciones que pueden informar sobre la naturaleza y el propósito de A.A. y sobre lo que puede hacer por los alcohólicos. El primer comité de Información Pública de A.A. fue formado por la Junta de Servicios Generales en 1956. En ese momento, la Conferencia de Servicios Generales redactó y aprobó la siguiente declaración de la «política de información pública de A.A. en todo el movimiento»:',
        '@en:In all public relations, AA’s sole objective is to help the still suffering alcoholic. Always mindful of the importance of personal anonymity we believe this can be done by making known to him, and to those who may be interested in his problems, our own experience as individuals and as a Fellowship in learning to live without alcohol. We believe that our experience should be made available freely to all who express sincere interest. We believe further that all efforts in this field should always reflect our gratitude for the gift of sobriety and our awareness that many outside AA are equally concerned with the serious problem of alcoholism.',
        '@en:As our co-founder Bill W. wrote: Public Information takes many forms – the simple sign outside a meeting place that says “AA meeting tonight;” listing in local phone directories; distribution of AA literature; and radio and television shows using sophisticated media techniques. Whatever the form, it comes down to “one drunk carrying the message to another drunk,” whether through personal contact or through the use of third parties and the media.',
        '@en:For those AA members who decide to speak about AA at a non-AA meeting….you assume a serious responsibility. Even though you are careful to explain that you are not speaking for AA as a whole, many members of the audience will base their good or bad opinion of the Fellowship on what is said and how it is said. The reaction of nonalcoholic listeners and their consequent referring or failure to refer alcoholics to AA may someday mean the difference between life and death to still-suffering alcoholics.',
      ],
    },
    {
      title: 'Registrador',
      paras: [
        '¿Tiene su grupo un número de servicio de la Oficina de Servicios Generales en Nueva York? Si envía una contribución a Nueva York sin este número, su grupo no recibirá crédito por la donación. Si no está seguro, escríbanos a [registrar@aaemass.org](mailto:registrar@aaemass.org) y podemos ayudarle a buscar la información de su grupo.',
        'Estamos aquí para ayudar con el proceso de registro.',
      ],
    },
    {
      title: 'Accesibilidades',
      paras: [
        'Algunos alcohólicos encuentran barreras para participar en A.A. debido a factores culturales, geográficos, mentales, físicos o sociales, u otras razones. Este comité trabaja por un futuro en el que todas las personas que quieran participar en las reuniones de A.A. (y en otros servicios de A.A.) en el Este de Massachusetts puedan, de hecho, participar plenamente.',
      ],
    },
    {
      title: '¿Por qué prestar servicio?',
      paras: [
        'El siguiente extracto es del mensaje final del Dr. Bob, pronunciado en la primera Conferencia Internacional de Alcohólicos Anónimos en Cleveland, Ohio, en 1950:',
        '@en:I get a big thrill out of looking over a vast sea of faces like this with a feeling that possibly some small thing I did a number of years ago played an infinitely small part in making this meeting possible…There are two or three things which flashed into my mind on which it would be fitting to lay a little emphasis. One is the simplicity of our program. Let’s not louse it up with…complexes and things that…have very little to do with our actual AA work.',
        '@en:Our Twelve Steps, when simmered down to the last, resolve themselves into the words ‘love’ and ‘service’. We understand what love is and we understand what service is. So let’s bear those two things in mind.',
        '@en:Reprinted from Pass It On: The story of Bill Wilson and how the AA message reached the world, ©1984, pp. 339-342, with permission of AA World Services, Inc.',
      ],
    },
  ],
};

const fr: Svc = {
  title: 'Le service dans la Région 30 : délégué, comités, rapports',
  description: 'Ce que font le délégué, le délégué suppléant, le secrétaire et chaque comité de la Région 30, quand ils se réunissent et comment les joindre.',
  heading: 'Services',
  eyebrow: 'Engagez-vous',
  lede: 'Les occasions ne manquent pas pour les membres des A.A. de l’Est du Massachusetts qui souhaitent servir au-delà de leur groupe d’attache.',
  aboutHidden: 'À propos du service dans la Région 30',
  intro1: 'Le Comité des services généraux de l’Est du Massachusetts, Région 30, soutient le travail de plusieurs comités, dont certains ont des rapports que vous pouvez lire ci-dessous. Tous les membres des Alcooliques anonymes sont les bienvenus. Pensez à vous rendre disponible pour aider là où vous le pouvez.',
  intro2: 'Une liste complète des comités de la Conférence et des comités permanents, avec un moyen de joindre chacun, se trouve sur la [page de contact](/contact).',
  jump: 'Aller à',
  full: 'Page complète du {title}',
  email: 'Écrire à {email}',
  quoteNote: 'Texte en anglais. Consultez les éditions françaises de la littérature des A.A. sur aa.org.',
  sections: [
    {
      title: 'Délégué',
      paras: [
        'Le délégué travaille en étroite collaboration avec le délégué suppléant et le président de la région, et ils participent souvent aux mêmes événements (y compris les réunions de comités, les assemblées de région, l’Assemblée régionale de service des A.A. du Nord-Est, la Réunion régionale des délégués du Nord-Est, le Congrès d’État du Massachusetts et le Forum régional du Nord-Est). Dans l’Est du Massachusetts, le délégué est membre votant du Comité des finances de la Région 30.',
        'À titre de membre votant de la Conférence des services généraux (CSG), le délégué apporte à ses délibérations les expériences et les points de vue de l’Est du Massachusetts. Pourtant, le délégué n’est pas un représentant de la Région 30 au sens politique habituel; après avoir entendu tous les points de vue et s’être pleinement informé lors des discussions de la CSG, le délégué vote dans le meilleur intérêt des A.A. dans leur ensemble.',
        'Après la CSG, les délégués font rapport à leur région des mesures prises et des recommandations formulées. Le délégué sert ainsi principalement de relais entre la Région 30 et les A.A. dans leur ensemble. Néanmoins, le délégué tient le délégué suppléant pleinement informé et actif, afin que celui-ci puisse lui succéder, au besoin.',
        'Pour le plaisir, le délégué est trésorier du Comité de planification du Congrès d’État du Massachusetts (organisé conjointement avec des membres de l’Est et de l’Ouest du Massachusetts).',
      ],
    },
    {
      title: 'Délégué suppléant',
      paras: [
        'Le délégué suppléant travaille en étroite collaboration avec le délégué de la région et participe souvent aux mêmes événements que lui (y compris l’Assemblée régionale de service des A.A. du Nord-Est, la Réunion régionale des délégués du Nord-Est, le Congrès d’État du Massachusetts et le Forum régional du Nord-Est), à l’exception de la Conférence des services généraux, et il est prêt à servir comme délégué, au besoin.',
        'Le délégué suppléant siège aussi au Comité de planification du Congrès d’État du Massachusetts, comme coprésident du programme la première année et comme président du programme la deuxième année. De plus, il peut remplir certaines fonctions particulières du Comité de la région.',
        'Ces dernières années, le délégué suppléant a planifié et organisé un voyage en autobus autofinancé au Bureau des services généraux à New York.',
        'Par ailleurs, le délégué suppléant sert la Région 30 comme membre votant du Comité des finances et comme agent de liaison avec d’autres entités des A.A. sur demande.',
      ],
    },
    {
      title: 'Archives',
      paras: [
        'Chaque fois qu’une société ou une civilisation périt, une condition est toujours présente : elle a oublié d’où elle venait. – Carl Sandburg',
        'Le Comité des archives a pour mandat de recueillir, de préserver et de présenter les documents d’intérêt historique pour les Alcooliques anonymes. Nous vous invitons à vous joindre à nous pour poursuivre nos efforts de découverte et de célébration de l’histoire des A.A. dans l’Est du Massachusetts.',
        'Voici une liste préliminaire de nos responsabilités à venir :',
        'trier, classer et préserver les documents déjà recueillis et entreposés;',
        'recueillir et cataloguer les nouveaux ajouts à mesure qu’ils arrivent;',
        'communiquer avec les districts et les autres groupes de la Région 30 pour leur faire connaître notre travail de service et les encourager à préserver leurs archives respectives;',
        'consigner l’histoire des groupes et des personnes avant qu’il ne soit trop tard; et',
        'partager nos archives avec vous, afin que nous puissions « faire route » ensemble.',
        'De plus, et c’est peut-être le plus important, nous invitons les membres qui ont vécu notre histoire à la partager avec nous afin que les futurs membres des A.A. profitent de votre grande expérience, force et espoir. Nous prendrons volontiers des arrangements convenant à tous pour nous rencontrer. Le Comité des archives de la Région 30 se réunit à 19 h 30 le troisième jeudi de chaque mois à l’église St. John’s, 80 Mt. Auburn St., Watertown. Les idées, anciennes et nouvelles, ne manquent pas. Tous les membres des A.A. sont les bienvenus.',
        'Surveillez cette page pour connaître les rapports sur les progrès et les projets d’avenir!',
      ],
    },
    {
      title: 'Secrétaire de la région',
      paras: [
        'Le secrétaire est responsable de rédiger les procès-verbaux des réunions mensuelles du comité de région, des assemblées de région et des réunions du comité des finances de la région, et de les distribuer aux officiers de la région, aux présidents de comités, aux MCD et aux participants à l’assemblée qui choisissent d’en recevoir une copie. Le registraire de la région tient une liste des destinataires. Les procès-verbaux sont envoyés par courriel aux personnes qui fournissent une adresse, conformément à la conscience de groupe de la Région. Le secrétaire sert aussi de relais d’information vers et depuis les officiers de la région et les présidents de comités.',
        'Le secrétaire suppléant est responsable de recueillir les rapports des comités de la Conférence et des comités permanents, d’envoyer une copie des procès-verbaux aux personnes sans accès au courriel et d’aider le secrétaire dans ses fonctions. Le suppléant est prêt à remplacer le secrétaire au besoin.',
      ],
    },
    {
      title: 'Établissements correctionnels',
      paras: [
        'Le Comité conjoint* des établissements correctionnels de la Région 30 et de Boston Central Service se réunit le quatrième jeudi du mois à Central Service, à Boston. Nos responsabilités comprennent la collaboration avec les établissements correctionnels de la Région 30 pour aider à porter le message des A.A. derrière les murs. Nous offrons actuellement un service qui aide les personnes détenues sur le point d’être libérées à entrer en contact avec des membres des A.A. de leur collectivité, appelé Programme de contact avant la libération. Les membres des A.A. qui souhaitent correspondre par courrier avec une personne détenue ou figurer sur une liste d’appels de Douzième Étape pour servir de points de contact à ceux qui sortent de prison doivent communiquer avec Boston Central Service pour obtenir les détails.',
        'Nous avons des affiches LIPS (Service de documentation pour les prisons) pour tout groupe de l’Est du Massachusetts qui souhaite recueillir de la documentation approuvée par la Conférence, qui peut être apportée à Boston Central Service pour être redistribuée aux membres des A.A. dans les prisons, là où c’est permis. L’affiche couvre un côté d’une boîte en carton. Les Gros Livres, les Douze Étapes et les Douze Traditions, les revues Grapevine, les brochures ou toute autre documentation approuvée par la Conférence sont toujours très en demande.',
        'Nous sommes disponibles pour des activités de sensibilisation lors d’événements de districts ou de groupes. On peut nous joindre à [cf@aaemass.org](mailto:cf@aaemass.org). Si vous ou votre groupe portez déjà le message dans un établissement correctionnel, nous vous encourageons à assister à la réunion mensuelle et à partager votre expérience avec nous.',
      ],
    },
    {
      title: 'Collaboration avec les milieux professionnels',
      paras: [
        'Le comité de Collaboration avec les milieux professionnels (CMP) peut transmettre le message des A.A. aux professionnels et aux étudiants des écoles professionnelles, en les aidant à comprendre comment et pourquoi les A.A. fonctionnent.',
        'Les A.A. ont toujours apprécié leurs amis de tous les milieux professionnels. Ces relations ont été mutuellement bénéfiques et tout à fait conformes aux Traditions des A.A.',
        'Les membres des comités CMP renseignent les professionnels et les futurs professionnels sur les A.A. : ce que nous sommes, où nous sommes, ce que nous pouvons faire et ce que nous ne pouvons pas faire. Ils s’efforcent d’établir une meilleure communication entre les membres des A.A. et les professionnels, et de trouver des moyens simples et efficaces de collaborer sans s’affilier.',
        'Tous les membres des A.A. sont les bienvenus à la réunion mensuelle du comité CMP, qui a lieu le deuxième jeudi du mois, à 19 h, à Central Service, 12 Channel Street, Suite 604, Boston, MA, 02210.',
      ],
    },
    {
      title: 'Grapevine',
      paras: [
        'L’un des principaux objectifs du Comité du Grapevine est de faire connaître aux personnes et à leurs groupes de la Région 30 tout ce que nous pouvons sur notre « réunion imprimée ». Comme nos réunions, la revue mensuelle Grapevine est aussi diversifiée que chacun de nous. Ses 64 pages, écrites par des amis et des membres des A.A., sont devenues la voix des A.A. d’aujourd’hui. Par l’entremise du Grapevine, les membres partagent leur expérience, leur force et leur espoir, en s’efforçant toujours de transmettre le message de Rétablissement, d’Unité et de Service à tous ceux qui le lisent. Puisque nous considérons la revue Grapevine comme un outil spirituel pour notre Fraternité d’aujourd’hui, notre comité offre, sur demande, des activités de sensibilisation aux districts et aux groupes de l’Est du Massachusetts, au cours desquelles nous nous efforçons de partager une partie de l’histoire que le Grapevine a transmise jusqu’à nous. Par exemple, le Préambule des Alcooliques anonymes, lu au début des réunions des A.A., a été imprimé pour la première fois dans le Grapevine pour dire ce que sont et font les A.A., ainsi que ce qu’ils ne sont pas et ne font pas. Le livre Le langage du cœur est une publication du Grapevine qui fait un merveilleux cadeau qui grandit avec nous. Lire des récits comme sujets de discussion en réunion est une excellente idée. Dans la Région 30, notre programme « Count On Us » offre des abonnements aux revues Grapevine et La Vigne (version française) aux centres de traitement et aux établissements correctionnels de tous les districts de notre Région. Nombreux sont ceux qui ont bénéficié de cet outil de Douzième Étape et qui nous font volontiers part de leur gratitude. Soit dit en passant, l’humour est à l’honneur dans nos pièces et nos expositions pendant que nous cheminons sur la Route du Heureux Destin! Écrivez à [grapevine@aaemass.org](mailto:grapevine@aaemass.org) pour obtenir plus de renseignements.',
      ],
    },
    {
      title: 'Comité conjoint des centres de traitement',
      paras: [
        'Le Comité conjoint des centres de traitement se réunit le troisième vendredi du mois à l’église St. Paul’s, 59 Court St., Dedham, MA, à 19 h. Le but du comité est de coordonner le travail des membres et des groupes A.A. qui souhaitent porter notre message de rétablissement aux alcooliques dans les centres de traitement, et de mettre en place des moyens de « jeter un pont » entre l’établissement et la collectivité en général. Le comité fournit des renseignements sur les A.A., ainsi que de la documentation et des lignes directrices pour organiser des réunions des A.A. dans les centres de traitement et les établissements de soins ambulatoires. Son objectif est de veiller à ce que tous les centres de traitement qui désirent la participation de réunions des A.A. soient desservis.',
        'Tous les membres des A.A. intéressés sont les bienvenus. Les représentants des districts et des groupes sont encouragés à participer. Le mot « conjoint » indique la présence de membres des intergroupes de la région.',
        'Nous sommes toujours disponibles pour des activités de sensibilisation. On peut nous joindre à : [treatment@aaemass.org](mailto:treatment@aaemass.org)',
      ],
    },
    {
      title: 'Littérature',
      paras: [
        'En plus de l’objet et des buts de notre comité énumérés sur la page CONTACT de ce site web, nous utilisons le temps de notre réunion pour examiner la documentation en vigueur approuvée par la Conférence et celle qui est produite localement, afin de pouvoir informer les membres de ce qui est offert et de nous assurer que le message demeure conforme aux principes de nos Étapes et de nos Traditions. Nous répondons aux demandes de renseignements sur divers sujets et indiquons des sources d’information possibles.',
        'Notre objectif est de faire connaître aux membres les outils disponibles pour notre propre rétablissement ainsi que pour transmettre le message à d’autres.',
      ],
    },
    {
      title: 'Messenger',
      paras: [
        'Le Comité du Messenger de la Région 30 publie un bulletin, The Messenger, cinq fois par année. On peut se le procurer à toutes les assemblées de région et, par la structure de service, aux nombreuses et diverses réunions de comités, dont les horaires sont affichés ailleurs sur ce site. Le Messenger contient des nouvelles, des récits et des événements spéciaux qui se déroulent dans l’Est du Massachusetts.',
        'Les textes sont les bienvenus et peuvent être envoyés par courriel à messenger@aaemass.org. Veuillez indiquer vos coordonnées confidentielles.',
      ],
    },
    {
      title: 'Comité d’information publique',
      paras: [
        'Qu’est-ce que le travail d’information publique et pourquoi les membres des A.A. devraient-ils le faire?',
        'L’information publique (I.P.) chez les Alcooliques anonymes consiste à transmettre le message de rétablissement à l’alcoolique qui souffre encore en renseignant le grand public sur le programme des A.A. Nous transmettons le message en entrant en contact avec les médias, les écoles, l’industrie et d’autres organisations qui peuvent faire connaître la nature et le but des A.A. et ce qu’ils peuvent faire pour les alcooliques. Le premier comité d’information publique des A.A. a été formé par le Conseil des services généraux en 1956. À l’époque, la Conférence des services généraux a rédigé et approuvé l’énoncé suivant de la « politique d’information publique des A.A. à l’échelle du mouvement » :',
        '@en:In all public relations, AA’s sole objective is to help the still suffering alcoholic. Always mindful of the importance of personal anonymity we believe this can be done by making known to him, and to those who may be interested in his problems, our own experience as individuals and as a Fellowship in learning to live without alcohol. We believe that our experience should be made available freely to all who express sincere interest. We believe further that all efforts in this field should always reflect our gratitude for the gift of sobriety and our awareness that many outside AA are equally concerned with the serious problem of alcoholism.',
        '@en:As our co-founder Bill W. wrote: Public Information takes many forms – the simple sign outside a meeting place that says “AA meeting tonight;” listing in local phone directories; distribution of AA literature; and radio and television shows using sophisticated media techniques. Whatever the form, it comes down to “one drunk carrying the message to another drunk,” whether through personal contact or through the use of third parties and the media.',
        '@en:For those AA members who decide to speak about AA at a non-AA meeting….you assume a serious responsibility. Even though you are careful to explain that you are not speaking for AA as a whole, many members of the audience will base their good or bad opinion of the Fellowship on what is said and how it is said. The reaction of nonalcoholic listeners and their consequent referring or failure to refer alcoholics to AA may someday mean the difference between life and death to still-suffering alcoholics.',
      ],
    },
    {
      title: 'Registraire',
      paras: [
        'Votre groupe a-t-il un numéro de service du Bureau des services généraux à New York? Si vous envoyez une contribution à New York sans ce numéro, votre groupe ne sera pas crédité pour le don. Si vous n’êtes pas certain, écrivez-nous à [registrar@aaemass.org](mailto:registrar@aaemass.org) et nous pourrons vous aider à retrouver les renseignements de votre groupe.',
        'Nous sommes là pour vous aider dans la démarche d’inscription.',
      ],
    },
    {
      title: 'Accessibilités',
      paras: [
        'Certains alcooliques rencontrent des obstacles à leur participation aux A.A. en raison de facteurs culturels, géographiques, mentaux, physiques ou sociaux, ou pour d’autres raisons. Ce comité œuvre pour un avenir où toutes les personnes qui désirent participer aux réunions des A.A. (et aux autres services des A.A.) dans l’Est du Massachusetts puissent effectivement y participer pleinement.',
      ],
    },
    {
      title: 'Pourquoi le service?',
      paras: [
        'L’extrait suivant provient du dernier message du Dr Bob, prononcé à la première Conférence internationale des Alcooliques anonymes à Cleveland, en Ohio, en 1950 :',
        '@en:I get a big thrill out of looking over a vast sea of faces like this with a feeling that possibly some small thing I did a number of years ago played an infinitely small part in making this meeting possible…There are two or three things which flashed into my mind on which it would be fitting to lay a little emphasis. One is the simplicity of our program. Let’s not louse it up with…complexes and things that…have very little to do with our actual AA work.',
        '@en:Our Twelve Steps, when simmered down to the last, resolve themselves into the words ‘love’ and ‘service’. We understand what love is and we understand what service is. So let’s bear those two things in mind.',
        '@en:Reprinted from Pass It On: The story of Bill Wilson and how the AA message reached the world, ©1984, pp. 339-342, with permission of AA World Services, Inc.',
      ],
    },
  ],
};

export const service: Record<Exclude<Lang, 'en'>, Svc> = { es, fr };
