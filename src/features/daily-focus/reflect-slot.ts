// What the evening-reflection slot on her notes list shows. Pure: no screens,
// no storage. Reuses focus-slot.ts's own teaser/card/none states (it's
// already generic over any {opened, done} pair) for the extra rules specific
// to this second card: it can only ever appear once the morning card is
// done, once it actually has a question to ask (a card saved before the
// evening reflection existed has neither — see reflect-card.tsx), and once
// it's actually evening for her.

import { slotView, type SlotView } from "./focus-slot";

// The hour her evening reflection becomes due, in her own time zone — same
// idea as local-day.ts's REFERENCE_HOUR for the morning card.
export const REFLECT_HOUR = 20;

export function reflectSlotView(
  morningCardDone: boolean,
  hasPrompt: boolean,
  isEvening: boolean,
  reflection: { opened: boolean; done: boolean } | null,
  loading: boolean,
): SlotView {
  if (!morningCardDone || !hasPrompt || !isEvening) return "none";
  return slotView(reflection, loading);
}
