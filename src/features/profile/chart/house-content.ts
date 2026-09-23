// What each of the 12 houses actually IS — a permanent definition of the area
// of life it covers, scoped to the full birth chart page only. Deliberately
// separate from daily-focus's content/houses.ts: that file's labels and
// statements are written for the daily card ("Today puts the spotlight on
// you...") and for a different audience moment, so a few labels here differ
// on purpose (e.g. house 11 is "Community & Aspirations" here, "Future &
// Community" there) — they're allowed to diverge rather than forcing one
// wording to serve two different jobs.

import type { HouseNumber } from "@/features/daily-focus";
import { FULL_PLANETS, type FullBirthChart, type FullPlanetName } from "./full-chart";

export type HouseInfo = { label: string; description: string };

export const HOUSE_INFO: Record<HouseNumber, HouseInfo> = {
  1: { label: "Self & Identity", description: "Your sense of self and how you approach the world." },
  2: {
    label: "Money & Self-Worth",
    description: "Your resources, personal values and sense of security.",
  },
  3: {
    label: "Mind & Communication",
    description: "How you learn, exchange ideas and connect with your everyday surroundings.",
  },
  4: {
    label: "Home & Belonging",
    description: "Your roots, family life and what helps you feel at home.",
  },
  5: {
    label: "Creativity & Joy",
    description: "How you express yourself through play, creativity and romance.",
  },
  6: {
    label: "Routine & Wellbeing",
    description: "Your daily habits, everyday work and how you care for yourself.",
  },
  7: {
    label: "Relationships & Partnership",
    description: "How you approach commitment, cooperation and one-to-one relationships.",
  },
  8: {
    label: "Intimacy & Transformation",
    description: "Your relationship with vulnerability, shared resources and deep change.",
  },
  9: {
    label: "Exploration & Beliefs",
    description: "How you broaden your perspective through learning, travel and belief.",
  },
  10: {
    label: "Career & Direction",
    description: "Your ambitions, public role and what you want to build.",
  },
  11: {
    label: "Community & Aspirations",
    description: "Your friendships, communities and hopes for the future.",
  },
  12: {
    label: "Inner Life & Rest",
    description: "Your relationship with solitude, reflection and what lies beneath the surface.",
  },
};

// "1st", "2nd", "3rd", "4th"... — only 1/2/3 are irregular in this 1-12 range.
export function ordinal(n: number): string {
  return `${n}${n === 1 ? "st" : n === 2 ? "nd" : n === 3 ? "rd" : "th"}`;
}

// Which of her planets sit in each house — shared by the Houses tab and the
// Overview tab's "where your chart is concentrated" line, so this grouping
// only happens in one place.
export function groupPlanetsByHouse(chart: FullBirthChart): Record<number, FullPlanetName[]> {
  const houseOf: Record<number, FullPlanetName[]> = {};
  for (const name of FULL_PLANETS) {
    const house = chart.planets[name].house;
    (houseOf[house] ??= []).push(name);
  }
  return houseOf;
}
