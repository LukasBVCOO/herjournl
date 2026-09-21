// Finding notes. Pure functions: no database, no screens.
import type { ListedNote, NoteSummary } from "../types";

const SNIPPET_BEFORE = 40;
const SNIPPET_AFTER = 120;

// A note with its text prepared once, so each keystroke stays fast.
export type IndexedNote = ListedNote & {
  foldedTitle: string;
  foldedText: string;
};

// Lowercase and drop accents, so "cafe" finds "Café" and capitals don't
// matter. Every character stays one character, so positions in the folded
// text line up with the original when cutting out a snippet.
function fold(text: string) {
  return text
    .toLowerCase()
    .split("")
    .map((char) => char.normalize("NFD")[0] ?? char)
    .join("");
}

export function buildIndex(notes: ListedNote[]): IndexedNote[] {
  return notes.map((note) => ({
    ...note,
    foldedTitle: fold(note.title),
    foldedText: fold(note.text),
  }));
}

// "Morning  Intention" -> ["morning", "intention"]
function toWords(query: string) {
  return fold(query).split(/\s+/).filter(Boolean);
}

// A few words from around the first match, so she can see why it was found.
function snippetAround(note: IndexedNote, words: string[]) {
  const positions = words
    .map((word) => note.foldedText.indexOf(word))
    .filter((position) => position >= 0);
  // The match is only in the title, so the usual preview will do.
  if (positions.length === 0) return note.preview;

  const at = Math.min(...positions);
  const start = Math.max(0, at - SNIPPET_BEFORE);
  const end = Math.min(note.text.length, at + SNIPPET_AFTER);
  return (
    (start > 0 ? "…" : "") +
    note.text.slice(start, end).trim() +
    (end < note.text.length ? "…" : "")
  );
}

// Notes containing every word she typed, in the title or the writing.
// Title matches come first, then newest first.
export function searchNotes(index: IndexedNote[], query: string): NoteSummary[] {
  const words = toWords(query);
  if (words.length === 0) return [];

  return index
    .filter((note) =>
      words.every(
        (word) =>
          note.foldedTitle.includes(word) || note.foldedText.includes(word),
      ),
    )
    .map((note) => ({
      note,
      inTitle: words.some((word) => note.foldedTitle.includes(word)),
    }))
    .sort(
      (a, b) =>
        Number(b.inTitle) - Number(a.inTitle) ||
        b.note.updatedAt.localeCompare(a.note.updatedAt),
    )
    .map(({ note }) => ({
      id: note.id,
      title: note.title,
      preview: snippetAround(note, words),
      pinned: note.pinned,
      updatedAt: note.updatedAt,
      focusLabel: note.focusLabel,
    }));
}
