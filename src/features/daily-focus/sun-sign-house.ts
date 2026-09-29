// Sun-sign houses (founder, 2026-09-27): for someone who doesn't know her birth
// time. With no Rising sign her real houses can't be worked out, so her Sun
// sign counts as her 1st house, the next sign as her 2nd, and so on round the
// zodiac — the long-established "solar houses" technique that sun-sign
// horoscopes use. Today's Moon sign then lands in one of those houses.
//
// Only used when her Sun sign is certain (see the reduced chart's
// sun.reliable). Nothing here is guessed.

import { SIGNS, type Sign } from "@/features/onboarding";

// Which of her Sun-sign houses (1 to 12) a sign is: her Sun sign itself is 1.
export function sunSignHouse(sign: Sign, sunSign: Sign): number {
  const from = SIGNS.indexOf(sunSign);
  const to = SIGNS.indexOf(sign);
  if (from < 0 || to < 0) throw new Error("Not a zodiac sign");
  return ((to - from + 12) % 12) + 1;
}

// The other way round, for explaining a card afterwards: her Sun sign, from
// the sign the Moon was in and the house that made.
export function sunSignFromHouse(sign: Sign, house: number): Sign {
  const to = SIGNS.indexOf(sign);
  if (to < 0 || !Number.isInteger(house) || house < 1 || house > 12) {
    throw new Error("Not a usable sign and house");
  }
  return SIGNS[(to - (house - 1) + 12) % 12];
}
