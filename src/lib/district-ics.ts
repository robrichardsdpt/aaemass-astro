// A repeating calendar entry for a district ("2nd Tuesday of every month at 7pm"), as an .ics file. Built in the browser
// when someone taps Add to calendar, so no extra files are needed on the site (the WordPress plugin only serves known types).
import { escapeIcs, fold } from './event-model.ts';
import { nextMeeting, type Schedule } from './next-meeting.ts';

export interface DistrictCalendar extends Schedule {
  id: string;
  name: string;
  how: string; // hybrid | virtually | in person
  place?: string;
  address?: string;
  platform?: string;
  zoomId?: string;
  password?: string;
  website?: string;
  note?: string;
}

const DAY_CODES = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
const ORDINALS = ['', '1st', '2nd', '3rd', '4th'];
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const compact = (ymd: string, hm: string) => `${ymd.replace(/-/g, '')}T${hm.replace(':', '')}00`;
const addHour = (hm: string) => `${String((Number(hm.slice(0, 2)) + 1) % 24).padStart(2, '0')}${hm.slice(2)}`;

// New York's daylight saving rules, so the 7pm meeting stays at 7pm all year.
const NEW_YORK = [
  'BEGIN:VTIMEZONE', 'TZID:America/New_York',
  'BEGIN:DAYLIGHT', 'TZOFFSETFROM:-0500', 'TZOFFSETTO:-0400', 'TZNAME:EDT', 'DTSTART:19700308T020000', 'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU', 'END:DAYLIGHT',
  'BEGIN:STANDARD', 'TZOFFSETFROM:-0400', 'TZOFFSETTO:-0500', 'TZNAME:EST', 'DTSTART:19701101T020000', 'RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU', 'END:STANDARD',
  'END:VTIMEZONE',
];

export function districtIcs(d: DistrictCalendar, now: Date = new Date()): string {
  const first = nextMeeting(d, now).ymd;
  const where = d.how === 'virtually' ? 'Online' : [d.place, d.address].filter(Boolean).join(', ');
  const details = [
    `${d.name} meets ${d.how} on the ${ORDINALS[d.week]} ${WEEKDAYS[d.weekday]} of the month.`,
    ...(d.note ? [d.note] : []),
    ...(d.how !== 'in person' && d.zoomId ? [`${d.platform ?? 'Online'} ID: ${d.zoomId}`] : []),
    ...(d.how !== 'in person' && d.password ? [`Password: ${d.password}`] : []),
    ...(d.website ? [d.website] : []),
    'Check the district website or Area 30 for changes.',
  ].join('\n');
  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Area 30 Eastern Mass. AA//Districts//EN', 'CALSCALE:GREGORIAN',
    ...NEW_YORK,
    'BEGIN:VEVENT',
    `UID:${d.id}-meeting@aaemass.org`,
    `DTSTAMP:${now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`,
    `DTSTART;TZID=America/New_York:${compact(first, d.start)}`,
    `DTEND;TZID=America/New_York:${compact(first, d.end ?? addHour(d.start))}`,
    `RRULE:FREQ=MONTHLY;BYDAY=${d.week}${DAY_CODES[d.weekday]}`,
    `SUMMARY:${escapeIcs(`${d.name} meeting`)}`,
    ...(where ? [`LOCATION:${escapeIcs(where)}`] : []),
    `DESCRIPTION:${escapeIcs(details)}`,
    'END:VEVENT', 'END:VCALENDAR',
  ];
  return lines.map(fold).join('\r\n') + '\r\n';
}

export const zoomLink = (platform: string | undefined, id: string | undefined): string | undefined => {
  const digits = (id ?? '').replace(/\D/g, '');
  return /zoom/i.test(platform ?? '') && digits.length >= 9 ? `https://zoom.us/j/${digits}` : undefined;
};
