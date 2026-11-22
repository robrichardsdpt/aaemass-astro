// node --test scripts/featured-event.test.mjs : which event the home page promotes under the banner.
import test from 'node:test';
import assert from 'node:assert/strict';
import { pickFeatured, ASSEMBLY_LEAD_DAYS } from '../src/lib/featured-event.ts';

const now = new Date('2026-11-21T15:00:00Z');
const ev = (title, start, extra = {}) => ({ id: title, source: 'google', title, start, allDay: false, description: '', categories: [], detail: `/e/${title}`, ...extra });

const kickoff = ev('Area 30 Kickoff & Budget Assembly hosted by District 23', '2027-01-10T14:00:00Z');
const regional = ev('Northeast Regional AA Service Assembly (NERAASA)', '2027-02-26T14:00:00Z');

test('with nothing featured and no Area Assembly, nothing is promoted', () => {
  assert.equal(pickFeatured([regional], now), undefined);
  assert.equal(pickFeatured([], now), undefined);
});

test('the next Area 30 Assembly is promoted when it is close enough', () => {
  const picked = pickFeatured([regional, kickoff], now);
  assert.equal(picked?.event, kickoff);
  assert.equal(picked?.kind, 'assembly');
});

test('an Area Assembly further away than the lead time is not promoted', () => {
  const far = ev('Area 30 Workshop Assembly', new Date(now.getTime() + (ASSEMBLY_LEAD_DAYS + 5) * 86_400_000).toISOString());
  assert.equal(pickFeatured([far], now), undefined);
});

test('an event an editor featured beats the automatic Assembly, however far away', () => {
  const convention = ev('Mass. State Convention', '2027-11-05T14:00:00Z', { featured: true, source: 'highlight' });
  const picked = pickFeatured([kickoff, convention], now);
  assert.equal(picked?.event, convention);
  assert.equal(picked?.kind, 'chosen');
});

test('with several featured events the soonest one is promoted', () => {
  const later = ev('Later', '2027-06-01T14:00:00Z', { featured: true });
  const sooner = ev('Sooner', '2027-03-01T14:00:00Z', { featured: true });
  assert.equal(pickFeatured([later, sooner], now)?.event, sooner);
});

test('a featured event that has finished is not promoted', () => {
  const past = ev('Past', '2026-11-01T14:00:00Z', { featured: true, end: '2026-11-01T20:00:00Z' });
  assert.equal(pickFeatured([past, kickoff], now)?.event, kickoff);
});

test('a multi-day featured event stays promoted until its last day ends', () => {
  const running = ev('Convention weekend', '2026-11-20T14:00:00Z', { featured: true, end: '2026-11-22T20:00:00Z' });
  assert.equal(pickFeatured([running], now)?.event, running);
});
