// node --test scripts/calendar.test.mjs : the month grid, which day an event is on, and the list on the Calendar page.
import test from 'node:test';
import assert from 'node:assert/strict';
import { monthCells, daysOf, indexByDay, agenda, chipTime, kindOf, isMultiDay, weekSpans } from '../src/lib/calendar-grid.ts';

const item = (o) => ({ id: o.id ?? 'x', title: o.title ?? 'T', start: o.start, end: o.end, allDay: Boolean(o.allDay), source: 'google', recurring: false, href: '/e/', venue: undefined });

test('month grid: always 6 weeks, Sunday first, and the right days are in the month', () => {
  const nov = monthCells(2026, 10); // November 2026 starts on a Sunday
  assert.equal(nov.length, 42);
  assert.equal(nov[0].ymd, '2026-11-01');
  assert.equal(nov.filter((c) => c.inMonth).length, 30);
  assert.equal(nov[41].ymd, '2026-12-12');
  const apr = monthCells(2026, 3); // April 2026 starts on a Wednesday: the first row begins in March
  assert.equal(apr[0].ymd, '2026-03-29');
  assert.equal(apr[3].ymd, '2026-04-01');
  assert.ok(!apr[0].inMonth && apr[3].inMonth);
  assert.equal(monthCells(2028, 1).filter((c) => c.inMonth).length, 29, 'leap year February');
});

test('a timed event is on its New York day, not its UTC day', () => {
  // 00:00 UTC on Jan 10 is 7pm on Jan 9 in New York
  assert.deepEqual(daysOf(item({ start: '2027-01-10T00:00:00.000Z' })), ['2027-01-09']);
  // 04:30 UTC on Jul 4 is 12:30am on Jul 4 in New York (daylight time)
  assert.deepEqual(daysOf(item({ start: '2027-07-04T04:30:00.000Z' })), ['2027-07-04']);
});

test('an all-day event covers each of its days (the end is the midnight after the last day)', () => {
  const start = '2026-11-06T05:00:00.000Z'; // midnight Nov 6 in New York
  assert.deepEqual(daysOf(item({ start, end: '2026-11-08T05:00:00.000Z', allDay: true })), ['2026-11-06', '2026-11-07']);
  assert.deepEqual(daysOf(item({ start, allDay: true })), ['2026-11-06'], 'no end: one day');
  assert.deepEqual(daysOf(item({ start, end: start, allDay: true })), ['2026-11-06'], 'end equal to start: one day');
});

test('events on a day: all-day first, then by time, then by title', () => {
  const day = '2026-11-18';
  const index = indexByDay([
    item({ id: 'b', title: 'Zebra', start: '2026-11-19T00:00:00.000Z' }), // 7pm Nov 18
    item({ id: 'a', title: 'Alpha', start: '2026-11-19T00:00:00.000Z' }),
    item({ id: 'c', title: 'Early', start: '2026-11-18T15:00:00.000Z' }), // 10am
    item({ id: 'd', title: 'All day', start: '2026-11-18T05:00:00.000Z', allDay: true }),
  ]);
  assert.deepEqual(index.get(day).map((e) => e.id), ['d', 'c', 'a', 'b']);
});

test('the list: only days with events, within the window, in order', () => {
  const items = [
    item({ id: '1', start: '2026-11-13T00:30:00.000Z' }), // Nov 12, 7:30pm
    item({ id: '2', start: '2026-11-20T00:00:00.000Z' }), // Nov 19
    item({ id: '3', start: '2027-02-01T15:00:00.000Z' }), // far away
  ];
  const days = agenda(items, '2026-11-12', 30);
  assert.deepEqual(days.map((d) => d.ymd), ['2026-11-12', '2026-11-19']);
  assert.deepEqual(agenda(items, '2026-11-13', 30).map((d) => d.ymd), ['2026-11-19'], 'starts at the given day');
  assert.deepEqual(agenda(items, '2026-11-12', 7).map((d) => d.ymd), ['2026-11-12'], 'window length');
});

test('short times for chips', () => {
  assert.equal(chipTime('2026-11-19T00:00:00.000Z', 'en-US'), '7 pm');
  assert.equal(chipTime('2026-11-19T00:30:00.000Z', 'en-US'), '7:30 pm');
  assert.equal(chipTime('2026-11-18T13:15:00.000Z', 'en-US'), '8:15 am');
  assert.equal(chipTime('2026-11-19T00:00:00.000Z', 'fr-FR'), '19:00');
  assert.equal(chipTime('2026-11-19T00:30:00.000Z', 'en-US', true), '7:30pm', 'compact for the grid');
});

const kind = (title, recurring = false, source = 'google') => kindOf({ title, recurring, source });

test('colours by type: district meetings, committee and service meetings, area events', () => {
  assert.equal(kind('District 8 Meeting', true), 'district');
  assert.equal(kind('District 18 & 19 Meeting', true), 'district');
  assert.equal(kind('Website Committee Meeting', true), 'committee');
  assert.equal(kind('Cooperation with the Professional Community (CPC) Committee meeting', true), 'committee');
  assert.equal(kind('Central Service Delegates Meeting', true), 'committee');
  assert.equal(kind('Cape Cod Intergroup Delegates Meeting', true), 'committee');
  assert.equal(kind('DCM Roundtable', true), 'committee');
  assert.equal(kind('Area Meeting', true), 'committee');
  assert.equal(kind('Finance Committee Meeting', false), 'committee', 'a one-time committee meeting is still a committee meeting');
  // a title that starts with "District" but is not a district meeting
  assert.equal(kind("District 18's Christmas Alcathon Lottery - hosted by District 18", false), 'event');
  assert.equal(kind('Christmas Alkathon hosted by District 21'), 'event');
  assert.equal(kind('Winter Alcathons hosted by District 18/19', true), 'event', 'even when it repeats');
  assert.equal(kind('Area Assembly Orientation'), 'event');
  assert.equal(kind('77th General Service Conference of Alcoholics Anonymous'), 'event');
  assert.equal(kind('Draft New Area Handbook Feedback Session'), 'event');
  assert.equal(kind('Something new and one-time'), 'event', 'unknown one-time: an event');
  assert.equal(kind('Something new that repeats', true), 'committee', 'unknown repeating: a meeting');
  assert.equal(kind('Anything', false, 'highlight'), 'event', 'highlighted (CMS) events are area events');
});

const day = (ymd) => `${ymd}T05:00:00.000Z`; // midnight in New York (winter)
const multi = (id, from, to, title = id) => item({ id, title, start: day(from), end: day(to), allDay: true }); // `to` is the midnight after the last day
const week1 = ['2026-11-01', '2026-11-02', '2026-11-03', '2026-11-04', '2026-11-05', '2026-11-06', '2026-11-07'];
const week2 = ['2026-11-08', '2026-11-09', '2026-11-10', '2026-11-11', '2026-11-12', '2026-11-13', '2026-11-14'];

test('multi-day: only all-day events that last more than one day', () => {
  assert.ok(isMultiDay(multi('a', '2026-11-06', '2026-11-09')));
  assert.ok(!isMultiDay(multi('b', '2026-11-06', '2026-11-07')), 'one day');
  assert.ok(!isMultiDay(item({ start: '2026-11-06T23:00:00.000Z', end: '2026-11-08T04:00:00.000Z' })), 'a timed event is not a bar');
});

test('a bar that runs past the end of the week is cut there and continues on the next row', () => {
  const conv = multi('conv', '2026-11-06', '2026-11-09'); // Fri Nov 6 to Sun Nov 8
  const a = weekSpans(week1, [conv]);
  assert.equal(a.lanes, 1);
  assert.deepEqual({ col: a.spans[0].col, len: a.spans[0].len, before: a.spans[0].before, after: a.spans[0].after }, { col: 5, len: 2, before: false, after: true });
  const b = weekSpans(week2, [conv]);
  assert.deepEqual({ col: b.spans[0].col, len: b.spans[0].len, before: b.spans[0].before, after: b.spans[0].after }, { col: 0, len: 1, before: true, after: false });
  assert.equal(weekSpans(['2026-11-15', '2026-11-16', '2026-11-17', '2026-11-18', '2026-11-19', '2026-11-20', '2026-11-21'], [conv]).spans.length, 0, 'not in this week');
});

test('overlapping bars use different lanes; bars that do not overlap share one', () => {
  const x = multi('x', '2026-11-02', '2026-11-05'); // Mon to Wed
  const y = multi('y', '2026-11-04', '2026-11-07'); // Wed to Fri (overlaps x on Wednesday)
  const z = multi('z', '2026-11-05', '2026-11-07'); // Thu to Fri (does not overlap x)
  const r = weekSpans(week1, [y, x, z]);
  const lane = Object.fromEntries(r.spans.map((s) => [s.item.id, s.lane]));
  assert.equal(lane.x, 0);
  assert.equal(lane.y, 1, 'overlaps x');
  assert.equal(lane.z, 0, 'starts after x ends, so it reuses the first lane');
  assert.equal(r.lanes, 2);
  assert.deepEqual(weekSpans(week1, [y, x, z]).spans.map((s) => s.item.id), weekSpans(week1, [x, z, y]).spans.map((s) => s.item.id), 'same result whatever order they arrive in');
});
