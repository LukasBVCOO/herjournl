// What she has typed under today's card but not yet finished with "Done", kept on
// her phone so leaving the screen (or the app) halfway never loses it.
//
// It lives only in this phone's browser storage, is tied to her account and the
// day, and is wiped when she signs out or taps Done (when it becomes a note).
// Storage can be blocked (some private windows), so every call fails quietly and
// the screen still works, it just can't remember.
//
// What she writes is never logged or sent anywhere from here.

import { getSession, registerSignOutHandler } from "@/lib/session";

const PREFIX = "becomely:focus-draft:";

function keyFor(date: string): string | null {
  const userId = getSession().userId;
  return userId ? `${PREFIX}${userId}:${date}` : null;
}

export function readDraft(date: string): string {
  try {
    const key = keyFor(date);
    return (key && localStorage.getItem(key)) || "";
  } catch {
    return "";
  }
}

// Saving nothing removes the draft.
export function saveDraft(date: string, text: string) {
  try {
    const key = keyFor(date);
    if (!key) return;
    if (text === "") localStorage.removeItem(key);
    else localStorage.setItem(key, text);
  } catch {
    // Nothing to do: she just won't have a draft to come back to.
  }
}

export function clearDraft(date: string) {
  saveDraft(date, "");
}

registerSignOutHandler({
  prepare: async () => null,
  clear: async () => {
    try {
      Object.keys(localStorage)
        .filter((key) => key.startsWith(PREFIX))
        .forEach((key) => localStorage.removeItem(key));
    } catch {
      // Storage blocked: there is nothing stored to clear.
    }
  },
});
