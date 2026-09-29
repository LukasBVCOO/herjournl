import type { ReactNode } from "react";
import { Link } from "react-router";
import { PackIcon } from "@/components/icons";

// The building blocks the Profile screen is laid out with: a titled group,
// and the rows inside it. Every row in a group shares one card, split by thin
// lines, so related things read as one block (like her phone's own
// Settings) instead of a stack of separate cards.

// Padding for one row inside a group. Rows bring no background of their own.
export const rowClass = "px-5 py-4";

// A row's small label ("Email", "Date of birth"…) and its value.
export const rowLabelClass = "text-[13px] text-ink-soft";
export const rowValueClass = "mt-0.5 text-[17px] text-ink break-words";

// The quiet "Edit" / "Change" on the right of a row. The tap area is a full
// 44px even though the word is small.
export const editButtonClass =
  "-mr-2 -mt-2 flex h-11 shrink-0 items-center px-2 text-[15px] font-medium text-ink underline decoration-accent underline-offset-4 transition-colors duration-200 hover:decoration-ink";

export const primaryButtonClass =
  "h-11 rounded-full bg-ink px-6 text-[15px] font-medium text-paper transition-opacity duration-200 hover:opacity-90 disabled:opacity-40";

export const cancelButtonClass =
  "h-11 px-3 text-[15px] font-medium text-ink-soft transition-colors duration-200 hover:text-ink disabled:opacity-40";

export function Group({
  title,
  bare = false,
  children,
}: {
  title: string;
  // True when the content is already its own card (her plan), so it isn't
  // wrapped in a second one.
  bare?: boolean;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-2.5 px-1 font-serif text-[21px] leading-tight font-medium text-ink">{title}</h2>
      {bare ? children : <div className="divide-y divide-line rounded-card bg-card shadow-soft">{children}</div>}
    </section>
  );
}

// A row that opens another screen.
export function LinkRow({ to, icon, label }: { to: string; icon: ReactNode; label: string }) {
  return (
    <Link
      to={to}
      className={`${rowClass} flex items-center gap-3 text-[17px] text-ink transition-opacity duration-200 active:opacity-70`}
    >
      <span className="text-ink-soft">{icon}</span>
      <span className="flex-1">{label}</span>
      <span className="text-ink-soft">
        <PackIcon name="arrow-right" size={18} />
      </span>
    </Link>
  );
}
