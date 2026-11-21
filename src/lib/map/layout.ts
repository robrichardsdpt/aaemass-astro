// Laying out the district map: colouring districts so neighbours differ, and finding a good spot for each district's number.
// Plain logic with no page in it.
import type { Point } from './topology';

/**
 * Gives every district one of `colours` colours so that no two neighbouring districts share one. Districts with the most
 * neighbours are coloured first. If a district has neighbours using every colour, that is an error rather than a quiet clash.
 */
export function greedyColors(neighbours: Map<number, number[]>, colours: number): Map<number, number> {
  const order = [...neighbours.keys()].sort((a, b) => neighbours.get(b)!.length - neighbours.get(a)!.length || a - b);
  const chosen = new Map<number, number>();
  for (const district of order) {
    const taken = new Set(neighbours.get(district)!.map((n) => chosen.get(n)));
    const colour = Array.from({ length: colours }, (_, i) => i).find((c) => !taken.has(c));
    if (colour === undefined) throw new Error(`district ${district} touches districts using all ${colours} colours: add a colour`);
    chosen.set(district, colour);
  }
  return chosen;
}

function inside([x, y]: Point, rings: Point[][]): boolean {
  let hit = false;
  for (const ring of rings) {
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i];
      const [xj, yj] = ring[j];
      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
    }
  }
  return hit;
}

// Distance from a point to the nearest edge. `rings` are closed shapes; `lines` (when given) are open polylines and are used instead.
function edgeDistance([px, py]: Point, rings: Point[][], lines?: Point[][]): number {
  let best = Infinity;
  const shapes = lines ?? rings;
  for (const ring of shapes) {
    for (let i = lines ? 1 : 0, j = lines ? 0 : ring.length - 1; i < ring.length; j = i++) {
      const [ax, ay] = ring[j];
      const [bx, by] = ring[i];
      const dx = bx - ax;
      const dy = by - ay;
      const length2 = dx * dx + dy * dy;
      const t = length2 === 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / length2));
      best = Math.min(best, Math.hypot(px - (ax + t * dx), py - (ay + t * dy)));
    }
  }
  return best;
}

/**
 * The point inside a shape that is furthest from its edges, and how far that is: a better place for a label than the middle,
 * which for a curved shape can fall outside it. `rings` make up the shape (towns side by side may overlap their borders);
 * `edges`, when given, are the lines that count as its outline (so the borders between its own towns are ignored).
 * Samples a grid over the shape. In a long shape many points are about equally far from the edges, so the answer is the one of
 * those closest to their average, which puts the label in the middle of the long part rather than at one end.
 */
export function visualCenterAndRadius(rings: Point[][], edges?: Point[][], grid = 50): { point: Point; radius: number } {
  const xs = rings.flat().map((p) => p[0]);
  const ys = rings.flat().map((p) => p[1]);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const samples: { p: Point; d: number }[] = [];
  for (let i = 0; i <= grid; i++) {
    for (let j = 0; j <= grid; j++) {
      const p: Point = [x0 + ((x1 - x0) * i) / grid, y0 + ((y1 - y0) * j) / grid];
      if (inside(p, rings)) samples.push({ p, d: edgeDistance(p, rings, edges) });
    }
  }
  if (!samples.length) return { point: [(x0 + x1) / 2, (y0 + y1) / 2], radius: 0 };
  const radius = Math.max(...samples.map((s) => s.d));
  const near = samples.filter((s) => s.d >= radius * 0.9);
  const mean: Point = [near.reduce((s, n) => s + n.p[0], 0) / near.length, near.reduce((s, n) => s + n.p[1], 0) / near.length];
  const point = near.reduce((a, b) => (Math.hypot(b.p[0] - mean[0], b.p[1] - mean[1]) < Math.hypot(a.p[0] - mean[0], a.p[1] - mean[1]) ? b : a)).p;
  return { point, radius };
}

/** The point inside a shape that is furthest from its edges (see `visualCenterAndRadius`). */
export const visualCenter = (rings: Point[][], edges?: Point[][]): Point => visualCenterAndRadius(rings, edges).point;
