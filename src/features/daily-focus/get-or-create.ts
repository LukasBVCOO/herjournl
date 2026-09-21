// Today's card for her: found if it was already made, made and saved if not.
//
//   1. Is there already a card for today (her day runs 08:00 to 08:00)? Then that
//      is her card, however it came about. A card never changes once made. "No card
//      for today yet" is all it takes to know a new one is due: nothing has to be
//      reset each morning, so nothing can be missed or go out of date.
//   2. Otherwise: has she finished onboarding, and does she have what a card needs
//      (a chart, a real birth time)?
//   3. Work the card out on her phone, and save it. One card per day is enforced
//      by the database itself, so two phones opening at once end up with the same
//      card.
//
// It never makes anything up. If the internet is not there, it says so and stops;
// the card is simply made the next time this runs with a connection. Nothing is
// queued or retried in the background.

import type { Chart } from "@/features/onboarding";
import { hasUsableHouses } from "./active-house";
import type { Found, SavedChart } from "./card-store";
import { cardDayIn } from "./local-day";
import type { DailyFocusCard, DailyFocusResult } from "./types";

// Everything this needs from the outside world, so it can be tried out without
// a phone or a database. today.ts hands in the real ones.
export type Ports = {
  userId: () => string | undefined;
  now: () => Date;
  timeZone: () => string;
  findCard: (localDate: string) => Promise<Found<DailyFocusCard | null>>;
  findChart: (userId: string) => Promise<Found<SavedChart | null>>;
  saveCard: (card: DailyFocusCard) => Promise<Found<"saved" | "exists">>;
  generate: (
    userId: string,
    chart: Chart,
    localDate: string,
    timeZone: string,
  ) => Promise<DailyFocusCard>;
};

const UNAVAILABLE: DailyFocusResult = { status: "unavailable" };

const failed = (reason: "offline" | "failed"): DailyFocusResult =>
  reason === "offline" ? { status: "offline" } : UNAVAILABLE;

async function run(ports: Ports, userId: string, localDate: string, timeZone: string) {
  // 1. Already made?
  const existing = await ports.findCard(localDate);
  if (!existing.ok) return failed(existing.reason);
  if (existing.value) return { status: "ready", card: existing.value, created: false } as const;

  // 2. Does she have what a card needs?
  const saved = await ports.findChart(userId);
  if (!saved.ok) return failed(saved.reason);
  if (!saved.value) return { status: "no-chart" } as const;
  // Cards are only made once onboarding is finished.
  if (!saved.value.onboarded) return { status: "no-chart" } as const;
  // Without a real birth time her houses are not real, so no house-based card.
  // No birth time is ever invented to get round this.
  if (!saved.value.birthTimeKnown) return { status: "no-birth-time" } as const;
  const chart = saved.value.chart;
  if (!chart || !hasUsableHouses(chart)) return { status: "no-chart" } as const;

  // 3. Make it and save it.
  let card: DailyFocusCard;
  try {
    card = await ports.generate(userId, chart, localDate, timeZone);
  } catch {
    return UNAVAILABLE;
  }

  const stored = await ports.saveCard(card);
  if (!stored.ok) return failed(stored.reason);
  if (stored.value === "saved") return { status: "ready", card, created: true } as const;

  // Another phone saved one a moment ago. Hers is the one that counts.
  const winner = await ports.findCard(localDate);
  if (!winner.ok) return failed(winner.reason);
  if (!winner.value) return UNAVAILABLE;
  return { status: "ready", card: winner.value, created: false } as const;
}

// Asking twice at the same moment (two screens, say) shares one piece of work.
const inFlight = new Map<string, Promise<DailyFocusResult>>();

export function getOrCreateDailyFocusCard(ports: Ports): Promise<DailyFocusResult> {
  const userId = ports.userId();
  if (!userId) return Promise.resolve(UNAVAILABLE);

  let timeZone: string;
  let localDate: string;
  try {
    timeZone = ports.timeZone();
    // Her day for the daily focus runs 08:00 to 08:00, so before 08:00 this is
    // still yesterday's card, and the new one is made from 08:00.
    localDate = cardDayIn(ports.now(), timeZone);
  } catch {
    return Promise.resolve(UNAVAILABLE);
  }

  const key = `${userId}|${localDate}|${timeZone}`;
  const running = inFlight.get(key);
  if (running) return running;

  const work = run(ports, userId, localDate, timeZone)
    .catch((): DailyFocusResult => UNAVAILABLE)
    .finally(() => inFlight.delete(key));
  inFlight.set(key, work);
  return work;
}
