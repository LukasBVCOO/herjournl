import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { supabase } from "@/lib/supabase/client";

const copy = {
  login: {
    headline: (
      <>
        Welcome <em>back.</em>
      </>
    ),
    sub: "Your intentions are waiting.",
    submit: "Log in",
    switchPrompt: "New here?",
    switchLabel: "Create an account",
    switchHref: "/sign-up",
  },
  signup: {
    headline: (
      <>
        Begin your <em>practice.</em>
      </>
    ),
    sub: "Set an intention in the morning. Come back to it at night.",
    submit: "Create account",
    switchPrompt: "Already have an account?",
    switchLabel: "Log in",
    switchHref: "/login",
  },
};

const labelClass = "text-sm text-ink-soft";
const fieldClass =
  "mt-1 h-11 w-full border-b border-line bg-transparent text-[17px] text-ink outline-none transition-colors duration-200 focus:border-ink";

type Props = {
  mode: "login" | "signup";
};

export default function AuthScreen({ mode }: Props) {
  const isSignup = mode === "signup";
  const text = copy[mode];
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>(
    // Set when a Google sign-in was sent back here because it didn't work.
    searchParams.get("error") === "google"
      ? "Google sign-in didn't work. Please try again."
      : undefined,
  );
  const [notice, setNotice] = useState<string | undefined>(undefined);
  const [pending, setPending] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const enteredEmail = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    setEmail(enteredEmail);
    setError(undefined);
    setNotice(undefined);

    if (isSignup) {
      if (!enteredEmail) return setError("Enter your email address.");
      if (password.length < 8) {
        return setError("Choose a password with at least 8 characters.");
      }
    } else if (!enteredEmail || !password) {
      return setError("Enter your email and password.");
    }

    setPending(true);
    if (isSignup) {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: enteredEmail,
        password,
      });
      if (signUpError) {
        setPending(false);
        setError(
          signUpError.code === "user_already_exists"
            ? "That email already has an account. Log in instead."
            : "We couldn't create your account. Please try again.",
        );
        return;
      }
      // With email confirmation on, there is no session until she confirms.
      if (!data.session) {
        setPending(false);
        setNotice("Check your email to confirm your account, then log in.");
        return;
      }
    } else {
      const { error: logInError } = await supabase.auth.signInWithPassword({
        email: enteredEmail,
        password,
      });
      if (logInError) {
        setPending(false);
        setError("That email and password don't match. Try again.");
        return;
      }
    }

    navigate("/", { replace: true });
  }

  async function continueWithGoogle() {
    setError(undefined);
    setGoogleBusy(true);
    const { error: googleError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (googleError) {
      setError("Google sign-in didn't work. Please try again.");
      setGoogleBusy(false);
    }
  }

  return (
    <main className="flex flex-1 animate-fade-in flex-col">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col sm:justify-center">
        <p className="px-6 pt-[max(1.25rem,env(safe-area-inset-top))] font-serif text-2xl font-medium sm:pt-0">
          HerJournl
        </p>

        <div className="flex flex-1 flex-col justify-end px-6 pt-6 pb-7 sm:flex-none sm:pt-8">
          <h1 className="font-serif text-[length:clamp(2.5rem,7.5dvh,3.5rem)] leading-[1.02] font-medium text-balance [&_em]:font-normal">
            {text.headline}
          </h1>
          <p className="mt-3 max-w-[26ch] text-[17px] text-ink-soft [@media(max-height:640px)]:hidden">
            {text.sub}
          </p>
        </div>

        <section className="rounded-t-sheet bg-surface px-6 pt-7 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-sheet sm:mx-6 sm:rounded-sheet sm:p-8 sm:shadow-soft">
          <form onSubmit={submit} className="flex flex-col gap-5">
            <div>
              <label htmlFor="email" className={labelClass}>
                Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                autoComplete="email"
                inputMode="email"
                defaultValue={email}
                required
                className={fieldClass}
              />
            </div>

            <div>
              <div className="flex items-baseline justify-between">
                <label htmlFor="password" className={labelClass}>
                  Password
                </label>
                {isSignup && (
                  <span id="password-hint" className="text-xs text-ink-soft">
                    At least 8 characters
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete={isSignup ? "new-password" : "current-password"}
                  aria-describedby={isSignup ? "password-hint" : undefined}
                  required
                  className={`${fieldClass} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((shown) => !shown)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  className="absolute top-1 right-0 flex h-11 w-11 items-center justify-center text-ink-soft transition-colors duration-200 hover:text-ink"
                >
                  <EyeIcon off={showPassword} />
                </button>
              </div>
            </div>

            {error && (
              <p role="alert" className="animate-fade-in text-sm text-alert">
                {error}
              </p>
            )}
            {notice && !error && (
              <p role="status" className="animate-fade-in text-sm text-ink-soft">
                {notice}
              </p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="h-[52px] w-full rounded-full bg-ink font-medium text-paper transition-opacity duration-200 hover:opacity-90 disabled:opacity-60"
            >
              {pending ? "One moment…" : text.submit}
            </button>
          </form>

          <button
            type="button"
            onClick={continueWithGoogle}
            disabled={googleBusy}
            className="mt-3 flex h-[52px] w-full items-center justify-center gap-3 rounded-full border border-line bg-surface font-medium text-ink transition-colors duration-200 hover:bg-paper disabled:opacity-60"
          >
            <GoogleMark />
            Continue with Google
          </button>

          <p className="mt-2 text-center text-[15px] text-ink-soft">
            {text.switchPrompt}{" "}
            <Link
              to={text.switchHref}
              className="inline-block py-1.5 font-medium text-ink underline underline-offset-4"
            >
              {text.switchLabel}
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}

function EyeIcon({ off }: { off: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.75" />
      {off && <path d="M4 4l16 16" />}
    </svg>
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
