// What she has typed under today's card but not yet finished with "Done", kept on
// her phone so leaving the screen (or the app) halfway never loses it. Three
// separate drafts now (intention, belief, next step — see focus-writing.tsx),
// each remembered on its own so switching between the three fields never
// loses what's in the others.
//
// It lives only in this phone's browser storage, is tied to her account and the
// day, and is wiped when she signs out or taps Done (when it becomes a note).
// Storage can be blocked (some private windows), so every call fails quietly and
// the screen still works, it just can't remember.
//
// What she writes is never logged or sent anywhere from here.

import { getSession, registerSignOutHandler } from "@/lib/session";

const PREFIX = "becomely:focus-draft:";

export type FocusDraftField = "intention" | "belief" | "nextStep";
const FIELDS: readonly FocusDraftField[] = ["intention", "belief", "nextStep"];

function keyFor(date: string, field: FocusDraftField): string | null {
  const userId = getSession().userId;
  return userId ? `${PREFIX}${userId}:${date}:${field}` : null;
}

export function readDraft(date: string, field: FocusDraftField): string {
  try {
    const key = keyFor(date, field);
    return (key && localStorage.getItem(key)) || "";
  } catch {
    return "";
  }
}

// Saving nothing removes that one field's draft.
export function saveDraft(date: string, field: FocusDraftField, text: string) {
  try {
    const key = keyFor(date, field);
    if (!key) return;
    if (text === "") localStorage.removeItem(key);
    else localStorage.setItem(key, text);
  } catch {
    // Nothing to do: she just won't have a draft to come back to.
  }
}

// Clears all three fields for the day at once, once she's answered.
export function clearDraft(date: string) {
  FIELDS.forEach((field) => saveDraft(date, field, ""));
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
