// "Today" for her, and the moment that day's focus is worked out for.
//
// A card day belongs to the time zone her phone is in and runs from 08:00 to
// 08:00 (see cardDayIn). Its focus is worked out for 08:00 there, a fixed morning
// moment, so the card does not change as the Moon moves on through the day. This
// turns "08:00 on this date in this zone" into one exact moment in UTC.
//
// Only the browser's own time zone knowledge (Intl) is used, so it follows
// daylight-saving changes without any list of rules kept here.

// The hour of the morning a day's focus is worked out for.
export const REFERENCE_HOUR = 8;

const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;

// The time zone her phone is set to, like "Europe/Vilnius". No location needed.
export function deviceTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

const formatters = new Map<string, Intl.DateTimeFormat>();

function partsIn(at: number, timeZone: string) {
  let formatter = formatters.get(timeZone);
  if (!formatter) {
    // An unknown zone name makes this throw, which is what we want.
    formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    });
    formatters.set(timeZone, formatter);
  }
  const found: Record<string, number> = {};
  for (const part of formatter.formatToParts(at)) {
    if (part.type !== "literal") found[part.type] = Number(part.value);
  }
  return found;
}

// How far ahead of UTC a zone's clocks are at a moment, in milliseconds.
function offsetAt(at: number, timeZone: string): number {
  const p = partsIn(at, timeZone);
  const wall = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return wall - Math.floor(at / 1000) * 1000;
}

const pad = (value: number) => String(value).padStart(2, "0");

// The calendar day, as "2026-09-21", that a moment falls on in a time zone.
export function localDateIn(at: Date, timeZone: string): string {
  if (Number.isNaN(at.getTime())) throw new Error("Not a real moment in time");
  const p = partsIn(at.getTime(), timeZone);
  return `${p.year}-${pad(p.month)}-${pad(p.day)}`;
}

// Which day's card she is on right now. The daily focus does not run from
// midnight to midnight but from 08:00 to 08:00: at 03:00 on the 22nd she is still
// on the 21st's card, and the 22nd's card begins at 08:00. So this is the calendar
// day in her time zone, stepped back a day for anything before 08:00 on her clock.
// (Each card is worked out for 08:00 of its day, which has always already happened.)
export function cardDayIn(at: Date, timeZone: string): string {
  if (Number.isNaN(at.getTime())) throw new Error("Not a real moment in time");
  const p = partsIn(at.getTime(), timeZone);
  const day = new Date(Date.UTC(p.year, p.month - 1, p.day));
  if (p.hour < REFERENCE_HOUR) day.setUTCDate(day.getUTCDate() - 1);
  return `${day.getUTCFullYear()}-${pad(day.getUTCMonth() + 1)}-${pad(day.getUTCDate())}`;
}

// The exact moment (UTC) when a zone's clocks read `hour:minute` on `localDate`.
//
// Twice a year a zone's clocks skip an hour or repeat one, so a clock time can
// belong to no moment or to two. A skipped time is read as the JavaScript Date
// does (as if the clocks had not jumped yet, which lands just after the jump),
// and a repeated time takes its first occurrence. The 08:00 used for a daily
// focus is never in either, but the rule is fixed so nothing is left to chance.
export function localInstant(
  localDate: string,
  timeZone: string,
  hour: number = REFERENCE_HOUR,
  minute: number = 0,
): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(localDate);
  if (!match) throw new Error("A date must look like 2026-09-21");
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const calendar = new Date(Date.UTC(year, month - 1, day));
  if (
    calendar.getUTCFullYear() !== year ||
    calendar.getUTCMonth() !== month - 1 ||
    calendar.getUTCDate() !== day
  ) {
    throw new Error("That date does not exist");
  }
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) throw new Error("Not an hour of the day");
  if (!Number.isInteger(minute) || minute < 0 || minute > 59) throw new Error("Not a minute of the hour");

  // The clock reading, as if it were UTC.
  const wall = Date.UTC(year, month - 1, day, hour, minute);

  // The clocks' offset a day before and a day after: at most one change happens
  // between them, so the answer is one of these two candidates.
  const before = offsetAt(wall - DAY, timeZone);
  const after = offsetAt(wall + DAY, timeZone);
  const candidates = [wall - before, wall - after].filter(
    (moment) => offsetAt(moment, timeZone) === wall - moment,
  );

  if (candidates.length === 0) return new Date(wall - before);
  return new Date(Math.min(...candidates));
}

// The moment a day's focus is worked out for: 08:00 on that day in that zone.
export function referenceInstant(localDate: string, timeZone: string): Date {
  return localInstant(localDate, timeZone, REFERENCE_HOUR, 0);
}
