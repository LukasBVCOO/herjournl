// An icon and a pair of colours (the icon itself, and the soft tint behind
// it) for each house — used on a note written from a daily focus card, and
// wherever else a house could use a small visual mark instead of text alone.
// Keyed by the house itself (1-12), the same number every full-personalisation
// card and every note written from one already carries (see types.ts's
// DailyFocusCard.activeHouse and notes/types.ts's FocusCardCopy.house).
export type HouseVisual = {
  // A file name under public/houses-icons/, or null to use the app's own
  // sparkle mark (the "✦" already used throughout its copy) instead of a
  // per-house icon — see MOON_FALLBACK_VISUAL.
  icon: string | null;
  color: string;
  background: string;
  // A full illustration for the notes-list "revealed" card, under
  // public/daily-cards/ — added one house at a time as the art is made.
  // Absent for a house without one yet: the card just shows without it, the
  // way it always has.
  image?: string;
  // A smaller illustration for the /focus screen's own card (the actual full
  // reveal, not the list) — sits in its top-right corner. Its own separate
  // artwork, not just `image` reused smaller.
  cornerImage?: string;
};

export const HOUSE_VISUAL: Record<number, HouseVisual> = {
  1: {
    icon: "1-plant.svg",
    color: "#B87968",
    background: "#F1E3DE",
    image: "/daily-cards/house-1-self.png",
    cornerImage: "/daily-cards/house-1-revealed.png",
  },
  2: {
    icon: "2-coins.svg",
    color: "#9A9B7A",
    background: "#EBECE4",
    image: "/daily-cards/house-2-worth.png",
    cornerImage: "/daily-cards/house-2-revealed.png",
  },
  3: {
    icon: "3-book.svg",
    color: "#D9C991",
    background: "#F6F0D8",
    image: "/daily-cards/house-3-mind.png",
    cornerImage: "/daily-cards/house-3-revealed.png",
  },
  4: {
    icon: "4-home-heart.svg",
    color: "#B8C4C2",
    background: "#EDF2F1",
    image: "/daily-cards/house-4-home.png",
    cornerImage: "/daily-cards/house-4-revealed.png",
  },
  5: {
    icon: "5-sparkle-highlight.svg",
    color: "#C5A56B",
    background: "#F3EBDD",
    image: "/daily-cards/house-5-creativity.png",
    cornerImage: "/daily-cards/house-5-revealed.png",
  },
  6: {
    icon: "6-hearts.svg",
    color: "#AAA58C",
    background: "#EEEBE3",
    image: "/daily-cards/house-6-routine.png",
    cornerImage: "/daily-cards/house-6-revealed.png",
  },
  7: {
    icon: "7-empathize.svg",
    color: "#C7A3A0",
    background: "#F3E8E7",
    image: "/daily-cards/house-7-relationships.png",
    cornerImage: "/daily-cards/house-7-revealed.png",
  },
  8: {
    icon: "8-flame.svg",
    color: "#765A62",
    background: "#EBE3E5",
    image: "/daily-cards/house-8-transformation.png",
    cornerImage: "/daily-cards/house-8-revealed.png",
  },
  9: {
    icon: "9-map-2.svg",
    color: "#8B8197",
    background: "#ECE9F0",
    image: "/daily-cards/house-9-growth.png",
    cornerImage: "/daily-cards/house-9-revealed.png",
  },
  10: {
    icon: "10-briefcase.svg",
    color: "#625852",
    background: "#E7E3E0",
    image: "/daily-cards/house-10-career.png",
    cornerImage: "/daily-cards/house-10-revealed.png",
  },
  11: {
    icon: "11-users-group.svg",
    color: "#7F98A3",
    background: "#E6EDF0",
    image: "/daily-cards/house-11-future.png",
    cornerImage: "/daily-cards/house-11-revealed.png",
  },
  12: {
    icon: "12-haze-moon.svg",
    color: "#AAA4B4",
    background: "#EEECF1",
    image: "/daily-cards/house-12-inner-world.png",
    cornerImage: "/daily-cards/house-12-revealed.png",
  },
};

// For a reduced-mode card (no birth time, so no house at all — see
// get-or-create.ts), or an older note from before the house was kept at all —
// one plain sparkle mark, on the same tan as the card itself (so there's
// nothing to colour-code, just a mark), rather than a full colour set of its
// own for all twelve Moon-sign themes.
export const MOON_FALLBACK_VISUAL: HouseVisual = {
  icon: null,
  // The app's own accent colour (--color-accent), not a house-specific one —
  // there's no house here to colour-code.
  color: "#C4A69B",
  background: "#EFE6DA",
};

// A shade between a house's light background and its deep icon colour — for a
// border that reads as "the same colour, a bit deeper," not the full icon
// colour itself. `amount` is how far toward the icon colour to go (0 = the
// background exactly, 1 = the icon colour exactly).
export function houseBorderColor(visual: HouseVisual, amount = 0.35): string {
  const bg = hexToRgb(visual.background);
  const fg = hexToRgb(visual.color);
  const mix = (a: number, b: number) => Math.round(a + (b - a) * amount);
  return rgbToHex(mix(bg.r, fg.r), mix(bg.g, fg.g), mix(bg.b, fg.b));
}

// A house's background colour, at a given opacity — for fading an
// illustration into the card underneath it rather than cutting it off with a
// hard edge.
export function houseFadeColor(visual: HouseVisual, alpha: number): string {
  const { r, g, b } = hexToRgb(visual.background);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function hexToRgb(hex: string) {
  const value = hex.replace("#", "");
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
  };
}

function rgbToHex(r: number, g: number, b: number) {
  const channel = (n: number) => n.toString(16).padStart(2, "0");
  return `#${channel(r)}${channel(g)}${channel(b)}`;
}
