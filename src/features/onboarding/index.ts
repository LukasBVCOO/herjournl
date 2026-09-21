// Onboarding: the questions a new user goes through once, right after she has
// created her account, ending on her first daily focus.
//
// Screens, in order:
//   welcome-screen.tsx, name-screen.tsx, birthday-screen.tsx,
//   birth-time-screen.tsx, birthplace-screen.tsx   the questions
//   mapping-screen.tsx           "Mapping your chart" while the chart is made
//   reveal-screen.tsx            her Sun, Moon and Rising; saving happens here
//   focus-placeholder-screen.tsx a stand-in for the first Daily Focus card
//   onboarding-flow.tsx          every screen and its web address
//
// What they use:
//   step-frame.tsx, progress-bar.tsx, constellation.tsx, placement-card.tsx
//   answers-store.ts     what she has typed so far (in memory until she finishes)
//   steps.ts             which questions are answered
//   save-profile.ts      writes her answers to her profile in the database
//   places.ts            the birthplace search: the worldmap table in Supabase,
//                        searched by the search_places database function
//   birth-offset.ts      what her birthplace's clocks read against world time on
//                        her birthday (summer time and old rule changes included)
//   birth-date.ts, birth-time.ts, sun-sign.ts   small pure checks
//   placement-content.ts the words that go with each Sun, Moon and Rising
//
// PLACEHOLDER, to be replaced when the real chart service exists:
//   chart.ts             the chart (Sun estimated, Moon/Rising fixed)
//
//   onboarding-shortcut.tsx      TESTING ONLY: the icon in the notes list header
//
// The rest of the app uses only what is exported here.
export { default as OnboardingFlow } from "./onboarding-flow";
// Testing only: remove before launch.
export { default as OnboardingShortcut } from "./onboarding-shortcut";
