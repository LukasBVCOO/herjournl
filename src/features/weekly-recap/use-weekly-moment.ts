import { useEffect, useState } from "react";
import { weeklyMoment, type WeeklyMoment } from "./week";

// Remembered on this phone (lib/seen.ts): the latest week whose recap was
// ready ("dueMonday") the last time she opened any recap. Set by
// weekly-recap-screen.tsx, read by the header icon's dot.
export const SEEN_AREA = "weekly-recap";

// weeklyMoment() for a screen, checked again every minute and whenever she
// comes back to the app, so the Sunday card appears at 18:00 without a reload.
export function useWeeklyMoment(): WeeklyMoment | null {
  const [moment, setMoment] = useState(() => weeklyMoment());

  useEffect(() => {
    const refresh = () => {
      const next = weeklyMoment();
      setMoment((current) =>
        current?.inWindow === next?.inWindow && current?.dueMonday === next?.dueMonday ? current : next,
      );
    };
    const timer = setInterval(refresh, 60_000);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);

  return moment;
}
