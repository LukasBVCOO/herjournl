import { Navigate } from "react-router";
import { useSession } from "./use-session";

// Where Google, and the link in the confirmation email, send her back. The
// Supabase library spots the one-time code in the web address and swaps it for a
// real login on its own, before this screen even appears — so all this does is
// wait, then move her on.
export default function AuthCallbackScreen() {
  const session = useSession();

  if (session.status === "signed-in") return <Navigate to="/" replace />;
  if (session.status === "signed-out") {
    return <Navigate to="/login?error=callback" replace />;
  }

  return (
    <main className="flex flex-1 items-center justify-center px-6">
      <p role="status" className="text-[17px] text-ink-soft">
        One moment…
      </p>
    </main>
  );
}
