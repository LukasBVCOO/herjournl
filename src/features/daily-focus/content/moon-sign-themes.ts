// The words for a reduced card's theme: one entry per Moon sign (12), chosen by
// TODAY's Moon sign rather than her houses, since a house needs a birth time
// she doesn't have. Shaped exactly like content/houses.ts, and read the same
// way — one title and one statement picked deterministically (see
// deterministic-seed.ts), then a line on the day's Moon-to-planet angle
// (content/moon-aspects.ts) added after the statement, when there is one.
// Below that, a reflection and three prompts (intention, belief, next step)
// carry her from material to consider through to one action.
//
// Rules, as in houses.ts:
//   - Warm, direct, aspirational. She is building something.
//   - Manifestation words lightly: intention, alignment, energy, abundance,
//     future self, make space, choose.
//   - Guide reflection, never predict or promise.
//   - No astrology words at all — never "Moon" itself.
//   - A statement is ONE sentence and ends with a full stop, because a line
//     about the day's angle may follow it. A reflection is one or two
//     sentences of real material to think about, not another question. Each
//     prompt is one question.
//   - The FIRST title, statement, reflection and prompt of each kind in each
//     list are the plain default used if anything else is ever missing.

import type { Sign } from "@/features/onboarding";

export type MoonSignTheme = {
  // Never shown; stays the same for saving and for counting.
  key: string;
  // The theme, as she would name it.
  label: string;
  titles: readonly string[];
  statements: readonly string[];
  reflections: readonly string[];
  intentionPrompts: readonly string[];
  beliefPrompts: readonly string[];
  nextStepPrompts: readonly string[];
};

// A reduced card's `focus_category` column is always "moon_<theme key>" (see
// assemble-card.ts) — this is the one other place that needs to compute the
// same string ahead of actually building the card, to look up her recent
// history for today's theme before assembling (see variant-history.ts).
export function themeCategory(sign: Sign): string {
  return `moon_${MOON_SIGN_THEMES[sign].key}`;
}

export const MOON_SIGN_THEMES: Record<Sign, MoonSignTheme> = {
  Aries: {
    key: "action",
    label: "Action & Initiation",
    titles: ["Move first", "Start it now"],
    statements: [
      "Today favours action over waiting, so the fastest way through is to simply begin.",
      "Your energy is best spent starting something today, not perfecting it.",
    ],
    reflections: [
      "Starting rarely feels as risky in hindsight as it does right before you do it — most momentum comes from the first unremarkable move, not the perfect one.",
      "Waiting to feel fully ready is its own kind of decision, and today rewards choosing differently.",
      "The fastest way through something is often just to begin, even messily.",
    ],
    intentionPrompts: [
      "What could you start today instead of waiting to feel ready?",
      "Where has overthinking cost you more than acting would have?",
      "What is the smallest first move you could make right now?",
    ],
    beliefPrompts: [
      "What do you tell yourself about needing to feel ready before you start?",
      "What belief makes waiting feel safer than acting?",
      "What would you have to believe to trust a messy first attempt?",
      "What do you assume will happen if you start before you've figured it all out?",
    ],
    nextStepPrompts: [
      "What's the smallest first move you could make today?",
      "What's one thing you can start today instead of keep planning?",
      "What's one thing you can do today without waiting to feel ready?",
      "What's a small action today that beats another day of overthinking?",
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
    reflections: [
      "Consistency rarely feels exciting in the moment, but it's usually what's actually building the life you want.",
      "What already works deserves as much attention as whatever feels unfinished or urgent.",
      "Slowing down isn't the same as falling behind — sometimes it's what lets something last.",
    ],
    intentionPrompts: [
      "What could you simplify today to feel more grounded?",
      "What already works, that deserves more of your attention?",
      "Where would slowing down actually get you further?",
    ],
    beliefPrompts: [
      "What do you tell yourself about needing to move faster than feels natural?",
      "What belief makes slowing down feel like you're not doing enough?",
      "What do you assume you'll lose if you simplify instead of add more?",
      "What would you have to believe to trust what's already working?",
    ],
    nextStepPrompts: [
      "What's one small thing you can simplify today?",
      "What's one thing already working that you can give more attention today?",
      "What's a small, steady action you can take today instead of a big leap?",
      "What's one thing you can protect today because it already supports you?",
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
    reflections: [
      "A question you keep circling back to usually isn't random — it's worth actually following instead of setting aside again.",
      "Talking or writing something through tends to clarify it faster than turning it over quietly in your head ever does.",
      "Curiosity followed all the way through often leads somewhere more useful than certainty would have.",
    ],
    intentionPrompts: [
      "What question have you been meaning to explore?",
      "Who would you benefit from talking this through with?",
      "What idea deserves more of your attention today?",
    ],
    beliefPrompts: [
      "What do you tell yourself about needing to have it all figured out before you ask?",
      "What belief makes saying an unfinished thought out loud feel risky?",
      "What do you assume people will think if your idea isn't fully formed yet?",
      "What would you have to believe to follow a question wherever it leads?",
    ],
    nextStepPrompts: [
      "What's one question you can actually explore today instead of just wonder about?",
      "What's one thing you can talk or write through today?",
      "What's one idea you can give real attention to today?",
      "What's one conversation you can start today instead of keep rehearsing?",
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
    reflections: [
      "Feeling secure isn't only about circumstances — it's also about how gently you're willing to treat yourself when things feel uncertain.",
      "The care you'd offer someone else without a second thought is worth offering yourself just as easily.",
      "What makes you feel most at home is worth naming specifically, not just longed for vaguely.",
    ],
    intentionPrompts: [
      "What would help you feel more secure today?",
      "Who or what makes you feel most at home?",
      "Where could you offer yourself the care you'd give someone else?",
    ],
    beliefPrompts: [
      "What do you tell yourself about needing to earn a little gentleness?",
      "What belief makes asking for care feel like a burden to someone else?",
      "What do you assume you have to handle alone?",
      "What would you have to believe to protect what helps you feel secure?",
    ],
    nextStepPrompts: [
      "What's one way you can offer yourself care today?",
      "What's one small thing you can do today to feel more secure?",
      "What's one way you can make time today for whoever makes you feel most at home?",
      "What's one thing you can protect today because it helps you feel safe?",
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
    reflections: [
      "Being visible feels riskier in the moment than it does once you've actually done it — most of the resistance lives in the anticipation.",
      "What you're proud of doesn't count less just because you haven't said it out loud yet.",
      "Taking up space you've been holding back from rarely costs what you think it will.",
    ],
    intentionPrompts: [
      "Where could you let yourself be seen a little more today?",
      "What would you do today if you weren't worried about being too much?",
      "What are you proud of that you haven't said out loud?",
    ],
    beliefPrompts: [
      "What do you tell yourself about being 'too much' if you let yourself be seen?",
      "What belief makes it hard to say what you're proud of out loud?",
      "What do you assume people will think if you take up more space?",
      "What would you have to believe to trust your own confidence today?",
    ],
    nextStepPrompts: [
      "What's one way you can let yourself be seen a little more today?",
      "What's one thing you're proud of that you can say out loud today?",
      "What's one small, visible thing you can do today?",
      "What's one thing you can do today as if you weren't worried about being too much?",
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
    reflections: [
      "One small, practical improvement usually gets you further than a big plan that never quite starts.",
      "Order isn't the goal itself — it's just what makes room for what actually matters to you.",
      "The next practical step is usually smaller and closer than the perfect one you're waiting for.",
    ],
    intentionPrompts: [
      "What is one small thing you could improve today?",
      "Where would a little more order make things easier?",
      "What's the next practical step, not the perfect one?",
    ],
    beliefPrompts: [
      "What do you tell yourself about needing things to be perfect before they count?",
      "What belief makes an imperfect first step feel like it's not worth taking?",
      "What do you assume will go wrong if you simplify instead of perfect?",
      "What would you have to believe to trust the next practical step is enough?",
    ],
    nextStepPrompts: [
      "What's one small thing you can improve today?",
      "What's one place a little more order would make things easier today?",
      "What's the next practical step you can take today, not the perfect one?",
      "What's one small task you can finish today instead of perfect?",
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
    reflections: [
      "Keeping the peace and actually feeling at peace aren't always the same thing, and it's worth noticing which one you're choosing.",
      "Balance rarely arrives on its own — it usually takes one deliberate adjustment to get there.",
      "What feels fair to you matters as much as what feels fair to everyone else.",
    ],
    intentionPrompts: [
      "Where do you need a little more balance today?",
      "What would feel fair to both you and the people around you?",
      "Where have you been keeping the peace at your own expense?",
    ],
    beliefPrompts: [
      "What do you tell yourself about needing to keep everyone comfortable?",
      "What belief makes your own needs feel like an inconvenience to others?",
      "What do you assume you'll lose if you ask for something more balanced?",
      "What would you have to believe to expect fairness for yourself too?",
    ],
    nextStepPrompts: [
      "What's one small adjustment you can make today to feel more balanced?",
      "What's one thing you can ask for today that would feel fair to you?",
      "What's a small way you can stop keeping the peace at your own expense today?",
      "What's one thing you can do today to even things out?",
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
    reflections: [
      "The honest version of what's going on is usually quieter and less dramatic than the story you've been telling yourself about it.",
      "Protecting your comfort and protecting yourself aren't always the same thing.",
      "What you've been avoiding tends to keep its power for exactly as long as you avoid it.",
    ],
    intentionPrompts: [
      "What are you avoiding being honest with yourself about?",
      "What would you do differently if you stopped protecting your comfort?",
      "What's really going on beneath what you've been saying?",
    ],
    beliefPrompts: [
      "What are you avoiding being honest with yourself about?",
      "What belief makes the truth here feel too uncomfortable to sit with?",
      "What do you tell yourself to keep from looking closer?",
      "What would you have to believe to trust yourself with an honest look?",
    ],
    nextStepPrompts: [
      "What's one honest thing you can admit to yourself today?",
      "What's one thing you can look at today instead of avoid?",
      "What's a small way you can stop protecting your comfort today?",
      "What's one thing you can do today that only honesty would allow?",
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
    reflections: [
      "How big your world feels right now is mostly a matter of what you've let yourself believe is possible.",
      "A bigger version of what you're already doing is often closer than it looks from inside a narrow view.",
      "Some fresh perspective usually takes less than you'd think — just enough distance to see it differently.",
    ],
    intentionPrompts: [
      "What would you do if you believed it was possible?",
      "Where could you make more room for possibility today?",
      "What's a bigger version of what you're already doing?",
    ],
    beliefPrompts: [
      "What belief is making your world feel smaller than it actually is?",
      "What do you tell yourself is impossible without ever having tested it?",
      "What do you assume you're not ready for yet?",
      "What would you have to believe to make more room for possibility today?",
    ],
    nextStepPrompts: [
      "What's one small way you can make more room for possibility today?",
      "What's one bigger version of what you're already doing you can try today?",
      "What's one thing you can do today to widen your view, even slightly?",
      "What's one belief you can test today instead of just consider?",
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
    reflections: [
      "What you're building rarely announces its progress loudly — most days it just needs the next honest step, not a big leap.",
      "Structure isn't the opposite of freedom; it's often what actually makes freedom possible later.",
      "Motivation is unreliable, but a concrete next step tends to show up whether or not you feel like it.",
    ],
    intentionPrompts: [
      "What is one steady step you could take today?",
      "Where would a little more structure actually help?",
      "What are you building, and what does it need from you today?",
    ],
    beliefPrompts: [
      "What do you tell yourself about needing to feel motivated before you act?",
      "What belief makes steady, unglamorous effort feel like it's not enough?",
      "What do you assume you have to sacrifice to keep building this?",
      "What would you have to believe to trust the next small step is enough for today?",
    ],
    nextStepPrompts: [
      "What's one steady step you can take today?",
      "What's one place a little more structure would actually help today?",
      "What's one thing your goal needs from you today, even a small one?",
      "What's one concrete task you can finish today instead of wait to feel motivated?",
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
    reflections: [
      "Thinking for yourself sometimes means going against the expected way, and that's not the same as being wrong.",
      "A little distance from something often makes it easier to see clearly than staying close to it does.",
      "Your own read on a situation is worth trusting even when it differs from the usual approach.",
    ],
    intentionPrompts: [
      "Where could you trust your own perspective a little more today?",
      "What would you do differently if you stopped following the expected way?",
      "What do you need some distance from to think clearly?",
    ],
    beliefPrompts: [
      "What do you tell yourself about needing to follow the expected way?",
      "What belief makes trusting your own perspective feel risky?",
      "What do you assume people will think if you do this differently?",
      "What would you have to believe to trust your own read on things today?",
    ],
    nextStepPrompts: [
      "What's one way you can trust your own perspective a little more today?",
      "What's one thing you can do differently today than the expected way?",
      "What's one thing you can get some distance from today to think more clearly?",
      "What's one idea you can act on today instead of second-guess?",
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
    reflections: [
      "What you sense before you can explain it is still information, even without a fully logical case behind it yet.",
      "Pushing through and actually moving forward aren't always the same thing — sometimes softening the pace gets you there faster.",
      "Trusting yourself without needing proof first is its own kind of practice.",
    ],
    intentionPrompts: [
      "What is your intuition already telling you?",
      "Where could you soften the pace today?",
      "What would it feel like to trust yourself without needing proof?",
    ],
    beliefPrompts: [
      "What do you tell yourself about needing proof before you trust what you sense?",
      "What belief makes resting feel like you're falling behind?",
      "What do you assume will happen if you slow down today?",
      "What would you have to believe to trust yourself without needing to justify it?",
    ],
    nextStepPrompts: [
      "What's one way you can soften the pace today?",
      "What's one thing your intuition is already telling you that you can act on today?",
      "What's one small way you can rest today without guilt?",
      "What's one thing you can trust today without needing proof first?",
    ],
  },
};
