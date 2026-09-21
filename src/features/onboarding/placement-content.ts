// The words that go with each placement on the reveal. A fixed library rather
// than anything generated, so the quality is the same for everyone and it costs
// nothing per user.
//
// Only the three descriptions from the onboarding spec are written so far. The
// other 33 come later; until then the reveal simply shows the title and the
// one-line label for those signs, which the spec allows (descriptions are
// optional).

import type { Sign } from "./sun-sign";

export type Placement = "sun" | "moon" | "rising";

export const placementLabel: Record<Placement, string> = {
  sun: "Your core energy",
  moon: "Your inner world",
  rising: "How you move through the world",
};

const descriptions: Record<Placement, Partial<Record<Sign, string>>> = {
  sun: {
    Cancer: "You lead with feeling, intuition and what matters deeply to you.",
  },
  moon: {
    Aquarius:
      "You often understand your feelings by stepping back and looking at them from a different angle.",
  },
  rising: {
    Scorpio:
      "You may come across as observant, private and more intense than you initially realise.",
  },
};

const titleSuffix: Record<Placement, string> = {
  sun: "Sun",
  moon: "Moon",
  rising: "Rising",
};

// "Cancer Sun"
export function placementTitle(placement: Placement, sign: Sign) {
  return `${sign} ${titleSuffix[placement]}`;
}

// null when that one hasn't been written yet.
export function placementDescription(placement: Placement, sign: Sign) {
  return descriptions[placement][sign] ?? null;
}
