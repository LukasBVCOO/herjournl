// What a finished daily focus card is. This is also what gets saved, one per
// person per day, so its parts line up with the database columns.

import type { Sign } from "@/features/onboarding";

// What asking for today's card can come back with. A card is only ever "ready"
// when it is real; every other answer says why there isn't one, and none of
// them makes anything up.
export type DailyFocusResult =
  // created is true when this call made and saved it (false: it already existed).
  | { status: "ready"; card: DailyFocusCard; created: boolean }
  // Her houses depend on a real birth time, so there is no house-based card.
  | { status: "no-birth-time" }
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
  activeHouse: number;
  natalMoonSign: Sign;

  // What she sees.
  // The area of life, as a short internal name (like "career").
  category: string;
  // The same area in words, like "Career & Direction". Shown in small type.
  // Not saved with the card: it is read from the wording for that area.
  label: string;
  title: string;
  // The day's statement followed by the line about how she tends to feel things.
  statement: string;
  // The question she writes about.
  prompt: string;

  // Which option was picked from each list (counting from 0), so a card can be
  // recreated exactly. The Moon line is null if there was none to add.
  titleVariant: number;
  statementVariant: number;
  moonModifierVariant: number | null;
  promptVariant: number;

  // Where she is with today's card. Both are saved with the card and only ever
  // move forward: opened means she has seen it (it stays revealed from then on),
  // done means she answered it and it is now a note (so it leaves the top of her
  // list, and the next card comes tomorrow). Done always means opened too.
  opened: boolean;
  done: boolean;
};
