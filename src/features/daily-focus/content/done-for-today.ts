// The dozen title/body pairs done-for-today-card.tsx picks from, deterministically
// (see deterministic-seed.ts) so it's the same all evening but varies day to day
// rather than saying the exact same thing every time she finishes her day.
export type DoneForTodayMessage = { title: string; body: string };

export const DONE_FOR_TODAY_MESSAGES: DoneForTodayMessage[] = [
  {
    title: "Let today settle",
    body: "You’ve made time for yourself today. A fresh focus awaits tomorrow.",
  },
  {
    title: "Let the evening be yours",
    body: "Your reflection is complete. Spend the rest of tonight however you like.",
  },
  {
    title: "A little lighter tonight",
    body: "You’ve given your thoughts a place. Leave them here for a while.",
  },
  {
    title: "Let that be enough for today",
    body: "You don’t have to do more to deserve a quiet evening.",
  },
  {
    title: "Close today with kindness",
    body: "Whatever today looked like, give yourself room to be human.",
  },
  {
    title: "Take the evening slowly",
    body: "There’s no rush to begin again. Tomorrow’s focus will be here.",
  },
  {
    title: "Keep a little time for you",
    body: "You’ve looked back on your day. Now enjoy what’s left of it.",
  },
  {
    title: "Leave some things for tomorrow",
    body: "You don’t need every answer before the day ends.",
  },
  {
    title: "Make room for a little quiet",
    body: "Your words are here whenever you want to return to them.",
  },
  {
    title: "End the day on your own terms",
    body: "Rest, read, take a bath or do something just because you enjoy it.",
  },
  {
    title: "Your day has a place here",
    body: "The thoughts, the plans, the little moments. Come back whenever you like.",
  },
  {
    title: "Tomorrow is a fresh page",
    body: "For tonight, let yourself be where you are.",
  },
];
