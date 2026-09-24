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
  // The same idea, for the evening reflection (see types.ts's DailyFocusCard
  // for what these mean) — kept here too, so the reflect slot also draws
  // correctly at once, offline, the same way the morning card does.
  eveningReflectionOpened: boolean;
  eveningReflectionDone: boolean;
  title: string;
  label: string;
  prompt: string;
  // The evening reflection's own question — null when the card has none (a
  // copy saved before it existed), which is also what tells the reflect slot
  // never to appear for this card at all (see reflect-slot.ts).
  eveningReflectionPrompt: string | null;
  // The house (1-12), for colouring the card — null for a reduced-mode card
  // (no birth time, so no house) or an older cached copy from before this
  // was kept.
  house: number | null;
};

type Flags = {
  opened: boolean;
  done: boolean;
  eveningReflectionOpened: boolean;
  eveningReflectionDone: boolean;
};

function keyFor(date: string): string | null {
  const userId = getSession().userId;
  return userId ? `${PREFIX}${userId}:${date}` : null;
}

// The four yes/no answers from a card and from this phone, combined. Once
// either says yes it stays yes, and each "done" means its own "opened".
export function mergeFlags(card: Flags, local: Flags | null): Flags {
  const done = card.done || Boolean(local?.done);
  const eveningReflectionDone = card.eveningReflectionDone || Boolean(local?.eveningReflectionDone);
  return {
    opened: card.opened || Boolean(local?.opened) || done,
    done,
    eveningReflectionOpened:
      card.eveningReflectionOpened || Boolean(local?.eveningReflectionOpened) || eveningReflectionDone,
    eveningReflectionDone,
  };
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
    const {
      opened,
      done,
      eveningReflectionOpened,
      eveningReflectionDone,
      title,
      label,
      prompt,
      eveningReflectionPrompt,
      house,
    } = v as Record<string, unknown>;
    if (typeof opened !== "boolean" || typeof done !== "boolean") return null;
    if (!isText(title) || !isText(label) || !isText(prompt)) return null;
    return {
      ...mergeFlags(
        {
          opened,
          done,
          // Both false, not missing, on a copy saved before these existed —
          // never invented as "yes".
          eveningReflectionOpened: eveningReflectionOpened === true,
          eveningReflectionDone: eveningReflectionDone === true,
        },
        null,
      ),
      title,
      label,
      prompt,
      eveningReflectionPrompt: isText(eveningReflectionPrompt) ? eveningReflectionPrompt : null,
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
      eveningReflectionPrompt: card.eveningReflectionPrompt,
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
