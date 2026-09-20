import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "../auth/actions";
import { BackIcon } from "../icons";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const email = data?.claims?.email as string | undefined;

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 animate-fade-in flex-col px-6">
      <header className="flex items-center gap-1 pt-[max(1.25rem,env(safe-area-inset-top))] pb-5">
        <Link
          href="/"
          aria-label="Back to notes"
          className="-ml-3 flex h-11 w-11 items-center justify-center text-ink-soft transition-colors duration-200 hover:text-ink"
        >
          <BackIcon />
        </Link>
        <h1 className="font-serif text-[28px] font-medium">Settings</h1>
      </header>

      <section className="rounded-card bg-card px-5 py-4 shadow-soft">
        <p className="text-xs text-muted">Signed in as</p>
        <p className="mt-1 text-[17px] break-all">{email ?? "Your account"}</p>
      </section>

      <form action={signOut} className="mt-6">
        <button
          type="submit"
          className="h-[52px] w-full rounded-full border border-line bg-surface font-medium text-ink transition-colors duration-200 hover:bg-paper"
        >
          Log out
        </button>
      </form>
    </main>
  );
}
