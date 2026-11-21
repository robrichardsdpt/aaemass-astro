// Map geometry for the district map: projecting longitude and latitude, simplifying lines, and cutting town outlines into the
// borders they share. A border between two towns is stored once and simplified once, so both towns still fit together exactly
// (the same idea as TopoJSON, without the library). Plain logic with no page in it. Used by scripts/build-district-map.mjs.

export type Point = [number, number];

export interface Box {
  west: number;
  east: number;
  south: number;
  north: number;
}

/** Longitude and latitude to flat map units: the north-west corner is 0,0 and east-west is `width` units wide. */
export function makeProjection(box: Box, width: number): (lon: number, lat: number) => Point {
  const lat0 = ((box.north + box.south) / 2) * (Math.PI / 180);
  const scale = width / ((box.east - box.west) * Math.cos(lat0));
  return (lon, lat) => [(lon - box.west) * Math.cos(lat0) * scale, (box.north - lat) * scale];
}

function distanceToSegment([px, py]: Point, [ax, ay]: Point, [bx, by]: Point): number {
  const dx = bx - ax;
  const dy = by - ay;
  const length2 = dx * dx + dy * dy;
  const t = length2 === 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / length2));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

/** Douglas-Peucker: drops points that lie within `tolerance` of the line between the points kept. The ends are always kept. */
export function simplifyLine(line: Point[], tolerance: number): Point[] {
  if (line.length <= 2) return line;
  const keep = new Array<boolean>(line.length).fill(false);
  keep[0] = keep[line.length - 1] = true;
  const stack: [number, number][] = [[0, line.length - 1]];
  while (stack.length) {
    const [from, to] = stack.pop()!;
    let far = -1;
    let farDistance = tolerance;
    for (let i = from + 1; i < to; i++) {
      const d = distanceToSegment(line[i], line[from], line[to]);
      if (d > farDistance) {
        far = i;
        farDistance = d;
      }
    }
    if (far >= 0) {
      keep[far] = true;
      stack.push([from, far], [far, to]);
    }
  }
  return line.filter((_, i) => keep[i]);
}

export interface TownShape {
  rings: Point[][]; // the outline first, then any holes; the closing point is not repeated
}

export interface Arc {
  points: Point[]; // the border, simplified; a closed ring starts and ends at the same point
  users: number[]; // the towns (by index) that have this border: one for a coast or the edge of the map, two between towns
}

export interface Topology {
  arcs: Arc[];
  /** For each town, each ring: the arcs that make it up, in order, and whether each is walked backwards. */
  rings: { arc: number; reversed: boolean }[][][];
}

const key = ([x, y]: Point): string => `${x},${y}`;
const edgeKey = (a: Point, b: Point): string => (key(a) < key(b) ? `${key(a)}|${key(b)}` : `${key(b)}|${key(a)}`);

// A border is "the same" however it is walked: from its smaller end to its larger, so two towns sharing it find the same arc.
function canonical(points: Point[]): { points: Point[]; reversed: boolean } {
  const closed = key(points[0]) === key(points[points.length - 1]);
  if (closed && points.length > 2) {
    const ring = points.slice(0, -1);
    let start = 0;
    ring.forEach((p, i) => { if (key(p) < key(ring[start])) start = i; });
    const turned = [...ring.slice(start), ...ring.slice(0, start)];
    const backward = [turned[0], ...turned.slice(1).reverse()];
    const reversed = key(backward[1] ?? backward[0]) < key(turned[1] ?? turned[0]);
    const chosen = reversed ? backward : turned;
    return { points: [...chosen, chosen[0]], reversed };
  }
  const reversed = key(points[0]) > key(points[points.length - 1]);
  return { points: reversed ? [...points].reverse() : points, reversed };
}

/**
 * Cuts the towns' outlines wherever the set of towns sharing the border changes, so each border becomes one arc, then simplifies
 * every arc once. Each town's rings are returned as arcs, so they can be rebuilt with `ringOf`.
 */
export function buildTopology(towns: TownShape[], tolerance = 0): Topology {
  const users = new Map<string, Set<number>>();
  towns.forEach((town, index) => {
    for (const ring of town.rings) {
      for (let i = 0; i < ring.length; i++) {
        const k = edgeKey(ring[i], ring[(i + 1) % ring.length]);
        (users.get(k) ?? users.set(k, new Set()).get(k)!).add(index);
      }
    }
  });
  const signature = (a: Point, b: Point): string => [...users.get(edgeKey(a, b))!].sort((p, q) => p - q).join(',');

  const arcs: Arc[] = [];
  const arcIndex = new Map<string, number>();
  const rings = towns.map((town) =>
    town.rings.map((ring) => {
      const n = ring.length;
      const sigs = ring.map((p, i) => signature(p, ring[(i + 1) % n]));
      let first = sigs.findIndex((s, i) => s !== sigs[(i + n - 1) % n]); // where the sharing changes
      const wholeRing = first === -1;
      if (wholeRing) first = 0;
      const runs: Point[][] = [];
      let run: Point[] = [ring[first]];
      for (let step = 0; step < n; step++) {
        const i = (first + step) % n;
        const next = ring[(i + 1) % n];
        run.push(next);
        if (step === n - 1 || sigs[(i + 1) % n] !== sigs[i]) {
          runs.push(run);
          run = [next];
        }
      }
      return runs.map((points) => {
        const { points: oriented, reversed } = canonical(points);
        const id = oriented.map(key).join(';');
        let index = arcIndex.get(id);
        if (index === undefined) {
          const touching = [...users.get(edgeKey(points[0], points[1]))!].sort((p, q) => p - q);
          index = arcs.push({ points: simplifyLine(oriented, tolerance), users: touching }) - 1;
          arcIndex.set(id, index);
        }
        return { arc: index, reversed };
      });
    }),
  );
  return { arcs, rings };
}

/** One of a town's rings, rebuilt from the (simplified) arcs, in its original direction, without repeating the closing point. */
export function ringOf(topology: Topology, town: number, ring: number): Point[] {
  const out: Point[] = [];
  for (const { arc, reversed } of topology.rings[town][ring]) {
    const points = reversed ? [...topology.arcs[arc].points].reverse() : topology.arcs[arc].points;
    out.push(...(out.length ? points.slice(1) : points));
  }
  if (out.length > 1 && key(out[0]) === key(out[out.length - 1])) out.pop();
  return out;
}
