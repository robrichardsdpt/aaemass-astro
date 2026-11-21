// node --test scripts/district-map-geometry.test.mjs : the real town list and the real map geometry agree, so no listed town is missing from the map.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parse } from 'yaml';
import { VILLAGES, NO_TOWN, assignMunicipalities } from '../src/lib/map/assign.ts';
import { townKey } from '../src/lib/town-finder.ts';

const lists = parse(fs.readFileSync('src/content/site/district-towns.yml', 'utf8'));
const geometry = JSON.parse(fs.readFileSync('src/data/area30-map.json', 'utf8'));
const municipalities = geometry.main.towns.map((t) => t.n);
const known = new Set(municipalities.map(townKey));

test('every name in the district town list is a town on the map, a village of one, or on the short list of places that are not towns', () => {
  const unknown = [];
  for (const [number, list] of Object.entries(lists)) {
    for (const name of list) if (!known.has(townKey(name)) && !VILLAGES[name] && !NO_TOWN.has(name)) unknown.push(`${name} (district ${number})`);
  }
  assert.deepEqual(unknown, []);
});

test('every village stands for towns that are on the map', () => {
  const missing = Object.entries(VILLAGES).flatMap(([village, towns]) => towns.filter((t) => !known.has(townKey(t))).map((t) => `${village} → ${t}`));
  assert.deepEqual(missing, []);
});

test('only the three towns nobody lists are left without a district', () => {
  const none = [...assignMunicipalities(lists, municipalities)].filter(([, a]) => a.kind === 'none').map(([town]) => town).sort();
  assert.deepEqual(none, ['Brookfield', 'Carlisle', 'Wenham']);
});

test('every town on the map is drawn, the Boston inset only shows towns that reach it, and every arc names towns that exist', () => {
  for (const view of [geometry.main, geometry.inset]) {
    for (const arc of view.arcs) for (const i of arc.u) assert.ok(view.towns[i], `arc points at town ${i}`);
    for (const t of view.towns) assert.match(t.p, /^M[\dMLZ. -]+Z$/, t.n);
  }
  const main = new Set(municipalities);
  for (const t of geometry.inset.towns) assert.ok(main.has(t.n), `${t.n} is in the inset but not the main map`);
});
