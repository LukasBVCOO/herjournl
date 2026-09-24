import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { posthog } from "@/lib/posthog";
import { supabase } from "@/lib/supabase/client";
import { confirmationRedirectUrl } from "./confirm-redirect";

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
        Turn your intentions into <em>action.</em>
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
    // Set when an email confirmation link was sent back here because it
    // didn't work. A confirmation link that is opened in a different browser
    // from the one she signed up in can fail even though the email did get
    // confirmed, so the message points her at logging in.
    searchParams.get("error") === "callback"
      ? "Sign-in didn't work. If you just confirmed your email, you can log in below."
      : undefined,
  );
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const enteredEmail = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    setEmail(enteredEmail);
    setError(undefined);

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
        options: { emailRedirectTo: confirmationRedirectUrl() },
      });
      if (signUpError) {
        setPending(false);
        setError(
          signUpError.code === "user_already_exists"
            ? "That email already has an account. Log in instead."
            : signUpError.status === 429
              ? "Too many sign-ups just now. Give it a little while and try again."
              : "We couldn't create your account. Please try again.",
        );
        return;
      }
      posthog?.capture("user_signed_up");
      // With email confirmation on, there is no session until she confirms, so
      // she is shown that the link has been sent. With it off, she is signed in
      // already and carries on below.
      if (!data.session) {
        navigate("/check-email", { state: { email: enteredEmail } });
        return;
      }
    } else {
      const { error: logInError } = await supabase.auth.signInWithPassword({
        email: enteredEmail,
        password,
      });
      if (logInError) {
        setPending(false);
        // Right password, but she hasn't tapped the link in her email yet.
        setError(
          logInError.code === "email_not_confirmed"
            ? "Please confirm your email first. We sent you a link when you signed up."
            : "That email and password don't match. Try again.",
        );
        return;
      }
    }

    if (!isSignup) posthog?.capture("user_logged_in");
    // A brand new account starts with the welcome; everyone else goes to her notes.
    navigate(isSignup ? "/onboarding" : "/", { replace: true });
  }

  return (
    <main className="flex flex-1 animate-fade-in flex-col">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col sm:justify-center">
        <p className="px-6 pt-[max(1.25rem,env(safe-area-inset-top))] font-serif text-2xl font-medium sm:pt-0">
          Becomely
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
                {isSignup ? (
                  <span id="password-hint" className="text-xs text-ink-soft">
                    At least 8 characters
                  </span>
                ) : (
                  <Link
                    to="/forgot-password"
                    className="text-xs font-medium text-ink-soft underline underline-offset-4 transition-colors duration-200 hover:text-ink"
                  >
                    Forgot password?
                  </Link>
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

            <button
              type="submit"
              disabled={pending}
              className="h-[52px] w-full rounded-full bg-ink font-medium text-paper transition-opacity duration-200 hover:opacity-90 disabled:opacity-60"
            >
              {pending ? "One moment…" : text.submit}
            </button>
          </form>

          <p className="mt-4 text-center text-[15px] text-ink-soft">
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

