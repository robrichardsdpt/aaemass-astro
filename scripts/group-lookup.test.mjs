// node --test scripts/group-lookup.test.mjs : finding a group by name or number, and how its address, day and time are offered on the form.
import test from 'node:test';
import assert from 'node:assert/strict';
import { searchGroups, addressPlan, groupNumber, groupLabel, meetingPlan, clock } from '../src/lib/group-lookup.ts';

const marl = { street: '31 Main St', town: 'Marlborough', zip: '01752' };
const groups = [
  { id: '000043137', name: 'One Day At A Time Group', district: 'District 02', address: 'prefill', options: [marl] },
  { id: '000050214', name: 'Pocasset Sun Night 7:30 P.M. Gp', district: 'District 02', address: 'none', options: [] },
  { id: '000097058', name: 'Brookline Group', district: 'District 14', address: 'offer', options: [marl] },
  { id: '000012345', name: 'Serenity Group', district: 'District 10', address: 'choose', options: [marl, { street: '5 Oak St', town: 'Natick', zip: '' }] },
  { id: '000099999', name: 'Serenity Group', district: 'District 22', address: 'none', options: [] },
];

test('the group number keeps its leading zeros, exactly as aa.org shows it', () => {
  assert.equal(groupNumber(groups[0]), '000043137');
});

test('the label shows the district and number so groups with the same name can be told apart', () => {
  assert.equal(groupLabel(groups[3]), 'Serenity Group · District 10 · #000012345');
});

test('search finds a group by the start of any word, ignoring case and punctuation', () => {
  assert.deepEqual(searchGroups(groups, 'brook').map((g) => g.id), ['000097058']);
  assert.deepEqual(searchGroups(groups, 'DAY at').map((g) => g.id), ['000043137']);
  assert.deepEqual(searchGroups(groups, 'sun night 7').map((g) => g.id), ['000050214']);
});

test('search needs every word to match, not just one', () => {
  assert.deepEqual(searchGroups(groups, 'brookline serenity'), []);
});

test('search finds a group by its number with or without leading zeros', () => {
  assert.deepEqual(searchGroups(groups, '43137').map((g) => g.id), ['000043137']);
  assert.deepEqual(searchGroups(groups, '000043137').map((g) => g.id), ['000043137']);
});

test('search lists names that start with the query before names that only contain it', () => {
  const list = [
    { id: '1', name: 'Early Serenity Group', district: 'District 01', address: 'none', options: [] },
    { id: '2', name: 'Serenity Group', district: 'District 01', address: 'none', options: [] },
  ];
  assert.deepEqual(searchGroups(list, 'serenity').map((g) => g.id), ['2', '1']);
});

test('search returns nothing for a blank query and caps the number of results', () => {
  assert.deepEqual(searchGroups(groups, '   '), []);
  assert.equal(searchGroups(groups, 'group', 2).length, 2);
});

test('one corroborated address is filled in; one uncorroborated address is only offered', () => {
  assert.deepEqual(addressPlan(groups[0]), { mode: 'fill', option: marl });
  assert.deepEqual(addressPlan(groups[2]), { mode: 'offer', option: marl });
});

test('several candidates become a short pick-list, and no candidates means no address help', () => {
  assert.deepEqual(addressPlan(groups[3]), { mode: 'choose', options: groups[3].options });
  assert.deepEqual(addressPlan(groups[1]), { mode: 'none' });
});

test('an entry marked fill or offer but with no address behaves like no address help', () => {
  assert.deepEqual(addressPlan({ ...groups[0], options: [] }), { mode: 'none' });
});

test('the address line reads the way a person would write it', async () => {
  const { addressLine } = await import('../src/lib/group-lookup.ts');
  assert.equal(addressLine(marl), '31 Main St, Marlborough 01752');
  assert.equal(addressLine({ street: '5 Oak St', town: 'Natick', zip: '' }), '5 Oak St, Natick');
});

test('times read as 12-hour clock text', () => {
  assert.equal(clock('07:00'), '7:00 am');
  assert.equal(clock('19:30'), '7:30 pm');
  assert.equal(clock('12:00'), '12:00 pm');
  assert.equal(clock('00:30'), '12:30 am');
});

test('one meeting at the address fills the day and time', () => {
  const meeting = { day: 2, time: '19:30' };
  assert.deepEqual(meetingPlan({ ...marl, meetings: [meeting] }), { mode: 'fill', meeting });
});

test('a few meetings at the address become a pick-list in week order', () => {
  const tue = { day: 2, time: '19:30' };
  const sun = { day: 0, time: '09:00' };
  assert.deepEqual(meetingPlan({ ...marl, meetings: [tue, sun] }), { mode: 'choose', meetings: [sun, tue] });
});

test('no meetings, or more than a week of daily ones, mean no day and time help', () => {
  assert.deepEqual(meetingPlan({ ...marl, meetings: [] }), { mode: 'none' });
  assert.deepEqual(meetingPlan(marl), { mode: 'none' }, 'an address from older data with no meetings field');
  const many = Array.from({ length: 8 }, (_, i) => ({ day: i % 7, time: `0${i}:00` }));
  assert.deepEqual(meetingPlan({ ...marl, meetings: many }), { mode: 'none' });
});
