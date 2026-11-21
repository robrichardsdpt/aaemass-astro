# The district map

`/districts/map/` (and `/es/distritos/mapa/`, `/fr/districts/carte/`) shows Area 30 as a map of its towns, coloured by district.
Choosing a town, or a district from the "Jump to a district" list, shows that district's meeting time and place in a panel,
with links to directions, Zoom and the district's full card on the Districts page. On phones there are zoom buttons, and the
town names appear on the map as you zoom in.

## Where the pieces come from

| What | Where |
| --- | --- |
| Town outlines | MassGIS "Massachusetts Municipalities" (TOWNS_POLY), turned into `src/data/area30-map.json` |
| Which town is in which district | `src/content/site/district-towns.yml` (the same file as the "Find your district by town" box) |
| Meeting time, place, Zoom | the district cards: `src/content/districts/*.yml` |
| District region names ("East Cape Cod") | the Area Handbook (Jan 2022), page 5 |

Nothing is edited on the map itself. Change a town's district in `district-towns.yml`, or a meeting in the CMS, and the map
page follows on the next build. The colours, the number positions and the town-name positions are worked out at build time
(`src/lib/map/`), about 5 seconds of the build, once, not per page.

## Regenerating the town outlines

Only needed if the town boundaries change (rare). Download the MassGIS towns as GeoJSON, then:

```
node scripts/build-district-map.mjs <towns.geojson> src/data/area30-map.json
```

The script keeps the towns that are in a district (plus any town that is more than half surrounded by listed towns),
simplifies the borders (borders shared by two towns are stored once, so neighbours never leave gaps) and writes the main map and
an enlarged Boston inset. The file is about 346 KB, 126 KB over the wire, fetched only when the map is about to scroll
into view.

**Licence.** MassGIS data is public. As of this writing the MassGIS page does not state a licence, so confirm that it can be
used here before launch (a one-line email to MassGIS is enough) and record the answer in this file. The credit line on the
page ("Town boundaries: MassGIS") is already shown.

## What the map does not show

- **Towns, not neighbourhoods.** Boston is hatched: its districts (10, 11, 12, 13, 14 and 17) cover neighbourhoods, which the
  town outlines do not have. Choosing Boston offers each of its districts. Districts 11, 12 and 13 have no territory of their
  own on the map, but the "Jump to a district" list reaches them and highlights Boston.
- **Area 31 and anything outside Area 30.**
- **District 27**, the Spanish-language district. It is not tied to a place. It is not on the map and has no entry in the list.
- **Three towns nobody has listed yet**: Brookfield, Carlisle and Wenham. They are grey, and the page says so. Add them to a
  district in `district-towns.yml` and they take that district's colour. A test (`scripts/district-map-geometry.test.mjs`) pins
  the list, so adding one means updating the test too.
- **Villages.** A village that is listed (Hyannis, Dorchester, ...) stands for its town through the table in
  `src/lib/map/assign.ts`. A new village name in `district-towns.yml` must be added there, or the same test fails and names it.

## Compared with the Area Handbook map (page 5)

The handbook's map is a hand-drawn outline of the same area. Ours is geographic, so shapes differ, but the arrangement
agrees: 26, 25, 24, 21 and 20 across the west and north; 19, 18, 17, 22, 23, 10, 9, 8, 7, 6, 5, 4 and 3 through the middle and
south; the Cape as 2 and 1; the islands in 2; and the Boston districts as an enlarged inset rather than on the main map.
District names in the legend and panel are the handbook's region names.

## Tests

- `scripts/district-map.test.mjs`: the drawing maths (shared borders, simplifying, projection, colours, label positions).
- `scripts/district-map-assign.test.mjs`: which district each town belongs to (villages, Boston, the islands).
- `scripts/district-map-data.test.mjs`: the data the page is built from (colours, number and town-name positions).
- `scripts/district-map-geometry.test.mjs`: the real town list and the real outlines agree.
