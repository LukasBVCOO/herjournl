import { Extension } from "@tiptap/react";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import type { Node as PmNode } from "@tiptap/pm/model";
import { focusQuestionLabels } from "../content";
import type { FocusCardCopy } from "../types";

// In a note written from a daily focus card, each of the card's questions
// sits above her answer as a heading (content.ts's docFromCardAnswers). This
// shows the same small label above each question as the card screen does —
// "My intention", "A belief to explore", "My next step" — and "Evening
// reflection" above the evening question once she has answered it.
//
// The label is only drawn on screen, never saved into the note, so it stays
// out of the note's title, preview and search, and notes written before this
// existed get their labels too. A question is recognised by its words
// matching the card's own copy of it; if she rewrites a question, it simply
// loses its label. (The labels themselves: content.ts's focusQuestionLabels,
// shared with the weekly recap.)

function decorate(doc: PmNode, labels: Map<string, string>) {
  const decorations: Decoration[] = [];
  doc.forEach((node, offset) => {
    if (node.type.name !== "heading") return;
    const label = labels.get(node.textContent.trim());
    if (label) {
      decorations.push(Decoration.node(offset, offset + node.nodeSize, { "data-prompt-label": label }));
    }
  });
  return DecorationSet.create(doc, decorations);
}

export const PromptLabels = Extension.create<{ card: FocusCardCopy | null }>({
  name: "promptLabels",

  addOptions() {
    return { card: null };
  },

  addProseMirrorPlugins() {
    const card = this.options.card;
    if (!card) return [];
    const labels = focusQuestionLabels(card);

    return [
      new Plugin({
        key: new PluginKey("promptLabels"),
        state: {
          init: (_, state) => decorate(state.doc, labels),
          apply: (tr, previous) => (tr.docChanged ? decorate(tr.doc, labels) : previous),
        },
        props: {
          decorations(state) {
            return this.getState(state);
          },
        },
      }),
    ];
  },
});
