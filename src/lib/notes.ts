// Helpers for reading and writing note content.
//
// A note's content is stored as JSON in the shape the editor (Tiptap) uses, so
// the real editor in step 1.5 can open every note written before it existed.

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

export function linesToContent(lines: string[]) {
  return {
    type: "doc",
    content: lines.map((line) =>
      line
        ? { type: "paragraph", content: [{ type: "text", text: line }] }
        : { type: "paragraph" },
    ),
  };
}

export function textToLines(text: string): string[] {
  return text.replace(/\r\n/g, "\n").trimEnd().split("\n");
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

export function isNoteId(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value,
  );
}

// "Sep 20", or "Sep 20, 2025" for a note from another year. Uses the phone's
// own time zone, so it has to run on her device, not on the server.
export function formatNoteDate(iso: string, now = new Date()) {
  const date = new Date(iso);
  const sameYear = date.getFullYear() === now.getFullYear();
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: sameYear ? undefined : "numeric",
  });
}
