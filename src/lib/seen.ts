import { getSession } from "./session";

// Small "has she looked at this yet?" marks, kept on this phone, per person.
// Used for the gold dots that point at something waiting: the crown in the
// bottom bar, and the options in "Explore more". Each area keeps one value
// (for example the day or moment she last looked). Nothing here is sent
// anywhere.
function key(area: string) {
  return `becomely:seen:${area}`;
}

export function markSeen(area: string, value = "yes") {
  const userId = getSession().userId;
  if (!userId) return;
  try {
    localStorage.setItem(key(area), JSON.stringify({ userId, value }));
  } catch {
    // Storage blocked: the dot just comes back next time.
  }
}

// What was last marked for this area, or null if she hasn't looked yet.
export function seenValue(area: string): string | null {
  const userId = getSession().userId;
  try {
    const saved = JSON.parse(localStorage.getItem(key(area)) ?? "null") as {
      userId: string;
      value: string;
    } | null;
    return saved && saved.userId === userId ? saved.value : null;
  } catch {
    return null;
  }
}
