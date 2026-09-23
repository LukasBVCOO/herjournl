import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router";
import { MenuIcon, ProfileIcon, SettingsIcon } from "@/components/icons";
import { TrashIcon } from "../note-icons";

export default function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;

    function dismissOutside(event: PointerEvent) {
      if (!container.current?.contains(event.target as Node)) setOpen(false);
    }

    function dismissOnEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setOpen(false);
      trigger.current?.focus();
    }

    document.addEventListener("pointerdown", dismissOutside);
    document.addEventListener("keydown", dismissOnEscape);
    return () => {
      document.removeEventListener("pointerdown", dismissOutside);
      document.removeEventListener("keydown", dismissOnEscape);
    };
  }, [open]);

  return (
    <div
      ref={container}
      className="relative -mr-3"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <button
        ref={trigger}
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
        className="flex h-11 w-11 items-center justify-center rounded-full text-ink-soft transition-colors duration-200 hover:bg-card hover:text-ink"
      >
        <MenuIcon />
      </button>
      {open && (
        <nav
          id={menuId}
          aria-label="Account"
          className="absolute top-full right-0 z-30 mt-1 w-56 animate-fade-in rounded-card bg-surface py-1.5 shadow-soft"
        >
          {[
            { to: "/profile", label: "Profile", icon: <ProfileIcon /> },
            { to: "/settings", label: "Settings", icon: <SettingsIcon /> },
            { to: "/recently-deleted", label: "Recently deleted", icon: <TrashIcon /> },
          ].map(({ to, label, icon }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className="flex min-h-12 items-center gap-3 px-4 text-[16px] text-ink-soft transition-colors duration-200 hover:bg-paper hover:text-ink"
            >
              {icon}
              {label}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
