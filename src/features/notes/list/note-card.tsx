import { Link } from "react-router";
import { HouseIcon, HOUSE_VISUAL, MOON_FALLBACK_VISUAL } from "@/features/daily-focus";
import { isDailyPlanTitle } from "../content";
import { PinIcon } from "../note-icons";
import type { NoteSummary } from "../types";
import NoteDate from "./note-date";

export default function NoteCard({ note }: { note: NoteSummary }) {
  // A note written from a daily focus card gets its own, richer layout: its
  // house's own icon and colours, by house number (see daily-focus's
  // content/house-visuals.ts). A card with no house at all — reduced-mode
  // (no birth time), or an older note from before the house was kept — shares
  // one plain moon mark instead. Then the area of life plus the date on one
  // row, the title, and a one-line preview. An ordinary note keeps the plain
  // layout below.
  if (note.focusLabel) {
    const visual = (note.focusHouse ? HOUSE_VISUAL[note.focusHouse] : null) ?? MOON_FALLBACK_VISUAL;
    return (
      <Link
        to={`/notes/${note.id}`}
        className="flex items-start gap-3 rounded-card bg-card px-4 py-3.5 shadow-soft transition-opacity duration-200 active:opacity-80"
      >
        <HouseIcon visual={visual} className="mt-0.5 h-11 w-11 shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="min-w-0 truncate text-xs font-medium tracking-wider text-muted uppercase">
              {note.focusLabel}
            </p>
            <p className="flex shrink-0 items-center gap-1.5 text-xs text-muted">
              {note.pinned && (
                <span aria-label="Pinned" className="scale-[0.65]">
                  <PinIcon />
                </span>
              )}
              <NoteDate iso={note.updatedAt} />
            </p>
          </div>
          <h3 className="mt-1 truncate font-serif text-[20px] leading-tight font-medium">
            {note.title || "New note"}
          </h3>
          {note.preview && (
            <p className="mt-0.5 truncate text-[14px] leading-snug text-ink-soft">
              {note.preview}
            </p>
          )}
        </div>
      </Link>
    );
  }

  // A Daily Plan note (see daily-focus's daily-plan-card.tsx) gets the same
  // icon-row layout as a card-linked note above, its checklist mark standing
  // in for a house icon.
  if (isDailyPlanTitle(note.title)) {
    return <IconRowCard note={note} icon="list-check" label="Daily plan" />;
  }

  // Likewise a Vision board note, with a board-layout mark. Told apart by what's in
  // it, not its title, since she can rename a board to anything.
  if (note.isVisionBoard) {
    return <IconRowCard note={note} icon="layout-dashboard" label="Vision board" />;
  }

  return (
    <Link
      to={`/notes/${note.id}`}
      className="relative block rounded-card bg-card px-5 py-4 shadow-soft transition-opacity duration-200 active:opacity-80"
    >
      {/* Pinned notes sit first in the list already (the store's own sort
          order) — this icon is the only other sign of it, not a section of
          its own. */}
      {note.pinned && (
        <span
          aria-label="Pinned"
          className="absolute top-4 right-4 origin-top-right scale-[0.7] text-muted"
        >
          <PinIcon />
        </span>
      )}
      {note.title ? (
        <h3 className="truncate font-serif text-[22px] leading-tight font-medium">
          {note.title}
        </h3>
      ) : (
        <h3 className="font-serif text-[22px] leading-tight font-medium text-muted">
          New note
        </h3>
      )}
      {note.preview && (
        <p className="mt-1 line-clamp-2 text-[15px] leading-snug text-ink-soft">
          {note.preview}
        </p>
      )}
      <p className="mt-3 text-xs text-muted">
        <NoteDate iso={note.updatedAt} />
      </p>
    </Link>
  );
}

// The icon-row layout for a note that isn't from a focus card: one mark from
// the icon pack in a rounded tile, in the same tan MOON_FALLBACK_VISUAL
// colours (there's no house to colour-code by), then a small label and the
// date on one row, the title, and a one-line preview.
function IconRowCard({
  note,
  icon,
  label,
}: {
  note: NoteSummary;
  icon: "list-check" | "layout-dashboard";
  label: string;
}) {
  return (
    <Link
      to={`/notes/${note.id}`}
      className="flex items-center gap-3 rounded-card bg-card px-4 py-3.5 shadow-soft transition-opacity duration-200 active:opacity-80"
    >
      <div
        aria-hidden="true"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px]"
        style={{ backgroundColor: MOON_FALLBACK_VISUAL.background }}
      >
        <span
          className="h-[55%] w-[55%]"
          style={{
            backgroundColor: MOON_FALLBACK_VISUAL.color,
            mask: `url("/Iconspack/${icon}.svg") center / contain no-repeat`,
            WebkitMask: `url("/Iconspack/${icon}.svg") center / contain no-repeat`,
          }}
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="min-w-0 truncate text-xs font-medium tracking-wider text-muted uppercase">
            {label}
          </p>
          <p className="flex shrink-0 items-center gap-1.5 text-xs text-muted">
            {note.pinned && (
              <span aria-label="Pinned" className="scale-[0.65]">
                <PinIcon />
              </span>
            )}
            <NoteDate iso={note.updatedAt} />
          </p>
        </div>
        <h3 className="mt-1 truncate font-serif text-[20px] leading-tight font-medium">
          {note.title}
        </h3>
        {note.preview && (
          <p className="mt-0.5 truncate text-[14px] leading-snug text-ink-soft">
            {note.preview}
          </p>
        )}
      </div>
    </Link>
  );
}
