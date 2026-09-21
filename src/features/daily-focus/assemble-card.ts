// Putting a card together from the day's facts and the wording in content/.
//
//   the area of life for the day  ->  a title, a statement and a question
//   her natal Moon sign           ->  one line about how she tends to feel things
//
// Which option is used from each list is decided by deterministic-seed.ts, so the
// same person on the same day always gets the same card. Nothing here touches the
// sky, the database or the screen.

import { SIGNS, type Sign } from "@/features/onboarding";
import type { MoonReading } from "./active-house";
import { HOUSE_CONTENT, type HouseContent, type HouseNumber } from "./content/houses";
import { MOON_MODIFIERS, type MoonModifier } from "./content/moon-modifiers";
import { pickIndex, seedFor } from "./deterministic-seed";
import type { DailyFocusCard } from "./types";

export type CardInput = {
  userId: string;
  moon: MoonReading;
  natalMoonSign: Sign;
};

export type CardContent = {
  houses: Record<number, HouseContent | undefined>;
  moons: Record<string, MoonModifier | undefined>;
};

const DEFAULT_CONTENT: CardContent = { houses: HOUSE_CONTENT, moons: MOON_MODIFIERS };

// Used only if a list of wording were ever empty, so a card is never blank.
const FALLBACK_PROMPT = "What deserves your attention today?";

export function assembleDailyFocusCard(
  input: CardInput,
  content: CardContent = DEFAULT_CONTENT,
): DailyFocusCard {
  const { userId, moon, natalMoonSign } = input;
  if (typeof userId !== "string" || userId.length === 0) throw new Error("A card needs a person");
  const house = moon.activeHouse;
  if (!Number.isInteger(house) || house < 1 || house > 12) throw new Error("Not a house from 1 to 12");
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

  // The line about her Moon sign is a bonus: without one, the card is still whole.
  const modifier = content.moons[natalMoonSign];
  const lines = modifier?.lines ?? [];
  const moonModifierVariant = lines.length > 0 ? pickIndex(seed, "moon", lines.length) : null;
  const line = moonModifierVariant === null ? "" : lines[moonModifierVariant];

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
    statement: line ? `${baseStatement} ${line}` : baseStatement,
    prompt,
    titleVariant,
    statementVariant,
    moonModifierVariant,
    promptVariant,
    // A new card has not been seen yet.
    opened: false,
    done: false,
  };
}
