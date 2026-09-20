import { Navigate } from "react-router";

// Kept so an older bookmark or home-screen shortcut to /notes/new still works:
// it makes a note id and hands over to the normal writing screen.
export default function NewNoteRedirect() {
  return (
    <Navigate to={`/notes/${crypto.randomUUID()}`} replace state={{ isNew: true }} />
  );
}
