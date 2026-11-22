// node --test scripts/major-events.test.mjs : which events the home page's "Upcoming events" list shows.
import test from 'node:test';
import assert from 'node:assert/strict';
import { majorEvents, isMajorEvent } from '../src/lib/major-events.ts';

const now = new Date('2026-11-21T15:00:00Z');
const ev = (title, start, extra = {}) => ({ id: title, source: 'google', title, start, allDay: false, description: '', categories: [], detail: `/e/${title}`, ...extra });

test('assemblies, conferences, conventions and forums count; meetings and the like do not', () => {
  for (const t of ['Area 30 Kickoff & Budget Assembly hosted by District 23', '77th General Service Conference of Alcoholics Anonymous', 'Mass. State Convention', 'Northeast Regional Forum (NERF)', 'Pre-Conference Assembly hosted by District 3']) {
    assert.equal(isMajorEvent(ev(t, '2027-01-10T14:00:00Z')), true, t);
  }
  for (const t of ['Corrections Committee Meeting', 'DCM Roundtable', 'Assembly Orientation', 'Mass. State Convention Planning Meeting', 'Thanksgiving Alkathon hosted by District 24', 'Area Meeting']) {
    assert.equal(isMajorEvent(ev(t, '2027-01-10T14:00:00Z')), false, t);
  }
});

test('a repeating event is never major', () => {
  assert.equal(isMajorEvent(ev("64th International Women's Conference (IWC) BID", '2027-01-10T14:00:00Z', { recurring: true })), false);
});

test('the list is soonest first, skips finished and far-off events, and honours the limit', () => {
  const list = [
    ev('Northeast Regional AA Service Assembly (NERAASA)', '2027-02-26T14:00:00Z'),
    ev('Area 30 Kickoff & Budget Assembly', '2027-01-10T14:00:00Z'),
    ev('Old Assembly', '2026-11-01T14:00:00Z', { end: '2026-11-01T20:00:00Z' }),
    ev('78th General Service Conference', '2028-04-23T14:00:00Z'),
    ev('77th General Service Conference', '2027-04-11T14:00:00Z'),
  ];
  assert.deepEqual(majorEvents(list, now).map((e) => e.title), ['Area 30 Kickoff & Budget Assembly', 'Northeast Regional AA Service Assembly (NERAASA)', '77th General Service Conference']);
  assert.equal(majorEvents(list, now, 2).length, 2);
});

test('an assembly that is happening now still shows until it ends', () => {
  const running = ev('Election Assembly', '2026-11-21T13:00:00Z', { end: '2026-11-21T22:00:00Z' });
  assert.deepEqual(majorEvents([running], now), [running]);
});
