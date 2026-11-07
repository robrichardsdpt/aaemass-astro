// Translates the mirrored district listings (src/lib/mirror-data.ts) line by line with fixed patterns.
// Names, addresses, Zoom IDs, passwords and URLs are never changed. A line with no matching pattern is
// returned in English, and scripts/check-i18n.mjs lists those so nothing slips through untranslated.
import type { Lang } from './index';

const weekdays = {
  es: { monday: 'lunes', tuesday: 'martes', wednesday: 'miércoles', thursday: 'jueves', friday: 'viernes', saturday: 'sábado', sunday: 'domingo' },
  fr: { monday: 'lundi', tuesday: 'mardi', wednesday: 'mercredi', thursday: 'jeudi', friday: 'vendredi', saturday: 'samedi', sunday: 'dimanche' },
} as const;
const ordinals = {
  es: { 1: 'primer', 2: 'segundo', 3: 'tercer', 4: 'cuarto' },
  fr: { 1: 'premier', 2: 'deuxième', 3: 'troisième', 4: 'quatrième' },
} as const;

// "7pm", "730pm", "815am", "6:30pm", "7:00pm" -> localized clock text.
function clock(raw: string, lang: 'es' | 'fr'): string {
  const m = raw.match(/^(\d{1,2})(?::?(\d{2}))?\s*(am|pm)$/i);
  if (!m) return raw;
  let h = Number(m[1]);
  const min = m[2] ?? '00';
  const pm = m[3].toLowerCase() === 'pm';
  if (lang === 'es') return `${h}:${min} ${pm ? 'p. m.' : 'a. m.'}`;
  if (pm && h < 12) h += 12;
  if (!pm && h === 12) h = 0;
  return min === '00' ? `${h} h` : `${h} h ${min}`;
}

const how = {
  es: { hybrid: 'en modalidad híbrida', virtually: 'de forma virtual', 'in person': 'en persona' },
  fr: { hybrid: 'en mode hybride', virtually: 'virtuellement', 'in person': 'en personne' },
} as const;

const labels: Record<'es' | 'fr', [RegExp, string][]> = {
  es: [
    [/^Online:$/, 'En línea:'],
    [/^In person:$/, 'En persona:'],
    [/^Join online:$/, 'Para unirse en línea:'],
    [/^Join virtually:$/, 'Para unirse de forma virtual:'],
    [/^Join in person:$/, 'Para unirse en persona:'],
    [/^Address:$/, 'Dirección:'],
    [/^Platform – (.*)$/, 'Plataforma – $1'],
    [/^Zoom ID – (.*)$/, 'ID de Zoom – $1'],
    [/^Password – (.*)$/, 'Contraseña – $1'],
    [/^Passcode – (.*)$/, 'Código de acceso – $1'],
    [/^For more info, email: (.*)$/, 'Para más información, escriba a: $1'],
    [/^For password email – (.*)$/, 'Para obtener la contraseña, escriba a – $1'],
    [/^(?:Please )?[Mm]ail contributions to: (.*)$/, 'Envíe las contribuciones por correo a: $1'],
    [/^Make checks payable to: (.*)$/, 'Haga los cheques a nombre de: $1'],
  ],
  fr: [
    [/^Online:$/, 'En ligne :'],
    [/^In person:$/, 'En personne :'],
    [/^Join online:$/, 'Pour vous joindre en ligne :'],
    [/^Join virtually:$/, 'Pour vous joindre virtuellement :'],
    [/^Join in person:$/, 'Pour vous joindre en personne :'],
    [/^Address:$/, 'Adresse :'],
    [/^Platform – (.*)$/, 'Plateforme – $1'],
    [/^Zoom ID – (.*)$/, 'ID Zoom – $1'],
    [/^Password – (.*)$/, 'Mot de passe – $1'],
    [/^Passcode – (.*)$/, 'Code d’accès – $1'],
    [/^For more info, email: (.*)$/, 'Pour plus de renseignements, écrivez à : $1'],
    [/^For password email – (.*)$/, 'Pour obtenir le mot de passe, écrivez à – $1'],
    [/^(?:Please )?[Mm]ail contributions to: (.*)$/, 'Veuillez envoyer vos contributions par la poste à : $1'],
    [/^Make checks payable to: (.*)$/, 'Libellez les chèques à l’ordre de : $1'],
  ],
};

export function translateDistrictLine(line: string, lang: Lang): string {
  if (lang === 'en') return line;
  const l = lang;
  const trimmed = line.trim();

  // District 27 lists its meeting in Spanish and English; Spanish pages keep only the Spanish line.
  if (/^Reuniones presenciales/.test(trimmed)) return l === 'es' ? trimmed : 'Réunions en personne le 2e mercredi de chaque mois, de 19 h à 21 h';
  if (/^Meets in person on the 2nd Wednesday of the month from 7pm-9pm$/.test(trimmed)) return l === 'es' ? '' : '';
  if (/^Dirección \/ Address:$/.test(trimmed)) return l === 'es' ? 'Dirección:' : 'Adresse :';

  const meets = trimmed.match(/^Meets (hybrid|virtually|in person)\s+on the (\d)(?:st|nd|rd|th) (Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)(?: of the month)? at ([\d:]+\s*[ap]m)(?: to ([\d:]+\s*[ap]m))?(?:\s*\((.*)\))?$/i);
  if (meets) {
    const mode = how[l][meets[1].toLowerCase() as 'hybrid' | 'virtually' | 'in person'];
    const wd = weekdays[l][meets[3].toLowerCase() as keyof (typeof weekdays)['es']];
    const ord = ordinals[l][Number(meets[2]) as 1 | 2 | 3 | 4];
    const start = clock(meets[4], l);
    const end = meets[5] ? clock(meets[5], l) : '';
    let text: string;
    if (l === 'es') {
      const when = end ? `de ${start} a ${end}` : `a las ${start}`;
      text = `Se reúne ${mode} el ${ord} ${wd} de cada mes ${when}`;
    } else {
      const when = end ? `de ${start} à ${end}` : `à ${start}`;
      text = `Se réunit ${mode} le ${ord} ${wd} de chaque mois ${when}`;
    }
    if (meets[6]) {
      const ords = ordinals[l];
      const note = /1st Monday falls on a holiday/.test(meets[6])
        ? l === 'es'
          ? `si el ${ords[1]} lunes cae en un día festivo, la reunión se celebra el ${ords[2]} lunes del mes`
          : `si le ${ords[1]} lundi tombe un jour férié, la réunion a lieu le ${ords[2]} lundi du mois`
        : meets[6];
      text += ` (${note})`;
    }
    return text;
  }

  for (const [re, out] of labels[l]) if (re.test(trimmed)) return trimmed.replace(re, out);
  return line;
}

// Heading text: "District 1 & 2" -> "Distrito 1 y 2" (French keeps "District").
export const districtName = (name: string, lang: Lang) =>
  lang === 'es' ? name.replace(/^District /, 'Distrito ').replace(' & ', ' y ') : lang === 'fr' ? name.replace(' & ', ' et ') : name;
