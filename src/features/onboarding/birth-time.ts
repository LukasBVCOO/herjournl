// Reading a birth time. Pure: no screens, no storage.

// The time picker on a phone hands back "16:00" whatever way she sees it (4 PM
// or 16:00), so the app only ever deals with 24-hour hour and minute.
export function parseBirthTime(value: string): { hour: number; minute: number } | null {
  const match = /^(\d{2}):(\d{2})/.exec(value);
  if (!match) return null;

  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) return null;
  return { hour, minute };
}
