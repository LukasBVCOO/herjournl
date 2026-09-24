// Picking the wording for a day without ever using chance.
//
// Everything about a card that is a choice (which title, which statement, which
// line about her Moon sign, which question) comes from a fixed recipe: her id,
// the day and the area of life go in, and the same numbers always come out. So a
// card is identical on every refresh and on every device, yet differs between
// two women and between two days.
//
// The recipe is a small standard text-scrambler (FNV-1a), written out here so
// nothing depends on a library and the answers can never shift under us.

// Turns any text into a whole number from 0 to 4294967295. The same text always
// gives the same number; a small change to the text gives an unrelated one.
export function hashText(text: string): number {
  let hash = 0x811c9dc5;
  for (const byte of new TextEncoder().encode(text)) {
    hash ^= byte;
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

// What one card is built from: who, which day, which area of life — a house
// number for a full card, or today's Moon sign for a reduced one.
export function seedFor(userId: string, localDate: string, area: number | string): string {
  return `${userId}|${localDate}|${area}`;
}

// A choice from 0 to count - 1. `part` names what is being chosen ("title",
// "prompt"...), so each choice is made separately and they do not move together.
export function pickIndex(seed: string, part: string, count: number): number {
  if (!Number.isInteger(count) || count < 1) throw new Error("There is nothing to choose from");
  // A final mixing step, so the last characters of the seed (the house number,
  // the day) spread across all the choices instead of nudging them by one.
  let hash = hashText(`${seed}|${part}`);
  hash ^= hash >>> 16;
  hash = Math.imul(hash, 0x85ebca6b);
  hash ^= hash >>> 13;
  hash = Math.imul(hash, 0xc2b2ae35);
  hash ^= hash >>> 16;
  return (hash >>> 0) % count;
}

// The same deterministic choice as pickIndex, but steered away from indices
// she's seen most recently — this is what stops a reflection or prompt from
// repeating itself while the house stays the same for a few days running,
// which the plain hash alone doesn't guard against with a pool this small.
//
// `recent` is her past picks for this exact field, most-recent-first (older
// entries and duplicates are fine — only the first count - 1 distinct values
// are ever used). Capping the avoid set at count - 1, rather than avoiding
// everything she's seen in some fixed window, is what makes this a true
// no-repeat-until-the-whole-pool-has-been-shown guarantee: there is always at
// least one un-avoided index to land on, so this never degrades back to a
// plain, repeatable pick the way avoiding an unbounded recent window would
// once she'd cycled through every variant at least once.
export function pickIndexAvoiding(seed: string, part: string, count: number, recent: readonly number[]): number {
  const start = pickIndex(seed, part, count);
  if (count <= 1) return start;
  const avoid = new Set<number>();
  for (const value of recent) {
    if (avoid.size >= count - 1) break;
    avoid.add(value);
  }
  for (let step = 0; step < count; step++) {
    const candidate = (start + step) % count;
    if (!avoid.has(candidate)) return candidate;
  }
  // Unreachable while avoid.size < count, kept only as a safety net.
  return start;
}
