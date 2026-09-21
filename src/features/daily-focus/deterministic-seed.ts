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

// What one card is built from: who, which day, which area of life.
export function seedFor(userId: string, localDate: string, activeHouse: number): string {
  return `${userId}|${localDate}|${activeHouse}`;
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
