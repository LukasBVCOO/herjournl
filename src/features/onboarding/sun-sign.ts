// Which sign the Sun was in on a given day. Pure: no screens, no storage.
//
// APPROXIMATE. The Sun changes sign on a slightly different day and hour each
// year, so days near the edges can be off by one. That is fine for the
// placeholder reveal; the real chart service replaces it.

export type Sign =
  | "Aries"
  | "Taurus"
  | "Gemini"
  | "Cancer"
  | "Leo"
  | "Virgo"
  | "Libra"
  | "Scorpio"
  | "Sagittarius"
  | "Capricorn"
  | "Aquarius"
  | "Pisces";

// The month and day each sign usually begins.
const starts: [month: number, day: number, sign: Sign][] = [
  [1, 20, "Aquarius"],
  [2, 19, "Pisces"],
  [3, 21, "Aries"],
  [4, 20, "Taurus"],
  [5, 21, "Gemini"],
  [6, 21, "Cancer"],
  [7, 23, "Leo"],
  [8, 23, "Virgo"],
  [9, 23, "Libra"],
  [10, 23, "Scorpio"],
  [11, 22, "Sagittarius"],
  [12, 22, "Capricorn"],
];

export function sunSignFor(day: number, month: number): Sign {
  // Capricorn runs across New Year, so it is what applies before 20 January.
  let sign: Sign = "Capricorn";
  for (const [startMonth, startDay, startSign] of starts) {
    if (month > startMonth || (month === startMonth && day >= startDay)) {
      sign = startSign;
    }
  }
  return sign;
}
