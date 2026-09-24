// The notes feature. Everything about notes lives in this folder.
//
//   content.ts        reading and writing note content (pure, no database)
//   dates.ts          how a note's date is shown, and the 30-day deleted timer
//   notes-api.ts      reading and changing notes in the database
//   save.ts           saving a note's writing
//   save-queue.ts     writing that hasn't reached the database yet
//   list/             the notes list screen and its note cards
//   search/           the search bar and how notes are matched
//   editor/           the writing screen, formatting bar, menu and its styles
//   deleted/          the Recently deleted screen
//
// A note can be written from a daily focus card: it keeps a copy of the card
// (types.ts FocusCardCopy), shown as the question above her writing and in a
// corner tooltip (editor/focus-info.tsx).
//
// The rest of the app only uses the screens below. src/app.tsx says which web
// address opens which one.
export { default as NotesListScreen } from "./list/notes-list";
export { default as EditNoteScreen } from "./editor/edit-note-screen";
export { default as NewNoteRedirect } from "./editor/new-note-redirect";
export { default as RecentlyDeletedScreen } from "./deleted/recently-deleted-screen";

// For the daily focus feature: start a note from what she wrote under a card,
// and (for the evening reflection) find that same note again later in the day
// and add to the end of it rather than starting a second one. Also: start
// today's Daily Plan note (its own checklist card, shown once the morning
// card is done — see daily-focus's daily-plan-card.tsx). Its distinct title
// (content.ts's dailyPlanTitle) is also what list/note-card.tsx checks for
// (isDailyPlanTitle) to give it its own icon-row layout, entirely inside
// this feature — daily-focus never needs to know.
export {
  appendToNote,
  findTodaysFocusNoteId,
  hasDailyPlanNote,
  startDailyPlanNote,
  startNoteFromFocus,
} from "./notes-store";
export type { FocusCardCopy } from "./types";
// Also for the daily focus feature: the preset content of a Checklist note,
// used by its own "Explore more" sheet (done-for-today-card.tsx) the same
// way the "+" menu's own Checklist action does (list/notes-list.tsx).
export { docFromChecklist } from "./content";

// For the install feature: whether she has written any daily-focus note yet
// (the moment that makes the first install offer due).
export { useNotes } from "./use-notes";
