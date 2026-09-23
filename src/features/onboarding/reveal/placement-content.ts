// The words that go with each placement on the reveal. A fixed library rather
// than anything generated, so the quality is the same for everyone and it costs
// nothing per user.
//
// 12 for the Sun (her core identity), 12 for the Moon (her inner world) and 12
// for the Rising (how she comes across). The Cancer Sun, Aquarius Moon and
// Scorpio Rising lines come from the onboarding spec; the rest follow the same
// shape and voice. One sentence each, and nothing that needs astrology
// knowledge: no houses, aspects or degrees.

import type { Sign } from "../chart/natal-chart";

export type Placement = "sun" | "moon" | "rising";

export const placementLabel: Record<Placement, string> = {
  sun: "Your sense of self",
  moon: "Your emotional needs",
  rising: "How you meet the world",
};

const descriptions: Record<Placement, Record<Sign, string>> = {
  sun: {
    Aries:
      "You’re driven by courage and momentum, and you come alive when you’re starting something of your own.",
    Taurus:
      "You build things that last, and you’re at your best when you feel grounded, secure and unhurried.",
    Gemini:
      "You’re curious and quick, and you thrive when there’s always something new to learn, say or try.",
    Cancer: "You lead with feeling, intuition and what matters deeply to you.",
    Leo: "You’re at your best when you’re creating, being seen and doing things with your whole heart.",
    Virgo:
      "You care about the details, and you find meaning in making things better one thoughtful step at a time.",
    Libra:
      "You look for balance and beauty, and you bring harmony to the people and places around you.",
    Scorpio:
      "You feel things deeply and you’re drawn to what’s real, meaningful and worth transforming.",
    Sagittarius:
      "You’re guided by freedom and big-picture belief, and you grow by exploring beyond what’s familiar.",
    Capricorn:
      "You’re ambitious and steady, and you’re built for the long game of turning goals into results.",
    Aquarius:
      "You see things differently, value your independence and are drawn to ideas that shape the future.",
    Pisces:
      "You’re intuitive, imaginative and open-hearted, and you sense what isn’t always said out loud.",
  },
  moon: {
    Aries:
      "You feel things fast and fully, and you process emotion best by moving, doing and getting it out.",
    Taurus:
      "You need calm, comfort and consistency to feel safe, and you recharge through simple, sensory pleasures.",
    Gemini:
      "You make sense of your feelings by talking, writing and thinking them through.",
    Cancer:
      "You feel everything deeply and need a safe, familiar place where you can be completely yourself.",
    Leo: "You need to feel appreciated and warmly seen, and you give your affection generously in return.",
    Virgo:
      "You feel calmer when things are in order, and you show care through the practical things you do.",
    Libra:
      "You feel best when there’s peace and connection around you, and you’re sensitive to the mood in any room.",
    Scorpio:
      "Your emotions run deep and private, and you need real trust before you let someone all the way in.",
    Sagittarius:
      "You need space, honesty and room to explore, and you lift your own mood with optimism and adventure.",
    Capricorn:
      "You hold your feelings close and handle them with self-control, and you feel secure when you’re making progress.",
    Aquarius:
      "You often understand your feelings by stepping back and looking at them from a different angle.",
    Pisces:
      "You absorb the feelings around you, and you need quiet time, creativity and rest to reset.",
  },
  rising: {
    Aries:
      "You may come across as direct, energetic and confident, someone who moves first and figures out the rest as you go.",
    Taurus:
      "You may come across as calm, steady and grounded, with a presence that helps other people relax.",
    Gemini:
      "You may come across as curious, quick-witted and easy to talk to, always with a question or an idea.",
    Cancer:
      "You may come across as warm, protective and intuitive, someone who makes people feel at home.",
    Leo: "You may come across as warm, magnetic and confident, someone people notice when you walk in.",
    Virgo:
      "You may come across as thoughtful, capable and put-together, with a sharp eye for what needs doing.",
    Libra:
      "You may come across as graceful, charming and considerate, with a natural sense of style.",
    Scorpio:
      "You may come across as observant, private and more intense than you initially realise.",
    Sagittarius:
      "You may come across as open, upbeat and adventurous, someone who brings a sense of possibility.",
    Capricorn:
      "You may come across as composed, capable and quietly ambitious, with a presence that earns respect.",
    Aquarius:
      "You may come across as independent, original and a little unconventional, someone who does things their own way.",
    Pisces:
      "You may come across as gentle, dreamy and intuitive, with a softness that draws people in.",
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

// The line under the title. null only if a sign the library returns isn't one
// of the twelve, in which case the card just shows without a description.
export function placementDescription(placement: Placement, sign: Sign) {
  return descriptions[placement][sign] ?? null;
}
