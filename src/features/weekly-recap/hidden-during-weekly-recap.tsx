import type { ReactNode } from "react";
import { useWeeklyMoment } from "./use-weekly-moment";

// The weekly recap overrides the usual evening reflection: from Sunday 18:00
// to Monday 08:00, whatever this wraps (the daily evening cards, in app.tsx)
// isn't shown, and the week's card takes their place.
export default function HiddenDuringWeeklyRecap({ children }: { children: ReactNode }) {
  const moment = useWeeklyMoment();
  return moment?.inWindow ? null : children;
}
