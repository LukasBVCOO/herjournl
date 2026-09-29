// What she has typed in her weekly reflection but not yet finished with
// "Done", kept on her phone so leaving halfway never loses it. Same approach
// as daily-focus's focus-draft.ts: this browser only, tied to her account and
// the week, wiped when she signs out or taps Done. Storage can be blocked
// (some private windows), so every call fails quietly.
//
// What she writes is never logged or sent anywhere from here.

import { getSession, registerSignOutHandler } from "@/lib/session";
import { WEEK_QUESTIONS, type WeekQuestionId } from "./content/week-questions";

const PREFIX = "becomely:week-draft:";

function keyFor(monday: string, id: WeekQuestionId): string | null {
  const userId = getSession().userId;
  return userId ? `${PREFIX}${userId}:${monday}:${id}` : null;
}

export function readWeekDraft(monday: string, id: WeekQuestionId): string {
  try {
    const key = keyFor(monday, id);
    return (key && localStorage.getItem(key)) || "";
  } catch {
    return "";
  }
}

export function saveWeekDraft(monday: string, id: WeekQuestionId, text: string) {
  try {
    const key = keyFor(monday, id);
    if (!key) return;
    if (text === "") localStorage.removeItem(key);
    else localStorage.setItem(key, text);
  } catch {
    // She just won't have a draft to come back to.
  }
}

export function clearWeekDraft(monday: string) {
  WEEK_QUESTIONS.forEach((question) => saveWeekDraft(monday, question.id, ""));
}

registerSignOutHandler({
  prepare: async () => null,
  clear: async () => {
    try {
      Object.keys(localStorage)
        .filter((key) => key.startsWith(PREFIX))
        .forEach((key) => localStorage.removeItem(key));
    } catch {
      // Storage blocked: nothing stored to clear.
    }
  },
});
