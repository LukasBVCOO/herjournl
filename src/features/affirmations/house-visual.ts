import { HOUSE_VISUAL, MOON_FALLBACK_VISUAL, type HouseVisual } from "@/features/daily-focus";

// The same colours and icon the daily focus card uses for a house, so a line
// looks like it belongs to the day's card. House 0 (no birth time) gets the
// plain sparkle set.
export function houseVisual(house: number): HouseVisual {
  return HOUSE_VISUAL[house] ?? MOON_FALLBACK_VISUAL;
}
