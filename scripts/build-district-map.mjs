// Builds src/data/area30-map.json, the geometry behind the district map on the Districts page (see docs/DISTRICT-MAP.md).
//
//   node scripts/build-district-map.mjs <towns.geojson> [src/data/area30-map.json]
//
// <towns.geojson> is MassGIS's municipal boundaries (the TOWNS_POLY layer: 351 towns, single-part polygons, longitude and latitude).
// The result holds only geography: each town's outline and the borders between towns, simplified so a border is stored once.
// Which district a town is in is not in it: that comes from src/content/site/district-towns.yml when the page is built.
import fs from 'node:fs';
import { parse } from 'yaml';
import { buildTopology, makeProjection, ringOf } from '../src/lib/map/topology.ts';
import { assignMunicipalities } from '../src/lib/map/assign.ts';

const [, , source, out = 'src/data/area30-map.json'] = process.argv;
if (!source) throw new Error('usage: node scripts/build-district-map.mjs <towns.geojson> [out.json]');

// ---- Read the boundaries: one entry per town (islands are separate polygons of the same town) ------------------------------
const features = JSON.parse(fs.readFileSync(source, 'utf8')).features;
const byName = new Map();
for (const f of features) {
  const name = f.properties.TOWN.toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase());
  const rings = f.geometry.coordinates.map((ring) => ring.slice(0, -1)); // GeoJSON repeats the first point at the end
  byName.set(name, [...(byName.get(name) ?? []), ...rings]);
}
const names = [...byName.keys()].sort();

// ---- Which towns belong on the map ----------------------------------------------------------------------------------------
const districtTowns = parse(fs.readFileSync('src/content/site/district-towns.yml', 'utf8'));
const assigned = assignMunicipalities(districtTowns, names);
const listed = (name) => assigned.get(name).kind !== 'none';

// Area 30's towns the list does not have yet are still part of the map, so there is no hole in it: a town nobody listed is
// included when at least half of its border is shared with towns that are listed. (Area 31, to the west, is not shown.)
const raw = buildTopology(names.map((n) => ({ rings: byName.get(n) })));
const length = (points) => points.reduce((sum, p, i) => (i ? sum + Math.hypot(p[0] - points[i - 1][0], p[1] - points[i - 1][1]) : 0), 0);
const border = new Map(names.map((_, i) => [i, { all: 0, withListed: 0 }]));
for (const arc of raw.arcs) {
  const len = length(arc.points) || 1e-9;
  for (const u of arc.users) {
    border.get(u).all += len;
    if (arc.users.some((v) => v !== u && listed(names[v]))) border.get(u).withListed += len;
  }
}
const included = names.filter((n, i) => listed(n) || border.get(i).withListed / border.get(i).all >= 0.5);
console.log(`towns on the map: ${included.length} (${included.filter(listed).length} with a district, ${included.filter((n) => !listed(n)).length} not in the list yet: ${included.filter((n) => !listed(n)).join(', ')})`);

// ---- Project, cut into shared borders, simplify, and write paths ----------------------------------------------------------
const num = (n) => String(Math.round(n * 10) / 10);
const path = (points, close) => `M${points.map(([x, y]) => `${num(x)} ${num(y)}`).join('L')}${close ? 'Z' : ''}`;

function view(box, width, tolerance, only) {
  const project = makeProjection(box, width);
  const shown = only ? included.filter(only) : included;
  const shapes = shown.map((n) => ({ rings: byName.get(n).map((ring) => ring.map(([lon, lat]) => project(lon, lat))) }));
  const topology = buildTopology(shapes, tolerance);
  const all = shapes.flatMap((s) => s.rings.flat());
  const height = Math.ceil(Math.max(...all.map((p) => p[1])));
  return {
    w: width,
    h: height,
    towns: shown.map((name, i) => ({ n: name, p: topology.rings[i].map((_, r) => path(ringOf(topology, i, r), true)).join('') })),
    arcs: topology.arcs.map((arc) => ({ d: path(arc.points, false), u: arc.users })),
  };
}

const lons = included.flatMap((n) => byName.get(n).flat().map((p) => p[0]));
const lats = included.flatMap((n) => byName.get(n).flat().map((p) => p[1]));
const area = { west: Math.min(...lons), east: Math.max(...lons), south: Math.min(...lats), north: Math.max(...lats) };

// The Boston area, enlarged: its districts are too small to read on the map of the whole area (the Area Handbook's map has the same inset).
const inset = { west: -71.3, east: -70.9, south: 42.2, north: 42.46 };
const touches = (name) => byName.get(name).some((ring) => ring.some(([lon, lat]) => lon >= inset.west && lon <= inset.east && lat >= inset.south && lat <= inset.north));

const result = {
  source: 'MassGIS Municipalities (TOWNS_POLY), 1:25,000. Simplified for display.',
  main: view(area, 1000, 0.6),
  inset: view(inset, 1000, 0.4, touches),
};
fs.writeFileSync(out, JSON.stringify(result));
const kb = (o) => Math.round(JSON.stringify(o).length / 1024);
console.log(`main: ${result.main.towns.length} towns, ${result.main.arcs.length} borders, ${kb(result.main)} KB | inset: ${result.inset.towns.length} towns, ${kb(result.inset)} KB | file: ${Math.round(fs.statSync(out).size / 1024)} KB`);
