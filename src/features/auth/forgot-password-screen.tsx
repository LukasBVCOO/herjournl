import { useState } from "react";
import { Link } from "react-router";
import { Icon } from "@/components/icons";
import { supabase } from "@/lib/supabase/client";

const footerLink = "inline-block py-1.5 font-medium text-ink underline underline-offset-4";
const fieldClass =
  "mt-1 h-11 w-full border-b border-line bg-transparent text-[17px] text-ink outline-none transition-colors duration-200 focus:border-ink";

// Reached from "Forgot password?" on the login screen. Not gated on her
// session either way (like check-email-screen.tsx): asking is harmless
// whether or not she happens to be signed in somewhere already.
export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [sent, setSent] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = email.trim();
    if (!value) return setError("Enter your email address.");

    setPending(true);
    setError(undefined);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(value, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    setPending(false);
    // Never says whether the address has an account — that would let anyone
    // check which emails are registered. The same "sent" screen shows either way.
    if (resetError && resetError.code === "over_email_send_rate_limit") {
      setError("That's a lot of requests just now. Give it a little while and try again.");
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <main className="flex flex-1 animate-fade-in flex-col">
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
          <p className="px-6 pt-[max(1.25rem,env(safe-area-inset-top))] font-serif text-2xl font-medium">
            Becomely
          </p>

          <div className="flex flex-1 flex-col justify-center px-6 pb-16">
            <span className="text-ink-soft">
              <Icon>
                <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
                <path d="m4 8 8 5.5L20 8" />
              </Icon>
            </span>
            <h1 className="mt-6 font-serif text-[length:clamp(2.5rem,7.5dvh,3.5rem)] leading-[1.02] font-medium text-balance [&_em]:font-normal">
              Reset link <em>sent.</em>
            </h1>
            <p className="mt-4 max-w-[30ch] text-[17px] text-ink-soft">
              If <span className="font-medium break-all text-ink">{email.trim()}</span> has an
              account, we&rsquo;ve sent a link to reset the password.
            </p>
            <p className="mt-3 text-sm text-muted">Can&rsquo;t see it? Check your spam folder.</p>
          </div>

          <p className="px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-center text-[15px] text-ink-soft">
            <Link to="/login" className={footerLink}>
              Back to log in
            </Link>
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 animate-fade-in flex-col">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col sm:justify-center">
        <p className="px-6 pt-[max(1.25rem,env(safe-area-inset-top))] font-serif text-2xl font-medium sm:pt-0">
          Becomely
        </p>

        <div className="flex flex-1 flex-col justify-end px-6 pt-6 pb-7 sm:flex-none sm:pt-8">
          <h1 className="font-serif text-[length:clamp(2.5rem,7.5dvh,3.5rem)] leading-[1.02] font-medium text-balance [&_em]:font-normal">
            Forgot your <em>password?</em>
          </h1>
          <p className="mt-3 max-w-[30ch] text-[17px] text-ink-soft">
            Enter your email and we&rsquo;ll send you a link to reset it.
          </p>
        </div>

        <section className="rounded-t-sheet bg-surface px-6 pt-7 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-sheet sm:mx-6 sm:rounded-sheet sm:p-8 sm:shadow-soft">
          <form onSubmit={submit} className="flex flex-col gap-5">
            <div>
              <label htmlFor="reset-email" className="text-sm text-ink-soft">
                Email
              </label>
              <input
                id="reset-email"
                type="email"
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoFocus
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
              {pending ? "Sending…" : "Send reset link"}
            </button>
          </form>

          <p className="mt-2 text-center text-[15px] text-ink-soft">
            <Link to="/login" className={footerLink}>
              Back to log in
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
