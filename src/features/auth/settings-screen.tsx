import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { BackIcon, PackIcon } from "@/components/icons";
import BottomNav from "@/components/bottom-nav";
import { NotificationsSection } from "@/features/notifications";
import { signOut } from "@/lib/session";
import { useGoBack } from "@/lib/use-go-back";
import { useSession } from "./use-session";

export default function SettingsScreen() {
  const session = useSession();
  const navigate = useNavigate();
  const goBack = useGoBack();
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  async function logOut() {
    setBusy(true);
    setProblem(null);
    // Refuses, with a reason, if some of her writing hasn't reached the
    // internet yet, because logging out clears the copy on this phone.
    const message = await signOut();
    if (message) {
      setProblem(message);
      setBusy(false);
      return;
    }
    navigate("/login", { replace: true });
  }

  return (
    <>
    <main className="mx-auto flex w-full max-w-md flex-1 animate-fade-in flex-col px-6 pb-32">
      <header className="flex items-center gap-1 pt-[max(1.25rem,env(safe-area-inset-top))] pb-5">
        {/* The last page she was actually on, not a fixed destination — she
            can reach this screen from more than one place now that the
            bottom nav (BottomNav) is on every main screen. */}
        <button
          type="button"
          onClick={goBack}
          aria-label="Back"
          className="-ml-3 flex h-11 w-11 items-center justify-center text-ink-soft transition-colors duration-200 hover:text-ink"
        >
          <BackIcon />
        </button>
        <h1 className="font-serif text-[28px] font-medium">Settings</h1>
      </header>

      <section className="rounded-card bg-card px-5 py-4 shadow-soft">
        <p className="text-xs text-muted">Signed in as</p>
        <p className="mt-1 text-[17px] break-all">
          {session.email ?? "Your account"}
        </p>
      </section>

      <div className="mt-4">
        <NotificationsSection />
      </div>

      <Link
        to="/recently-deleted"
        className="mt-4 flex items-center gap-3 rounded-card bg-card px-5 py-4 text-[17px] text-ink shadow-soft transition-opacity duration-200 active:opacity-80"
      >
        <span className="text-ink-soft">
          <PackIcon name="trash" />
        </span>
        <span className="flex-1">Recently deleted</span>
        <span aria-hidden="true" className="text-ink-soft">
          →
        </span>
      </Link>

      {problem && (
        <p role="alert" className="mt-6 animate-fade-in text-sm text-alert">
          {problem}
        </p>
      )}

      <button
        type="button"
        onClick={logOut}
        disabled={busy}
        className={`${problem ? "mt-3" : "mt-6"} h-[52px] w-full rounded-full border border-line bg-surface font-medium text-ink transition-colors duration-200 hover:bg-paper disabled:opacity-60`}
      >
        Log out
      </button>

      <p className="mt-4 text-center text-xs text-muted">
        Version {import.meta.env.VITE_APP_VERSION}
      </p>
    </main>
    <BottomNav />
    </>
  );
}
