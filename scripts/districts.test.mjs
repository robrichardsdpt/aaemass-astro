// node --test scripts/districts.test.mjs : the "next meeting" date, the calendar entry and the Zoom link for district cards.
import test from 'node:test';
import assert from 'node:assert/strict';
import { nthWeekday, nextMeeting, dayLabel } from '../src/lib/next-meeting.ts';
import { districtIcs, zoomLink } from '../src/lib/district-ics.ts';

const at = (iso) => new Date(iso);

test('the nth weekday of a month', () => {
  assert.equal(nthWeekday(2026, 11, 2, 2), 8); // 2nd Tuesday of December 2026
  assert.equal(nthWeekday(2026, 10, 4, 3), 19); // 3rd Thursday of November 2026
  assert.equal(nthWeekday(2027, 2, 1, 1), 1); // 1st Monday of March 2027 (the 1st itself)
  assert.equal(nthWeekday(2026, 1, 0, 4), 22); // 4th Sunday of February 2026
});

test('next meeting: later this month, next month, today, and rolling into the next year', () => {
  const secondTue = { week: 2, weekday: 2, start: '19:00' };
  assert.deepEqual(nextMeeting(secondTue, at('2026-11-12T15:00:00Z')), { ymd: '2026-12-08', today: false }, 'Nov 10 has passed, so December');
  assert.deepEqual(nextMeeting({ week: 3, weekday: 4, start: '19:00' }, at('2026-11-12T15:00:00Z')), { ymd: '2026-11-19', today: false });
  assert.deepEqual(nextMeeting({ week: 1, weekday: 1, start: '19:00' }, at('2026-12-30T15:00:00Z')), { ymd: '2027-01-04', today: false }, 'across New Year');
  // Thursday Nov 12 2026 is the 2nd Thursday: still "today" until the meeting is over, then next month.
  const secondThu = { week: 2, weekday: 4, start: '19:00', end: '20:30' };
  assert.deepEqual(nextMeeting(secondThu, at('2026-11-12T15:00:00Z')), { ymd: '2026-11-12', today: true }, '10am in New York');
  assert.deepEqual(nextMeeting(secondThu, at('2026-11-13T01:00:00Z')), { ymd: '2026-11-12', today: true }, '8pm in New York, still going');
  assert.deepEqual(nextMeeting(secondThu, at('2026-11-13T02:00:00Z')), { ymd: '2026-12-10', today: false }, '9pm in New York, over');
  assert.deepEqual(nextMeeting({ week: 2, weekday: 4, start: '19:00' }, at('2026-11-13T01:30:00Z')), { ymd: '2026-12-10', today: false }, 'no end time: one hour after the start');
});

test('the date is New York time, not the visitor\'s', () => {
  // 11pm on Nov 9 in New York is already Nov 10 in UTC: the Tuesday meeting on the 10th is still tomorrow, not today.
  assert.deepEqual(nextMeeting({ week: 2, weekday: 2, start: '19:00' }, at('2026-11-10T04:00:00Z')), { ymd: '2026-11-10', today: false });
});

test('day label', () => {
  assert.equal(dayLabel('2026-12-08', 'en-US'), 'Tue, Dec 8');
});

const d = { id: 'district-8', name: 'District 8', week: 3, weekday: 1, start: '19:00', how: 'hybrid', place: 'Quincy Point Congregational Church', address: '444 Washington St, Quincy, MA 02169', platform: 'Zoom', zoomId: '884 7243 7705', password: 'GSRD8', website: 'http://www.aadistrict8ma.org/' };

test('calendar entry repeats monthly on the right day, in New York time', () => {
  const ics = districtIcs(d, at('2026-11-12T15:00:00Z'));
  assert.ok(ics.startsWith('BEGIN:VCALENDAR\r\n') && ics.endsWith('END:VCALENDAR\r\n'));
  assert.ok(ics.includes('BEGIN:VTIMEZONE') && ics.includes('TZID:America/New_York'), 'carries the time zone rules');
  assert.ok(ics.includes('DTSTART;TZID=America/New_York:20261116T190000'), '3rd Monday of November is the 16th');
  assert.ok(ics.includes('DTEND;TZID=America/New_York:20261116T200000'), 'one hour when no end time is given');
  assert.ok(ics.includes('RRULE:FREQ=MONTHLY;BYDAY=3MO'));
  assert.ok(ics.includes('SUMMARY:District 8 meeting'));
  assert.ok(ics.replace(/\r\n /g, '').includes('LOCATION:Quincy Point Congregational Church\\, 444 Washington St\\, Quincy\\, MA 02169'), 'commas escaped (after unfolding long lines)');
  for (const line of ics.split('\r\n')) assert.ok([...line].length <= 75, `line too long: ${line}`);
});

test('calendar entry: join details only when there is an online way in; end time when given; note kept', () => {
  const inPerson = districtIcs({ ...d, how: 'in person', end: '21:00', note: 'if the 3rd Monday is a holiday, it moves' }, at('2026-11-12T15:00:00Z'));
  assert.ok(inPerson.includes('DTEND;TZID=America/New_York:20261116T210000'));
  assert.ok(!/Zoom ID|Password:/.test(inPerson.replace(/\r\n /g, '')), 'no Zoom details for an in-person meeting');
  assert.ok(inPerson.replace(/\r\n /g, '').includes('if the 3rd Monday is a holiday\\, it moves'));
  const virtual = districtIcs({ ...d, how: 'virtually' }, at('2026-11-12T15:00:00Z')).replace(/\r\n /g, '');
  assert.ok(virtual.includes('LOCATION:Online') && virtual.includes('Zoom ID: 884 7243 7705') && virtual.includes('Password: GSRD8'));
});

test('Zoom link', () => {
  assert.equal(zoomLink('Zoom', '884 7243 7705'), 'https://zoom.us/j/88472437705');
  assert.equal(zoomLink('Zoom', '94948435755'), 'https://zoom.us/j/94948435755');
  assert.equal(zoomLink('Google Meet', '884 7243 7705'), undefined);
  assert.equal(zoomLink('Zoom', '503 682 627'), 'https://zoom.us/j/503682627', 'nine digits is enough');
  assert.equal(zoomLink('Zoom', '12345'), undefined);
  assert.equal(zoomLink(undefined, undefined), undefined);
});
