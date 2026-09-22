// Putting a card together from the day's facts and the wording in content/.
//
//   the area of life for the day       ->  a title, a statement and a question
//   the Moon's closest angle to her    ->  one line on how to approach it today
//   natal planets, today
//
// The area (the house) moves slowly, so the Moon can sit in the same one for two
// or three days running. The angle changes with it every day, which is what
// keeps the card from repeating itself while the area stays the same. Which
// title, statement and prompt are used from the house's own lists is still
// picked with no chance involved (deterministic-seed.ts), so the same person on
// the same day always gets the same card. Nothing here touches the sky, the
// database or the screen.

import { SIGNS, type Chart, type Sign } from "@/features/onboarding";
import type { MoonReading } from "./active-house";
import { HOUSE_CONTENT, type HouseContent, type HouseNumber } from "./content/houses";
import { moonAspectLine } from "./content/moon-aspects";
import { closestMoonAspect } from "./moon-aspect";
import { pickIndex, seedFor } from "./deterministic-seed";
import type { DailyFocusCard } from "./types";

export type CardInput = {
  userId: string;
  moon: MoonReading;
  chart: Chart;
};

export type CardContent = {
  houses: Record<number, HouseContent | undefined>;
};

const DEFAULT_CONTENT: CardContent = { houses: HOUSE_CONTENT };

// Used only if a list of wording were ever empty, so a card is never blank.
const FALLBACK_PROMPT = "What deserves your attention today?";

export function assembleDailyFocusCard(
  input: CardInput,
  content: CardContent = DEFAULT_CONTENT,
): DailyFocusCard {
  const { userId, moon, chart } = input;
  if (typeof userId !== "string" || userId.length === 0) throw new Error("A card needs a person");
  const house = moon.activeHouse;
  if (!Number.isInteger(house) || house < 1 || house > 12) throw new Error("Not a house from 1 to 12");
  const natalMoonSign: Sign = chart.moon.sign;
  if (!(SIGNS as readonly string[]).includes(natalMoonSign)) throw new Error("Not a Moon sign");

  // A missing area would leave nothing honest to say, so this is an error, not a
  // made-up card.
  const area = content.houses[house as HouseNumber];
  if (!area) throw new Error("There is no wording for this area of life");

  const seed = seedFor(userId, moon.localDate, house);

  const titleVariant = pickIndex(seed, "title", Math.max(area.titles.length, 1));
  const statementVariant = pickIndex(seed, "statement", Math.max(area.statements.length, 1));
  const promptVariant = pickIndex(seed, "prompt", Math.max(area.prompts.length, 1));

  const title = area.titles[titleVariant] ?? area.label;
  const baseStatement = area.statements[statementVariant] ?? `${area.label} is in focus today.`;
  const prompt = area.prompts[promptVariant] ?? FALLBACK_PROMPT;

  // How to approach it today: not a pick from a list, but always worked out
  // fresh from where the Moon actually is against her chart, so it changes even
  // on a day the house does not.
  const moonAspect = closestMoonAspect(moon.moonLongitude, chart);
  const approachLine = moonAspectLine(moonAspect.planet, moonAspect.aspect);

  return {
    localDate: moon.localDate,
    timeZone: moon.timeZone,
    referenceInstant: moon.referenceInstant,
    moonLongitude: moon.moonLongitude,
    activeHouse: house,
    natalMoonSign,
    category: area.key,
    label: area.label,
    title,
    statement: `${baseStatement} ${approachLine}`,
    prompt,
    titleVariant,
    statementVariant,
    promptVariant,
    moonAspectPlanet: moonAspect.planet,
    moonAspectName: moonAspect.aspect,
    moonAspectOrb: moonAspect.orb,
    // A new card has not been seen yet.
    opened: false,
    done: false,
  };
}
