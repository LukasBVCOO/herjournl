// The weekly recap: her week, Monday to Sunday, one day at a time — the
// area of life each day was about, what she answered to each question, her
// evening reflection, and the affirmation she said.
//
//   week.ts                 weeks in card days: the Monday, the seven days,
//                           "21 – 27 September" (pure)
//   use-week.ts             one week's days: her notes written from each
//                           day's card (already on the phone) and her 369
//                           days (from the database)
//   recap-day.tsx           one day, in the colours of its house
//   weekly-recap-screen.tsx the recap, at /week (this week) and
//                           /week/<monday> (earlier ones)
//   weekly-recap-card.tsx   "Your week in review" on her notes list, from
//                           Sunday 18:00 to Monday 08:00, in place of the
//                           evening reflection (the Sunday notification at
//                           18:00 is the "weekly" row of notification_settings)
//   use-weekly-moment.ts    whether it's that window now, kept up to date
//   hidden-during-weekly-recap.tsx  hides the evening cards in that window
//   weekly-recap-button.tsx the calendar icon beside the search, any day,
//                           with a gold dot until she's opened the latest week
//   week-reflect-screen.tsx reflecting on the week, on its own screen
//                           (…/reflect): three questions (content/
//                           week-questions.ts), saved as a note titled
//                           "My week · …" (found again by that title)
//   week-draft.ts           what she has typed there so far, on her phone
//
// Reads from notes, daily-focus and affirmations through their index.ts;
// none of them know about it. The only thing it saves is the reflection, and
// that is an ordinary note.
export { default as WeeklyRecapScreen } from "./weekly-recap-screen";
export { default as WeekReflectScreen } from "./week-reflect-screen";
// The calendar icon beside the search, with its dot.
export { default as WeeklyRecapButton } from "./weekly-recap-button";
// Hides the daily evening cards from Sunday 18:00 to Monday 08:00, when the
// week's card takes their place.
export { default as HiddenDuringWeeklyRecap } from "./hidden-during-weekly-recap";
export { default as WeeklyRecapCard } from "./weekly-recap-card";
