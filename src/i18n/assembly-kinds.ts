// What each kind of Area 30 Assembly is for, in one sentence. Shared by the next-Assembly card and the home page's featured event.
import type { Lang } from './index';
import type { AssemblyKind } from '../lib/next-assembly';

export const assemblyKinds: Record<Lang, Record<AssemblyKind, string>> = {
  en: {
    kickoff: 'The first Assembly of the year. Conference committees report, and the Assembly votes on the Area budget.',
    pre: 'The Pre-Conference Assembly, held before the General Service Conference meets in New York.',
    post: 'The Post-Conference Assembly, where the Delegate reports back on what the Conference did.',
    workshop: 'A workshop Assembly: the day is built around the Assembly topic and workshops.',
    election: 'The Election Assembly: the Delegate and the other Area officers are chosen using the Third Legacy Procedure.',
    other: '',
  },
  es: {
    kickoff: 'La primera Asamblea del año. Los comités de la Conferencia presentan informes y la Asamblea vota el presupuesto del Área.',
    pre: 'La Asamblea previa a la Conferencia, que se celebra antes de que la Conferencia de Servicios Generales se reúna en Nueva York.',
    post: 'La Asamblea posterior a la Conferencia, en la que el Delegado informa sobre lo que hizo la Conferencia.',
    workshop: 'Una Asamblea de talleres: el día gira en torno al tema de la Asamblea y a los talleres.',
    election: 'La Asamblea de Elecciones: se elige al Delegado y a los demás funcionarios del Área con el Procedimiento del Tercer Legado.',
    other: '',
  },
  fr: {
    kickoff: 'La première assemblée de l’année. Les comités de la Conférence font rapport et l’assemblée vote le budget de la région.',
    pre: 'L’assemblée précédant la Conférence, tenue avant la réunion de la Conférence des services généraux à New York.',
    post: 'L’assemblée suivant la Conférence, où le délégué rend compte de ce que la Conférence a fait.',
    workshop: 'Une assemblée d’ateliers : la journée est organisée autour du thème de l’assemblée et d’ateliers.',
    election: 'L’assemblée d’élection : le délégué et les autres responsables de la région sont choisis selon la procédure du Troisième Legs.',
    other: '',
  },
};
