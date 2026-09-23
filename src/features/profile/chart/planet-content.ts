// Labels for full planet/point headings, and the general "what is this"
// definitions shown behind each point's info button. The specific,
// sign-matched content for planets and points lives elsewhere: planets in
// planet-sign-content.ts, points in point-sign-content.ts + point-house-content.ts.
// Aspects use aspect-content.ts's own pair-specific tables. None of those
// reach into this file any more.

import type { FullPlanetName, FullPointName } from "./full-chart";

// A short label for each planet, used in headings ("Mercury in Sagittarius").
export const PLANET_LABEL: Record<FullPlanetName, string> = {
  sun: "Sun",
  moon: "Moon",
  mercury: "Mercury",
  venus: "Venus",
  mars: "Mars",
  jupiter: "Jupiter",
  saturn: "Saturn",
  uranus: "Uranus",
  neptune: "Neptune",
  pluto: "Pluto",
};

export const POINT_LABEL: Record<FullPointName, string> = {
  northnode: "North Node",
  southnode: "South Node",
  lilith: "Lilith",
  chiron: "Chiron",
};

// What each point IS, in general — behind the ⓘ button next to its name, kept
// separate from her actual, sign-matched reading (point-sign-content.ts) so
// the card itself never has to repeat this explanation. Written to avoid
// assuming trauma, a "wound" that needs healing, or a fixed destiny.
export const POINT_DEFINITION: Record<FullPointName, string> = {
  northnode:
    "The North Node marks a direction of growth in your chart — qualities that can feel unfamiliar at first because they're less practised, not because they're wrong for you.",
  southnode:
    "The South Node marks what already comes naturally to you — real strengths, but ones that can turn into default patterns you lean on more than you need to.",
  lilith:
    "Lilith marks a part of you that resists shrinking, apologising or being made smaller — often the part that's hardest to express freely.",
  chiron:
    "Chiron marks an area of real sensitivity — something that's affected you more than it might affect someone else, and that you tend to understand more deeply the longer you live with it.",
};
