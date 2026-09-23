// What this phone remembers about today's card, so her notes list can draw the
// right thing at once with no wait for the internet: whether she has opened it,
// whether she has answered it, and the words it needs to show itself (title,
// area and question).
//
// The database is the record. This copy only makes opening the app instant, and
// it covers the moments the database can't be reached: a step she took (opening
// the card, answering it) is never lost, because "yes" always wins over "no" when
// the two disagree (see mergeFlags), and the database is told again later.
//
// Only what the card said is kept here, never anything she wrote. It lives in this
// phone's browser storage, is tied to her account, only ever holds today's card,
// and is wiped when she signs out. Storage can be blocked (some private windows),
// so every call fails quietly.

import { getSession, registerSignOutHandler } from "@/lib/session";
import type { DailyFocusCard } from "./types";

const PREFIX = "becomely:focus-state:";
// Kept by an earlier version of this feature. Cleared away when found.
const LEGACY_PREFIX = "becomely:focus-opened:";

export type FocusState = {
  opened: boolean;
  done: boolean;
  title: string;
  label: string;
  prompt: string;
  // The house (1-12), for colouring the card — null for a reduced-mode card
  // (no birth time, so no house) or an older cached copy from before this
  // was kept.
  house: number | null;
};

function keyFor(date: string): string | null {
  const userId = getSession().userId;
  return userId ? `${PREFIX}${userId}:${date}` : null;
}

// The two yes/no answers from a card and from this phone, combined. Once either
// says yes it stays yes, and done means opened.
export function mergeFlags(
  card: { opened: boolean; done: boolean },
  local: { opened: boolean; done: boolean } | null,
) {
  const done = card.done || Boolean(local?.done);
  return { opened: card.opened || Boolean(local?.opened) || done, done };
}

function isText(value: unknown): value is string {
  return typeof value === "string" && value !== "";
}

// What this phone remembers about the card for `date`, or null if nothing.
export function readFocusState(date: string): FocusState | null {
  try {
    const key = keyFor(date);
    const raw = key && localStorage.getItem(key);
    if (!raw) return null;
    const v: unknown = JSON.parse(raw);
    if (typeof v !== "object" || v === null) return null;
    const { opened, done, title, label, prompt, house } = v as Record<string, unknown>;
    if (typeof opened !== "boolean" || typeof done !== "boolean") return null;
    if (!isText(title) || !isText(label) || !isText(prompt)) return null;
    return {
      ...mergeFlags({ opened, done }, null),
      title,
      label,
      prompt,
      house: typeof house === "number" && house >= 1 && house <= 12 ? house : null,
    };
  } catch {
    return null;
  }
}

// Remembers the card and where she is with it. Never takes a "yes" back.
export function saveFocusState(card: DailyFocusCard) {
  try {
    const key = keyFor(card.localDate);
    if (!key) return;
    const flags = mergeFlags(card, readFocusState(card.localDate));
    const state: FocusState = {
      ...flags,
      title: card.title,
      label: card.label,
      prompt: card.prompt,
      house: card.activeHouse,
    };
    localStorage.setItem(key, JSON.stringify(state));
    // Only today's card is kept. Anything from an earlier day goes.
    Object.keys(localStorage)
      .filter(
        (other) =>
          (other.startsWith(PREFIX) && other !== key) || other.startsWith(LEGACY_PREFIX),
      )
      .forEach((other) => localStorage.removeItem(other));
  } catch {
    // Nothing to do: the list just asks the database instead.
  }
}

registerSignOutHandler({
  prepare: async () => null,
  clear: async () => {
    try {
      Object.keys(localStorage)
        .filter((key) => key.startsWith(PREFIX) || key.startsWith(LEGACY_PREFIX))
        .forEach((key) => localStorage.removeItem(key));
    } catch {
      // Storage blocked: there is nothing stored to clear.
    }
  },
});
