import { Navigate, useLocation } from "react-router";
import OpeningScreen from "./opening-screen";
import { useSession } from "./use-session";

// Wraps the screens that only make sense when she is signed in. This replaces
// the old server-side check that ran before every page. Her notes were never
// protected by that check — the database's own privacy rules are what stop
// anyone reading someone else's notes, and those have not changed.
export function RequireSession({ children }: { children: React.ReactNode }) {
  const session = useSession();
  const location = useLocation();

  if (session.status === "loading") return <OpeningScreen />;
  if (session.status === "signed-out") {
    // Remember where she was headed, so signing in carries her straight there.
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return children;
}

// The other way round: the login and sign-up screens, which she shouldn't see
// once she is already signed in. `to` is where she goes instead. Creating an
// account signs her in on the spot, so the sign-up screen sends her to the
// welcome, the same place its own button does; if the two disagreed she would
// flash through the wrong screen on the way.
export function RequireNoSession({
  children,
  to = "/",
}: {
  children: React.ReactNode;
  to?: string;
}) {
  const session = useSession();

  if (session.status === "loading") return <OpeningScreen />;
  if (session.status === "signed-in") return <Navigate to={to} replace />;
  return children;
}
