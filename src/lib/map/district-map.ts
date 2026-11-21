// What the district map needs, worked out when the site is built: which district each town is in, a colour for each district so
// neighbours differ, and where to put each district's number. The geometry is public/data/area30-map.json (scripts/build-district-map.mjs).
import type { Point } from './topology.ts';
import { assignMunicipalities, type Assignment } from './assign.ts';
import { greedyColors, visualCenterAndRadius } from './layout.ts';

export interface MapView {
  w: number;
  h: number;
  towns: { n: string; p: string }[]; // p: the outline as an SVG path ("M x y L x y ... Z", one subpath per ring)
  arcs: { d: string; u: number[] }[]; // d: a border as an SVG path; u: the towns (indices) on its sides
}

export interface MapGeometry {
  main: MapView;
  inset: MapView;
}

export interface MapData {
  towns: Record<string, Assignment>;
  colors: Record<number, number>; // district number -> colour number
  // Where each district's number goes: x, y and the clear space around it (a small screen leaves out the labels that would not fit).
  labels: { main: Record<number, Label>; inset: Record<number, Label> };
  // Where each town's name goes, for when the map is zoomed in: x, y and the clear space around it, by town name.
  names: { main: Record<string, Label>; inset: Record<string, Label> };
}

export type Label = [x: number, y: number, radius: number];

/** The colours the districts are shared among. */
export const COLOURS = 5;
/** The grid a town's name position is searched on: coarser than for a district, as there are many more towns. */
const NAME_GRID = 24;
/** A district whose number would not fit (its widest clear space is narrower than this, in map units) goes without one. */
export const MIN_LABEL_RADIUS = 9;

/** Reads back a path written by the build: "M x y L x y ... Z" with one M per ring. */
export function parsePath(d: string): Point[][] {
  return d
    .split('M')
    .filter(Boolean)
    .map((sub) => sub.replace('Z', '').split('L').map((pt) => pt.split(' ').map(Number) as Point));
}

const round1 = (n: number): number => Math.round(n * 10) / 10;

export function buildMapData(geometry: MapGeometry, byDistrict: Record<string, string[]>): MapData {
  const towns = assignMunicipalities(byDistrict, geometry.main.towns.map((t) => t.n));
  const regionOf = (view: MapView, index: number): number | 'split' | 'none' => {
    const a = towns.get(view.towns[index].n)!;
    return a.kind === 'solid' ? a.district : a.kind === 'split' ? 'split' : 'none';
  };

  // Colours are shared out on the whole map: districts that touch anywhere get different ones.
  const neighbours = new Map<number, number[]>();
  for (const t of towns.values()) if (t.kind === 'solid') neighbours.set(t.district, neighbours.get(t.district) ?? []);
  for (const arc of geometry.main.arcs) {
    if (arc.u.length !== 2) continue;
    const [a, b] = arc.u.map((i) => regionOf(geometry.main, i));
    if (typeof a === 'number' && typeof b === 'number' && a !== b) {
      neighbours.set(a, [...new Set([...neighbours.get(a)!, b])]);
      neighbours.set(b, [...new Set([...neighbours.get(b)!, a])]);
    }
  }
  const colors = Object.fromEntries(greedyColors(neighbours, COLOURS));

  const labelsFor = (view: MapView): Record<number, Label> => {
    const labels: Record<number, Label> = {};
    for (const district of neighbours.keys()) {
      const mine = view.towns.map((_, i) => i).filter((i) => regionOf(view, i) === district);
      if (!mine.length) continue;
      // The district's outline: borders with other districts, the coast and the edge of the map, but not borders between its own towns.
      const edges = view.arcs
        .filter((a) => a.u.some((i) => regionOf(view, i) === district) && (a.u.length === 1 || regionOf(view, a.u[0]) !== regionOf(view, a.u[1])))
        .flatMap((a) => parsePath(a.d));
      const { point, radius } = visualCenterAndRadius(mine.flatMap((i) => parsePath(view.towns[i].p)), edges);
      if (radius >= MIN_LABEL_RADIUS) labels[district] = [round1(point[0]), round1(point[1]), round1(radius)];
    }
    return labels;
  };

  const namesFor = (view: MapView): Record<string, Label> =>
    Object.fromEntries(
      view.towns.map((t) => {
        const { point, radius } = visualCenterAndRadius(parsePath(t.p), undefined, NAME_GRID);
        return [t.n, [round1(point[0]), round1(point[1]), round1(radius)] as Label];
      }),
    );

  return {
    towns: Object.fromEntries(towns),
    colors,
    labels: { main: labelsFor(geometry.main), inset: labelsFor(geometry.inset) },
    names: { main: namesFor(geometry.main), inset: namesFor(geometry.inset) },
  };
}
