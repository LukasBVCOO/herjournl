// Turning a card into a row of the daily_focus_cards table, and a row back into a
// card. Nothing here talks to the database.
//
// A row is read back with suspicion: it is checked field by field, and a row that
// is not a whole, sensible card comes back as null instead of a half-card.

import { SIGNS, type Sign } from "@/features/onboarding";
import { HOUSE_CONTENT, type HouseNumber } from "./content/houses";
import { MOON_SIGN_THEMES } from "./content/moon-sign-themes";
import {
  ASPECT_NAMES,
  ASPECT_PLANETS,
  type AspectName,
  type AspectPlanet,
} from "./content/moon-aspects";
import type { DailyFocusCard } from "./types";

// A reduced card's category is "moon_<theme key>" (see assemble-card.ts); this
// looks the label back up from it the same way a full card's is looked up from
// its house, so wording changes to content/moon-sign-themes.ts are picked up
// by cards already saved, not frozen at the moment each one was made.
const REDUCED_LABEL_BY_CATEGORY: Record<string, string> = Object.fromEntries(
  Object.values(MOON_SIGN_THEMES).map((theme) => [`moon_${theme.key}`, theme.label]),
);

// The columns a card is made of. The id, owner and created-at are the database's
// own. moon_modifier_variant is an older column, kept in the database but not
// used any more (see content/moon-modifiers.ts): the Moon-sign line it recorded
// was replaced by the daily Moon-to-planet angle below, which changes even on a
// day the house does not.
//
// active_house, natal_moon_sign and the three moon_aspect_* columns are only
// ever null on a reduced card (personalisation_level "reduced") — see types.ts.
export const CARD_COLUMNS =
  "local_date, timezone, reference_instant, moon_longitude, personalisation_level, active_house, natal_moon_sign, focus_category, focus_title, focus_statement, reflection, journal_prompt, belief_prompt, next_step_prompt, title_variant, statement_variant, reflection_variant, prompt_variant, belief_prompt_variant, next_step_prompt_variant, moon_aspect_planet, moon_aspect_name, moon_aspect_orb, opened, done";

export type CardRow = {
  local_date: string;
  timezone: string;
  reference_instant: string;
  moon_longitude: number;
  personalisation_level: "full" | "reduced";
  active_house: number | null;
  natal_moon_sign: Sign | null;
  focus_category: string;
  focus_title: string;
  focus_statement: string;
  reflection: string | null;
  journal_prompt: string;
  belief_prompt: string | null;
  next_step_prompt: string | null;
  title_variant: number;
  statement_variant: number;
  reflection_variant: number | null;
  prompt_variant: number;
  belief_prompt_variant: number | null;
  next_step_prompt_variant: number | null;
  moon_aspect_planet: AspectPlanet | null;
  moon_aspect_name: AspectName | null;
  moon_aspect_orb: number | null;
  opened: boolean;
  done: boolean;
};

export function rowFromCard(card: DailyFocusCard): CardRow {
  return {
    local_date: card.localDate,
    timezone: card.timeZone,
    reference_instant: card.referenceInstant,
    moon_longitude: card.moonLongitude,
    personalisation_level: card.personalisationLevel,
    active_house: card.activeHouse,
    natal_moon_sign: card.natalMoonSign,
    focus_category: card.category,
    focus_title: card.title,
    focus_statement: card.statement,
    reflection: card.reflection,
    journal_prompt: card.prompt,
    belief_prompt: card.beliefPrompt,
    next_step_prompt: card.nextStepPrompt,
    title_variant: card.titleVariant,
    statement_variant: card.statementVariant,
    reflection_variant: card.reflectionVariant,
    prompt_variant: card.promptVariant,
    belief_prompt_variant: card.beliefPromptVariant,
    next_step_prompt_variant: card.nextStepPromptVariant,
    moon_aspect_planet: card.moonAspectPlanet,
    moon_aspect_name: card.moonAspectName,
    moon_aspect_orb: card.moonAspectOrb,
    opened: card.opened,
    done: card.done,
  };
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() !== "" ? value : null;
}

function whole(value: unknown, min: number, max = Number.MAX_SAFE_INTEGER): number | null {
  return typeof value === "number" && Number.isInteger(value) && value >= min && value <= max
    ? value
    : null;
}

function oneOf<T extends string>(value: unknown, allowed: readonly T[]): T | null {
  return typeof value === "string" && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : null;
}

export function cardFromRow(row: unknown): DailyFocusCard | null {
  if (typeof row !== "object" || row === null) return null;
  const r = row as Record<string, unknown>;

  const personalisationLevel = oneOf(r.personalisation_level, ["full", "reduced"] as const);
  const localDate = text(r.local_date);
  const timeZone = text(r.timezone);
  const category = text(r.focus_category);
  const title = text(r.focus_title);
  const statement = text(r.focus_statement);
  const prompt = text(r.journal_prompt);
  // New with the reflection/belief/next-step upgrade: null on any card saved
  // before it, real text on every card since. Kept distinct from "corrupt"
  // the same way the moon-aspect columns are below — a genuinely absent
  // pre-upgrade value is fine, a present-but-mismatched one is not.
  const reflection = r.reflection === null ? null : (text(r.reflection) ?? undefined);
  const beliefPrompt = r.belief_prompt === null ? null : (text(r.belief_prompt) ?? undefined);
  const nextStepPrompt = r.next_step_prompt === null ? null : (text(r.next_step_prompt) ?? undefined);
  const reflectionVariant = r.reflection_variant === null ? null : (whole(r.reflection_variant, 0) ?? undefined);
  const beliefPromptVariant =
    r.belief_prompt_variant === null ? null : (whole(r.belief_prompt_variant, 0) ?? undefined);
  const nextStepPromptVariant =
    r.next_step_prompt_variant === null ? null : (whole(r.next_step_prompt_variant, 0) ?? undefined);
  const moonLongitude =
    typeof r.moon_longitude === "number" &&
    Number.isFinite(r.moon_longitude) &&
    r.moon_longitude >= 0 &&
    r.moon_longitude < 360
      ? r.moon_longitude
      : null;
  const titleVariant = whole(r.title_variant, 0);
  const statementVariant = whole(r.statement_variant, 0);
  const promptVariant = whole(r.prompt_variant, 0);

  // Each of these is null when the row genuinely has SQL NULL there (only
  // ever valid on a reduced card), undefined when it's present but not a
  // value that means anything — which is never valid, on either kind of card
  // — and its real value otherwise. Kept distinct from a plain null so a
  // corrupted row can't be misread as an honestly-empty reduced field.
  const natalMoonSign =
    r.natal_moon_sign === null ? null : (oneOf(r.natal_moon_sign, SIGNS) ?? undefined);
  const activeHouse = r.active_house === null ? null : (whole(r.active_house, 1, 12) ?? undefined);
  const moonAspectPlanet =
    r.moon_aspect_planet === null ? null : (oneOf(r.moon_aspect_planet, ASPECT_PLANETS) ?? undefined);
  const moonAspectName =
    r.moon_aspect_name === null ? null : (oneOf(r.moon_aspect_name, ASPECT_NAMES) ?? undefined);
  const moonAspectOrb =
    r.moon_aspect_orb === null
      ? null
      : typeof r.moon_aspect_orb === "number" && Number.isFinite(r.moon_aspect_orb) && r.moon_aspect_orb >= 0
        ? r.moon_aspect_orb
        : undefined;

  // A full card needs a real house and natal Moon sign; a reduced card needs
  // both to be genuinely absent (not just invalid).
  if (personalisationLevel === "full" && (activeHouse === null || !natalMoonSign)) return null;
  if (personalisationLevel === "reduced" && (activeHouse !== null || natalMoonSign !== null)) return null;
  if (activeHouse === undefined || natalMoonSign === undefined) return null;

  // A moon aspect is either fully present or fully absent, never partial —
  // and on a full card it is always present.
  const aspectPresent = moonAspectPlanet !== null || moonAspectName !== null || moonAspectOrb !== null;
  const aspectComplete = moonAspectPlanet && moonAspectName && typeof moonAspectOrb === "number";
  if (aspectPresent && !aspectComplete) return null;
  if (personalisationLevel === "full" && !aspectComplete) return null;

  // Same all-or-nothing rule as the moon aspect, for each of the three
  // pieces this card gained alongside "My intention": text and its variant
  // are both there, or both genuinely absent (a card saved before this
  // existed) — never a mismatch.
  if (reflection === undefined || reflectionVariant === undefined) return null;
  if ((reflection === null) !== (reflectionVariant === null)) return null;
  if (beliefPrompt === undefined || beliefPromptVariant === undefined) return null;
  if ((beliefPrompt === null) !== (beliefPromptVariant === null)) return null;
  if (nextStepPrompt === undefined || nextStepPromptVariant === undefined) return null;
  if ((nextStepPrompt === null) !== (nextStepPromptVariant === null)) return null;

  // The two flags must be real yes/no answers, and done means opened too.
  if (typeof r.opened !== "boolean" || typeof r.done !== "boolean") return null;
  if (r.done && !r.opened) return null;

  // The database hands the moment back in its own format; keep it as an ISO time.
  const instant = new Date(String(r.reference_instant));
  const referenceInstant = Number.isNaN(instant.getTime()) ? null : instant.toISOString();

  if (
    !personalisationLevel ||
    !localDate ||
    !/^\d{4}-\d{2}-\d{2}$/.test(localDate) ||
    !timeZone ||
    !category ||
    !title ||
    !statement ||
    !prompt ||
    moonLongitude === null ||
    titleVariant === null ||
    statementVariant === null ||
    promptVariant === null ||
    referenceInstant === null
  ) {
    return null;
  }

  return {
    localDate,
    timeZone,
    referenceInstant,
    moonLongitude,
    personalisationLevel,
    activeHouse,
    natalMoonSign: natalMoonSign ?? null,
    category,
    // The area in words comes from the wording for that area, not from the
    // row: a full card's house, or a reduced card's Moon-sign theme.
    label:
      activeHouse !== null
        ? (HOUSE_CONTENT[activeHouse as HouseNumber]?.label ?? title)
        : (REDUCED_LABEL_BY_CATEGORY[category] ?? title),
    title,
    statement,
    reflection,
    prompt,
    beliefPrompt,
    nextStepPrompt,
    titleVariant,
    statementVariant,
    reflectionVariant,
    promptVariant,
    beliefPromptVariant,
    nextStepPromptVariant,
    moonAspectPlanet: aspectComplete ? moonAspectPlanet : null,
    moonAspectName: aspectComplete ? moonAspectName : null,
    moonAspectOrb: aspectComplete ? (moonAspectOrb as number) : null,
    opened: r.opened,
    done: r.done,
  };
}
