// Turning a card into a row of the daily_focus_cards table, and a row back into a
// card. Nothing here talks to the database.
//
// A row is read back with suspicion: it is checked field by field, and a row that
// is not a whole, sensible card comes back as null instead of a half-card.

import { SIGNS, type Sign } from "@/features/onboarding";
import { HOUSE_CONTENT, type HouseNumber } from "./content/houses";
import {
  ASPECT_NAMES,
  ASPECT_PLANETS,
  type AspectName,
  type AspectPlanet,
} from "./content/moon-aspects";
import type { DailyFocusCard } from "./types";

// The columns a card is made of. The id, owner and created-at are the database's
// own. moon_modifier_variant is an older column, kept in the database but not
// used any more (see content/moon-modifiers.ts): the Moon-sign line it recorded
// was replaced by the daily Moon-to-planet angle below, which changes even on a
// day the house does not.
export const CARD_COLUMNS =
  "local_date, timezone, reference_instant, moon_longitude, active_house, natal_moon_sign, focus_category, focus_title, focus_statement, journal_prompt, title_variant, statement_variant, prompt_variant, moon_aspect_planet, moon_aspect_name, moon_aspect_orb, opened, done";

export type CardRow = {
  local_date: string;
  timezone: string;
  reference_instant: string;
  moon_longitude: number;
  active_house: number;
  natal_moon_sign: Sign;
  focus_category: string;
  focus_title: string;
  focus_statement: string;
  journal_prompt: string;
  title_variant: number;
  statement_variant: number;
  prompt_variant: number;
  moon_aspect_planet: AspectPlanet;
  moon_aspect_name: AspectName;
  moon_aspect_orb: number;
  opened: boolean;
  done: boolean;
};

export function rowFromCard(card: DailyFocusCard): CardRow {
  return {
    local_date: card.localDate,
    timezone: card.timeZone,
    reference_instant: card.referenceInstant,
    moon_longitude: card.moonLongitude,
    active_house: card.activeHouse,
    natal_moon_sign: card.natalMoonSign,
    focus_category: card.category,
    focus_title: card.title,
    focus_statement: card.statement,
    journal_prompt: card.prompt,
    title_variant: card.titleVariant,
    statement_variant: card.statementVariant,
    prompt_variant: card.promptVariant,
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

  const localDate = text(r.local_date);
  const timeZone = text(r.timezone);
  const category = text(r.focus_category);
  const title = text(r.focus_title);
  const statement = text(r.focus_statement);
  const prompt = text(r.journal_prompt);
  const natalMoonSign = oneOf(r.natal_moon_sign, SIGNS);
  const moonLongitude =
    typeof r.moon_longitude === "number" &&
    Number.isFinite(r.moon_longitude) &&
    r.moon_longitude >= 0 &&
    r.moon_longitude < 360
      ? r.moon_longitude
      : null;
  const activeHouse = whole(r.active_house, 1, 12);
  const titleVariant = whole(r.title_variant, 0);
  const statementVariant = whole(r.statement_variant, 0);
  const promptVariant = whole(r.prompt_variant, 0);
  const moonAspectPlanet = oneOf(r.moon_aspect_planet, ASPECT_PLANETS);
  const moonAspectName = oneOf(r.moon_aspect_name, ASPECT_NAMES);
  const moonAspectOrb =
    typeof r.moon_aspect_orb === "number" && Number.isFinite(r.moon_aspect_orb) && r.moon_aspect_orb >= 0
      ? r.moon_aspect_orb
      : null;

  // The two flags must be real yes/no answers, and done means opened too.
  if (typeof r.opened !== "boolean" || typeof r.done !== "boolean") return null;
  if (r.done && !r.opened) return null;

  // The database hands the moment back in its own format; keep it as an ISO time.
  const instant = new Date(String(r.reference_instant));
  const referenceInstant = Number.isNaN(instant.getTime()) ? null : instant.toISOString();

  if (
    !localDate ||
    !/^\d{4}-\d{2}-\d{2}$/.test(localDate) ||
    !timeZone ||
    !category ||
    !title ||
    !statement ||
    !prompt ||
    !natalMoonSign ||
    moonLongitude === null ||
    activeHouse === null ||
    titleVariant === null ||
    statementVariant === null ||
    promptVariant === null ||
    !moonAspectPlanet ||
    !moonAspectName ||
    moonAspectOrb === null ||
    referenceInstant === null
  ) {
    return null;
  }

  return {
    localDate,
    timeZone,
    referenceInstant,
    moonLongitude,
    activeHouse,
    natalMoonSign,
    category,
    // The area in words comes from the wording for that area, not from the row.
    label: HOUSE_CONTENT[activeHouse as HouseNumber]?.label ?? title,
    title,
    statement,
    prompt,
    titleVariant,
    statementVariant,
    promptVariant,
    moonAspectPlanet,
    moonAspectName,
    moonAspectOrb,
    opened: r.opened,
    done: r.done,
  };
}
