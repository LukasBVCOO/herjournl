import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { forgetPendingSignup, pendingSignupFor } from "./pending-signup";

// How often to check while she waits, and for how long before giving up
// (Supabase allows a limited number of login attempts per few minutes, so
// this stays well under it). She is also checked on straight away whenever
// she comes back to this tab or app — which is usually right after tapping the
// link on her phone.
const CHECK_EVERY_MS = 10_000;
const GIVE_UP_AFTER_MS = 30 * 60_000;

// While she waits on "Confirmation link sent": quietly tries to log in with
// the details she just signed up with. Supabase refuses ("email not
// confirmed") until she taps the link — on any device — and then lets her in,
// at which point the session changes and the screen moves her on by itself.
// Returns whether it is watching (so the screen can say it will move on).
export function useConfirmedElsewhere(email: string | undefined): boolean {
  const [watching, setWatching] = useState(() => pendingSignupFor(email) !== null);

  useEffect(() => {
    const details = pendingSignupFor(email);
    if (!details) return;

    const startedAt = Date.now();
    let stopped = false;
    let busy = false;

    function stop() {
      stopped = true;
      forgetPendingSignup();
      setWatching(false);
    }

    async function check() {
      if (stopped || busy || document.visibilityState !== "visible") return;
      if (Date.now() - startedAt > GIVE_UP_AFTER_MS) return stop();
      busy = true;
      const { error } = await supabase.auth.signInWithPassword(details!);
      busy = false;
      if (stopped) return;
      // Logged in: the session change takes her on (check-email-screen.tsx).
      if (!error) return stop();
      // Still waiting for her to tap the link: try again later.
      if (error.code === "email_not_confirmed") return;
      // Anything else (too many tries, the details no longer work): stop
      // quietly; "Log in" at the bottom of the page is always there.
      stop();
    }

    const timer = setInterval(() => void check(), CHECK_EVERY_MS);
    const onReturn = () => void check();
    document.addEventListener("visibilitychange", onReturn);
    window.addEventListener("focus", onReturn);
    return () => {
      stopped = true;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onReturn);
      window.removeEventListener("focus", onReturn);
    };
  }, [email]);

  return watching;
}
