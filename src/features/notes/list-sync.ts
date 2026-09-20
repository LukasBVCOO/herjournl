// The notes list can be shown from memory when she swipes back from the
// editor, so the editor leaves a flag behind telling the list to refresh
// itself once.
const CHANGED_KEY = "herjournl:notes-changed";

export function markNotesChanged() {
  try {
    sessionStorage.setItem(CHANGED_KEY, "1");
  } catch {
    // Private browsing can block storage; the list just refreshes next visit.
  }
}

export function consumeNotesChanged() {
  try {
    const changed = sessionStorage.getItem(CHANGED_KEY) === "1";
    if (changed) sessionStorage.removeItem(CHANGED_KEY);
    return changed;
  } catch {
    return false;
  }
}
