// How a calendar day is written for her, like "Monday 21 September". Shared by
// the daily focus card and the notes written from it.

// `localDate` is a calendar day ("2026-09-21"), not a moment, so it is read at
// midday UTC and shown in UTC: no time zone can push it onto the day before or
// after. Anything that isn't a real day (including "2026-02-30", which
// JavaScript would quietly turn into 2 March) gives an empty string.
export function dayLabel(localDate: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(localDate);
  if (!match) return "";
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const at = new Date(Date.UTC(year, month - 1, day, 12));
  if (
    at.getUTCFullYear() !== year ||
    at.getUTCMonth() !== month - 1 ||
    at.getUTCDate() !== day
  ) {
    return "";
  }
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(at);
}
