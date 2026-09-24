// Daily focus: the one area of life her day is pointed at, worked out from where
// the Moon is on her own chart that morning, and the card that says so.
//
//   local-day.ts           which card day it is for her (08:00 to 08:00, not midnight
//                          to midnight), and the 08:00 moment it is worked out for
//                          (daylight saving handled)
//   active-house.ts        the Moon at that moment, and which of her houses it is in
//   moon-aspect.ts          the Moon's closest angle to one of her seven natal
//                          planets today: worked out fresh from the sky, not
//                          picked from a list, so it changes even on a day the
//                          house does not. This is what keeps the card from
//                          repeating itself
//   content/               the words: houses.ts (12 areas of life) and
//                          moon-aspects.ts (7 planets x 5 angles, "how to approach
//                          it today"). moon-modifiers.ts (12 Moon signs, "how she
//                          tends to feel things") is kept but no longer used by
//                          the default card
//   deterministic-seed.ts  picks the house's own title/statement/prompt with no
//                          chance involved, so a card is the same all day
//   assemble-card.ts       builds the card from the house content and the day's
//                          Moon-to-planet angle
//   generate.ts            all of the above in one call: chart + day in, card out
//   types.ts               what a finished card is (including opened and done), and
//                          what asking for one returns
//   card-row.ts            a card <-> a row of the daily_focus_cards table
//   card-store.ts          the database: find a card, save one, mark it opened or
//                          done, find her chart
//   get-or-create.ts       today's card: found if made, made and saved if not
//   today.ts               get-or-create wired to the real clock and database, and
//                          kept in memory once found so reopening it is instant
//   use-todays-focus.ts    today's card for a screen (loading, ready or why not)
//   todays-focus-card.tsx  today's card on her notes list, below the search bar.
//                          A teaser that gives nothing away until she opens it;
//                          then the card itself, ready to answer, however long ago
//                          she opened it; then nothing once she has answered it
//                          (her answer is a note). Only ever today's card
//   focus-slot.ts          the rule for which of those three to show
//   focus-state.ts         what this phone remembers of today's card (opened, done,
//                          its words), so the list draws at once. The database is
//                          the record, and a "yes" is never taken back
//   focus-screen.tsx       the screen it leads to, where today's card is revealed
//   focus-card-view.tsx    the revealed card itself
//   focus-writing.tsx      under the card: where she writes, and "Done", which turns
//                          it into a note (see startNoteFromFocus in notes)
//   focus-draft.ts         keeps what she has typed so far on her phone, so leaving
//                          halfway loses nothing
//   daily-plan-card.tsx     a third moment, between the morning card and the
//                          evening reflection: once the morning card is
//                          done, a plain "Add a task" prompt offers a blank
//                          checklist for the rest of her day. Stays until
//                          she makes one (see startDailyPlanNote in notes)
//                          or, failing that, until it's evening — never
//                          alongside the reflect card
//   waiting-for-reflection-card.tsx a fourth moment, filling the rest of the
//                          day: once she has today's Daily Plan note (so the
//                          card above has nothing left to prompt), this
//                          quiet placeholder fills the gap until 8pm rather
//                          than leaving it blank
//   content/evening-reflection.ts, reflect-slot.ts, reflect-card.tsx,
//   reflect-screen.tsx     a second, smaller moment in the day: once the
//                          morning card is done, a "Time to reflect" card
//                          appears in its place, in the same style, leading
//                          to one question. Answering it adds the question
//                          and her answer to the END of today's own
//                          daily-focus note (see appendToNote in notes)
//                          rather than starting a new one.
//   done-for-today-card.tsx the last moment of the day: once the evening
//                          reflection is done, a quiet closing note takes
//                          the reflect card's place. Nothing to tap.
//
// This feature uses the notes feature (to make the note, and to append the
// evening reflection to it); notes knows nothing about it. app.tsx puts
// today's card, the Daily Plan card, the waiting card, the reflect card and
// the closing card on the notes list.
export { default as TodaysFocusCard } from "./todays-focus-card";
export { default as FocusScreen } from "./focus-screen";
export { default as DailyPlanCard } from "./daily-plan-card";
export { default as WaitingForReflectionCard } from "./waiting-for-reflection-card";
export { default as ReflectCard } from "./reflect-card";
export { default as ReflectScreen } from "./reflect-screen";
export { default as DoneForTodayCard } from "./done-for-today-card";
// A house's icon and colours, by house number — used here by NoteCard so a
// note written from a card can show which house it came from. A reduced-mode
// card has no house at all, so MOON_FALLBACK_VISUAL is its one shared mark.
export { default as HouseIcon } from "./house-icon";
export {
  HOUSE_VISUAL,
  MOON_FALLBACK_VISUAL,
  houseBorderColor,
  type HouseVisual,
} from "./content/house-visuals";
// Shared with the full birth chart page (profile/chart/), so a house's
// meaning and a sign's practical trait line are written once and read the
// same way everywhere they appear, not duplicated in a second content file.
export { HOUSE_CONTENT, type HouseContent, type HouseNumber } from "./content/houses";
export { MOON_MODIFIERS, type MoonModifier } from "./content/moon-modifiers";
export { cardDayIn, deviceTimeZone, localDateIn, localInstant, referenceInstant, REFERENCE_HOUR } from "./local-day";
export { moonHouse, readMoon, type MoonReading } from "./active-house";
export { assembleDailyFocusCard } from "./assemble-card";
export { generateDailyFocus } from "./generate";
export { getTodaysFocus } from "./today";
export type { DailyFocusCard, DailyFocusResult } from "./types";
