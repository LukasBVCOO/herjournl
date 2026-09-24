// The ten title/body pairs waiting-for-reflection-card.tsx picks from,
// deterministically (see deterministic-seed.ts) so it's the same all day but
// varies day to day rather than saying the exact same thing every time.
export type WaitingForReflectionMessage = { title: string; body: string };

export const WAITING_FOR_REFLECTION_MESSAGES: WaitingForReflectionMessage[] = [
  {
    title: "Let your day unfold",
    body: "Your evening reflection will be here at 8 pm.",
  },
  {
    title: "The day is yours",
    body: "We’ll leave a little space to reflect at 8 pm.",
  },
  {
    title: "Your day, your pace",
    body: "Come back at 8 pm for a moment to yourself.",
  },
  {
    title: "Carry your intention with you",
    body: "Check in with yourself tonight. Your reflection opens at 8 pm.",
  },
  {
    title: "See where today takes you",
    body: "Your evening reflection will be waiting from 8 pm.",
  },
  {
    title: "Make today feel like you",
    body: "There’s time to look back later. Your reflection opens at 8 pm.",
  },
  {
    title: "A little intention, then life",
    body: "Go about your day. Your evening reflection arrives at 8 pm.",
  },
  {
    title: "Find your own rhythm today",
    body: "A moment to pause and reflect will be here at 8 pm.",
  },
  {
    title: "Leave room for the unexpected",
    body: "Your evening reflection opens at 8 pm, whatever today brings.",
  },
  {
    title: "Let your plans meet the day",
    body: "Return at 8 pm to reflect on how it all felt.",
  },
];
