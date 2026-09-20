import { createClient } from "@/lib/supabase/server";
import { signOut } from "./auth/actions";

// Placeholder home screen. The notes list replaces this in step 1.4.
export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const email = data?.claims?.email as string | undefined;

  return (
    <main className="flex flex-1 animate-fade-in flex-col items-center justify-center px-6 text-center">
      <h1 className="font-serif text-5xl font-medium">HerJournl</h1>
      <p className="mt-4 text-muted">Start with a thought.</p>
      {email && (
        <p className="mt-10 text-sm text-muted">Signed in as {email}</p>
      )}
      <form action={signOut} className="mt-3">
        <button
          type="submit"
          className="text-sm font-medium text-ink underline underline-offset-4"
        >
          Log out
        </button>
      </form>
    </main>
  );
}
