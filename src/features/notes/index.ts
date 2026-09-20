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
// The rest of the app only uses the screens below. src/app.tsx says which web
// address opens which one.
export { default as NotesListScreen } from "./list/notes-list";
export { default as EditNoteScreen } from "./editor/edit-note-screen";
export { default as NewNoteRedirect } from "./editor/new-note-redirect";
export { default as RecentlyDeletedScreen } from "./deleted/recently-deleted-screen";
