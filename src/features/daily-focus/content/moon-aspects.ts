// How to approach today, from the Moon's angle to one of her seven natal
// planets. This is what changes day to day even while the house (the broad area
// of life) stays the same for two or three days, so the card never repeats
// itself the way a single fixed line would.
//
// One sentence for each of the 7 natal planets x the 5 angles (35 in total). It
// follows the day's house statement, so together they read as two sentences:
// "[what's in focus]. [how to approach it today]."
//
// Rules, as in houses.ts and moon-modifiers.ts:
//   - Warm, direct, aspirational, manifestation words lightly, no promises.
//   - No astrology words: the sentence never names the planet or the angle.
//   - One sentence, starts with a capital, ends with a full stop.
//   - Advice for TODAY, not a description of her personality (that is what the
//     Moon-sign modifier is for, kept for later use but not in the default card).

// The seven natal points a daily Moon angle is measured against. Her Rising is
// not a planet, so it is left out here (unlike aspects.ts, which is a general
// tool and keeps it).
export const ASPECT_PLANETS = [
  "sun",
  "moon",
  "mercury",
  "venus",
  "mars",
  "jupiter",
  "saturn",
] as const;

export type AspectPlanet = (typeof ASPECT_PLANETS)[number];

export const ASPECT_NAMES = [
  "conjunction",
  "sextile",
  "square",
  "trine",
  "opposition",
] as const;

export type AspectName = (typeof ASPECT_NAMES)[number];

export const MOON_ASPECT_LINES: Record<AspectPlanet, Record<AspectName, string>> = {
  sun: {
    conjunction: "Today puts a spotlight on you, so let yourself be seen rather than shrinking back.",
    sextile: "A small opportunity to be more visible is easy to take today, if you reach for it.",
    square: "You may feel pulled between what you want and what is expected of you, so choose you.",
    trine: "Confidence comes easily today, so let it carry you rather than second-guessing it.",
    opposition: "Someone else is in the spotlight today too, so look for where you can meet in the middle.",
  },
  moon: {
    conjunction: "Your feelings are close to the surface today, so give them room instead of pushing them down.",
    sextile: "A gentle mood today makes it easy to notice what you actually need.",
    square: "Your feelings and your plans may pull in different directions today, so be patient with yourself.",
    trine: "You are in step with yourself today, so trust what feels right.",
    opposition: "What you need and what others need may not match today, so name what you need first.",
  },
  mercury: {
    conjunction: "Your mind is busy today, so put the loudest thought into words before it crowds out the rest.",
    sextile: "A conversation or an idea comes easily today, so follow it.",
    square: "Your thoughts may feel tangled today, so write them down instead of trying to hold them all at once.",
    trine: "Thinking and talking things through come easily today, so use it.",
    opposition: "A different point of view is worth hearing today, even if it is not the one you expected.",
  },
  venus: {
    conjunction: "What you value is close to the surface today, so notice what actually feels good.",
    sextile: "Connection or ease comes easily today, so let yourself enjoy it.",
    square: "What you want and what feels comfortable may not agree today, so choose deliberately.",
    trine: "Relationships and small pleasures flow easily today, so make room for them.",
    opposition: "Someone else's wants may sit against your own today, so look for where you can both be satisfied.",
  },
  mars: {
    conjunction: "Your drive is strong today, so point it at something that matters instead of everything at once.",
    sextile: "A small window to act opens easily today, so take it rather than waiting.",
    square: "Effort may meet resistance today, so expect it to take work rather than reading that as a reason to stop.",
    trine: "Action comes easily today, so trust the momentum instead of overthinking it.",
    opposition: "You and someone else may both be pushing today, so choose whether this is worth the friction.",
  },
  jupiter: {
    conjunction: "Today feels bigger than usual, so aim it at something worth growing.",
    sextile: "A chance to grow or expand something is easy to take today.",
    square: "You may be tempted to take on more than is sensible today, so pick one thing.",
    trine: "Growth and good timing line up today, so say yes to what moves you forward.",
    opposition: "You may be weighing more freedom against a commitment today, so decide what you are choosing.",
  },
  saturn: {
    conjunction: "Today asks for a little more responsibility, so let structure help rather than weigh you down.",
    sextile: "A steady, practical step is easy to take today.",
    square: "Progress may feel slower today, so focus on showing up rather than chasing quick wins.",
    trine: "Discipline comes easily today, so use it to build something that lasts.",
    opposition: "Freedom and responsibility may be pulling at each other today, so find the middle ground.",
  },
};

export function moonAspectLine(planet: AspectPlanet, aspect: AspectName): string {
  return MOON_ASPECT_LINES[planet][aspect];
}
