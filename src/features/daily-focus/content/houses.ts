// The words for each area of life a day can point at. One entry per house of her
// chart (1 to 12); the astrology never shows, she only sees the label, a title,
// a short statement, a reflection, and three prompts.
//
// How a card is built from this: one title and one statement are picked (the
// same ones all day, see the variation step), then a line about the Moon's
// closest angle to her chart is added after the statement (moon-aspects.ts).
// Below the statement, a reflection paragraph gives her real material to
// consider, then three prompts carry her from intention to belief to action:
//   intentionPrompts — what do I want to create or move towards?
//   beliefPrompts    — what thought makes that feel difficult?
//   nextStepPrompts  — what can I do today?
//
// Rules for everything written here:
//   - Warm, direct, aspirational. She is building something.
//   - Manifestation words lightly: intention, alignment, energy, abundance,
//     future self, make space, choose.
//   - Guide reflection, never predict or promise ("deserves attention today",
//     never "is coming your way").
//   - No astrology words at all.
//   - A statement is ONE sentence and ends with a full stop, because a line about
//     her Moon sign follows it. A reflection is one or two sentences of real
//     material to think about, not another question. Each prompt is one question.
//   - The FIRST title, statement, reflection and prompt of each kind in each
//     list are the plain default used if anything else is ever missing.

export type HouseNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export type HouseContent = {
  // Never shown; stays the same for saving and for counting.
  key: string;
  // The area of life, as she would name it.
  label: string;
  titles: readonly string[];
  statements: readonly string[];
  reflections: readonly string[];
  intentionPrompts: readonly string[];
  beliefPrompts: readonly string[];
  nextStepPrompts: readonly string[];
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
    reflections: [
      "Confidence isn't something you either have or don't — it shows up in small choices: the outfit you almost didn't wear, the opinion you almost didn't share, the room you almost didn't walk into.",
      "The version of you that you're becoming already knows how to take up space. The only question is how much you let her lead today.",
      "Self-trust builds the same way anything else does — one decision at a time, especially the ones nobody else sees you make.",
    ],
    intentionPrompts: [
      "How does the version of you that you're becoming show up today?",
      "Where could you take up a little more space today?",
      "What would you do today if you fully trusted yourself?",
      "What is one thing you can do today that makes you feel most like you?",
      "What are you ready to stop apologising for?",
    ],
    beliefPrompts: [
      "What do you tell yourself when you imagine being seen fully?",
      "What belief about yourself are you still proving wrong?",
      "What do you assume people think of you that you've never actually asked?",
      "What would you have to believe about yourself to stop shrinking?",
    ],
    nextStepPrompts: [
      "What is one small way you can show up as her today?",
      "What's one thing you can do today without asking permission first?",
      "What's a small, specific way to take up a little more space today?",
      "What is one thing you can do today that only the more confident version of you would do?",
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
    reflections: [
      "Security might mean more savings, more control over your time, or feeling comfortable asking for what your work is worth — it looks different for everyone, and it's worth being specific about which one you actually mean.",
      "What you charge, spend and save are all just decisions — and most of them are shaped by beliefs about worth you picked up a long time ago, not facts about what you deserve.",
      "Abundance isn't only about the number in your account. It's also about how easily you let yourself receive.",
    ],
    intentionPrompts: [
      "What would feeling financially secure actually look like for you?",
      "What do you believe about your worth that you're ready to update?",
      "Where are you spending or saving out of fear instead of intention?",
      "What would you do with more abundance, and what is one step toward it today?",
      "What do you value enough to protect today?",
    ],
    beliefPrompts: [
      "What do you tell yourself when you imagine asking for more?",
      "What belief about money did you inherit that you never chose?",
      "What do you assume you have to sacrifice to have more?",
      "What would you have to believe about your worth to charge what you're actually worth?",
    ],
    nextStepPrompts: [
      "What is one small step you can take today toward feeling more secure?",
      "What's one money decision you can make today from intention instead of fear?",
      "What's a specific way to protect what you value today?",
      "What's one thing you can do today to move closer to the number that would make you feel secure?",
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
    reflections: [
      "The thoughts you repeat become the story you live inside, and today is a good day to notice which ones are actually true and which ones just got loud.",
      "Saying something plainly, even once, changes how it sits in your body — half-said things tend to keep circling.",
      "What you take in shapes what you think about, so it's worth being as intentional with your inputs as your outputs today.",
    ],
    intentionPrompts: [
      "What is one thing you've been meaning to say, and how would you say it?",
      "What thought keeps repeating, and is it one you want to keep?",
      "What do you want to understand better right now?",
      "Who would benefit from hearing from you today?",
      "What would you say if you weren't worried about how it sounds?",
    ],
    beliefPrompts: [
      "What are you afraid people will think if you say it plainly?",
      "What thought do you keep having that you haven't questioned yet?",
      "What do you believe about yourself that makes speaking up feel risky?",
      "What would you have to believe to trust your own read on things?",
    ],
    nextStepPrompts: [
      "What's one thing you can say today instead of keep thinking?",
      "What's a message you can send today instead of draft in your head?",
      "What's one conversation you can start today, even briefly?",
      "What's one thing you can write down today to get it out of your head?",
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
    reflections: [
      "Feeling settled isn't only about where you live — it's also about who and what you let close, and what you've built that holds steady when things around you don't.",
      "Roots aren't fixed once; they're something you keep choosing, even in small ways, like what you let your space say about you.",
      "What felt safe growing up isn't always what actually makes you feel safe now, and today is worth noticing the difference.",
    ],
    intentionPrompts: [
      "What would make your home feel more like the life you're building?",
      "What helps you feel grounded, and how can you make space for it today?",
      "What from your past is shaping how safe you feel now?",
      "What is one small change to your space that would leave you feeling more aligned?",
      "Who or what makes you feel most at home, and how can you make time for it?",
    ],
    beliefPrompts: [
      "What do you believe you have to earn before you're allowed to feel settled?",
      "What did you learn about safety growing up that you're ready to update?",
      "What do you tell yourself about needing help to feel supported?",
      "What would you have to believe to let your home reflect who you are now?",
    ],
    nextStepPrompts: [
      "What's one small thing you can do today to make your space feel more like you?",
      "What's one way you can make time today for whoever makes you feel most at home?",
      "What's a small boundary you can set today to protect your sense of safety?",
      "What's one thing you can let go of today that no longer makes you feel grounded?",
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
    reflections: [
      "Joy doesn't need a reason or a result — sometimes the point of making something is simply that you wanted to.",
      "What used to feel fun before it had to be productive is still in there, and today is a good day to remember what that was.",
      "Play loosens the grip perfectionism has on everything else, even the parts of your life that feel serious.",
    ],
    intentionPrompts: [
      "What would feel joyful to make, try or do today?",
      "Where have you been too serious about something that could be fun?",
      "What did you love doing before it had to be productive?",
      "What would you create if there was no wrong answer?",
      "How can you bring more play into a day that's already full?",
    ],
    beliefPrompts: [
      "What do you tell yourself about needing a reason to do something just for fun?",
      "What belief makes rest or play feel like you're falling behind?",
      "What do you assume has to be perfect before it counts as creative?",
      "What would you have to believe to let something be fun without a purpose?",
    ],
    nextStepPrompts: [
      "What's one small thing you can do today purely because it sounds fun?",
      "What's one thing you can make, try or start today with no pressure attached?",
      "What's a way to bring a little more play into today, even for ten minutes?",
      "What's one thing you can do today the way you did it before it became work?",
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
    reflections: [
      "The small things you repeat every day quietly decide who you become — not the big leaps, the ordinary Tuesdays.",
      "Your body keeps a record of what your routine has actually been asking of it, and today is worth checking in on what that record says.",
      "Rest isn't the reward for finishing everything — it's part of what makes finishing anything possible.",
    ],
    intentionPrompts: [
      "What is one habit that would make the biggest difference to how you feel?",
      "What in your routine gives you energy, and what drains it?",
      "How can you take better care of your body today?",
      "What would your future self thank you for doing every day?",
      "Where are you running on empty, and what would refilling look like?",
    ],
    beliefPrompts: [
      "What do you tell yourself when you think about slowing down?",
      "What belief makes rest feel like something you have to earn?",
      "What do you assume will happen if your routine isn't perfect?",
      "What would you have to believe to treat your body as worth the effort?",
    ],
    nextStepPrompts: [
      "What's one small habit you can start or protect today?",
      "What's one thing you can do today to give your body what it's asking for?",
      "What's a small boundary that would protect your energy today?",
      "What's one thing you can remove from today to make more room to rest?",
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
    reflections: [
      "The people closest to you shape more of your days than almost anything else, so it's worth noticing who actually leaves you feeling like yourself.",
      "What you give in a relationship and what you receive don't always match, and today is a good day to be honest about the gap.",
      "Being close to someone and being fully yourself around them aren't automatically the same thing.",
    ],
    intentionPrompts: [
      "What do you need more of from the people closest to you?",
      "Where are you giving more than you're receiving?",
      "What would a relationship that supports your goals look like?",
      "Who deserves a message from you today?",
      "What is one boundary that would help you feel more at ease?",
    ],
    beliefPrompts: [
      "What do you tell yourself about asking for what you need from someone?",
      "What belief makes it hard to set a boundary with someone you love?",
      "What do you assume you have to accept to keep someone close?",
      "What would you have to believe to expect to be met halfway?",
    ],
    nextStepPrompts: [
      "What's one small way you can ask for what you need today?",
      "What's one message you can send today to someone who deserves to hear from you?",
      "What's a specific boundary you can hold today?",
      "What's one thing you can do today to give more to yourself in a relationship, not just to others?",
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
    reflections: [
      "Letting go rarely happens all at once — it's usually a hundred small decisions to stop reaching for the same thing.",
      "What no longer fits the life you're building can be true even if it was once exactly right for you.",
      "Being honest about what you actually want, even privately, is often the hardest and most useful part of change.",
    ],
    intentionPrompts: [
      "What are you holding onto that no longer fits who you're becoming?",
      "What are you afraid to admit you want?",
      "What would you do differently if you could start over?",
      "What pattern are you ready to break?",
      "What would change if you stopped trying to control the outcome?",
    ],
    beliefPrompts: [
      "What are you afraid it means about you if you let this go?",
      "What belief keeps you circling back to something you've outgrown?",
      "What do you tell yourself to avoid admitting what you actually want?",
      "What would you have to believe to trust yourself with a fresh start?",
    ],
    nextStepPrompts: [
      "What's one small thing you can release today, even symbolically?",
      "What's one honest thing you can admit to yourself today?",
      "What's a pattern you can interrupt today, even briefly?",
      "What's one thing you can do today instead of trying to control how it turns out?",
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
    reflections: [
      "The size of your world right now is mostly a matter of what you've let yourself believe is possible, not what's actually available to you.",
      "New perspective rarely arrives by staying exactly where you already are — a little exposure to something different usually does it.",
      "What you want to learn or explore next is often trying to tell you something about who you're becoming.",
    ],
    intentionPrompts: [
      "What would you do if you believed it was possible?",
      "What belief is keeping your world smaller than it needs to be?",
      "What do you want to learn, explore or experience next?",
      "Where could you say yes to something new today?",
      "What does the bigger version of your life look like?",
    ],
    beliefPrompts: [
      "What belief is quietly keeping your world smaller than it needs to be?",
      "What do you tell yourself is impossible without actually testing it?",
      "What do you assume you're not ready for yet?",
      "What would you have to believe to say yes before you feel fully prepared?",
    ],
    nextStepPrompts: [
      "What's one small way you can say yes to something new today?",
      "What's one thing you can learn, read or ask about today?",
      "What's a small step today toward something you've been putting off exploring?",
      "What's one belief you can test today instead of just think about?",
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
    reflections: [
      "Progress rarely looks as dramatic as the goal itself — most days it's one unremarkable, deliberate move in the right direction.",
      "What you're building says something about what you actually want, even on the days it feels more like maintenance than momentum.",
      "Waiting to feel fully ready is usually just another way of staying where you already are.",
    ],
    intentionPrompts: [
      "What is one move your future self would make today?",
      "What would meaningful progress look like today?",
      "Where are you waiting to feel ready before taking action?",
      "What are you building toward?",
      "What deserves more ambition from you right now?",
    ],
    beliefPrompts: [
      "What do you tell yourself about not being ready yet?",
      "What belief makes ambition feel like something to apologise for?",
      "What do you assume you have to sacrifice to want more from your career?",
      "What would you have to believe to act like the direction you want is already yours?",
    ],
    nextStepPrompts: [
      "What's one small move your future self would make today?",
      "What's one thing you can do today that counts as real progress, even quietly?",
      "What's a specific next step you've been putting off?",
      "What's one thing you can do today instead of waiting to feel ready?",
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
    reflections: [
      "The people around you are quietly shaping where you end up, whether or not you've thought about it that way before.",
      "A goal becomes more real the moment you say it in one clear sentence instead of a vague hope.",
      "The friendships and communities that bring out your best are worth protecting as deliberately as any goal.",
    ],
    intentionPrompts: [
      "What is the future you're building, in one sentence?",
      "Who in your life is heading where you want to go?",
      "What is one step toward a goal you keep putting off?",
      "Which friendships or communities bring out your best?",
      "What would you like to be true a year from now?",
    ],
    beliefPrompts: [
      "What do you tell yourself about needing the 'right' people around you first?",
      "What belief makes your bigger vision feel unrealistic?",
      "What do you assume you have to give up to reach for something bigger?",
      "What would you have to believe to let yourself want this out loud?",
    ],
    nextStepPrompts: [
      "What's one small step today toward a goal you keep putting off?",
      "What's one message you can send today to someone heading where you want to go?",
      "What's a specific way to invest in a friendship or community today?",
      "What's one thing you can do today to make the future you want feel more real?",
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
    reflections: [
      "What's quiet in you usually has something to say — it just needs enough stillness for you to actually hear it.",
      "Rest isn't a pause from becoming who you're meant to be; some of that becoming only happens in the quiet.",
      "The thing you've been avoiding often gets louder, not quieter, the longer it's left unattended.",
    ],
    intentionPrompts: [
      "What do you need more rest from right now?",
      "What is your mind trying to tell you when it's quiet?",
      "What would slowing down make room for?",
      "What have you been ignoring that deserves your attention?",
      "What would it feel like to release the pressure to do more today?",
    ],
    beliefPrompts: [
      "What do you tell yourself about needing to earn the right to rest?",
      "What belief makes slowing down feel like falling behind?",
      "What do you assume will happen if you finally sit with what you've been avoiding?",
      "What would you have to believe to trust stillness as much as you trust doing?",
    ],
    nextStepPrompts: [
      "What's one small way you can rest today without guilt?",
      "What's one thing you can do today to make space for quiet?",
      "What's a specific thing you can finally sit with today instead of avoid?",
      "What's one thing you can release today to feel less pressure to do more?",
    ],
  },
};
