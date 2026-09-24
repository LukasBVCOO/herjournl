import { useState } from "react";
import { Navigate } from "react-router";
import { supabase } from "@/lib/supabase/client";
import { useSession } from "./use-session";

const PASSWORD_MIN_LENGTH = 8;
const fieldClass =
  "mt-1 h-11 w-full border-b border-line bg-transparent text-[17px] text-ink outline-none transition-colors duration-200 focus:border-ink";

// Where the link in the "forgot password" email brings her back. Opening it
// signs her into a short-lived session on its own (the same way the sign-up
// confirmation link does — see auth-callback-screen.tsx), so this waits for
// that the same way, then lets her choose a new password instead of moving
// her straight on. Deliberately NOT wrapped in RequireSession: at the moment
// this screen first renders there may be no session yet, only one about to
// arrive.
export default function ResetPasswordScreen() {
  const session = useSession();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [done, setDone] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password.length < PASSWORD_MIN_LENGTH) {
      return setError(`Choose a password with at least ${PASSWORD_MIN_LENGTH} characters.`);
    }
    if (password !== confirm) return setError("Those two don't match.");

    setPending(true);
    setError(undefined);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setPending(false);
    if (updateError) return setError("We couldn't update your password. Please try again.");
    setDone(true);
  }

  if (done) return <Navigate to="/" replace />;
  // The link was invalid, expired, or already used — nothing to reset here.
  if (session.status === "signed-out") return <Navigate to="/login?error=callback" replace />;

  return (
    <main className="flex flex-1 animate-fade-in flex-col">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col sm:justify-center">
        <p className="px-6 pt-[max(1.25rem,env(safe-area-inset-top))] font-serif text-2xl font-medium sm:pt-0">
          Becomely
        </p>

        {session.status === "loading" ? (
          <p role="status" className="px-6 py-16 text-center text-[17px] text-ink-soft">
            One moment…
          </p>
        ) : (
          <>
            <div className="flex flex-1 flex-col justify-end px-6 pt-6 pb-7 sm:flex-none sm:pt-8">
              <h1 className="font-serif text-[length:clamp(2.5rem,7.5dvh,3.5rem)] leading-[1.02] font-medium text-balance [&_em]:font-normal">
                Choose a new <em>password.</em>
              </h1>
            </div>

            <section className="rounded-t-sheet bg-surface px-6 pt-7 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-sheet sm:mx-6 sm:rounded-sheet sm:p-8 sm:shadow-soft">
              <form onSubmit={submit} className="flex flex-col gap-5">
                <div>
                  <div className="flex items-baseline justify-between">
                    <label htmlFor="new-password" className="text-sm text-ink-soft">
                      New password
                    </label>
                    <span className="text-xs text-ink-soft">At least 8 characters</span>
                  </div>
                  <input
                    id="new-password"
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoFocus
                    required
                    className={fieldClass}
                  />
                </div>

                <div>
                  <label htmlFor="confirm-password" className="text-sm text-ink-soft">
                    Confirm password
                  </label>
                  <input
                    id="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    value={confirm}
                    onChange={(event) => setConfirm(event.target.value)}
                    required
                    className={fieldClass}
                  />
                </div>

                {error && (
                  <p role="alert" className="animate-fade-in text-sm text-alert">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={pending}
                  className="h-[52px] w-full rounded-full bg-ink font-medium text-paper transition-opacity duration-200 hover:opacity-90 disabled:opacity-60"
                >
                  {pending ? "Saving…" : "Save new password"}
                </button>
              </form>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
