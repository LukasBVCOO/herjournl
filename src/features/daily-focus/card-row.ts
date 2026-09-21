// Turning a card into a row of the daily_focus_cards table, and a row back into a
// card. Nothing here talks to the database.
//
// A row is read back with suspicion: it is checked field by field, and a row that
// is not a whole, sensible card comes back as null instead of a half-card.

import { SIGNS, type Sign } from "@/features/onboarding";
import { HOUSE_CONTENT, type HouseNumber } from "./content/houses";
import type { DailyFocusCard } from "./types";

// The columns a card is made of. The id, owner and created-at are the database's own.
export const CARD_COLUMNS =
  "local_date, timezone, reference_instant, moon_longitude, active_house, natal_moon_sign, focus_category, focus_title, focus_statement, journal_prompt, title_variant, statement_variant, moon_modifier_variant, prompt_variant, opened, done";

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
  moon_modifier_variant: number | null;
  prompt_variant: number;
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
    moon_modifier_variant: card.moonModifierVariant,
    prompt_variant: card.promptVariant,
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

export function cardFromRow(row: unknown): DailyFocusCard | null {
  if (typeof row !== "object" || row === null) return null;
  const r = row as Record<string, unknown>;

  const localDate = text(r.local_date);
  const timeZone = text(r.timezone);
  const category = text(r.focus_category);
  const title = text(r.focus_title);
  const statement = text(r.focus_statement);
  const prompt = text(r.journal_prompt);
  const natalMoonSign = (SIGNS as readonly string[]).includes(r.natal_moon_sign as string)
    ? (r.natal_moon_sign as Sign)
    : null;
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

  // The two flags must be real yes/no answers, and done means opened too.
  if (typeof r.opened !== "boolean" || typeof r.done !== "boolean") return null;
  if (r.done && !r.opened) return null;

  // Having no line about her Moon sign is fine (null); a nonsense one is not.
  let moonModifierVariant: number | null = null;
  if (r.moon_modifier_variant !== null) {
    moonModifierVariant = whole(r.moon_modifier_variant, 0);
    if (moonModifierVariant === null) return null;
  }

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
    moonModifierVariant,
    promptVariant,
    opened: r.opened,
    done: r.done,
  };
}
