// Labels on event pages (src/views/Event.astro). The event's own title, summary and details come from the CMS
// (translated copies are written by scripts/translate.mjs). Draft: have a bilingual AA member review before publishing.
import type { Lang } from '../index';

export interface EventLabels {
  eyebrow: string;
  trail: string;
  titleSuffix: string;
  details: string;
  when: string;
  where: string;
  online: string;
  joinOnline: string;
  passed: string;
  seeCalendarPre: string;
  calendar: string;
  seeCalendarPost: string;
}

export const eventLabels: Record<Lang, EventLabels> = {
  en: {
    eyebrow: 'Event', trail: 'Events', titleSuffix: 'Area 30 Events', details: 'Details',
    when: 'When:', where: 'Where:', online: 'Online:', joinOnline: 'Join online',
    passed: 'This event has passed.', seeCalendarPre: 'See', calendar: 'the calendar', seeCalendarPost: 'for what is coming up.',
  },
  es: {
    eyebrow: 'Evento', trail: 'Eventos', titleSuffix: 'Eventos del Área 30', details: 'Detalles',
    when: 'Cuándo:', where: 'Dónde:', online: 'En línea:', joinOnline: 'Unirse en línea',
    passed: 'Este evento ya pasó.', seeCalendarPre: 'Consulte', calendar: 'el calendario', seeCalendarPost: 'para ver lo que viene.',
  },
  fr: {
    eyebrow: 'Événement', trail: 'Événements', titleSuffix: 'Événements de la Région 30', details: 'Détails',
    when: 'Quand :', where: 'Où :', online: 'En ligne :', joinOnline: 'Se joindre en ligne',
    passed: 'Cet événement est passé.', seeCalendarPre: 'Consultez', calendar: 'le calendrier', seeCalendarPost: 'pour voir ce qui s’en vient.',
  },
};
