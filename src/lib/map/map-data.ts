// The district map's data, worked out once per site build from the geometry (src/data/area30-map.json) and the districts' towns.
import geometry from '../../data/area30-map.json';
import { districtTownLists } from '../district-towns';
import { buildMapData, type MapGeometry } from './district-map';

export const mapData = buildMapData(geometry as MapGeometry, districtTownLists);

/** Width over height of each view, so the page can hold the right amount of space before the map has loaded (no jump when it appears). */
export const mapRatios = {
  main: geometry.main.w / geometry.main.h,
  inset: geometry.inset.w / geometry.inset.h,
};
