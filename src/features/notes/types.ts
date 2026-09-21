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
};

// The copy of a daily focus card that a note written from it keeps: the day, the
// card's title and statement, and the question that was asked. It is separate
// from the note's writing, so it is never part of the title, preview or search.
export type FocusCardCopy = {
  // The card's day, like "2026-09-21".
  date: string;
  // The area of life in words, like "Career & Direction". Missing on notes made
  // before it was kept.
  label?: string;
  title: string;
  statement: string;
  prompt: string;
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
