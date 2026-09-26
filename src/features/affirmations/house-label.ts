import { HOUSE_CONTENT, type HouseNumber } from "@/features/daily-focus";

// The area of life a house stands for, like "Money & Self-Worth". Null for
// house 0 (the general lines used when there's no birth time).
export function houseLabel(house: number): string | null {
  return HOUSE_CONTENT[house as HouseNumber]?.label ?? null;
}
