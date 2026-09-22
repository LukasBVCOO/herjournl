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
//
// This feature uses the notes feature (to make the note); notes knows nothing
// about it. app.tsx puts today's card on the notes list.
export { default as TodaysFocusCard } from "./todays-focus-card";
export { default as FocusScreen } from "./focus-screen";
export { cardDayIn, deviceTimeZone, localDateIn, localInstant, referenceInstant, REFERENCE_HOUR } from "./local-day";
export { moonHouse, readMoon, type MoonReading } from "./active-house";
export { assembleDailyFocusCard } from "./assemble-card";
export { generateDailyFocus } from "./generate";
export { getTodaysFocus } from "./today";
export type { DailyFocusCard, DailyFocusResult } from "./types";
