// Placing a planet into one of HER houses. Her chart saves where each of her 12
// houses begins as a sign and a degree; this turns those back into positions
// around the circle and finds which two starts a planet falls between.

import { SIGNS, type Chart, type Sign } from "@/features/onboarding";

// A sign and a degree into it, as saved in her chart, as a position around the
// whole circle (0 to 360, starting at 0 degrees Aries).
export function longitudeOf(position: { sign: Sign; degree: number }) {
  return SIGNS.indexOf(position.sign) * 30 + position.degree;
}

// Where each of her 12 houses begins, in order. Rounding to two decimals when
// the chart was saved costs less than 0.005 of a degree.
export function houseStarts(chart: Chart) {
  return Array.from({ length: 12 }, (_, index) =>
    longitudeOf(chart.houseCusps[String(index + 1)]),
  );
}

// Which house (1 to 12) a position falls in. A house runs from its own start to
// the next house's start, and one of them always crosses 0 degrees Aries, which
// is why every distance is measured going round the circle.
export function houseOf(longitude: number, starts: number[]) {
  for (let index = 0; index < 12; index++) {
    const start = starts[index];
    const next = starts[(index + 1) % 12];
    const width = (next - start + 360) % 360;
    const into = (longitude - start + 360) % 360;
    if (into < width) return index + 1;
  }
  throw new Error("No house found for that position");
}
