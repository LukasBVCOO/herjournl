// Today's card for whoever is signed in: the real clock, her real phone settings
// and the real database wired into get-or-create.ts.
//
// Once today's card is in hand it is kept in memory, so opening the card screen
// again the same day is instant and asks the database nothing. It is forgotten
// when the app is closed, when the day changes, and when she signs out.
//
// Where she is with the card (opened, done) is saved with the card in the
// database, and copied on this phone (focus-state.ts). The two are combined here:
// if this phone knows more than the database, the database is told.

import { registerSignOutHandler, getSession } from "@/lib/session";
import { findCard, findChart, markDone, markOpened, saveCard } from "./card-store";
import { mergeFlags, readFocusState, saveFocusState } from "./focus-state";
import { generateDailyFocus } from "./generate";
import { getOrCreateDailyFocusCard } from "./get-or-create";
import { cardDayIn, deviceTimeZone } from "./local-day";
import type { DailyFocusCard, DailyFocusResult } from "./types";
import { recentVariants } from "./variant-history";

type Ready = Extract<DailyFocusResult, { status: "ready" }>;

let remembered: { key: string; result: Ready } | null = null;

registerSignOutHandler({
  prepare: async () => null,
  clear: async () => {
    remembered = null;
  },
});

// Who, which day and which time zone a remembered card belongs to.
function todayKey(): string | null {
  const userId = getSession().userId;
  if (!userId) return null;
  try {
    const timeZone = deviceTimeZone();
    return `${userId}|${cardDayIn(new Date(), timeZone)}|${timeZone}`;
  } catch {
    return null;
  }
}

// The day of the card she is on right now, like "2026-09-21". Her days run from
// 08:00 to 08:00, so before 08:00 this is still yesterday. Empty if the phone
// can't say.
export function currentCardDay(): string {
  try {
    return cardDayIn(new Date(), deviceTimeZone());
  } catch {
    return "";
  }
}

// Today's card if it is already in hand, otherwise null. Never asks anyone.
export function rememberedTodaysFocus(): DailyFocusResult | null {
  const key = todayKey();
  return key && remembered?.key === key ? remembered.result : null;
}

// The card as found, with anything this phone knows about it added in.
function withPhoneKnowledge(found: DailyFocusCard): DailyFocusCard {
  const flags = mergeFlags(found, readFocusState(found.localDate));
  return flags.opened === found.opened && flags.done === found.done
    ? found
    : { ...found, ...flags };
}

export async function getTodaysFocus(): Promise<DailyFocusResult> {
  const hit = rememberedTodaysFocus();
  if (hit) return hit;

  const key = todayKey();
  const result = await getOrCreateDailyFocusCard({
    userId: () => getSession().userId,
    now: () => new Date(),
    timeZone: deviceTimeZone,
    findCard,
    findChart,
    saveCard,
    generate: (userId, chart, localDate, timeZone) =>
      generateDailyFocus(userId, chart, localDate, timeZone, undefined, recentVariants),
  });
  // Only a real card is remembered. Every other answer is asked again next time,
  // so fixing what was missing (or coming back online) just works.
  if (result.status !== "ready") return result;

  const card = withPhoneKnowledge(result.card);
  // This phone got further than the database (she answered while offline, say):
  // tell the database now that it can be reached.
  if (card.done && !result.card.done) void markDone(card.localDate);
  else if (card.opened && !result.card.opened) void markOpened(card.localDate);

  saveFocusState(card);
  const ready: Ready = { ...result, card };
  if (key) remembered = { key, result: ready };
  return ready;
}

function update(card: DailyFocusCard) {
  saveFocusState(card);
  if (remembered?.result.card.localDate === card.localDate) {
    remembered = { ...remembered, result: { ...remembered.result, card } };
  }
}

// She has seen today's card. From now on it stays revealed, on this phone and in
// the database. Nothing waits on the database: if it can't be reached, this phone
// remembers and the database is told the next time the card is fetched.
export function recordOpened(card: DailyFocusCard) {
  if (card.opened) return;
  update({ ...card, opened: true });
  void markOpened(card.localDate);
}

// She answered today's card, and her answer is now a note.
export function recordDone(card: DailyFocusCard) {
  if (card.done) return;
  update({ ...card, opened: true, done: true });
  void markDone(card.localDate);
}
