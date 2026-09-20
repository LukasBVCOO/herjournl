// Who is signed in. The one place that knows.
//
// This lives OUTSIDE React, like the save queue does, so there is exactly one
// listener on the login session no matter how many screens are open. Screens
// read it with useSyncExternalStore and re-render when it changes.

import { supabase } from "@/lib/supabase/client";

export type Session = {
  // "loading" only until the stored login has been read, which is instant.
  status: "loading" | "signed-in" | "signed-out";
  userId?: string;
  email?: string;
};

let session: Session = { status: "loading" };
const listeners = new Set<() => void>();

function publish(next: Session) {
  const same =
    next.status === session.status &&
    next.userId === session.userId &&
    next.email === session.email;
  // React compares by reference, so an unchanged session must keep the same
  // object or every screen would re-render forever.
  if (same) return;
  session = next;
  listeners.forEach((listener) => listener());
}

// Fires for the stored login on startup, for signing in and out, and whenever
// the login is renewed in the background.
supabase.auth.onAuthStateChange((_event, next) => {
  publish(
    next
      ? {
          status: "signed-in",
          userId: next.user.id,
          email: next.user.email ?? undefined,
        }
      : { status: "signed-out" },
  );
});

// A safety net in case the event above never arrives, so the app can never sit
// on the opening screen forever. This waits for the stored login to be read
// (including finishing a Google sign-in), so it cannot report "signed out" too
// early.
void supabase.auth.getSession().then(({ data }) => {
  publish(
    data.session
      ? {
          status: "signed-in",
          userId: data.session.user.id,
          email: data.session.user.email ?? undefined,
        }
      : { status: "signed-out" },
  );
});

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getSession() {
  return session;
}
