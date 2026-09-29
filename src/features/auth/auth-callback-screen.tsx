import { Navigate } from "react-router";
import { useSession } from "./use-session";

// Where the link in the confirmation email sends her back (Google sign-in
// used to land here too — removed for now, see auth-screen.tsx). The
// Supabase library spots the one-time code in the web address and swaps it
// for a real login on its own, before this screen even appears — so all
// this does is wait, then move her on to the welcome, since that is the
// moment she has just created her account.
export default function AuthCallbackScreen({ next = "/" }: { next?: string }) {
  const session = useSession();

  if (session.status === "signed-in") return <Navigate to={next} replace />;
  if (session.status === "signed-out") {
    // From the confirmation email: her email IS confirmed, this device just
    // can't be logged in by the link (e.g. she opened it on another device),
    // so she's thanked and asked to log in, not shown an error.
    return <Navigate to={next === "/onboarding" ? "/login?confirmed=1" : "/login?error=callback"} replace />;
  }

  return (
    <main className="flex flex-1 items-center justify-center px-6">
      <p role="status" className="text-[17px] text-ink-soft">
        One moment…
      </p>
    </main>
  );
}
