"use client";

import { useEffect, useState } from "react";
import { MoreIcon, PinIcon, TrashIcon } from "../note-icons";

type Props = {
  pinned: boolean;
  // A note that hasn't been saved yet has nothing to pin or delete.
  disabled: boolean;
  onTogglePin: () => void;
  onDelete: () => void;
};

// The "..." menu at the top right of the editor.
export default function NoteMenu({ pinned, disabled, onTogglePin, onDelete }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  function choose(action: () => void) {
    setOpen(false);
    action();
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Note options"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((isOpen) => !isOpen)}
        className="-mr-3 flex h-11 w-11 items-center justify-center text-ink-soft transition-colors duration-200 hover:text-ink"
      >
        <MoreIcon />
      </button>

      {open && (
        <>
          {/* Tapping anywhere else closes the menu */}
          <button
            type="button"
            tabIndex={-1}
            aria-hidden="true"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-10 cursor-default"
          />
          <div
            role="menu"
            className="absolute top-full right-0 z-20 mt-1 w-48 animate-fade-in rounded-card bg-surface py-1.5 shadow-soft"
          >
            <MenuItem
              disabled={disabled}
              onClick={() => choose(onTogglePin)}
              icon={<PinIcon />}
            >
              {pinned ? "Unpin" : "Pin"}
            </MenuItem>
            <MenuItem
              disabled={disabled}
              danger
              onClick={() => choose(onDelete)}
              icon={<TrashIcon />}
            >
              Delete
            </MenuItem>
          </div>
        </>
      )}
    </div>
  );
}

function MenuItem({
  children,
  icon,
  disabled,
  danger,
  onClick,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  disabled: boolean;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={onClick}
      className={`flex h-12 w-full items-center gap-3 px-4 text-[16px] transition-colors duration-200 hover:bg-paper disabled:opacity-40 disabled:hover:bg-transparent ${
        danger ? "text-alert" : "text-ink"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}
