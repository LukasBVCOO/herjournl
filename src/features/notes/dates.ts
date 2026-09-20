// "Sep 20", or "Sep 20, 2025" for a note from another year. Uses the phone's
// own time zone, so it has to run on her device, not on the server.
export function formatNoteDate(iso: string, now = new Date()) {
  const date = new Date(iso);
  const sameYear = date.getFullYear() === now.getFullYear();
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: sameYear ? undefined : "numeric",
  });
}

// A deleted note is kept this long, then removed for good.
export const DELETED_RETENTION_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

// When a deleted note was deleted before this moment, it has expired.
export function expiryCutoff(now = new Date()) {
  return new Date(now.getTime() - DELETED_RETENTION_DAYS * DAY_MS);
}

// Whole days left before a deleted note is removed. Never more than the full
// retention period and never below 1 while the note still exists.
export function daysLeft(deletedAtIso: string, now = new Date()) {
  const expiresAt = new Date(deletedAtIso).getTime() + DELETED_RETENTION_DAYS * DAY_MS;
  const days = Math.ceil((expiresAt - now.getTime()) / DAY_MS);
  return Math.min(DELETED_RETENTION_DAYS, Math.max(1, days));
}
