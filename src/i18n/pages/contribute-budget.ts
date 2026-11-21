// The budget explainer shown on the Contribute page, below the ways to contribute. Written as page-builder blocks.
// Draft: have a bilingual AA member review the Spanish and French (docs/TRANSLATION.md).
import type { Block } from '../../lib/blocks-schema';
import type { Lang } from '..';

export const contributeBudget: Record<Lang, Block[]> = {
  "en": [
    {
      "type": "text",
      "heading": "Where contributions go",
      "body": "In the spirit of the Seventh Tradition, Area 30 is funded solely by contributions from the AA groups within its boundaries.\n\nThe Finance Committee advises on the money. The Area Treasurer chairs it, and its voting members are the elected Area officers and their alternates, the Conference and standing committee chairs (or their alternates) and the Immediate Past Delegate. Its minutes are available to anyone who asks.\n"
    },
    {
      "type": "timeline",
      "heading": "How the yearly budget is made",
      "steps": [
        {
          "when": "Each year",
          "title": "Committees say what they expect to spend",
          "text": "Every committee is asked what it thinks it will need in the coming year. Those everyday costs make up the general operating budget."
        },
        {
          "when": "November",
          "title": "The Finance Committee presents a proposal",
          "text": "The proposed budget goes to the Area Committee."
        },
        {
          "when": "After November",
          "title": "Districts and groups discuss it",
          "text": "The proposal is taken back to the districts and groups for discussion and review."
        },
        {
          "when": "January",
          "title": "The Assembly votes",
          "text": "The Treasurer presents the budget at the first Assembly of the year. The Assembly can approve it, reject it or change it. Once approved, it becomes the Area's operating plan."
        },
        {
          "when": "Through the year",
          "title": "Extra requests need approval too",
          "text": "A one-time request, or a supplemental request from someone who expects to go over their budget, is approved by the Finance Committee and then by an Assembly."
        }
      ]
    },
    {
      "type": "cards",
      "heading": "Reserves and surplus",
      "intro": "Contributions and costs do not match month to month, so the Area keeps some money in reserve. The Handbook gives the exact amounts and rules.",
      "cards": [
        {
          "title": "Operating reserve",
          "text": "Enough to pay the current and next month's expenses, so bills are paid on time whatever came in that month."
        },
        {
          "title": "Prudent reserve",
          "text": "A larger cushion, set by the Assembly, that would keep the Area running for roughly six months."
        },
        {
          "title": "Surplus funds",
          "text": "Money held beyond both reserves for at least three months. The Treasurer announces it at an Assembly so it can be put to work carrying the message. Any left at the set date goes to the General Service Office on the Area's behalf."
        }
      ]
    },
    {
      "type": "checklist",
      "heading": "Service should not depend on your wallet",
      "items": [
        "Expenses you incur doing business at the Area's request are fully reimbursed.",
        "Whether to be reimbursed is your choice.",
        "The goal is that anyone willing and able to serve can, with personal finances removed as a limit.",
        "Officers and committees may decide how to use their funds, and must manage them prudently and report on them.",
        "Service is its own reward."
      ]
    },
    {
      "type": "buttons",
      "items": [
        {
          "label": "Area 30 Handbook (PDF)",
          "url": "https://aaemass.org/wp-content/uploads/2022/12/Area-Handbook-Jan2022.pdf",
          "style": "quiet"
        },
        {
          "label": "Glossary",
          "url": "/glossary/",
          "style": "quiet"
        }
      ]
    },
    {
      "type": "faq",
      "items": [
        {
          "q": "Who decides how Area 30's money is spent?",
          "a": "The Assembly. It votes on the budget each January, and it also approves one-time and supplemental requests."
        },
        {
          "q": "Can I see the Finance Committee's minutes?",
          "a": "Yes. Minutes are kept and are available to anyone on request. Ask the Treasurer at treasurer@aaemass.org."
        }
      ],
      "heading": "Questions about the budget"
    }
  ],
  "es": [
    {
      "type": "text",
      "heading": "A dónde van las contribuciones",
      "body": "En el espíritu de la Séptima Tradición, el Área 30 se financia únicamente con las contribuciones de los grupos de A.A. dentro de sus límites.\n\nEl Comité de Finanzas asesora sobre el dinero. Lo preside el Tesorero del Área, y sus miembros con voto son los funcionarios elegidos del Área y sus suplentes, los presidentes de los comités de la Conferencia y permanentes (o sus suplentes) y el Delegado anterior inmediato. Sus actas están disponibles para quien las pida.\n"
    },
    {
      "type": "timeline",
      "heading": "Cómo se elabora el presupuesto anual",
      "steps": [
        {
          "when": "Cada año",
          "title": "Los comités dicen cuánto prevén gastar",
          "text": "Se pide a cada comité que diga qué cree que necesitará el año siguiente. Esos gastos cotidianos forman el presupuesto operativo general."
        },
        {
          "when": "Noviembre",
          "title": "El Comité de Finanzas presenta una propuesta",
          "text": "El presupuesto propuesto pasa al Comité de Área."
        },
        {
          "when": "Después de noviembre",
          "title": "Los distritos y los grupos lo analizan",
          "text": "La propuesta vuelve a los distritos y a los grupos para su discusión y revisión."
        },
        {
          "when": "Enero",
          "title": "La Asamblea vota",
          "text": "El Tesorero presenta el presupuesto en la primera Asamblea del año. La Asamblea puede aprobarlo, rechazarlo o modificarlo. Una vez aprobado, es el plan operativo del Área."
        },
        {
          "when": "Durante el año",
          "title": "Las solicitudes adicionales también necesitan aprobación",
          "text": "Una solicitud única, o una solicitud suplementaria de quien prevé exceder su presupuesto, la aprueba el Comité de Finanzas y luego una Asamblea."
        }
      ]
    },
    {
      "type": "cards",
      "heading": "Reservas y excedentes",
      "intro": "Las contribuciones y los gastos no coinciden de un mes a otro, así que el Área guarda dinero en reserva. El Manual da las cantidades y reglas exactas.",
      "cards": [
        {
          "title": "Reserva operativa",
          "text": "Suficiente para pagar los gastos del mes en curso y del siguiente, de modo que las cuentas se paguen a tiempo sin importar lo que entró ese mes."
        },
        {
          "title": "Reserva prudente",
          "text": "Un colchón mayor, fijado por la Asamblea, que mantendría al Área en funcionamiento unos seis meses."
        },
        {
          "title": "Fondos excedentes",
          "text": "Dinero que se mantiene por encima de ambas reservas durante al menos tres meses. El Tesorero lo anuncia en una Asamblea para que se use en llevar el mensaje. Lo que quede en la fecha fijada se envía a la Oficina de Servicios Generales en nombre del Área."
        }
      ]
    },
    {
      "type": "checklist",
      "heading": "El servicio no debe depender de su bolsillo",
      "items": [
        "Los gastos que usted tenga al atender asuntos a petición del Área se reembolsan por completo.",
        "Decidir si se reembolsa es decisión suya.",
        "La meta es que cualquiera que quiera y pueda servir lo haga, sin que sus finanzas personales sean un límite.",
        "Los funcionarios y los comités pueden decidir cómo usar sus fondos, y deben administrarlos con prudencia y rendir cuentas.",
        "El servicio es su propia recompensa."
      ]
    },
    {
      "type": "buttons",
      "items": [
        {
          "label": "Manual del Área 30 (PDF, en inglés)",
          "url": "https://aaemass.org/wp-content/uploads/2022/12/Area-Handbook-Jan2022.pdf",
          "style": "quiet"
        },
        {
          "label": "Glosario",
          "url": "/glossary/",
          "style": "quiet"
        }
      ]
    },
    {
      "type": "faq",
      "items": [
        {
          "q": "¿Quién decide cómo se gasta el dinero del Área 30?",
          "a": "La Asamblea. Vota el presupuesto cada enero y también aprueba las solicitudes únicas y suplementarias."
        },
        {
          "q": "¿Puedo ver las actas del Comité de Finanzas?",
          "a": "Sí. Las actas se conservan y están disponibles para cualquiera que las pida. Pregunte al Tesorero en treasurer@aaemass.org."
        }
      ],
      "heading": "Preguntas sobre el presupuesto"
    }
  ],
  "fr": [
    {
      "type": "text",
      "heading": "Où vont les contributions",
      "body": "Dans l’esprit de la Septième Tradition, la région 30 est financée uniquement par les contributions des groupes A.A. situés dans ses limites.\n\nLe comité des finances conseille sur l’argent. Il est présidé par le trésorier de la région, et ses membres votants sont les responsables élus de la région et leurs suppléants, les présidents des comités de la Conférence et des comités permanents (ou leurs suppléants) et l’ancien délégué immédiat. Ses procès-verbaux sont accessibles à quiconque les demande.\n"
    },
    {
      "type": "timeline",
      "heading": "Comment le budget annuel est établi",
      "steps": [
        {
          "when": "Chaque année",
          "title": "Les comités indiquent ce qu’ils prévoient de dépenser",
          "text": "On demande à chaque comité ce dont il pense avoir besoin l’année suivante. Ces dépenses courantes forment le budget de fonctionnement général."
        },
        {
          "when": "Novembre",
          "title": "Le comité des finances présente une proposition",
          "text": "Le budget proposé est soumis au comité de région."
        },
        {
          "when": "Après novembre",
          "title": "Les districts et les groupes en discutent",
          "text": "La proposition retourne aux districts et aux groupes pour discussion et examen."
        },
        {
          "when": "Janvier",
          "title": "L’assemblée vote",
          "text": "Le trésorier présente le budget à la première assemblée de l’année. L’assemblée peut l’approuver, le rejeter ou le modifier. Une fois approuvé, il devient le plan de fonctionnement de la région."
        },
        {
          "when": "Tout au long de l’année",
          "title": "Les demandes supplémentaires doivent aussi être approuvées",
          "text": "Une demande ponctuelle, ou une demande supplémentaire de quelqu’un qui prévoit de dépasser son budget, est approuvée par le comité des finances puis par une assemblée."
        }
      ]
    },
    {
      "type": "cards",
      "heading": "Réserves et excédents",
      "intro": "Les contributions et les dépenses ne coïncident pas d’un mois à l’autre ; la région garde donc de l’argent en réserve. Le manuel donne les montants et les règles exacts.",
      "cards": [
        {
          "title": "Réserve de fonctionnement",
          "text": "Assez pour payer les dépenses du mois en cours et du suivant, afin que les factures soient payées à temps quoi qu’il soit entré ce mois-là."
        },
        {
          "title": "Réserve prudente",
          "text": "Un coussin plus important, fixé par l’assemblée, qui maintiendrait la région en activité environ six mois."
        },
        {
          "title": "Fonds excédentaires",
          "text": "De l’argent conservé au-delà des deux réserves pendant au moins trois mois. Le trésorier l’annonce à une assemblée pour qu’il serve à transmettre le message. Ce qui reste à la date fixée est versé au Bureau des services généraux au nom de la région."
        }
      ]
    },
    {
      "type": "checklist",
      "heading": "Le service ne doit pas dépendre de votre portefeuille",
      "items": [
        "Les dépenses que vous engagez à la demande de la région sont entièrement remboursées.",
        "Être remboursé ou non est votre choix.",
        "Le but est que quiconque veut et peut servir le fasse, sans que ses finances personnelles soient une limite.",
        "Les responsables et les comités peuvent décider de l’usage de leurs fonds, et doivent les gérer avec prudence et en rendre compte.",
        "Le service est sa propre récompense."
      ]
    },
    {
      "type": "buttons",
      "items": [
        {
          "label": "Manuel de la région 30 (PDF, en anglais)",
          "url": "https://aaemass.org/wp-content/uploads/2022/12/Area-Handbook-Jan2022.pdf",
          "style": "quiet"
        },
        {
          "label": "Glossaire",
          "url": "/glossary/",
          "style": "quiet"
        }
      ]
    },
    {
      "type": "faq",
      "items": [
        {
          "q": "Qui décide de l’utilisation de l’argent de la région 30 ?",
          "a": "L’assemblée. Elle vote le budget chaque janvier et approuve aussi les demandes ponctuelles et supplémentaires."
        },
        {
          "q": "Puis-je consulter les procès-verbaux du comité des finances ?",
          "a": "Oui. Les procès-verbaux sont conservés et accessibles à quiconque les demande. Écrivez au trésorier à treasurer@aaemass.org."
        }
      ],
      "heading": "Questions sur le budget"
    }
  ]
};
