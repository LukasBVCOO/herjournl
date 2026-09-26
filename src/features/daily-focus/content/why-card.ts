// "Why this card?" — the short, plain-words explanation at the bottom of the
// daily focus card (why-card-pill.tsx). Built only from what the card itself
// already stores, so it always tells the truth about how the card was chosen:
//
//   where today's Moon is (its sign, and for a full chart her house)  -> WHY this area
//   the Moon's closest angle to one of her birth planets              -> WHY this approach
//
// Real astrology words are used once each, with their meaning right beside
// them, so she learns the terms without needing to know them already.

import { SIGNS } from "@/features/onboarding";
import type { AspectName, AspectPlanet } from "./moon-aspects";
import type { DailyFocusCard } from "../types";

const PLANET_NAME: Record<AspectPlanet, string> = {
  sun: "Sun",
  moon: "Moon",
  mercury: "Mercury",
  venus: "Venus",
  mars: "Mars",
  jupiter: "Jupiter",
  saturn: "Saturn",
};

// What each birth planet stands for, in a few everyday words.
const PLANET_THEME: Record<AspectPlanet, string> = {
  sun: "your sense of self",
  moon: "your emotions",
  mercury: "how you think and speak",
  venus: "love, beauty and what you value",
  mars: "your drive and energy",
  jupiter: "growth and opportunity",
  saturn: "discipline and your long-term goals",
};

// How the Moon is meeting that planet today, and what that means for her.
const ASPECT_LINE: Record<AspectName, (planet: string, theme: string) => string> = {
  conjunction: (p, t) => `It's also sitting right beside your birth ${p}, so ${t} feels louder than usual.`,
  sextile: (p, t) => `It's also in a helpful angle to your birth ${p}, opening small, easy chances around ${t}.`,
  trine: (p, t) => `It's also flowing easily with your birth ${p}, so ${t} is on your side today.`,
  square: (p, t) => `It's also in a tense angle to your birth ${p}, so expect a little friction around ${t}. Use it as a push to act.`,
  opposition: (p, t) => `It's also opposite your birth ${p}, so you may feel pulled between today's focus and ${t}.`,
};

function ordinal(n: number) {
  return `${n}${n === 1 ? "st" : n === 2 ? "nd" : n === 3 ? "rd" : "th"}`;
}

function moonSign(longitude: number) {
  const index = Math.floor((((longitude % 360) + 360) % 360) / 30);
  return SIGNS[index];
}

export type WhyThisCard = {
  // The short text on the pill itself, like "Moon · 10th house".
  pill: string;
  // One to three short sentences, shown when she taps the pill.
  lines: string[];
};

export function whyThisCard(card: DailyFocusCard): WhyThisCard {
  const sign = moonSign(card.moonLongitude);
  const lines: string[] = [];
  let pill: string;

  if (card.activeHouse) {
    pill = `Moon · ${ordinal(card.activeHouse)} house`;
    lines.push(
      `Today the Moon is in ${sign}, passing through your ${ordinal(card.activeHouse)} house, the part of your chart about ${card.label.toLowerCase()}. That's why today's focus is here.`,
    );
  } else {
    pill = `Moon in ${sign}`;
    lines.push(
      `Today the Moon is in ${sign}. Without your birth time we can't place it in your chart, so today's focus follows the Moon's sign.`,
    );
  }

  if (card.moonAspectPlanet && card.moonAspectName) {
    const line = ASPECT_LINE[card.moonAspectName];
    lines.push(line(PLANET_NAME[card.moonAspectPlanet], PLANET_THEME[card.moonAspectPlanet]));
  }

  return { pill, lines };
}
