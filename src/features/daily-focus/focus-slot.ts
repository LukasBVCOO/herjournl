// What the card slot on her notes list shows. Pure: no screens, no storage.
//
//   not opened yet   a teaser that shows none of the card's words
//   opened           the card itself, ready to answer, however long ago she opened
//                    it and whether or not she started writing
//   done             nothing: her answer is now an ordinary note in the list, and
//                    the next card arrives tomorrow
//
// "info" is what is known about today's card (null when nothing is known yet).
// While it is still being looked up, nothing is shown rather than a teaser that
// might turn out to be wrong a moment later. If it can't be found at all (no
// internet, no chart) the teaser is shown, and the screen it leads to says why.

export type SlotView = "teaser" | "card" | "none";

export function slotView(
  info: { opened: boolean; done: boolean } | null,
  loading: boolean,
): SlotView {
  if (info) return info.done ? "none" : info.opened ? "card" : "teaser";
  return loading ? "none" : "teaser";
}
