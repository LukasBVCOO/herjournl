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

export function paragraphsFor(text: string): NoteNode[] {
  return text
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) =>
      line === "" ? { type: "paragraph" } : { type: "paragraph", content: [{ type: "text", text: line }] },
    );
}

// Adds nodes to the end of an existing doc, with a blank line before them —
// used by the evening reflection to add its own question+answer onto today's
// daily-focus note rather than starting a new one (see notes-store.ts's
// appendToNote). A doc with no content yet (shouldn't happen in practice,
// since this only ever runs on a note that already has today's intention
// answer in it) is treated as empty, not an error.
export function appendNodes(doc: NoteNode, nodes: NoteNode[]): NoteNode {
  const existing = Array.isArray(doc?.content) ? doc.content : [];
  return { type: "doc", content: [...existing, { type: "paragraph" }, ...nodes] };
}

// Her three answers to a card, as one note shaped like the card itself:
// the card's own title leads (so it becomes the note's title the same way
// any note's first line already does — see titleFromLines — no separate
// title field needed), then each question she was actually asked sits
// directly above her answer to it, in order. "My intention" always has an
// answer (it's the one required field), so its question and her answer
// always appear; "belief" and "nextStep" only appear, each under its own
// real question, if she actually wrote something for it.
export function docFromCardAnswers(
  card: FocusCardCopy,
  answers: { intention: string; belief: string; nextStep: string },
): NoteNode {
  const content: NoteNode[] = [
    { type: "paragraph", content: [{ type: "text", text: card.title }] },
    { type: "heading", content: [{ type: "text", text: card.prompt }] },
    ...paragraphsFor(answers.intention.trim()),
  ];
  if (card.beliefPrompt && answers.belief.trim() !== "") {
    content.push({ type: "heading", content: [{ type: "text", text: card.beliefPrompt }] });
    content.push(...paragraphsFor(answers.belief.trim()));
  }
  if (card.nextStepPrompt && answers.nextStep.trim() !== "") {
    content.push({ type: "heading", content: [{ type: "text", text: card.nextStepPrompt }] });
    content.push(...paragraphsFor(answers.nextStep.trim()));
  }
  return { type: "doc", content };
}

const FOCUS_LIMITS = {
  label: 100,
  title: 200,
  statement: 800,
  reflection: 800,
  prompt: 400,
  beliefPrompt: 400,
  nextStepPrompt: 400,
} as const;

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
  // Likewise the house — never invented if it isn't a real 1-12 (a reduced-
  // mode card has no house at all, and older copies never kept one).
  const house =
    typeof v.house === "number" && Number.isInteger(v.house) && v.house >= 1 && v.house <= 12
      ? v.house
      : null;
  // The reflection and the two optional prompts: missing on any copy saved
  // before they existed, which is fine — a copy without them is still whole.
  const reflection = text(v.reflection, FOCUS_LIMITS.reflection);
  const beliefPrompt = text(v.beliefPrompt, FOCUS_LIMITS.beliefPrompt);
  const nextStepPrompt = text(v.nextStepPrompt, FOCUS_LIMITS.nextStepPrompt);
  if (!date || !title || !statement || !prompt) return null;
  return {
    date,
    title,
    statement,
    prompt,
    ...(label ? { label } : {}),
    ...(house ? { house } : {}),
    ...(reflection ? { reflection } : {}),
    ...(beliefPrompt ? { beliefPrompt } : {}),
    ...(nextStepPrompt ? { nextStepPrompt } : {}),
  };
}

export function isNoteId(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value,
  );
}
