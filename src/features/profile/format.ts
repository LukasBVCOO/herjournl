// How a saved birth date and time are shown. Both use her phone's own language
// and clock style, so they read the way she is used to.

// "2000-07-18" -> "18 July 2000"
export function formatBirthDate(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// "16:00" -> "4:00 PM" (or "16:00", depending on her phone)
export function formatBirthTime(time: string) {
  const [hour, minute] = time.split(":").map(Number);
  return new Date(2000, 0, 1, hour, minute).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}
