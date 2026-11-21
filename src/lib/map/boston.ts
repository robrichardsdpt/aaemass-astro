/**
 * The Boston neighbourhoods each district covers, from the district town lists, the Area Handbook and the groups' meeting
 * addresses. Districts 12 and 13 work as one (the same neighbourhoods and the same churches belong to both), so they are listed once, under 12.
 */
export const BOSTON_NEIGHBORHOODS: Record<number, string[]> = {
  10: ['Jamaica Plain', 'Roslindale', 'West Roxbury', 'Hyde Park'],
  11: ['Dorchester', 'South Boston', 'Mattapan'],
  12: ['Back Bay', 'Beacon Hill', 'Fenway', 'Mission Hill', 'Roxbury', 'Charlestown', 'South End', 'North End', 'Downtown'],
  14: ['Allston', 'Brighton'],
  17: ['East Boston'],
};
