// Pure helpers for reading and writing note content. No database, no screens.
//
// A note's content is stored as JSON in the shape the editor (Tiptap) uses, so
// every note written earlier can still be opened when the editor grows.

import type { FocusCardCopy } from "./types";

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

// Plain writing as a note: one paragraph per line, blank lines kept.
export function docFromText(text: string): NoteNode {
  return {
    type: "doc",
    content: text
      .replace(/\r\n?/g, "\n")
      .split("\n")
      .map((line) =>
        line === ""
          ? { type: "paragraph" }
          : { type: "paragraph", content: [{ type: "text", text: line }] },
      ),
  };
}

const FOCUS_LIMITS = { label: 100, title: 200, statement: 800, prompt: 400 } as const;

// A card copy read back from the phone or the database, or null if it isn't a
// whole one. Anything odd is treated as "this note has no card".
export function parseFocusCard(value: unknown): FocusCardCopy | null {
  if (typeof value !== "object" || value === null) return null;
  const v = value as Record<string, unknown>;
  const text = (item: unknown, max: number) =>
    typeof item === "string" && item.trim() !== "" && item.length <= max ? item : null;

  const date = typeof v.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v.date) ? v.date : null;
  const title = text(v.title, FOCUS_LIMITS.title);
  const statement = text(v.statement, FOCUS_LIMITS.statement);
  const prompt = text(v.prompt, FOCUS_LIMITS.prompt);
  // The area is optional: a copy without a usable one is still a whole copy.
  const label = text(v.label, FOCUS_LIMITS.label);
  if (!date || !title || !statement || !prompt) return null;
  return label ? { date, label, title, statement, prompt } : { date, title, statement, prompt };
}

export function isNoteId(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value,
  );
}
