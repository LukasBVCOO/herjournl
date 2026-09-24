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

import { SIGNS, type Chart, type ReducedChart, type Sign } from "@/features/onboarding";
import type { MoonReading } from "./active-house";
import type { MoonSignReading } from "./moon-sign";
import { HOUSE_CONTENT, type HouseContent, type HouseNumber } from "./content/houses";
import { moonAspectLine } from "./content/moon-aspects";
import { MOON_SIGN_THEMES, type MoonSignTheme } from "./content/moon-sign-themes";
import { EVENING_REFLECTION_PROMPTS } from "./content/evening-reflection";
import { closestMoonAspect, closestReliableMoonAspect } from "./moon-aspect";
import { pickIndex, pickIndexAvoiding, seedFor } from "./deterministic-seed";
import type { DailyFocusCard } from "./types";

// Which indices she's already seen for this same area of life (or Moon
// sign), most-recent-first, so the reflection and the three prompts don't
// repeat while the area stays the same for a few days running — see
// variant-history.ts for where this comes from and deterministic-seed.ts's
// pickIndexAvoiding for how it's used. Empty arrays when there's no history
// yet, which reads exactly the same as "nothing to avoid".
export type RecentVariants = {
  reflection: readonly number[];
  intentionPrompt: readonly number[];
  beliefPrompt: readonly number[];
  nextStepPrompt: readonly number[];
};

export const NO_RECENT_VARIANTS: RecentVariants = {
  reflection: [],
  intentionPrompt: [],
  beliefPrompt: [],
  nextStepPrompt: [],
};

export type CardInput = {
  userId: string;
  moon: MoonReading;
  chart: Chart;
  recent?: RecentVariants;
  // Her recent evening-reflection picks, most-recent-first — a flat pool,
  // not grouped by house/sign the way `recent` is, so this is separate. See
  // variant-history.ts's recentEveningReflectionVariants.
  recentEveningReflection?: readonly number[];
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
  const { userId, moon, chart, recent = NO_RECENT_VARIANTS, recentEveningReflection = [] } = input;
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
  const reflectionVariant = pickIndexAvoiding(
    seed,
    "reflection",
    Math.max(area.reflections.length, 1),
    recent.reflection,
  );
  const promptVariant = pickIndexAvoiding(
    seed,
    "prompt",
    Math.max(area.intentionPrompts.length, 1),
    recent.intentionPrompt,
  );
  const beliefPromptVariant = pickIndexAvoiding(
    seed,
    "beliefPrompt",
    Math.max(area.beliefPrompts.length, 1),
    recent.beliefPrompt,
  );
  const nextStepPromptVariant = pickIndexAvoiding(
    seed,
    "nextStepPrompt",
    Math.max(area.nextStepPrompts.length, 1),
    recent.nextStepPrompt,
  );
  // A flat pool, not grouped by house — same seed (still deterministic and
  // still unique per user per day), just its own "part" name and its own,
  // unscoped avoid list.
  const eveningReflectionPromptVariant = pickIndexAvoiding(
    seed,
    "eveningReflectionPrompt",
    Math.max(EVENING_REFLECTION_PROMPTS.length, 1),
    recentEveningReflection,
  );

  const title = area.titles[titleVariant] ?? area.label;
  const baseStatement = area.statements[statementVariant] ?? `${area.label} is in focus today.`;
  const reflection = area.reflections[reflectionVariant] ?? null;
  const prompt = area.intentionPrompts[promptVariant] ?? FALLBACK_PROMPT;
  const beliefPrompt = area.beliefPrompts[beliefPromptVariant] ?? null;
  const nextStepPrompt = area.nextStepPrompts[nextStepPromptVariant] ?? null;
  const eveningReflectionPrompt = EVENING_REFLECTION_PROMPTS[eveningReflectionPromptVariant] ?? null;

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
    personalisationLevel: "full",
    activeHouse: house,
    natalMoonSign,
    category: area.key,
    label: area.label,
    title,
    statement: `${baseStatement} ${approachLine}`,
    reflection,
    prompt,
    beliefPrompt,
    nextStepPrompt,
    eveningReflectionPrompt,
    titleVariant,
    statementVariant,
    reflectionVariant,
    promptVariant,
    beliefPromptVariant,
    nextStepPromptVariant,
    eveningReflectionPromptVariant,
    moonAspectPlanet: moonAspect.planet,
    moonAspectName: moonAspect.aspect,
    moonAspectOrb: moonAspect.orb,
    // A new card has not been seen yet.
    opened: false,
    done: false,
    eveningReflectionOpened: false,
    eveningReflectionDone: false,
  };
}

// The reduced version of the card above: no birth time, so no house — today's
// Moon sign gives the theme instead (content/moon-sign-themes.ts), and the
// approach line only appears when a reliable natal angle exists close enough
// to use (see moon-aspect.ts's closestReliableMoonAspect). Nothing here is
// guessed: a missing theme is an error, not a made-up card, exactly as above.
export type ReducedCardInput = {
  userId: string;
  moon: MoonSignReading;
  chart: ReducedChart;
  recent?: RecentVariants;
  recentEveningReflection?: readonly number[];
};

export type ReducedCardContent = {
  themes: Record<Sign, MoonSignTheme | undefined>;
};

const DEFAULT_REDUCED_CONTENT: ReducedCardContent = { themes: MOON_SIGN_THEMES };

export function assembleReducedDailyFocusCard(
  input: ReducedCardInput,
  content: ReducedCardContent = DEFAULT_REDUCED_CONTENT,
): DailyFocusCard {
  const { userId, moon, chart, recent = NO_RECENT_VARIANTS, recentEveningReflection = [] } = input;
  if (typeof userId !== "string" || userId.length === 0) throw new Error("A card needs a person");

  const theme = content.themes[moon.moonSign];
  if (!theme) throw new Error("There is no wording for this Moon sign");

  // Seeded by today's Moon sign instead of a house — the same idea as the full
  // card (deterministic-seed.ts), just a different key for what area of the
  // wording it picks from.
  const seed = seedFor(userId, moon.localDate, moon.moonSign);

  const titleVariant = pickIndex(seed, "title", Math.max(theme.titles.length, 1));
  const statementVariant = pickIndex(seed, "statement", Math.max(theme.statements.length, 1));
  const reflectionVariant = pickIndexAvoiding(
    seed,
    "reflection",
    Math.max(theme.reflections.length, 1),
    recent.reflection,
  );
  const promptVariant = pickIndexAvoiding(
    seed,
    "prompt",
    Math.max(theme.intentionPrompts.length, 1),
    recent.intentionPrompt,
  );
  const beliefPromptVariant = pickIndexAvoiding(
    seed,
    "beliefPrompt",
    Math.max(theme.beliefPrompts.length, 1),
    recent.beliefPrompt,
  );
  const nextStepPromptVariant = pickIndexAvoiding(
    seed,
    "nextStepPrompt",
    Math.max(theme.nextStepPrompts.length, 1),
    recent.nextStepPrompt,
  );
  const eveningReflectionPromptVariant = pickIndexAvoiding(
    seed,
    "eveningReflectionPrompt",
    Math.max(EVENING_REFLECTION_PROMPTS.length, 1),
    recentEveningReflection,
  );

  const title = theme.titles[titleVariant] ?? theme.label;
  const baseStatement = theme.statements[statementVariant] ?? `${theme.label} is in focus today.`;
  const reflection = theme.reflections[reflectionVariant] ?? null;
  const prompt = theme.intentionPrompts[promptVariant] ?? FALLBACK_PROMPT;
  const beliefPrompt = theme.beliefPrompts[beliefPromptVariant] ?? null;
  const nextStepPrompt = theme.nextStepPrompts[nextStepPromptVariant] ?? null;
  const eveningReflectionPrompt = EVENING_REFLECTION_PROMPTS[eveningReflectionPromptVariant] ?? null;

  // Not every day has one — a reduced chart may have no planet both reliably
  // known and close enough — so the statement has to read as complete alone.
  const aspect = closestReliableMoonAspect(moon.moonLongitude, chart);
  const statement = aspect
    ? `${baseStatement} ${moonAspectLine(aspect.planet, aspect.aspect)}`
    : baseStatement;

  return {
    localDate: moon.localDate,
    timeZone: moon.timeZone,
    referenceInstant: moon.referenceInstant,
    moonLongitude: moon.moonLongitude,
    personalisationLevel: "reduced",
    activeHouse: null,
    natalMoonSign: chart.moon.reliable ? chart.moon.sign : null,
    category: `moon_${theme.key}`,
    label: theme.label,
    title,
    statement,
    reflection,
    prompt,
    beliefPrompt,
    nextStepPrompt,
    eveningReflectionPrompt,
    titleVariant,
    statementVariant,
    reflectionVariant,
    promptVariant,
    beliefPromptVariant,
    nextStepPromptVariant,
    eveningReflectionPromptVariant,
    moonAspectPlanet: aspect?.planet ?? null,
    moonAspectName: aspect?.aspect ?? null,
    moonAspectOrb: aspect?.orb ?? null,
    opened: false,
    done: false,
    eveningReflectionOpened: false,
    eveningReflectionDone: false,
  };
}
