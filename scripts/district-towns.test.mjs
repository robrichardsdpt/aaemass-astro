// node --test scripts/district-towns.test.mjs : the data behind "Find your district by town" (src/content/site/district-towns.yml).
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parse } from 'yaml';

const towns = parse(fs.readFileSync('src/content/site/district-towns.yml', 'utf8'));
const districtNames = fs.readdirSync('src/content/districts').map((f) => parse(fs.readFileSync(`src/content/districts/${f}`, 'utf8')).name);
const cardNumbers = new Set(districtNames.flatMap((n) => n.match(/\d+/g) ?? []).map(Number));

test('every district number in the list has a card on the Districts page', () => {
  for (const number of Object.keys(towns)) assert.ok(cardNumbers.has(Number(number)), `district ${number} has no card`);
});

test('every district has at least one town and no town is listed twice in a district', () => {
  for (const [number, list] of Object.entries(towns)) {
    assert.ok(list.length > 0, `district ${number} is empty`);
    assert.equal(new Set(list).size, list.length, `district ${number} lists a town twice`);
  }
});

test('a town belongs to one district, except Boston, which is split between 12 and 13', () => {
  const where = new Map();
  for (const [number, list] of Object.entries(towns)) for (const t of list) where.set(t, [...(where.get(t) ?? []), Number(number)]);
  const split = [...where].filter(([, numbers]) => numbers.length > 1);
  assert.deepEqual(split, [['Boston', [12, 13]]]);
});

test('well-known towns are in the districts the printed list gives them', () => {
  const inDistrict = (town) => Object.entries(towns).filter(([, list]) => list.includes(town)).map(([n]) => Number(n));
  assert.deepEqual(inDistrict('Wellesley'), [14]);
  assert.deepEqual(inDistrict('Harwich'), [1]);
  assert.deepEqual(inDistrict('Marlborough'), [23]);
  assert.deepEqual(inDistrict('Worcester'), [25]);
  assert.deepEqual(inDistrict('Gloucester'), [19]);
});

test('the list is complete enough to be useful', () => {
  const count = Object.values(towns).reduce((n, list) => n + list.length, 0);
  assert.ok(count >= 290, `only ${count} towns`);
});
