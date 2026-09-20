import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { BackIcon } from "@/components/icons";
import { supabase } from "@/lib/supabase/client";
import { useSession } from "./use-session";

export default function SettingsScreen() {
  const session = useSession();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  async function logOut() {
    setBusy(true);
    await supabase.auth.signOut();
    navigate("/login", { replace: true });
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 animate-fade-in flex-col px-6">
      <header className="flex items-center gap-1 pt-[max(1.25rem,env(safe-area-inset-top))] pb-5">
        <Link
          to="/"
          aria-label="Back to notes"
          className="-ml-3 flex h-11 w-11 items-center justify-center text-ink-soft transition-colors duration-200 hover:text-ink"
        >
          <BackIcon />
        </Link>
        <h1 className="font-serif text-[28px] font-medium">Settings</h1>
      </header>

      <section className="rounded-card bg-card px-5 py-4 shadow-soft">
        <p className="text-xs text-muted">Signed in as</p>
        <p className="mt-1 text-[17px] break-all">
          {session.email ?? "Your account"}
        </p>
      </section>

      <button
        type="button"
        onClick={logOut}
        disabled={busy}
        className="mt-6 h-[52px] w-full rounded-full border border-line bg-surface font-medium text-ink transition-colors duration-200 hover:bg-paper disabled:opacity-60"
      >
        Log out
      </button>
    </main>
  );
}
