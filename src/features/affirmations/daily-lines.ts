// Which three lines she's offered today: one theme, one goal and one belief
// from the lines for today's house (five of each — see the
// affirmations_more_lines migration).
//
// Each kind steps on to its next line every day, so she sees all five before
// any comes round again, even while the Moon stays in the same house for a
// few days. Where each person starts in the cycle depends on who she is, so
// two people on the same day don't see the same three. No chance involved:
// the same person on the same day always gets the same three.

import type { Affirmation, AffirmationType } from "./affirmations-api";

const KINDS: AffirmationType[] = ["theme", "goal", "belief"];

// A small, steady number from her id (the same every time).
function personOffset(userId: string): number {
  let hash = 0;
  for (let index = 0; index < userId.length; index++) {
    hash = (hash * 31 + userId.charCodeAt(index)) >>> 0;
  }
  return hash;
}

// "2026-09-29" as a count of whole days.
function dayNumber(date: string): number {
  const [year, month, day] = date.split("-").map(Number);
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
}

export function dailyLines(all: Affirmation[], date: string, userId: string): Affirmation[] {
  const offset = personOffset(userId);
  const day = dayNumber(date);
  return KINDS.flatMap((kind, index) => {
    const pool = all.filter((line) => line.type === kind).sort((a, b) => a.id - b.id);
    if (pool.length === 0) return [];
    // Each kind starts at a different point, so they don't all move in step.
    return [pool[(day + offset + index * 2) % pool.length]];
  });
}
