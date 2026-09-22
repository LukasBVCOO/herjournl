// The words for a reduced card's theme: one entry per Moon sign (12), chosen by
// TODAY's Moon sign rather than her houses, since a house needs a birth time
// she doesn't have. Shaped exactly like content/houses.ts, and read the same
// way — one title, one statement and one prompt picked deterministically (see
// deterministic-seed.ts), then a line on the day's Moon-to-planet angle
// (content/moon-aspects.ts) added after the statement, when there is one.
//
// Rules, as in houses.ts:
//   - Warm, direct, aspirational. She is building something.
//   - Manifestation words lightly: intention, alignment, energy, abundance,
//     future self, make space, choose.
//   - Guide reflection, never predict or promise.
//   - No astrology words at all — never "Moon" itself.
//   - A statement is ONE sentence and ends with a full stop, because a line
//     about the day's angle may follow it. A prompt is one question.
//   - The FIRST title, statement and prompt in each list are the plain default
//     used if anything else is ever missing.

import type { Sign } from "@/features/onboarding";

export type MoonSignTheme = {
  // Never shown; stays the same for saving and for counting.
  key: string;
  // The theme, as she would name it.
  label: string;
  titles: readonly string[];
  statements: readonly string[];
  prompts: readonly string[];
};

export const MOON_SIGN_THEMES: Record<Sign, MoonSignTheme> = {
  Aries: {
    key: "action",
    label: "Action & Initiation",
    titles: ["Move first", "Start it now"],
    statements: [
      "Today favours action over waiting, so the fastest way through is to simply begin.",
      "Your energy is best spent starting something today, not perfecting it.",
    ],
    prompts: [
      "What could you start today instead of waiting to feel ready?",
      "Where has overthinking cost you more than acting would have?",
      "What is the smallest first move you could make right now?",
    ],
  },
  Taurus: {
    key: "stability",
    label: "Stability & Grounding",
    titles: ["Create some stability", "Slow it down"],
    statements: [
      "Today is better suited to slowing things down and strengthening what already supports you.",
      "Consistency matters more than intensity today, so build on what's already working.",
    ],
    prompts: [
      "What could you simplify today to feel more grounded?",
      "What already works, that deserves more of your attention?",
      "Where would slowing down actually get you further?",
    ],
  },
  Gemini: {
    key: "curiosity",
    label: "Curiosity & Conversation",
    titles: ["Follow the thread", "Say it out loud"],
    statements: [
      "Today rewards curiosity, so follow the question you keep coming back to.",
      "Talking or writing something through will get you further today than sitting with it alone.",
    ],
    prompts: [
      "What question have you been meaning to explore?",
      "Who would you benefit from talking this through with?",
      "What idea deserves more of your attention today?",
    ],
  },
  Cancer: {
    key: "care",
    label: "Care & Connection",
    titles: ["Come back to what feels safe", "Check in with yourself"],
    statements: [
      "Today asks for a little more gentleness, starting with how you treat yourself.",
      "Feeling secure matters more than usual today, so protect what helps you feel that way.",
    ],
    prompts: [
      "What would help you feel more secure today?",
      "Who or what makes you feel most at home?",
      "Where could you offer yourself the care you'd give someone else?",
    ],
  },
  Leo: {
    key: "expression",
    label: "Expression & Confidence",
    titles: ["Let yourself be seen", "Lead with warmth"],
    statements: [
      "Today rewards being visible, so let yourself take up the space you've been holding back from.",
      "Your confidence is worth trusting today, even in something small.",
    ],
    prompts: [
      "Where could you let yourself be seen a little more today?",
      "What would you do today if you weren't worried about being too much?",
      "What are you proud of that you haven't said out loud?",
    ],
  },
  Virgo: {
    key: "improvement",
    label: "Organisation & Improvement",
    titles: ["Tend to the details", "Make it a little better"],
    statements: [
      "Today favours the practical over the abstract, so pick one thing and make it better.",
      "Small, useful improvements will feel better today than big, vague plans.",
    ],
    prompts: [
      "What is one small thing you could improve today?",
      "Where would a little more order make things easier?",
      "What's the next practical step, not the perfect one?",
    ],
  },
  Libra: {
    key: "balance",
    label: "Balance & Harmony",
    titles: ["Find the balance", "Choose what feels fair"],
    statements: [
      "Today asks you to notice where things feel out of balance, and take one step toward evening them out.",
      "Harmony matters today, but not at the cost of what you actually need.",
    ],
    prompts: [
      "Where do you need a little more balance today?",
      "What would feel fair to both you and the people around you?",
      "Where have you been keeping the peace at your own expense?",
    ],
  },
  Scorpio: {
    key: "honesty",
    label: "Depth & Honesty",
    titles: ["Get honest", "Go beneath the surface"],
    statements: [
      "Today favours honesty over comfort, especially with yourself.",
      "Something deserves a closer, more honest look today.",
    ],
    prompts: [
      "What are you avoiding being honest with yourself about?",
      "What would you do differently if you stopped protecting your comfort?",
      "What's really going on beneath what you've been saying?",
    ],
  },
  Sagittarius: {
    key: "perspective",
    label: "Possibility & Perspective",
    titles: ["Widen the view", "Make room for possibility"],
    statements: [
      "Today is a good day to zoom out and remember how much is actually possible.",
      "Your perspective could use some fresh air today, so look beyond what's right in front of you.",
    ],
    prompts: [
      "What would you do if you believed it was possible?",
      "Where could you make more room for possibility today?",
      "What's a bigger version of what you're already doing?",
    ],
  },
  Capricorn: {
    key: "structure",
    label: "Responsibility & Structure",
    titles: ["Build it steadily", "Take the next step"],
    statements: [
      "Today favours steady effort over big leaps, so focus on the next honest step.",
      "Structure will help more than motivation today, so give yourself something concrete to do.",
    ],
    prompts: [
      "What is one steady step you could take today?",
      "Where would a little more structure actually help?",
      "What are you building, and what does it need from you today?",
    ],
  },
  Aquarius: {
    key: "independence",
    label: "Independence & Ideas",
    titles: ["Think differently", "Trust your own read"],
    statements: [
      "Today rewards thinking for yourself, even if it means going against the usual approach.",
      "Some distance will help you see things more clearly today.",
    ],
    prompts: [
      "Where could you trust your own perspective a little more today?",
      "What would you do differently if you stopped following the expected way?",
      "What do you need some distance from to think clearly?",
    ],
  },
  Pisces: {
    key: "intuition",
    label: "Intuition & Rest",
    titles: ["Soften the pace", "Trust what you notice"],
    statements: [
      "Today favours intuition over force, so notice what you sense before you decide.",
      "Rest and a slower pace will serve you better today than pushing through.",
    ],
    prompts: [
      "What is your intuition already telling you?",
      "Where could you soften the pace today?",
      "What would it feel like to trust yourself without needing proof?",
    ],
  },
};
