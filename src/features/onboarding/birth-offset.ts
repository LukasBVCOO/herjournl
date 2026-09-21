// What the clocks in her birthplace said, compared with world time (UTC), at the
// moment she was born. Pure: no screens, no storage, no outside service.
//
// It is the offset that applied THEN, not today's: places move their clocks for
// summer time, and change their rules over the years. The browser carries the
// standard time zone records (the IANA database) with every past rule in it, so
// this asks those, given the zone's name (e.g. "Europe/Vilnius") and her birth
// date and time as they appear on the certificate.

export type BirthOffset = {
  // Minutes ahead of UTC. +120 means her clock was 2 hours ahead. Negative
  // means behind, e.g. -300 for New York in winter.
  minutes: number;
  // "ok"       the time was unambiguous.
  // "gap"      the clocks jumped forward and skipped this time, so it never
  //            happened on the wall. The offset from before the jump is used.
  // "overlap"  the clocks were put back and this time happened twice. The first
  //            time round is used.
  note: "ok" | "gap" | "overlap";
};

const DAY_MS = 24 * 60 * 60 * 1000;

const formatters = new Map<string, Intl.DateTimeFormat>();

function formatterFor(timeZone: string) {
  let formatter = formatters.get(timeZone);
  if (!formatter) {
    // Throws a RangeError for a zone name the browser doesn't know.
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
  return formatter;
}

// How far ahead of UTC the zone's clocks were at one exact moment.
function offsetAt(timeZone: string, utcMs: number) {
  const parts = formatterFor(timeZone).formatToParts(new Date(utcMs));
  const part = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value);

  // What the wall clock read, read as if it were UTC, minus the real UTC moment.
  const wallClockAsUtc = Date.UTC(
    part("year"),
    part("month") - 1,
    part("day"),
    part("hour") % 24,
    part("minute"),
    part("second"),
  );
  const wholeSeconds = Math.floor(utcMs / 1000) * 1000;
  return Math.round((wallClockAsUtc - wholeSeconds) / 60000);
}

// The offset for a wall-clock time. The trouble is that the offset depends on
// the moment, and the moment depends on the offset, so it tries the offsets
// found on either side of the day and keeps the ones that agree with themselves.
export function utcOffsetAtBirth(
  timeZone: string,
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
): BirthOffset {
  const wallMs = Date.UTC(year, month - 1, day, hour, minute);

  const before = offsetAt(timeZone, wallMs - DAY_MS);
  const after = offsetAt(timeZone, wallMs + DAY_MS);
  const candidates = before === after ? [before] : [before, after];

  const consistent = candidates.filter(
    (offset) => offsetAt(timeZone, wallMs - offset * 60000) === offset,
  );

  if (consistent.length === 1) return { minutes: consistent[0], note: "ok" };
  // Happened twice: the bigger offset is the earlier of the two moments.
  if (consistent.length === 2) {
    return { minutes: Math.max(...consistent), note: "overlap" };
  }
  // Never happened: use the clocks as they were before they jumped.
  return { minutes: before, note: "gap" };
}
