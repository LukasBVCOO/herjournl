import { useAccess } from "./use-access";

// Until she pays (in her trial or on the free plan): one vision board, with
// up to 10 photos on it (founder, 2026-09-27). Words don't count. Founding
// members and subscribers have no limit.
export const VISION_BOARD_LIMIT = { boards: 1, photos: 10 } as const;

// The limit that applies to her right now, or null for none. Null too while
// it isn't known yet, so she's never stopped by mistake.
export function useVisionBoardLimit(): typeof VISION_BOARD_LIMIT | null {
  const access = useAccess();
  if (access.status !== "known") return null;
  const paying = access.access.reason === "lifetime" || access.access.reason === "subscription";
  return paying ? null : VISION_BOARD_LIMIT;
}
