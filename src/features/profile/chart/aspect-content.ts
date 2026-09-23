// The angle between two of her planets, written as ONE genuine interpretation
// of that specific pair — not two separate planet phrases joined into a run-on
// sentence (the earlier version of this page did exactly that, and it read
// like two fortune cookies stapled together).
//
// The content is two layers, same "small tables" trick as the rest of this
// feature, but richer: a PAIR_CORE — a real, two-sentence description of what
// these two specific parts of a person tend to feel like together, written
// once per unordered pair (45 of them: 10 planets choose 2) — plus a short
// ASPECT_TAG naming how it plays out (fused, easy, tense, flowing, pulling),
// one per angle (5). 45 + 5 = 50 pieces of writing cover every one of the 225
// possible (pair, angle) combinations without needing all 225 hand-written,
// while still being specific to the actual pair — the thing that matters.

import type { AspectName, FullPlanetName } from "./full-chart";

export const ASPECT_LABEL: Record<AspectName, string> = {
  conjunction: "Conjunction",
  sextile: "Sextile",
  square: "Square",
  trine: "Trine",
  opposition: "Opposition",
};

// How each angle tends to play out, appended after a pair's own core
// sentence — the only aspect-specific content, so it never repeats a planet's
// own description, just names the dynamic.
export const ASPECT_TAG: Record<AspectName, string> = {
  conjunction: "These two are fused together here, so you likely experience them as one and the same thing.",
  sextile: "This tends to be an easy opening — a little effort here goes a long way.",
  trine: "This tends to come naturally, almost easily enough to take for granted.",
  square: "This can take real, active work — it rarely resolves on its own.",
  opposition: "This can pull in two directions at once, and the growth is in letting both be true.",
};

// Every unordered pair of the 10 planets (10 choose 2 = 45), in a fixed order
// so a pair can always be looked up the same way regardless of which planet
// the library happened to list first.
const PLANET_ORDER: readonly FullPlanetName[] = [
  "sun",
  "moon",
  "mercury",
  "venus",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
  "pluto",
];

function pairKey(a: FullPlanetName, b: FullPlanetName): string {
  const [x, y] = PLANET_ORDER.indexOf(a) <= PLANET_ORDER.indexOf(b) ? [a, b] : [b, a];
  return `${x}-${y}`;
}

type Pair = { theme: string; core: string };

// A subtitle theme (what these two parts of her are, together) and a
// two-sentence core (what it's genuinely like when they're connected),
// written per pair — not derived from the planets' own separate descriptions.
const PAIRS: Record<string, Pair> = {
  "sun-moon": {
    theme: "Head & heart",
    core: "This connects who you fundamentally are with what you need emotionally underneath it. When these two are in sync, you feel like yourself; when they're not, it can feel like living two different lives at once.",
  },
  "sun-mercury": {
    theme: "Identity & voice",
    core: "This connects your core identity with how you think and communicate. What you say and who you are tend to line up closely, for better or worse.",
  },
  "sun-venus": {
    theme: "Confidence & charm",
    core: "This connects your sense of self with how you love and what you find beautiful. Your confidence and your charm tend to move together.",
  },
  "sun-mars": {
    theme: "Confidence & action",
    core: "You may find it easier to act when a goal feels true to who you are. Taking the first step can help build your confidence.",
  },
  "sun-jupiter": {
    theme: "Confidence & growth",
    core: "This connects who you are with your instinct to grow, take risks and reach further. Your confidence tends to expand right alongside your ambition.",
  },
  "sun-saturn": {
    theme: "Identity & discipline",
    core: "This connects who you are with how much responsibility you feel you carry. Your confidence can be genuinely earned through discipline, but it can also feel conditional on proving yourself.",
  },
  "sun-uranus": {
    theme: "Identity & independence",
    core: "This connects who you are with your need to do things your own way. Fitting into someone else's mould can feel like it costs you something real.",
  },
  "sun-neptune": {
    theme: "Identity & imagination",
    core: "This connects who you are with your imagination and ideals. It can be hard to tell where the real you ends and the version you're imagining begins.",
  },
  "sun-pluto": {
    theme: "Identity & intensity",
    core: "This connects who you are with your capacity for real, unavoidable change. Your sense of self tends to be genuinely transformed by what you go through, not just adjusted.",
  },
  "moon-mercury": {
    theme: "Feelings & thoughts",
    core: "This connects how you feel with how you think and talk about it. Putting your feelings into words tends to come more naturally to you than it does for most people.",
  },
  "moon-venus": {
    theme: "Comfort & connection",
    core: "Affection, beauty and close relationships may help you feel emotionally settled. Expressing care can come naturally to you.",
  },
  "moon-mars": {
    theme: "Feelings & drive",
    core: "This connects how you feel with how you act on it. Your emotions and your instincts tend to move together — you feel it, then you act on it.",
  },
  "moon-jupiter": {
    theme: "Comfort & optimism",
    core: "This connects your emotional needs with your sense of hope and possibility. Feeling emotionally safe tends to make you more generous and optimistic, not less.",
  },
  "moon-saturn": {
    theme: "Feelings & responsibility",
    core: "This connects how you feel with how much responsibility you carry for other people's feelings too. Emotional security can end up feeling like something you have to earn rather than something that's simply there.",
  },
  "moon-uranus": {
    theme: "Feelings & change",
    core: "This connects your emotional needs with your need for freedom and change. Your moods can shift suddenly, and routine can start to feel confining faster than you'd expect.",
  },
  "moon-neptune": {
    theme: "Feelings & imagination",
    core: "This connects how you feel with your imagination and sensitivity to what's around you. You may pick up on other people's emotions as easily as your own, which can make it hard to know where their feelings end and yours begin.",
  },
  "moon-pluto": {
    theme: "Feelings & intensity",
    core: "This connects your emotional needs with your capacity for deep, real change. Your feelings can run intensely, and very little about your inner world stays surface-level for long.",
  },
  "mercury-venus": {
    theme: "Words & affection",
    core: "This connects how you think and talk with how you love and what you find beautiful. Conversation is often a real part of how you feel close to someone.",
  },
  "mercury-mars": {
    theme: "Words & action",
    core: "This connects your thinking with how you assert yourself. You tend to say what you think directly, sometimes before you've fully softened it.",
  },
  "mercury-jupiter": {
    theme: "Ideas & possibility",
    core: "This connects your thinking with your instinct to grow and explore. Your mind is drawn to the bigger picture, sometimes at the expense of the smaller details.",
  },
  "mercury-saturn": {
    theme: "Thoughts & structure",
    core: "This connects how you think with how seriously you take what you say. You tend to think things through carefully before committing to an idea out loud.",
  },
  "mercury-uranus": {
    theme: "Ideas & originality",
    core: "This connects your thinking with your instinct to break from the expected. Sudden insight tends to arrive for you, sometimes faster than you can explain where it came from.",
  },
  "mercury-neptune": {
    theme: "Thoughts & imagination",
    core: "This connects how you think with your imagination and intuition. Facts and impressions can blur together, so it's worth double-checking a strong instinct against the actual detail.",
  },
  "mercury-pluto": {
    theme: "Words & depth",
    core: "This connects how you think with your instinct to go deep rather than stay on the surface. You tend to notice what's underneath a conversation, not just what's being said out loud.",
  },
  "venus-mars": {
    theme: "Attraction & drive",
    core: "This connects how you love with how you go after what you want. Attraction and action tend to move together for you — when you want something, you tend to pursue it.",
  },
  "venus-jupiter": {
    theme: "Love & abundance",
    core: "This connects how you love with your sense of generosity and possibility. You tend to love expansively, and you may find it easy to see the best in people.",
  },
  "venus-saturn": {
    theme: "Love & commitment",
    core: "This connects how you love with how seriously you take responsibility. Your affection tends to be genuine and lasting, even if it takes you a while to fully show it.",
  },
  "venus-uranus": {
    theme: "Closeness & freedom",
    core: "You may want relationships that feel exciting and allow you to be yourself. Finding room for both commitment and independence can be an important theme.",
  },
  "venus-neptune": {
    theme: "Love & idealism",
    core: "This connects how you love with your imagination and ideals. You may fall for the potential in someone as much as who they actually are.",
  },
  "venus-pluto": {
    theme: "Love & intensity",
    core: "This connects how you love with your capacity for deep, transformative change. When you love, you tend to love completely, and it rarely stays casual for long.",
  },
  "mars-jupiter": {
    theme: "Drive & ambition",
    core: "This connects how you go after what you want with your instinct to reach further. Your energy tends to be big and enthusiastic, so pacing yourself is often the harder skill.",
  },
  "mars-saturn": {
    theme: "Drive & discipline",
    core: "This connects your drive with your sense of discipline and responsibility. You tend to work hard and stick with things, even once the initial motivation has faded.",
  },
  "mars-uranus": {
    theme: "Action & impulse",
    core: "This connects how you act with your need for freedom and change. Your energy can arrive suddenly and unpredictably, and patience isn't always where your instincts want to go.",
  },
  "mars-neptune": {
    theme: "Drive & imagination",
    core: "This connects your drive with your imagination and ideals. You're motivated by what genuinely inspires you, though it can be harder to act when the goal isn't clearly defined yet.",
  },
  "mars-pluto": {
    theme: "Drive & power",
    core: "This connects your drive with your capacity for real, intense change. When you commit to something, you tend to commit completely, and very little can talk you out of it.",
  },
  "jupiter-saturn": {
    theme: "Growth & structure",
    core: "This connects your instinct to grow with your sense of discipline and responsibility. You tend to balance ambition with a real, practical plan for getting there.",
  },
  "jupiter-uranus": {
    theme: "Growth & freedom",
    core: "This connects your instinct to grow with your need for independence. You're drawn to opportunities that feel genuinely different, not just more of the same.",
  },
  "jupiter-neptune": {
    theme: "Growth & idealism",
    core: "This connects your instinct to grow with your imagination and ideals. You tend to believe in possibility, sometimes ahead of the evidence for it.",
  },
  "jupiter-pluto": {
    theme: "Growth & intensity",
    core: "This connects your instinct to grow with your capacity for deep transformation. When you commit to growing in a direction, the change tends to be real and lasting, not surface-level.",
  },
  "saturn-uranus": {
    theme: "Structure & change",
    core: "This connects your sense of responsibility with your need to break from convention. You may feel a real pull between wanting stability and needing to do things differently.",
  },
  "saturn-neptune": {
    theme: "Structure & imagination",
    core: "This connects your discipline with your imagination and ideals. You tend to want your dreams to be practical enough to actually build, not just to hold onto.",
  },
  "saturn-pluto": {
    theme: "Structure & power",
    core: "This connects your sense of responsibility with your capacity for deep, unavoidable change. You tend to build things that are genuinely built to last, even through real pressure.",
  },
  "uranus-neptune": {
    theme: "Change & imagination",
    core: "This connects your need for freedom with your imagination and ideals. You're drawn to possibilities that haven't been tried yet, and convention rarely holds much appeal.",
  },
  "uranus-pluto": {
    theme: "Change & power",
    core: "This connects your need for independence with your capacity for deep transformation. When change comes for you, it tends to be sudden and complete rather than gradual.",
  },
  "neptune-pluto": {
    theme: "Imagination & depth",
    core: "This connects your imagination with your capacity for real transformation. What you dream about and what actually changes in you tend to be more connected than they first appear.",
  },
};

export function aspectPair(a: FullPlanetName, b: FullPlanetName): Pair {
  return PAIRS[pairKey(a, b)];
}

export function aspectSentence(aspect: AspectName, a: FullPlanetName, b: FullPlanetName): string {
  const pair = aspectPair(a, b);
  return `${pair.core} ${ASPECT_TAG[aspect]}`;
}
