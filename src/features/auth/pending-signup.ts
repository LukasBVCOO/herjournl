// The email and password she just signed up with, held ONLY in this page's
// memory while she waits on "Confirmation link sent", so that page can log
// her in by itself the moment she confirms — even if she taps the link on a
// different device (her phone), where the confirmation can't log THIS device
// in. Never written to storage, the address bar or history: a refresh or
// leaving the page forgets it (she then just logs in normally), and it is
// wiped as soon as it has been used.

type PendingSignup = { email: string; password: string };

let pending: PendingSignup | null = null;

export function rememberPendingSignup(email: string, password: string) {
  pending = { email, password };
}

// The details for this address, if they are still held.
export function pendingSignupFor(email: string | undefined): PendingSignup | null {
  return pending && email && pending.email === email ? pending : null;
}

export function forgetPendingSignup() {
  pending = null;
}
