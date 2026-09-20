// The notes feature. Everything about notes lives in this folder.
//
//   content.ts        reading and writing note content (pure, no database)
//   dates.ts          how a note's date is shown, and the 30-day deleted timer
//   queries.ts        reading notes from the database (server)
//   actions.ts        pin, delete, restore, delete forever (server)
//   save.ts           saving a note's writing (on her phone)
//   list-sync.ts      tells the list to refresh after an edit
//   list/             the notes list screen, its note cards and search filtering
//   search/           the search bar and how notes are matched
//   editor/           the writing screen, formatting bar, menu and its styles
//   deleted/          the Recently deleted screen
//
// The rest of the app only uses the screens below. Files in src/app are thin
// route files that show one of them: Next.js needs those files there because
// a page's folder is its web address.
export { default as NotesListScreen } from "./list/notes-list";
export { default as NewNoteScreen } from "./editor/new-note-screen";
export { default as EditNoteScreen } from "./editor/edit-note-screen";
export { default as RecentlyDeletedScreen } from "./deleted/recently-deleted-screen";
