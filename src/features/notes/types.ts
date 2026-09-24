// What a note card shows.
export type NoteSummary = {
  id: string;
  title: string;
  preview: string;
  pinned: boolean;
  updatedAt: string;
  // For a note written from a daily focus card: the area of life it was for, like
  // "Career & Direction". Its presence is what marks the note as one of those (it
  // gets a small star and this line above its title). Null for an ordinary note.
  focusLabel: string | null;
  // The house (1-12) the card came from, for picking its icon and colours
  // (see daily-focus's content/house-visuals.ts). Null for an ordinary note,
  // for a reduced-mode card (no birth time, so no house), and for notes made
  // before this was kept.
  focusHouse: number | null;
};

// The copy of a daily focus card that a note written from it keeps: the day, the
// card's title and statement, the reflection and the three prompts she was
// asked. It is separate from the note's writing, so it is never part of the
// title, preview or search.
export type FocusCardCopy = {
  // The card's day, like "2026-09-21".
  date: string;
  // The area of life in words, like "Career & Direction". Missing on notes made
  // before it was kept.
  label?: string;
  // The house (1-12) the card came from. Missing for a reduced-mode card (no
  // house at all) and for notes made before this was kept.
  house?: number;
  title: string;
  statement: string;
  // Material to consider, shown before the three prompts below. Missing on
  // notes made before this existed.
  reflection?: string;
  // "My intention" — the one required prompt, and the only one every note
  // from a card has always had.
  prompt: string;
  // "A belief to explore" / "My next step" — shown and encouraged, never
  // required to answer. Missing on notes made before these existed.
  beliefPrompt?: string;
  nextStepPrompt?: string;
};

// A note in the list, with all of its writing so the search box at the top can
// filter the list on her phone as she types.
export type ListedNote = NoteSummary & {
  text: string;
};

// What the Recently deleted screen needs to know about a note.
export type DeletedNoteSummary = {
  id: string;
  title: string;
  preview: string;
  daysLeft: number;
};
