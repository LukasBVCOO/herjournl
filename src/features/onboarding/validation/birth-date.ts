// Checking a date of birth. Pure: no screens, no storage.

// The youngest a person can be to use the app.
export const MIN_AGE = 16;

export type BirthDateProblem = "invalid" | "future" | "too-young";

export type BirthDateResult =
  | { ok: true }
  | { ok: false; problem: BirthDateProblem };

// Takes what she typed (day, month and year as text) and says whether it is a
// real date she is allowed to use the app with. Uses the phone's own calendar
// date for "today", since this is about her birthday, not a server moment.
export function checkBirthDate(
  day: string,
  month: string,
  year: string,
  today = new Date(),
): BirthDateResult {
  if (!/^\d{1,2}$/.test(day) || !/^\d{1,2}$/.test(month) || !/^\d{4}$/.test(year)) {
    return { ok: false, problem: "invalid" };
  }

  const d = Number(day);
  const m = Number(month);
  const y = Number(year);
  if (y < 1900) return { ok: false, problem: "invalid" };

  // JavaScript quietly turns 31 February into 3 March, so a date only counts if
  // it comes back out as the same day, month and year that went in.
  const born = new Date(y, m - 1, d);
  if (
    born.getFullYear() !== y ||
    born.getMonth() !== m - 1 ||
    born.getDate() !== d
  ) {
    return { ok: false, problem: "invalid" };
  }

  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  if (born > startOfToday) return { ok: false, problem: "future" };

  // Old enough means she turned MIN_AGE on or before today.
  const oldestAllowedBirthday = new Date(
    startOfToday.getFullYear() - MIN_AGE,
    startOfToday.getMonth(),
    startOfToday.getDate(),
  );
  if (born > oldestAllowedBirthday) return { ok: false, problem: "too-young" };

  return { ok: true };
}
