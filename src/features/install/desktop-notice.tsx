import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useLocation } from "react-router";
import { getSession, subscribe as subscribeToSession } from "@/lib/session";

const SEEN_KEY = "becomely:desktop-notice-seen";
const APP_ADDRESS = "app.becomely.co";
// "A couple of seconds" after she's free (founder, 2026-09-29).
const SHOW_DELAY_MS = 2500;

// Never interrupts these: signing up or in, onboarding, the plans and
// thank-you pages (so for a new person it waits until she's done with the
// paywall too), and the legal pages people reach from outside the app.
const QUIET_PREFIXES = [
  "/login",
  "/sign-up",
  "/check-email",
  "/forgot-password",
  "/auth",
  "/onboarding",
  "/premium",
  "/thank-you",
  "/privacy",
  "/terms",
];

// A computer: a screen at least tablet-wide AND a mouse or trackpad, so
// phones and iPads never see it.
function isComputer() {
  return window.matchMedia("(min-width: 768px) and (pointer: fine)").matches;
}

function alreadySeen() {
  try {
    return localStorage.getItem(SEEN_KEY) === "yes";
  } catch {
    return false;
  }
}

function markSeen() {
  try {
    localStorage.setItem(SEEN_KEY, "yes");
  } catch {
    // Storage blocked: it may show again next time, which is harmless.
  }
}

// "Becomely is made for your phone": shown once per computer (founder,
// 2026-09-29), suggesting she opens it on her phone for the real experience.
// Only once she's logged in and inside the app; app.tsx also holds it back
// until the "your 7 days have started" sheet is closed (AfterTrialWelcome), so
// a new person gets it a couple of seconds after the paywall, never on top of
// it. "Continue on desktop" closes it for good on this browser.
export default function DesktopNotice() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const continueButton = useRef<HTMLButtonElement>(null);
  const session = useSyncExternalStore(subscribeToSession, getSession, getSession);
  const quiet =
    session.status !== "signed-in" ||
    QUIET_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

  function close() {
    markSeen();
    setOpen(false);
  }

  useEffect(() => {
    if (quiet || !isComputer() || alreadySeen()) return;
    const timer = setTimeout(() => setOpen(true), SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, [quiet]);

  useEffect(() => {
    if (!open) return;
    continueButton.current?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") close();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open || quiet) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
      <button
        type="button"
        aria-label="Close"
        tabIndex={-1}
        onClick={close}
        className="absolute inset-0 animate-fade-in bg-ink/30"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="desktop-notice-title"
        className="relative w-full max-w-sm animate-fade-in rounded-card bg-surface px-6 py-7 text-center shadow-soft"
      >
        <img
          src="/icon-192.png"
          alt=""
          width={56}
          height={56}
          className="mx-auto h-14 w-14 rounded-[15px] shadow-soft"
        />
        <h2 id="desktop-notice-title" className="mt-5 font-serif text-[26px] leading-tight font-medium">
          Becomely is made for your phone <span className="text-gold">✦</span>
        </h2>
        <p className="mt-2 text-[15px] leading-snug text-ink-soft">
          Open <strong className="font-semibold text-ink">{APP_ADDRESS}</strong> on your phone for the best
          experience.
        </p>

        <button
          ref={continueButton}
          type="button"
          onClick={close}
          className="mt-6 h-[52px] w-full rounded-full bg-ink font-medium text-paper transition-opacity duration-200 hover:opacity-90"
        >
          Continue on desktop
        </button>
      </div>
    </div>
  );
}
