// Pure helpers for reading and writing note content. No database, no screens.
//
// A note's content is stored as JSON in the shape the editor (Tiptap) uses, so
// every note written earlier can still be opened when the editor grows.

export type NoteNode = {
  type?: string;
  text?: string;
  content?: NoteNode[];
};

const TITLE_MAX_LENGTH = 120;
const PREVIEW_MAX_LENGTH = 200;

function isInline(node: NoteNode) {
  return node.type === "text" || node.type === "hardBreak";
}

function inlineText(nodes: NoteNode[]) {
  return nodes
    .map((node) => (node.type === "hardBreak" ? "\n" : (node.text ?? "")))
    .join("");
}

function collectLines(node: NoteNode, lines: string[]) {
  const children = node.content ?? [];
  const isTextBlock =
    node.type === "paragraph" ||
    node.type === "heading" ||
    (children.length > 0 && children.every(isInline));

  if (isTextBlock) {
    lines.push(inlineText(children));
    return;
  }
  children.forEach((child) => collectLines(child, lines));
}

// Every line of writing in a note, in order. Blank lines are kept.
export function noteToLines(content: unknown): string[] {
  if (!content || typeof content !== "object") return [];
  const lines: string[] = [];
  collectLines(content as NoteNode, lines);
  return lines.flatMap((line) => line.split("\n"));
}

// The first line with writing on it is the note's title.
function firstWrittenIndex(lines: string[]) {
  return lines.findIndex((line) => line.trim() !== "");
}

export function titleFromLines(lines: string[]) {
  const index = firstWrittenIndex(lines);
  if (index === -1) return "";
  return lines[index].trim().slice(0, TITLE_MAX_LENGTH);
}

// Everything after the title, squashed onto one line for the list card.
export function previewFromLines(lines: string[]) {
  const index = firstWrittenIndex(lines);
  if (index === -1) return "";
  return lines
    .slice(index + 1)
    .map((line) => line.trim())
    .filter(Boolean)
    .join(" ")
    .slice(0, PREVIEW_MAX_LENGTH);
}

// All the writing in a note on one line, title included. Used by search.
export function textFromLines(lines: string[]) {
  return lines
    .map((line) => line.trim())
    .filter(Boolean)
    .join(" ");
}

export function isEmptyDoc(doc: unknown) {
  return titleFromLines(noteToLines(doc)) === "";
}

export function isNoteId(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value,
  );
}
