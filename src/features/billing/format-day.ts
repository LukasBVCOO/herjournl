// A moment as the day she'd say it: "October 4" this year, "October 4, 2027"
// otherwise. In her own time zone.
export function formatDay(iso: string): string {
  const date = new Date(iso);
  const thisYear = date.getFullYear() === new Date().getFullYear();
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    ...(thisYear ? {} : { year: "numeric" }),
  });
}

// Whole days left until a moment, rounded up ("1 day left" on the last day).
export function daysUntil(iso: string): number {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000));
}
