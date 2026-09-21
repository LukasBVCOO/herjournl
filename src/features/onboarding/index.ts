// Onboarding: the questions a new user goes through once, right after she has
// created her account, ending on her first daily focus. Everything about it
// lives in this folder, grouped by what it does. onboarding_layout.md next to this
// file has the full guide (the journey screen by screen, what is saved, what is
// built), and DATA-SOURCES.md says where the places list and the astrology come
// from and how the historical time zone is worked out.
//
//   onboarding-flow.tsx   every screen and its web address (all under /onboarding)
//
//   questions/    the five screens she answers: welcome, name, birthday,
//                 birth time and birthplace
//   fields/       the inputs those questions are built from: the day / month /
//                 year boxes, the birth time picker, and the birthplace search
//   reveal/       "Mapping your chart" while the chart is made, then the reveal
//                 of her Sun, Moon and Rising. Also its animation, the
//                 placement cards and the 36 descriptions (12 Sun, 12 Moon,
//                 12 Rising)
//   focus/        the first Daily Focus card (a stand-in for now)
//
//   chart/        working out her chart: the real calculation (natal-chart.ts,
//                 using circular-natal-horoscope-js, loaded only when a chart is
//                 made, every result checked) and the bridge from her answers
//   places/       the birthplace search (the worldmap table in Supabase, through
//                 the search_places database function)
//   validation/   small pure checks: a birth date and a birth time
//   data/         what she has answered so far (in memory until she finishes),
//                 which questions are answered, and saving it all to her profile
//   layout/       the back arrow and progress bar shared by the questions
//
//   testing/      TESTING ONLY: the sparkle icon in the notes list header. Remove
//                 this folder, and its export below, before launch.
//
// The rest of the app uses only what is exported here.
export { default as OnboardingFlow } from "./onboarding-flow";
// Testing only: remove before launch.
export { default as OnboardingShortcut } from "./testing/onboarding-shortcut";

// Shared with the Profile screen. Changing her birth details there is entered,
// checked, searched and recalculated exactly the way onboarding does it, because
// it calls this same code. Nothing here has been moved: it still lives in the
// folders above.
export { default as BirthDateFields } from "./fields/birth-date-fields";
export { default as BirthTimeField } from "./fields/birth-time-field";
export { default as PlaceSearch } from "./fields/place-search";
export { default as Constellation } from "./reveal/constellation";
export { calculateChart, readSavedChart, SIGNS } from "./chart/natal-chart";
export type { Chart, Sign } from "./chart/natal-chart";
export { checkBirthDate, MIN_AGE } from "./validation/birth-date";
export type { BirthDateProblem } from "./validation/birth-date";
export { parseBirthTime } from "./validation/birth-time";
export { formatPlace, placeDetail } from "./places/places";
export type { Place } from "./places/places";
export {
  placementDescription,
  placementLabel,
  placementTitle,
} from "./reveal/placement-content";
