import { Link } from "react-router";
import { PackIcon } from "@/components/icons";
import { isLocked, useAccess } from "@/features/billing";
import { seenValue } from "@/lib/seen";
import { SEEN_AREA, useWeeklyMoment } from "./use-weekly-moment";

// The calendar beside the search on her notes list: her weekly recaps any
// day, not only on Sunday evening. A gold dot (like the crown's for
// affirmations) while a week has been ready since she last opened a recap.
// No dot on the free plan: the recap is Premium.
export default function WeeklyRecapButton() {
  const moment = useWeeklyMoment();
  const access = useAccess();
  const premium = access.status !== "loading" && !isLocked(access);
  const waiting = premium && moment !== null && seenValue(SEEN_AREA) !== moment.dueMonday;

  return (
    <Link
      to="/week"
      aria-label={waiting ? "Your weekly recap — waiting for you" : "Your weekly recaps"}
      className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink-soft transition-colors duration-200 hover:bg-card hover:text-ink"
    >
      <PackIcon name="calendar-week" />
      {/* The paper-coloured ring keeps the dot off the icon's own lines. */}
      {waiting && (
        <span aria-hidden="true" className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-gold ring-2 ring-paper" />
      )}
    </Link>
  );
}
