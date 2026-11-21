// node --test scripts/district-map-data.test.mjs : turning the map's geometry and the districts' town lists into what the page shows.
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildMapData, parsePath } from '../src/lib/map/district-map.ts';
import { visualCenter } from '../src/lib/map/layout.ts';

// Three towns in a triangle of neighbours, plus one nobody has listed. Alpha and Beta are side by side, Gamma is under both.
const view = {
  w: 100,
  h: 100,
  towns: [
    { n: 'Alpha', p: 'M0 0L40 0L40 40L0 40Z' },
    { n: 'Beta', p: 'M40 0L80 0L80 40L40 40Z' },
    { n: 'Gamma', p: 'M0 40L80 40L80 80L0 80Z' },
    { n: 'Delta', p: 'M80 0L100 0L100 80L80 80Z' },
  ],
  arcs: [
    { d: 'M40 0L40 40', u: [0, 1] },
    { d: 'M0 40L40 40', u: [0, 2] },
    { d: 'M40 40L80 40', u: [1, 2] },
    { d: 'M80 0L80 40', u: [1, 3] },
    { d: 'M80 40L80 80', u: [2, 3] },
    { d: 'M0 40L0 0L40 0', u: [0] },
    { d: 'M40 0L80 0', u: [1] },
    { d: 'M0 40L0 80L80 80', u: [2] },
    { d: 'M80 0L100 0L100 80L80 80', u: [3] },
  ],
};
const geometry = { main: view, inset: { ...view, towns: view.towns.slice(0, 2), arcs: [{ d: 'M40 0L40 40', u: [0, 1] }] } };
const lists = { 1: ['Alpha'], 2: ['Beta'], 3: ['Gamma'] };

test('a path written by the build is read back as its rings of points', () => {
  assert.deepEqual(parsePath('M0 0L40 0L40 40Z'), [[[0, 0], [40, 0], [40, 40]]]);
  assert.deepEqual(parsePath('M0 0L1 0L1 1ZM5 5L6 5L6 6Z').length, 2);
  assert.deepEqual(parsePath('M0 40L0 0L40 0'), [[[0, 40], [0, 0], [40, 0]]]);
});

test('each town is told its district; a town nobody lists has none', () => {
  const data = buildMapData(geometry, lists);
  assert.deepEqual(data.towns.Alpha, { kind: 'solid', district: 1, alsoIn: [] });
  assert.deepEqual(data.towns.Delta, { kind: 'none' });
});

test('neighbouring districts get different colours', () => {
  const { colors } = buildMapData(geometry, lists);
  assert.equal(new Set([colors[1], colors[2], colors[3]]).size, 3);
});

test('a district number sits inside its district', () => {
  const { labels } = buildMapData(geometry, lists);
  const [x, y] = labels.main[1];
  assert.ok(x > 0 && x < 40 && y > 0 && y < 40, `${x},${y}`);
  const [gx, gy] = labels.main[3];
  assert.ok(gx > 0 && gx < 80 && gy > 40 && gy < 80, `${gx},${gy}`);
});

test('each label says how much clear space there is around it, so a small screen can leave out the ones that would not fit', () => {
  const { labels } = buildMapData(geometry, lists);
  const [, , radius] = labels.main[3];
  assert.ok(radius > 10 && radius <= 40, `${radius}`);
  assert.ok(labels.main[1][2] > 9);
});

test('every town gets a spot for its name, with the clear space around it, inside the town', () => {
  const { names } = buildMapData(geometry, lists);
  const [x, y, radius] = names.main.Alpha;
  assert.ok(x > 0 && x < 40 && y > 0 && y < 40 && radius > 5, `${x},${y},${radius}`);
  assert.deepEqual(Object.keys(names.main).sort(), ['Alpha', 'Beta', 'Delta', 'Gamma']);
  assert.deepEqual(Object.keys(names.inset).sort(), ['Alpha', 'Beta']);
});

test('a district too small to carry its number is left without one', () => {
  const tiny = { ...view, towns: [{ n: 'Alpha', p: 'M0 0L2 0L2 2L0 2Z' }, view.towns[1]], arcs: [{ d: 'M2 0L2 2', u: [0] }, { d: 'M40 0L80 0L80 40L40 40Z', u: [1] }] };
  const { labels } = buildMapData({ main: tiny, inset: geometry.inset }, { 1: ['Alpha'], 2: ['Beta'] });
  assert.equal(labels.main[1], undefined);
  assert.ok(labels.main[2]);
});

test('the label of a district is placed away from the borders between its own towns', () => {
  const two = { ...view, towns: view.towns.slice(0, 2), arcs: [{ d: 'M40 0L40 40', u: [0, 1] }, { d: 'M0 40L0 0L80 0L80 40L0 40', u: [0] }] };
  const { labels } = buildMapData({ main: two, inset: geometry.inset }, { 1: ['Alpha', 'Beta'] });
  const [x] = labels.main[1];
  assert.ok(x > 30 && x < 50, `${x}: the middle of the two towns together, not the middle of one`);
});

test('the visual centre can be told which edges count, so an inner border does not push the label away', () => {
  const left = [[0, 0], [10, 0], [10, 10], [0, 10]];
  const right = [[10, 0], [20, 0], [20, 10], [10, 10]];
  const outline = [[0, 0], [20, 0], [20, 10], [0, 10], [0, 0]];
  const [x] = visualCenter([left, right], [outline]);
  assert.ok(x > 8 && x < 12, `${x}`);
});
