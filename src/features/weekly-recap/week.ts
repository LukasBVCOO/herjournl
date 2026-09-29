// Weeks, Monday to Sunday, counted in card days ("YYYY-MM-DD", her day
// running 08:00 to 08:00 — see daily-focus's cardDayIn). Pure: no clock, no
// database. Dates are read at midday UTC so no time zone can shift them.

import { cardDayIn, deviceTimeZone, localHourIn } from "@/features/daily-focus";

const DAY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function toDate(day: string): Date | null {
  const match = DAY_PATTERN.exec(day);
  if (!match) return null;
  const [year, month, date] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const at = new Date(Date.UTC(year, month - 1, date, 12));
  if (at.getUTCFullYear() !== year || at.getUTCMonth() !== month - 1 || at.getUTCDate() !== date) {
    return null;
  }
  return at;
}

function fromDate(at: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${at.getUTCFullYear()}-${pad(at.getUTCMonth() + 1)}-${pad(at.getUTCDate())}`;
}

export function isDay(value: string): boolean {
  return toDate(value) !== null;
}

export function addDays(day: string, count: number): string {
  const at = toDate(day)!;
  at.setUTCDate(at.getUTCDate() + count);
  return fromDate(at);
}

// The Monday of the week `day` is in.
export function mondayOf(day: string): string {
  const at = toDate(day)!;
  // getUTCDay: Sunday 0 … Saturday 6. Monday is 0 days back, Sunday 6.
  return addDays(day, -((at.getUTCDay() + 6) % 7));
}

// The seven days of the week that starts on `monday`.
export function weekDays(monday: string): string[] {
  return Array.from({ length: 7 }, (_, index) => addDays(monday, index));
}

// Her card day right now, or "" if her phone's clock can't be read.
export function today(): string {
  try {
    return cardDayIn(new Date(), deviceTimeZone());
  } catch {
    return "";
  }
}

const monthName = (at: Date) =>
  new Intl.DateTimeFormat("en-GB", { month: "long", timeZone: "UTC" }).format(at);

// "21 – 27 September", or "29 September – 5 October" across two months.
export function weekLabel(monday: string): string {
  const start = toDate(monday)!;
  const end = toDate(addDays(monday, 6))!;
  if (start.getUTCMonth() === end.getUTCMonth()) {
    return `${start.getUTCDate()} – ${end.getUTCDate()} ${monthName(end)}`;
  }
  return `${start.getUTCDate()} ${monthName(start)} – ${end.getUTCDate()} ${monthName(end)}`;
}

// The week's own moment (founder, 2026-09-29): from 18:00 on Sunday until
// 08:00 on Monday, her time. That is the Sunday card day from 18:00 on (her
// card day already runs 08:00 to 08:00). The Sunday notification goes out at
// the same hour (the "weekly" row of notification_settings).
export const REVIEW_HOUR = 18;

// TESTING: true treats every moment as Sunday evening (card on the notes
// list, evening reflection cards hidden). Leave false.
const PREVIEW_SUNDAY_FOR_TESTING = false;

export type WeeklyMoment = {
  // True from Sunday 18:00 to Monday 08:00.
  inWindow: boolean;
  // The Monday of the most recent week whose Sunday evening has come: this
  // week while inWindow, otherwise last week. What the header icon's dot is
  // about.
  dueMonday: string;
};

export function weeklyMoment(at: Date = new Date()): WeeklyMoment | null {
  try {
    const timeZone = deviceTimeZone();
    const cardDay = cardDayIn(at, timeZone);
    const hour = localHourIn(at, timeZone);
    const isSunday = toDate(cardDay)!.getUTCDay() === 0;
    const inWindow = PREVIEW_SUNDAY_FOR_TESTING || (isSunday && (hour >= REVIEW_HOUR || hour < 8));
    const monday = mondayOf(cardDay);
    return { inWindow, dueMonday: inWindow ? monday : addDays(monday, -7) };
  } catch {
    return null;
  }
}

// Which week an address points at: `start` from /week/<start> (undefined for
// /week, meaning this week). Null when it isn't a Monday up to this week, or
// her phone's clock can't be read.
export function resolveWeek(start: string | undefined): { monday: string; isThisWeek: boolean; now: string } | null {
  const now = today();
  if (!now) return null;
  const thisMonday = mondayOf(now);
  if (start === undefined) return { monday: thisMonday, isThisWeek: true, now };
  if (!isDay(start) || mondayOf(start) !== start || start > thisMonday) return null;
  return { monday: start, isThisWeek: start === thisMonday, now };
}

// The address of a week's recap, and of its reflection.
export const weekPath = (monday: string, isThisWeek: boolean) => (isThisWeek ? "/week" : `/week/${monday}`);

// The title of a week's reflection note, like "My week · 28 September – 4
// October". It is also how that note is found again, so renaming the note
// means the week offers a fresh reflection.
export const reflectionTitle = (monday: string) => `My week · ${weekLabel(monday)}`;

// "Mon", "Tue", … and "21" for one day.
export function weekdayShort(day: string): string {
  return new Intl.DateTimeFormat("en-GB", { weekday: "short", timeZone: "UTC" }).format(toDate(day)!);
}

export function dayOfMonth(day: string): number {
  return toDate(day)!.getUTCDate();
}
