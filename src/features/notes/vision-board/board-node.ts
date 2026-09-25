import { mergeAttributes, Node, ReactNodeViewRenderer } from "@tiptap/react";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import type { Node as PmNode } from "@tiptap/pm/model";
import BoardView from "./board-view";

export const VISION_BOARD_NODE = "visionBoard";

function countBoards(doc: PmNode) {
  let count = 0;
  doc.descendants((node) => {
    if (node.type.name === VISION_BOARD_NODE) count += 1;
    // A board only ever sits at the top level of a note, never inside a list.
    return false;
  });
  return count;
}

// The vision board block inside a note's content. The whole board, tiles and
// all, is one block whose tiles live in its "tiles" attribute (see tiles.ts),
// so it saves through the note's normal save queue with nothing extra.
//
// It can't be typed into, dragged, or removed by editing: backspacing from
// the line below, selecting everything and deleting, or cutting would
// otherwise wipe a whole board of photos in one keystroke. A board goes away
// only with its note (the note's own Delete, then Recently deleted).
export const VisionBoard = Node.create({
  name: VISION_BOARD_NODE,
  group: "block",
  atom: true,
  selectable: false,
  draggable: false,

  addAttributes() {
    return {
      tiles: {
        default: [],
        parseHTML: (element) => {
          try {
            return JSON.parse(element.getAttribute("data-tiles") ?? "[]");
          } catch {
            return [];
          }
        },
        renderHTML: (attributes) => ({ "data-tiles": JSON.stringify(attributes.tiles ?? []) }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="vision-board"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "vision-board" })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(BoardView);
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("visionBoardKeep"),
        filterTransaction: (tr, state) => {
          if (!tr.docChanged) return true;
          const before = countBoards(state.doc);
          return before === 0 || countBoards(tr.doc) >= before;
        },
      }),
    ];
  },
});
