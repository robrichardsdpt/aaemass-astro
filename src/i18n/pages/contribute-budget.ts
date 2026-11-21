// A short "where contributions go" note for the Contribute page, with links to the detail. Written as page-builder blocks.
// Draft: have a bilingual AA member review the Spanish and French (docs/TRANSLATION.md).
import type { Block } from '../../lib/blocks-schema';
import type { Lang } from '..';

const handbook = 'https://aaemass.org/wp-content/uploads/2022/12/Area-Handbook-Jan2022.pdf';

export const contributeBudget: Record<Lang, Block[]> = {
  en: [
    {
      type: 'text',
      heading: 'Where contributions go',
      body: 'Area 30 is funded only by contributions from the AA groups it serves. Each November the Finance Committee proposes a budget, the districts and groups discuss it, and the Area Assembly votes on it in January. Service should never depend on a member’s own money, so expenses incurred at the Area’s request are reimbursed.',
    },
    {
      type: 'links',
      heading: 'More about the budget',
      items: [
        { label: 'Reserves and surplus funds', url: '/glossary/#operating-reserve' },
        { label: 'How Assemblies work', url: '/area-assembly/' },
        { label: 'Area 30 Handbook, Finance section (PDF)', url: handbook },
        { label: 'Ask the Treasurer', url: 'mailto:treasurer@aaemass.org' },
      ],
    },
  ],
  es: [
    {
      type: 'text',
      heading: 'A dónde van las contribuciones',
      body: 'El Área 30 se sostiene únicamente con las contribuciones de los grupos de A.A. a los que sirve. Cada noviembre el Comité de Finanzas propone un presupuesto, los distritos y los grupos lo analizan, y la Asamblea de Área lo vota en enero. El servicio nunca debe depender del dinero propio de un miembro, así que los gastos hechos a petición del Área se reembolsan.',
    },
    {
      type: 'links',
      heading: 'Más sobre el presupuesto',
      items: [
        { label: 'Reservas y fondos excedentes', url: '/glossary/#reserva-operativa' },
        { label: 'Cómo funcionan las Asambleas', url: '/area-assembly/' },
        { label: 'Manual del Área 30, sección de Finanzas (PDF, en inglés)', url: handbook },
        { label: 'Pregunte al Tesorero', url: 'mailto:treasurer@aaemass.org' },
      ],
    },
  ],
  fr: [
    {
      type: 'text',
      heading: 'Où vont les contributions',
      body: 'La région 30 est financée uniquement par les contributions des groupes A.A. qu’elle sert. Chaque novembre, le comité des finances propose un budget, les districts et les groupes en discutent, et l’assemblée de région le vote en janvier. Le service ne doit jamais dépendre de l’argent personnel d’un membre : les dépenses engagées à la demande de la région sont donc remboursées.',
    },
    {
      type: 'links',
      heading: 'En savoir plus sur le budget',
      items: [
        { label: 'Réserves et fonds excédentaires', url: '/glossary/#reserve-de-fonctionnement' },
        { label: 'Comment fonctionnent les assemblées', url: '/area-assembly/' },
        { label: 'Manuel de la région 30, section Finances (PDF, en anglais)', url: handbook },
        { label: 'Écrire au trésorier', url: 'mailto:treasurer@aaemass.org' },
      ],
    },
  ],
};
