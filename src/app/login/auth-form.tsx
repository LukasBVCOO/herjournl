"use client";

import { useActionState, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { logIn, signUp } from "./actions";

type Mode = "login" | "signup";

const inputClass =
  "h-14 w-full rounded-card bg-card px-5 text-base text-ink placeholder:text-muted/70 outline-none transition-shadow duration-200 focus-visible:ring-2 focus-visible:ring-ink/20";

export default function AuthForm({ initialError }: { initialError?: string }) {
  const [mode, setMode] = useState<Mode>("login");
  const [googleError, setGoogleError] = useState<string | undefined>(
    initialError,
  );
  const [googleBusy, setGoogleBusy] = useState(false);

  const [loginState, loginAction, loginPending] = useActionState(
    logIn,
    undefined,
  );
  const [signupState, signupAction, signupPending] = useActionState(
    signUp,
    undefined,
  );

  const isSignup = mode === "signup";
  const state = isSignup ? signupState : loginState;
  const pending = isSignup ? signupPending : loginPending;
  const message = state?.error ?? state?.notice ?? googleError;

  async function continueWithGoogle() {
    setGoogleError(undefined);
    setGoogleBusy(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setGoogleError("Google sign-in didn't work. Please try again.");
      setGoogleBusy(false);
    }
  }

  function switchMode() {
    setGoogleError(undefined);
    setMode(isSignup ? "login" : "signup");
  }

  return (
    <main className="flex flex-1 animate-fade-in flex-col justify-center px-6 py-12 pb-[max(3rem,env(safe-area-inset-bottom))]">
      <div className="mx-auto w-full max-w-sm">
        <h1 className="font-serif text-5xl font-medium">HerJournl</h1>
        <p className="mt-3 text-muted">
          {isSignup
            ? "Create your space to set intentions and act on them."
            : "Welcome back to your intentions."}
        </p>

        <form
          key={mode}
          action={isSignup ? signupAction : loginAction}
          className="mt-10 flex flex-col gap-5"
        >
          <label className="flex flex-col gap-2 text-sm text-muted">
            Email
            <input
              type="email"
              name="email"
              autoComplete="email"
              inputMode="email"
              defaultValue={state?.email}
              placeholder="you@example.com"
              required
              className={inputClass}
            />
          </label>

          <label className="flex flex-col gap-2 text-sm text-muted">
            Password
            <input
              type="password"
              name="password"
              autoComplete={isSignup ? "new-password" : "current-password"}
              placeholder={isSignup ? "At least 8 characters" : "Your password"}
              required
              className={inputClass}
            />
          </label>

          <p
            role="alert"
            aria-live="polite"
            className={`min-h-5 text-sm ${
              state?.notice && !state.error ? "text-muted" : "text-alert"
            }`}
          >
            {message}
          </p>

          <button
            type="submit"
            disabled={pending}
            className="h-14 w-full rounded-full bg-ink font-medium text-paper transition-opacity duration-200 disabled:opacity-60"
          >
            {pending
              ? "One moment…"
              : isSignup
                ? "Create account"
                : "Log in"}
          </button>
        </form>

        <div className="my-6 flex items-center gap-4 text-sm text-muted">
          <span className="h-px flex-1 bg-line" />
          or
          <span className="h-px flex-1 bg-line" />
        </div>

        <button
          type="button"
          onClick={continueWithGoogle}
          disabled={googleBusy}
          className="flex h-14 w-full items-center justify-center gap-3 rounded-full bg-card font-medium text-ink transition-opacity duration-200 disabled:opacity-60"
        >
          <GoogleMark />
          Continue with Google
        </button>

        <p className="mt-8 text-center text-sm text-muted">
          {isSignup ? "Already have an account?" : "New here?"}{" "}
          <button
            type="button"
            onClick={switchMode}
            className="font-medium text-ink underline underline-offset-4"
          >
            {isSignup ? "Log in" : "Create an account"}
          </button>
        </p>
      </div>
    </main>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z"
      />
    </svg>
  );
}
