// The words for each area of life a day can point at. One entry per house of her
// chart (1 to 12); the astrology never shows, she only sees the label, a title,
// a short statement and a question.
//
// How a card is built from this: one title, one statement and one prompt are
// picked (the same ones all day, see the variation step), then a line about how
// her own Moon sign feels things (moon-modifiers.ts) is added after the statement.
//
// Rules for everything written here:
//   - Warm, direct, aspirational. She is building something.
//   - Manifestation words lightly: intention, alignment, energy, abundance,
//     future self, make space, choose.
//   - Guide reflection, never predict or promise ("deserves attention today",
//     never "is coming your way").
//   - No astrology words at all.
//   - A statement is ONE sentence and ends with a full stop, because a line about
//     her Moon sign follows it. A prompt is one question.
//   - The FIRST title, statement and prompt in each list are the plain default
//     used if anything else is ever missing.

export type HouseNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export type HouseContent = {
  // Never shown; stays the same for saving and for counting.
  key: string;
  // The area of life, as she would name it.
  label: string;
  titles: readonly string[];
  statements: readonly string[];
  prompts: readonly string[];
};

export const HOUSE_CONTENT: Record<HouseNumber, HouseContent> = {
  // Identity, how she sees and shows herself.
  1: {
    key: "self",
    label: "Self & Confidence",
    titles: ["Your presence", "Who you're becoming", "Claim your space"],
    statements: [
      "Today puts the spotlight on you, on how you see yourself and how you choose to show up.",
      "Your confidence deserves some attention today, and so does the woman you're becoming.",
      "Today is a good day to check in with how you're carrying yourself and what you're allowing yourself to want.",
    ],
    prompts: [
      "How does the version of you that you're becoming show up today?",
      "Where could you take up a little more space today?",
      "What would you do today if you fully trusted yourself?",
      "What is one thing you can do today that makes you feel most like you?",
      "What are you ready to stop apologising for?",
    ],
  },

  // Money, value, what she believes she is worth.
  2: {
    key: "money",
    label: "Money & Self-Worth",
    titles: ["Your worth", "Your abundance", "What you value"],
    statements: [
      "Money and your sense of value deserve more attention today.",
      "Today is a good day to notice what you value, and how that shows up in what you earn, spend and allow yourself to receive.",
      "Your relationship with abundance is in focus today, including what you believe you're worth.",
    ],
    prompts: [
      "What would feeling financially secure actually look like for you?",
      "What do you believe about your worth that you're ready to update?",
      "Where are you spending or saving out of fear instead of intention?",
      "What would you do with more abundance, and what is one step toward it today?",
      "What do you value enough to protect today?",
    ],
  },

  // Thinking, talking, learning, everyday exchanges.
  3: {
    key: "mind",
    label: "Mind & Communication",
    titles: ["Your words", "Clear thinking", "Say what you mean"],
    statements: [
      "Today is a good day to get clear on what you think and to say it plainly.",
      "Your mind is busy today, so what you say and what you take in matter more than usual.",
      "Conversations, ideas and messages carry extra weight today, so choose them with intention.",
    ],
    prompts: [
      "What is one thing you've been meaning to say, and how would you say it?",
      "What thought keeps repeating, and is it one you want to keep?",
      "What do you want to understand better right now?",
      "Who would benefit from hearing from you today?",
      "What would you say if you weren't worried about how it sounds?",
    ],
  },

  // Home, roots, feeling safe and settled.
  4: {
    key: "home",
    label: "Home & Security",
    titles: ["Your foundation", "Your space", "Come home to yourself"],
    statements: [
      "Home, roots and the feeling of being settled are in focus today.",
      "Today invites you to look at what makes you feel safe and supported, and where you could build more of it.",
      "Your space and your sense of stability deserve some care today.",
    ],
    prompts: [
      "What would make your home feel more like the life you're building?",
      "What helps you feel grounded, and how can you make space for it today?",
      "What from your past is shaping how safe you feel now?",
      "What is one small change to your space that would leave you feeling more aligned?",
      "Who or what makes you feel most at home, and how can you make time for it?",
    ],
  },

  // Creativity, play, romance, joy.
  5: {
    key: "creativity",
    label: "Creativity & Joy",
    titles: ["Your spark", "Make something", "Let it be fun"],
    statements: [
      "Creativity, play and joy are in focus today.",
      "Today is a good day to do something simply because it lights you up.",
      "Your energy is drawn toward what feels fun and expressive today, so let it lead a little.",
    ],
    prompts: [
      "What would feel joyful to make, try or do today?",
      "Where have you been too serious about something that could be fun?",
      "What did you love doing before it had to be productive?",
      "What would you create if there was no wrong answer?",
      "How can you bring more play into a day that's already full?",
    ],
  },

  // Daily habits, health, the way she looks after herself.
  6: {
    key: "routine",
    label: "Routine & Wellbeing",
    titles: ["Your rhythm", "Daily habits", "Look after yourself"],
    statements: [
      "Your daily habits and how you look after yourself are in focus today.",
      "Today is a good day to notice what your routine is doing for you, and what it's costing you.",
      "The small things you repeat shape who you become, and today they deserve some attention.",
    ],
    prompts: [
      "What is one habit that would make the biggest difference to how you feel?",
      "What in your routine gives you energy, and what drains it?",
      "How can you take better care of your body today?",
      "What would your future self thank you for doing every day?",
      "Where are you running on empty, and what would refilling look like?",
    ],
  },

  // Partnerships, close relationships.
  7: {
    key: "relationships",
    label: "Relationships",
    titles: ["Your people", "Real connection", "Who you let in"],
    statements: [
      "Today puts more attention on the people closest to you and what you need from them.",
      "Your relationships are in focus today, including how you show up in them.",
      "Today is a good day to notice who you feel most like yourself around.",
    ],
    prompts: [
      "What do you need more of from the people closest to you?",
      "Where are you giving more than you're receiving?",
      "What would a relationship that supports your goals look like?",
      "Who deserves a message from you today?",
      "What is one boundary that would help you feel more at ease?",
    ],
  },

  // Deep change, letting go, honesty, shared resources.
  8: {
    key: "transformation",
    label: "Transformation",
    titles: ["Let go", "What's changing", "Your next chapter"],
    statements: [
      "Change and letting go are in focus today, including what you're ready to leave behind.",
      "Today is a good day to be honest about what no longer fits the life you're building.",
      "Depth and honesty are in focus today, so look at what you've been avoiding.",
    ],
    prompts: [
      "What are you holding onto that no longer fits who you're becoming?",
      "What are you afraid to admit you want?",
      "What would you do differently if you could start over?",
      "What pattern are you ready to break?",
      "What would change if you stopped trying to control the outcome?",
    ],
  },

  // Beliefs, learning, travel, the bigger picture.
  9: {
    key: "growth",
    label: "Growth & Expansion",
    titles: ["Think bigger", "Your bigger picture", "Room to grow"],
    statements: [
      "Today is a good day to think bigger about what's possible for you.",
      "Growth, learning and new perspectives are in focus today.",
      "Your attention is drawn toward what's next and who you could become.",
    ],
    prompts: [
      "What would you do if you believed it was possible?",
      "What belief is keeping your world smaller than it needs to be?",
      "What do you want to learn, explore or experience next?",
      "Where could you say yes to something new today?",
      "What does the bigger version of your life look like?",
    ],
  },

  // Work, ambition, direction. (Wording follows the product documents.)
  10: {
    key: "career",
    label: "Career & Direction",
    titles: ["Your direction", "Where you're going", "Your next move"],
    statements: [
      "Today puts more attention on where you're going and what progress means to you.",
      "Your ambitions deserve a little more attention today.",
      "Today is a useful moment to look beyond the urgent and toward what you're building.",
    ],
    prompts: [
      "What is one move your future self would make today?",
      "What would meaningful progress look like today?",
      "Where are you waiting to feel ready before taking action?",
      "What are you building toward?",
      "What deserves more ambition from you right now?",
    ],
  },

  // Goals, friends, community, the future she is building.
  11: {
    key: "future",
    label: "Future & Community",
    titles: ["Your vision", "The future you're building", "Your circle"],
    statements: [
      "Your goals and the people who support them are in focus today.",
      "Today is a good day to reconnect with the future you're building and who you want beside you.",
      "Your bigger vision deserves attention today, along with the community that helps you reach it.",
    ],
    prompts: [
      "What is the future you're building, in one sentence?",
      "Who in your life is heading where you want to go?",
      "What is one step toward a goal you keep putting off?",
      "Which friendships or communities bring out your best?",
      "What would you like to be true a year from now?",
    ],
  },

  // Rest, solitude, what sits below the surface.
  12: {
    key: "inner_world",
    label: "Inner World & Rest",
    titles: ["Your inner world", "Rest and reset", "Slow down"],
    statements: [
      "Today is a good day to slow down and listen to what's going on inside.",
      "Rest, quiet and reflection are in focus today, and they are part of the work, not a break from it.",
      "You don't have to push today, so let yourself reset and notice what you actually need.",
    ],
    prompts: [
      "What do you need more rest from right now?",
      "What is your mind trying to tell you when it's quiet?",
      "What would slowing down make room for?",
      "What have you been ignoring that deserves your attention?",
      "What would it feel like to release the pressure to do more today?",
    ],
  },
};
