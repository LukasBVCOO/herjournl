// How each of the 12 Moon signs tends to feel things, in a sentence she can read
// without knowing any astrology. Her natal Moon sign (from her saved chart)
// picks the entry, and one line is added after the day's statement so the card
// feels written for her.
//
// Because these follow ANY of the 12 area statements (money, relationships,
// rest...), every line is about HOW she tends to approach things and never
// about a particular area of life.
//
// Rules, as in houses.ts: warm and direct, no astrology words (the word "Moon"
// itself never appears), no promises, guide rather than predict. Each line is one
// sentence, starts with "You" or an equivalent, and ends with a full stop.

import type { Sign } from "@/features/onboarding";

export type MoonModifier = {
  // Never shown; the one-line idea behind the entry.
  trait: string;
  lines: readonly string[];
};

export const MOON_MODIFIERS: Record<Sign, MoonModifier> = {
  Aries: {
    trait: "instinctive, direct, action-oriented",
    lines: [
      "You tend to know what you want quickly, so trust that first instinct and act on it.",
      "You usually feel better when you're moving, so take one small step instead of waiting for the perfect plan.",
      "Your energy responds to momentum, so start before you feel completely ready.",
    ],
  },
  Taurus: {
    trait: "seeks stability, comfort and consistency",
    lines: [
      "You feel most yourself when things are steady, so go at a pace you can sustain.",
      "Comfort and consistency help you think clearly, so build on what's already working.",
      "You tend to trust what you can see and feel, so let small, steady steps count.",
    ],
  },
  Gemini: {
    trait: "processes feelings through ideas and conversation",
    lines: [
      "You often work out how you feel by talking or writing it through, so let your thoughts onto the page.",
      "Curiosity is one of your strengths, so follow the questions that keep coming back.",
      "You tend to understand things best once you've put them into words, so write until it makes sense.",
    ],
  },
  Cancer: {
    trait: "sensitive to emotional security and connection",
    lines: [
      "You feel things deeply and pick up on the mood around you, so begin by asking what would help you feel secure.",
      "Feeling safe helps you move forward, so be gentle with yourself as you begin.",
      "You're often tuned in to what other people need, so remember to check in with what you need too.",
    ],
  },
  Leo: {
    trait: "wants expression, warmth and recognition",
    lines: [
      "You do your best when you feel inspired and seen, so let yourself be bold about what you want.",
      "Warmth and expression come naturally to you, so bring your full energy to it.",
      "You tend to thrive when you're proud of what you're doing, so choose something you can genuinely get behind.",
    ],
  },
  Virgo: {
    trait: "processes feelings through analysis and improvement",
    lines: [
      "You tend to make sense of things by breaking them down, so pick one thing to improve and start there.",
      "Details matter to you, so notice what could be a little better without asking for perfect.",
      "You usually feel calmer with a clear plan, so write down the next practical step.",
    ],
  },
  Libra: {
    trait: "seeks harmony, balance and connection",
    lines: [
      "You tend to see both sides, so give yourself permission to choose what feels right to you.",
      "Harmony matters to you, so notice where keeping the peace has been costing you your voice.",
      "You feel best when things feel balanced, so notice what would bring a little more of that back today.",
    ],
  },
  Scorpio: {
    trait: "feels deeply and privately",
    lines: [
      "You feel things deeply and privately, so give yourself some quiet time to notice what's really going on.",
      "You tend to sense what's beneath the surface, so trust what you notice and be honest with yourself about it.",
      "You don't do anything halfway, so choose the one thing that truly matters and give it your full focus.",
    ],
  },
  Sagittarius: {
    trait: "seeks perspective, freedom and possibility",
    lines: [
      "You tend to find clarity when you can see the wider view, so give yourself room to think freely.",
      "Freedom and possibility keep you motivated, so look for the option that opens things up.",
      "You usually feel your best when you're moving toward something exciting, so let yourself get excited.",
    ],
  },
  Capricorn: {
    trait: "responsible, practical, likes control",
    lines: [
      "You take responsibility seriously, so remember that progress doesn't have to be all effort.",
      "You feel best with a practical plan, so turn what you want into one clear step.",
      "You're used to holding it together, so notice where you could ask for support or take a lighter approach.",
    ],
  },
  Aquarius: {
    trait: "processes feelings through distance and perspective",
    lines: [
      "You often understand what you want by stepping back and seeing the bigger picture.",
      "Giving yourself some mental space can make your feelings easier to understand.",
      "You tend to find clarity when you can look at things from a little distance.",
    ],
  },
  Pisces: {
    trait: "intuitive, imaginative and emotionally receptive",
    lines: [
      "You're intuitive and imaginative, so let yourself feel your way toward what's right before you decide.",
      "You tend to absorb the feelings around you, so make space to find out what's actually yours.",
      "Your imagination is a strength, so picture how you want it to feel before you plan how to get there.",
    ],
  },
};
