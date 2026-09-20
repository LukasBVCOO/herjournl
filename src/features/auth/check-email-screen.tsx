import { useEffect, useState } from "react";
import { Link, Navigate, useLocation } from "react-router";
import { Icon } from "@/components/icons";
import { supabase } from "@/lib/supabase/client";
import { confirmationRedirectUrl } from "./confirm-redirect";
import { useSession } from "./use-session";

// Supabase only sends one confirmation email per address about every minute, so
// the button waits this long between sends rather than letting her tap into an
// error.
const RESEND_WAIT_SECONDS = 60;

const footerLink =
  "inline-block py-1.5 font-medium text-ink underline underline-offset-4";

// Where she lands right after creating an account: nothing to fill in, just the
// news that the confirmation link is on its way.
export default function CheckEmailScreen() {
  const session = useSession();
  const location = useLocation();
  // Passed along by the sign-up screen, so it can name the address. It stays
  // through a refresh; on a direct visit there is simply no address to show.
  const email = (location.state as { email?: string } | null)?.email;

  const [sending, setSending] = useState(false);
  const [waitLeft, setWaitLeft] = useState(0);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  // Counts the wait down one second at a time.
  useEffect(() => {
    if (waitLeft <= 0) return;
    const timer = setTimeout(() => setWaitLeft((seconds) => seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [waitLeft]);

  async function resend() {
    if (!email) return;
    setSending(true);
    setResult(null);

    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: confirmationRedirectUrl() },
    });

    setSending(false);
    if (error) {
      setResult({
        ok: false,
        text:
          error.code === "over_email_send_rate_limit"
            ? "That's a lot of emails just now. Give it a little while and try again."
            : "We couldn't send it. Please try again.",
      });
      // Nothing was sent, so a short wait is enough to stop rapid re-tapping.
      setWaitLeft(10);
      return;
    }
    setResult({ ok: true, text: "Sent again. Check your inbox." });
    setWaitLeft(RESEND_WAIT_SECONDS);
  }

  // If the link was opened in this same browser she is signed in by now, so this
  // page has done its job and she moves on to the welcome.
  if (session.status === "signed-in") return <Navigate to="/onboarding" replace />;

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
            Confirmation link <em>sent.</em>
          </h1>
          <p className="mt-4 max-w-[30ch] text-[17px] text-ink-soft">
            {email ? (
              <>
                Open the email we sent to{" "}
                <span className="font-medium break-all text-ink">{email}</span> and
                tap the link to finish setting up.
              </>
            ) : (
              "Open the email we sent you and tap the link to finish setting up."
            )}
          </p>
          <p className="mt-3 text-sm text-muted">
            Can&rsquo;t see it? Check your spam folder.
          </p>

          {/* Without the address there is nothing to send to; "Start again"
              below covers that case. */}
          {email && (
            <div className="mt-6">
              <button
                type="button"
                onClick={resend}
                disabled={sending || waitLeft > 0}
                className="h-12 rounded-full border border-line bg-surface px-6 font-medium text-ink transition-colors duration-200 hover:bg-paper disabled:opacity-60"
              >
                {sending
                  ? "Sending…"
                  : waitLeft > 0 && result?.ok
                    ? `Resend in ${waitLeft}s`
                    : "Resend email"}
              </button>
              {result && (
                <p
                  role={result.ok ? "status" : "alert"}
                  className={`mt-3 animate-fade-in text-sm ${
                    result.ok ? "text-ink-soft" : "text-alert"
                  }`}
                >
                  {result.text}
                </p>
              )}
            </div>
          )}
        </div>

        <p className="px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-center text-[15px] text-ink-soft">
          Wrong address?{" "}
          <Link to="/sign-up" className={footerLink}>
            Start again
          </Link>
          <span aria-hidden="true" className="mx-2 text-line">
            ·
          </span>
          <Link to="/login" className={footerLink}>
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
