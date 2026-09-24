// Who is signed in. The one place that knows.
//
// This lives OUTSIDE React, like the save queue does, so there is exactly one
// listener on the login session no matter how many screens are open. Screens
// read it with useSyncExternalStore and re-render when it changes. It sits in
// lib/ rather than in a feature folder because both signing in and the notes
// themselves need to know who she is.

import { posthog } from "./posthog";
import { supabase } from "./supabase/client";

export type Session = {
  // "loading" only until the stored login has been read, which is instant.
  status: "loading" | "signed-in" | "signed-out";
  userId?: string;
  email?: string;
};

let session: Session = { status: "loading" };
let identifiedUserId: string | undefined;
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

// Who was signed in last time. The login library can't confirm a login while
// the phone is offline and the login has gone stale, and would report "signed
// out". That must not lock her out of her own notes, so we remember her here.
// Named after the app's first name on purpose: it never shows on screen, and
// changing it would forget who was signed in on every phone.
const LAST_USER_KEY = "herjournl:last-user";

type KnownUser = { userId: string; email?: string };

function rememberedUser(): KnownUser | null {
  try {
    const raw = localStorage.getItem(LAST_USER_KEY);
    return raw ? (JSON.parse(raw) as KnownUser) : null;
  } catch {
    return null;
  }
}

function remember(user: KnownUser | null) {
  try {
    if (user) localStorage.setItem(LAST_USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(LAST_USER_KEY);
  } catch {
    // Private browsing can block storage; she just isn't remembered offline.
  }
}

function signedIn(user: KnownUser) {
  if (identifiedUserId !== user.userId) {
    // A direct account switch must not retain the previous person's identity.
    if (identifiedUserId) posthog?.reset();
    posthog?.identify(
      user.userId,
      user.email ? { email: user.email } : undefined,
    );
    identifiedUserId = user.userId;
  }

  remember(user);
  publish({ status: "signed-in", userId: user.userId, email: user.email });
}

// Fires for signing in and out, and whenever the login is renewed.
supabase.auth.onAuthStateChange((event, next) => {
  if (next) {
    signedIn({ userId: next.user.id, email: next.user.email ?? undefined });
  } else if (event === "SIGNED_OUT") {
    // A real sign out, or a login that was refused for good.
    posthog?.reset();
    identifiedUserId = undefined;
    remember(null);
    publish({ status: "signed-out" });
  }
  // A missing session at startup is settled by getSession() just below.
});

void supabase.auth.getSession().then(({ data, error }) => {
  if (data.session) {
    signedIn({
      userId: data.session.user.id,
      email: data.session.user.email ?? undefined,
    });
    return;
  }
  // No session AND an error usually means "couldn't reach the login server",
  // not "not signed in". Trust who she was last time rather than the login
  // screen, so her notes still open with no internet.
  const known = error ? rememberedUser() : null;
  if (known) signedIn(known);
  else publish({ status: "signed-out" });
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

// Things that hold her writing on the phone register here, so logging out can
// first make sure nothing is lost, then clear the phone.
type SignOutHandler = {
  // Returns a message to show her if it isn't safe to log out yet.
  prepare: () => Promise<string | null>;
  clear: () => Promise<void>;
};

const signOutHandlers = new Set<SignOutHandler>();

export function registerSignOutHandler(handler: SignOutHandler) {
  signOutHandlers.add(handler);
}

// Logs her out. Returns a message when it wouldn't be safe, otherwise null.
export async function signOut(): Promise<string | null> {
  for (const handler of signOutHandlers) {
    const problem = await handler.prepare();
    if (problem) return problem;
  }
  for (const handler of signOutHandlers) await handler.clear();
  await supabase.auth.signOut();
  return null;
}
