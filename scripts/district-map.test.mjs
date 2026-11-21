// node --test scripts/district-map.test.mjs : the geometry behind the district map (src/lib/map/).
import test from 'node:test';
import assert from 'node:assert/strict';
import { simplifyLine, buildTopology, ringOf, makeProjection } from '../src/lib/map/topology.ts';
import { greedyColors, visualCenter } from '../src/lib/map/layout.ts';

const sq = (x, y) => [[x, y], [x + 1, y], [x + 1, y + 1], [x, y + 1]]; // a unit square, corner at x,y

test('simplifying drops points on the line and keeps the ends', () => {
  const line = [[0, 0], [1, 0.001], [2, 0], [3, 0.0005], [4, 0]];
  assert.deepEqual(simplifyLine(line, 0.1), [[0, 0], [4, 0]]);
});

test('simplifying keeps a corner that sticks out further than the tolerance', () => {
  const line = [[0, 0], [2, 3], [4, 0]];
  assert.deepEqual(simplifyLine(line, 0.5), line);
  assert.deepEqual(simplifyLine(line, 5), [[0, 0], [4, 0]]);
});

test('a line of two points is left alone', () => {
  assert.deepEqual(simplifyLine([[0, 0], [1, 1]], 10), [[0, 0], [1, 1]]);
});

test('two squares sharing an edge make three arcs, one of them used by both', () => {
  const topo = buildTopology([{ rings: [sq(0, 0)] }, { rings: [sq(1, 0)] }]);
  assert.equal(topo.arcs.length, 3);
  const shared = topo.arcs.filter((a) => a.users.length === 2);
  assert.equal(shared.length, 1);
  assert.deepEqual([...shared[0].users].sort(), [0, 1]);
  assert.equal(shared[0].points.length, 2);
});

test('a polygon rebuilt from its arcs has the same corners, in the same order, whichever way an arc was stored', () => {
  const topo = buildTopology([{ rings: [sq(0, 0)] }, { rings: [sq(1, 0)] }]);
  for (const [index, square] of [sq(0, 0), sq(1, 0)].entries()) {
    const rebuilt = ringOf(topo, index, 0);
    assert.equal(rebuilt.length, 4);
    const start = rebuilt.findIndex(([x, y]) => x === square[0][0] && y === square[0][1]);
    const turned = [...rebuilt.slice(start), ...rebuilt.slice(0, start)];
    assert.deepEqual(turned, square);
  }
});

test('a polygon alone is one closed arc', () => {
  const topo = buildTopology([{ rings: [sq(0, 0)] }]);
  assert.equal(topo.arcs.length, 1);
  assert.deepEqual(topo.arcs[0].users, [0]);
});

test('a town inside another (a hole) shares its whole ring with the outer town', () => {
  const outer = [[0, 0], [10, 0], [10, 10], [0, 10]];
  const hole = [[4, 4], [4, 6], [6, 6], [6, 4]]; // wound the other way, as holes are
  const inner = [[4, 4], [6, 4], [6, 6], [4, 6]];
  const topo = buildTopology([{ rings: [outer, hole] }, { rings: [inner] }]);
  const shared = topo.arcs.filter((a) => a.users.length === 2);
  assert.equal(shared.length, 1);
  assert.equal(ringOf(topo, 1, 0).length, 4);
});

test('simplifying an arc once simplifies the border for both towns', () => {
  const left = [[0, 0], [1, 0], [1, 1], [1, 2], [1, 3], [0, 3]];
  const right = [[1, 0], [2, 0], [2, 3], [1, 3], [1, 2], [1, 1]];
  const topo = buildTopology([{ rings: [left] }, { rings: [right] }], 0.1);
  const a = ringOf(topo, 0, 0).filter(([x]) => x === 1);
  const b = ringOf(topo, 1, 0).filter(([x]) => x === 1);
  assert.deepEqual(a.map(([, y]) => y).sort(), b.map(([, y]) => y).sort());
  assert.ok(a.length < 4, 'the straight border lost its middle points');
});

test('the projection puts the north-west corner at the origin and scales with the width', () => {
  const p = makeProjection({ west: -72, east: -70, south: 41, north: 43 }, 1000);
  assert.deepEqual(p(-72, 43), [0, 0]);
  const [x] = p(-70, 43);
  assert.ok(Math.abs(x - 1000) < 1e-9, `${x}`);
  const [, y] = p(-72, 41);
  assert.ok(y > 0);
});

test('adjacent districts never get the same colour', () => {
  const adjacent = new Map([[1, [2, 3]], [2, [1, 3]], [3, [1, 2, 4]], [4, [3]]]);
  const colors = greedyColors(adjacent, 5);
  for (const [d, ns] of adjacent) for (const n of ns) assert.notEqual(colors.get(d), colors.get(n), `${d} and ${n}`);
});

test('a district with more neighbours than colours is an error, not a quiet clash', () => {
  const adjacent = new Map([[1, [2, 3, 4]], [2, [1, 3, 4]], [3, [1, 2, 4]], [4, [1, 2, 3]]]);
  assert.throws(() => greedyColors(adjacent, 3), /colours/);
});

test('the visual centre of a square is its middle', () => {
  const [x, y] = visualCenter([[[0, 0], [10, 0], [10, 10], [0, 10]]]);
  assert.ok(Math.abs(x - 5) < 1 && Math.abs(y - 5) < 1, `${x},${y}`);
});

test('the visual centre of a C shape is inside the C, not in its mouth', () => {
  const c = [[0, 0], [10, 0], [10, 3], [3, 3], [3, 7], [10, 7], [10, 10], [0, 10]];
  const [x, y] = visualCenter([c]);
  const inside = x >= 0 && x <= 3 && y >= 0 && y <= 10 || (y <= 3 || y >= 7) && x >= 0 && x <= 10;
  assert.ok(inside, `${x},${y}`);
});
