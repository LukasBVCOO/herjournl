// The rules of the 369, as plain functions: no screens, no database.
//
// One line a day, repeated 3 times in the morning, 6 in the afternoon and 9
// in the evening. Sessions are suggested by time of day but never locked: one
// done outside its own part of the day still counts, and is marked late.

export type Session = "morning" | "afternoon" | "evening";

export const SESSIONS: readonly Session[] = ["morning", "afternoon", "evening"];

export const TARGET: Record<Session, number> = { morning: 3, afternoon: 6, evening: 9 };

export const SESSION_LABEL: Record<Session, string> = {
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
};

export type Counts = Record<Session, number>;
export type DoneAt = Record<Session, string | null>;

// Which session the time of day suggests. Before noon is morning, noon to
// 6pm afternoon, after 6pm evening. Her day runs 08:00 to 08:00 (the same day
// as her focus card), so the small hours still belong to the evening before.
export function sessionForHour(hour: number): Session {
  if (hour >= 8 && hour < 12) return "morning";
  if (hour >= 12 && hour < 18) return "afternoon";
  return "evening";
}

// Finished in a later part of the day than its own — e.g. the morning 3x
// done at 2pm. Nothing is lost for it, it's only shown.
export function isLate(session: Session, doneHour: number): boolean {
  return SESSIONS.indexOf(sessionForHour(doneHour)) > SESSIONS.indexOf(session);
}

export function isSessionDone(counts: Counts, session: Session): boolean {
  return counts[session] >= TARGET[session];
}

export function sessionsDone(counts: Counts): number {
  return SESSIONS.filter((session) => isSessionDone(counts, session)).length;
}

// "YYYY-MM-DD" one day earlier, without going through any time zone.
export function dayBefore(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  const earlier = new Date(Date.UTC(y, m - 1, d - 1));
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${earlier.getUTCFullYear()}-${pad(earlier.getUTCMonth() + 1)}-${pad(earlier.getUTCDate())}`;
}

// Days in a row with at least one whole session done. Today only adds to it
// once something is done; until then the streak still stands from yesterday
// rather than showing 0 every morning.
export function currentStreak(days: { date: string; counts: Counts }[], today: string): number {
  const active = new Set(days.filter((day) => sessionsDone(day.counts) > 0).map((day) => day.date));
  let date = active.has(today) ? today : dayBefore(today);
  let streak = 0;
  while (active.has(date)) {
    streak++;
    date = dayBefore(date);
  }
  return streak;
}

// For write mode: the same words count as the same line, whatever the
// capitals, punctuation or spacing.
export function sameLine(typed: string, line: string): boolean {
  const normal = (text: string) =>
    text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
  return normal(typed) !== "" && normal(typed) === normal(line);
}
