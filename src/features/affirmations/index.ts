// Affirmations, on the 369 method: one short line a day, taken from the house
// today's focus card is in, said 3 times in the morning, 6 in the afternoon
// and 9 in the evening.
//
//   sessions.ts              the rules: targets, time of day, late, streak (pure)
//   affirmations-api.ts      the database: the lines and her 369 days
//   daily-369-store.ts       today's line and counts, shared by every screen;
//                            which line today (she picks daily; yesterday's is option 4)
//   daily-lines.ts           today's three new lines (theme, goal, belief), rotating
//   use-daily-369.ts         the store, for a screen
//   line-picker.tsx          choosing today's line (theme / goal / belief)
//   ring-counter.tsx         tap mode: a ring and a dot per repetition
//   write-counter.tsx        write mode: type it each time (morning only)
//   affirmation-session.tsx  one session (3, 6 or 9), picker first if needed
//   affirmations-screen.tsx  the overview, at /affirmations (crown in the
//                            bottom bar): streak, today's card, past lines
//   affirmation-practice-screen.tsx
//                            today's practice, at /affirmations/today (and
//                            where the 2pm afternoon nudge opens)
//
// Uses the daily-focus feature for today's house and her card day. A feature
// of its own, under the crown: kept out of the morning entry and the evening
// reflection on purpose (founder, 2026-09-27), so the daily card stays simple.
export { default as AffirmationsScreen } from "./affirmations-screen";
export { default as AffirmationPracticeScreen } from "./affirmation-practice-screen";
// For the weekly recap: her lines for a run of days, and how many of the
// day's three sessions she finished.
export { fetchDaysBetween, type Day369 } from "./affirmations-api";
export { sessionsDone } from "./sessions";
// The gold dot on the crown in the bottom bar.
export { useAffirmationNudge } from "./use-affirmation-nudge";
