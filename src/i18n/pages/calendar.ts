import type { Lang } from '../index';

const en = {
  title: 'Area 30 Calendar: Events and Committee Meetings',
  description: 'See upcoming Area 30 events, assemblies and committee meetings for Alcoholics Anonymous in Eastern Massachusetts, updated live.',
  heading: 'Area 30 calendar',
  eyebrow: 'Events',
  lede: 'Upcoming events, assemblies and committee meetings across Eastern Massachusetts. Times are Eastern.',
  subscribe: 'Add to Google Calendar',
  calendarHeading: 'Calendar',
  agendaTitle: 'Area 30 calendar, agenda view',
  monthTitle: 'Area 30 calendar, month view',
  meets: 'The Area 30 committee meets {when} at the {where}. Each committee’s own meeting time is on its page under [Committees](/committees).',
  faqs: [
    { q: 'Can any AA member attend Area 30 committee meetings?', a: 'Yes. All AA members are welcome at Area 30 committee meetings, and committees are always looking for people to help.' },
    { q: 'Where can I find a committee’s meeting time?', a: 'Each committee’s page lists its monthly meeting time, and the calendar above shows events, assemblies and committee meetings as they are scheduled.' },
    { q: 'How do I add the calendar to my phone?', a: 'Use the “Add to Google Calendar” button at the top of this page to subscribe.' },
  ],
};
type C = typeof en;
const es: C = {
  title: 'Calendario del Área 30: eventos y reuniones de comités',
  description: 'Consulte los próximos eventos, asambleas y reuniones de comités del Área 30 de Alcohólicos Anónimos del Este de Massachusetts, actualizados en vivo.',
  heading: 'Calendario del Área 30',
  eyebrow: 'Eventos',
  lede: 'Próximos eventos, asambleas y reuniones de comités en todo el Este de Massachusetts. Las horas son del Este (hora de Nueva York).',
  subscribe: 'Agregar a Google Calendar',
  calendarHeading: 'Calendario',
  agendaTitle: 'Calendario del Área 30, vista de agenda',
  monthTitle: 'Calendario del Área 30, vista mensual',
  meets: 'El comité del Área 30 se reúne {when} en {where}. La hora de reunión de cada comité está en su página, en [Comités](/committees).',
  faqs: [
    { q: '¿Puede asistir cualquier miembro de A.A. a las reuniones de los comités del Área 30?', a: 'Sí. Todos los miembros de A.A. son bienvenidos a las reuniones de los comités del Área 30, y los comités siempre buscan personas que ayuden.' },
    { q: '¿Dónde puedo encontrar la hora de reunión de un comité?', a: 'La página de cada comité indica su hora de reunión mensual, y el calendario de arriba muestra los eventos, las asambleas y las reuniones de comités a medida que se programan.' },
    { q: '¿Cómo agrego el calendario a mi teléfono?', a: 'Use el botón «Agregar a Google Calendar» en la parte superior de esta página para suscribirse.' },
  ],
};
const fr: C = {
  title: 'Calendrier de la Région 30 : événements et réunions de comités',
  description: 'Consultez les prochains événements, assemblées et réunions de comités de la Région 30 des Alcooliques anonymes de l’Est du Massachusetts, mis à jour en direct.',
  heading: 'Calendrier de la Région 30',
  eyebrow: 'Événements',
  lede: 'Prochains événements, assemblées et réunions de comités dans tout l’Est du Massachusetts. Les heures sont celles de l’Est (heure de New York).',
  subscribe: 'Ajouter à Google Agenda',
  calendarHeading: 'Calendrier',
  agendaTitle: 'Calendrier de la Région 30, vue agenda',
  monthTitle: 'Calendrier de la Région 30, vue mensuelle',
  meets: 'Le comité de la Région 30 se réunit {when} au {where}. L’heure de réunion de chaque comité figure sur sa page, sous [Comités](/committees).',
  faqs: [
    { q: 'Tout membre des A.A. peut-il assister aux réunions des comités de la Région 30?', a: 'Oui. Tous les membres des A.A. sont les bienvenus aux réunions des comités de la Région 30, et les comités cherchent toujours des personnes pour aider.' },
    { q: 'Où trouver l’heure de réunion d’un comité?', a: 'La page de chaque comité indique son heure de réunion mensuelle, et le calendrier ci-dessus montre les événements, les assemblées et les réunions de comités à mesure qu’ils sont fixés.' },
    { q: 'Comment ajouter le calendrier à mon téléphone?', a: 'Utilisez le bouton « Ajouter à Google Agenda » en haut de cette page pour vous abonner.' },
  ],
};
export const calendar: Record<Lang, C> = { en, es, fr };
