// Transits: where the planets are on a given day, and where that falls on her
// own chart. Pure calculation, using the same library as her birth chart. No
// screens, no database, no outside service.
//
//   transits.ts   where the planets are at a moment (positions, retrograde or not).
//                 The same for everyone, wherever they are
//   houses.ts     which of HER 12 houses a position falls in
//   aspects.ts    the angles between today's planets and her birth planets
//   for-chart.ts  the two together: today's planets on her chart
//
// Nothing here decides what a day's focus IS. That is a product choice (which
// planets count, what time of day "today" means, how close an angle has to be)
// still to be made. This gives the facts it will be built from.
export {
  calculateTransits,
  TRANSIT_PLANETS,
  type TransitPlanet,
  type TransitPosition,
  type Transits,
} from "./transits";
export { houseOf, houseStarts, longitudeOf } from "./houses";
export {
  DEFAULT_ORB,
  findAspects,
  type AspectName,
  type NatalPoint,
  type TransitAspect,
} from "./aspects";
export {
  calculateTransitsForChart,
  transitsForChart,
  type TransitInHouse,
  type TransitsForChart,
} from "./for-chart";
