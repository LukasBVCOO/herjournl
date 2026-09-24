import { useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { docFromChecklist } from "@/features/notes";
import {
  HomeIcon,
  ListIcon,
  MoonStarsIcon,
  PlusIcon,
  ProfileIcon,
  SettingsIcon,
  StickerIcon,
} from "./icons";

// Solid ink for whichever page she's actually on, muted for the rest —
// active is a real prop, not a hover-only state, so it stays visible on
// touch devices where there's no hover at all.
function navIconClass(active: boolean) {
  return `flex h-12 w-12 items-center justify-center transition-colors duration-200 ${
    active ? "text-ink" : "text-ink-soft hover:text-ink"
  }`;
}

type FabAction = { label: string; icon: ReactNode; onClick: () => void };

// The app's own bottom bar, the same on every one of its four main screens
// (notes list, birth chart, profile, settings — each renders this at the end
// of its own JSX, with matching bottom padding on its scrollable content so
// nothing sits underneath it). Home and Chart on the left, Profile and
// Settings on the right, one flat bar like a native tab bar. "+" isn't one
// of the row's flex items — it's absolutely centered and pulled up so it
// pokes out above the bar rather than sitting flush inside it, the only
// filled circle among plain outline icons.
//
// Each Link is a normal push navigation (not a replace), so the in-app back
// arrow on each of those screens (navigate(-1)) always returns to whichever
// page she actually came from, not a fixed "home" destination.
export default function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  function newNote() {
    navigate(`/notes/${crypto.randomUUID()}`, { state: { isNew: true } });
  }

  // Same idea as newNote, but the writing screen starts her off with the
  // Checklist's title and its preset blank tasks already there (carried
  // through router state — see edit-note-screen.tsx's "preset"). Nothing is
  // saved until she actually changes something, same as any other new note:
  // leaving without checking a box or writing a word means this never
  // existed as far as her list or the database are concerned.
  function newChecklist() {
    navigate(`/notes/${crypto.randomUUID()}`, {
      state: { isNew: true, preset: docFromChecklist() },
    });
  }

  // What the "+" button fans out into.
  const fabActions: FabAction[] = [
    { label: "Checklist", icon: <ListIcon />, onClick: newChecklist },
    { label: "New note", icon: <StickerIcon />, onClick: newNote },
  ];

  function runFabAction(action: FabAction) {
    setMenuOpen(false);
    action.onClick();
  }

  return (
    <>
      {/* Tapping anywhere else while the "+" menu is open closes it, the
          same dismiss pattern as the app's other popups. */}
      {menuOpen && (
        <button
          type="button"
          aria-label="Close"
          tabIndex={-1}
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 z-10 animate-fade-in bg-ink/10"
        />
      )}

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-paper pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="relative mx-auto flex w-full max-w-md items-center justify-between px-8 py-1.5">
          <Link to="/" aria-label="Home" className={navIconClass(pathname === "/")}>
            <HomeIcon size={28} />
          </Link>
          <Link
            to="/profile/chart"
            aria-label="Your birth chart"
            className={navIconClass(pathname === "/profile/chart")}
          >
            <MoonStarsIcon size={28} />
          </Link>

          {/* Reserves the "+" button's own footprint in the row, so the two
              side pairs stay evenly split around true center instead of
              drifting together now that "+" is positioned outside the flow. */}
          <div className="w-16 shrink-0" aria-hidden="true" />

          <Link to="/profile" aria-label="Profile" className={navIconClass(pathname === "/profile")}>
            <ProfileIcon size={28} />
          </Link>
          <Link to="/settings" aria-label="Settings" className={navIconClass(pathname === "/settings")}>
            <SettingsIcon size={28} />
          </Link>

          <div className="absolute -top-6 left-1/2 -translate-x-1/2">
            {/* Anchors the two extra buttons to the "+" button itself, so
                they are positioned out of the normal layout (nothing
                reserves space for them while closed) and visibly rise up
                out of it when it opens, rather than just fading in where
                they already sit. */}
            <div className="pointer-events-none absolute bottom-full left-1/2 flex -translate-x-1/2 flex-col items-center gap-3 pb-3">
              {fabActions.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  onClick={() => runFabAction(action)}
                  aria-label={action.label}
                  aria-hidden={!menuOpen}
                  tabIndex={menuOpen ? 0 : -1}
                  className={`flex h-12 w-12 items-center justify-center rounded-full bg-ink text-paper shadow-soft transition-all duration-200 hover:opacity-90 active:opacity-80 ${
                    menuOpen
                      ? "pointer-events-auto translate-y-0 opacity-100"
                      : "pointer-events-none translate-y-4 opacity-0"
                  }`}
                >
                  {action.icon}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label={menuOpen ? "Close" : "New"}
              aria-expanded={menuOpen}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-ink text-paper shadow-soft transition-opacity duration-200 hover:opacity-90 active:opacity-80"
            >
              <PlusIcon size={32} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
