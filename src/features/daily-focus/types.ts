// What a finished daily focus card is. This is also what gets saved, one per
// person per day, so its parts line up with the database columns.

import type { Sign } from "@/features/onboarding";
import type { AspectName, AspectPlanet } from "./content/moon-aspects";

// What asking for today's card can come back with. A card is only ever "ready"
// when it is real; every other answer says why there isn't one, and none of
// them makes anything up.
export type DailyFocusResult =
  // created is true when this call made and saved it (false: it already existed).
  | { status: "ready"; card: DailyFocusCard; created: boolean }
  // Her saved chart is missing or damaged: she should review her birth details.
  | { status: "no-chart" }
  // No internet. Nothing is wrong; the card is made when she is back online.
  | { status: "offline" }
  // Anything else: "your focus is still aligning", try again.
  | { status: "unavailable" };

export type DailyFocusCard = {
  // The day it belongs to and how it was worked out. Kept so a card can always
  // be explained later, but never shown to her. The day runs from 08:00 to 08:00
  // in her time zone (see cardDayIn), and the Moon is read at 08:00 on it.
  localDate: string;
  timeZone: string;
  referenceInstant: string;
  moonLongitude: number;
  // "full" once she has a real birth time (houses, a fixed area of life over a
  // few days); "reduced" when she doesn't (today's Moon sign is the theme
  // instead — see content/moon-sign-themes.ts). Never shown to her; kept so a
  // card can always be explained, and for basic debugging.
  personalisationLevel: "full" | "reduced";
  // Null on a reduced card: there is no real house without a birth time, and
  // one is never invented to stand in for it.
  activeHouse: number | null;
  // Null on a reduced card when even her natal Moon sign wasn't reliably
  // knowable (see the reduced chart's own moon.reliable flag). Kept for
  // explainability only — it never decides what a reduced card says; today's
  // transiting Moon sign does that instead.
  natalMoonSign: Sign | null;

  // What she sees.
  // The area of life, as a short internal name (like "career").
  category: string;
  // The same area in words, like "Career & Direction". Shown in small type.
  // Not saved with the card: it is read from the wording for that area.
  label: string;
  title: string;
  // The day's statement, usually followed by a line on how to approach it
  // today (see moonAspectPlanet below — a reduced card may not have one).
  statement: string;
  // A short paragraph of real material to consider, shown before the three
  // prompts below. Null only on a card saved before this existed — every
  // card made from here on always has one.
  reflection: string | null;
  // "My intention" — the one required prompt. Still named `prompt`, from
  // when it was the only one; see beliefPrompt/nextStepPrompt for the two
  // added alongside it.
  prompt: string;
  // "A belief to explore" — shown and encouraged, never required to answer.
  // Null only on a card saved before this existed.
  beliefPrompt: string | null;
  // "My next step" — shown and encouraged, never required to answer. Null
  // only on a card saved before this existed.
  nextStepPrompt: string | null;
  // The evening reflection's one question — picked this morning alongside
  // everything else, just not shown until the morning card is done (see
  // reflect-screen.tsx). Null only on a card saved before this existed.
  eveningReflectionPrompt: string | null;

  // Which option was picked from the house's (or Moon sign's) own lists
  // (counting from 0), so a card can be recreated exactly.
  titleVariant: number;
  statementVariant: number;
  reflectionVariant: number | null;
  promptVariant: number;
  beliefPromptVariant: number | null;
  nextStepPromptVariant: number | null;
  eveningReflectionPromptVariant: number | null;

  // How to approach it today: the Moon's closest angle to one of her seven natal
  // planets. Not a pick from a list — worked out fresh from where the Moon
  // actually is, so it changes day to day even while the house above does not.
  // Kept so a card can always be explained later, never shown to her. Null only
  // on a reduced card with no planet both reliably known and close enough to
  // use (see moon-aspect.ts's closestReliableMoonAspect) — the statement still
  // reads as complete without it.
  moonAspectPlanet: AspectPlanet | null;
  moonAspectName: AspectName | null;
  moonAspectOrb: number | null;

  // Where she is with today's card. Both are saved with the card and only ever
  // move forward: opened means she has seen it (it stays revealed from then on),
  // done means she answered it and it is now a note (so it leaves the top of her
  // list, and the next card comes tomorrow). Done always means opened too.
  opened: boolean;
  done: boolean;
  // The same idea, for the evening reflection: opened means she's on the
  // reflection prompt page, done means her answer has been appended to
  // today's note. Only ever meaningful once `done` above is true — see
  // reflect-slot.ts, which is what actually gates the reflection on the
  // morning card being finished.
  eveningReflectionOpened: boolean;
  eveningReflectionDone: boolean;
};
