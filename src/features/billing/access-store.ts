// Whether she's premium, shared by every screen. Asked once each time the app
// opens (and again after anything that could change it), and remembered on
// this phone so screens know at once, and so she isn't locked out of
// something she has paid for just because she's offline.
//
// When nothing is known at all (first open, no internet), premium screens
// stay open rather than lock her out by mistake.

import { getSession, registerSignOutHandler, subscribe as subscribeToSession } from "@/lib/session";
import { fetchAccess, type Access } from "./billing-api";

export type AccessState =
  | { status: "loading" }
  | { status: "known"; access: Access }
  // Couldn't be asked and nothing remembered: treated as premium.
  | { status: "unknown" };

const STORAGE_KEY = "becomely:access";

let state: AccessState = { status: "loading" };
let loadedFor: string | null = null;
let loading = false;
const listeners = new Set<() => void>();

function set(next: AccessState) {
  state = next;
  listeners.forEach((listener) => listener());
}

function remembered(userId: string): Access | null {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null") as {
      userId: string;
      access: Access;
    } | null;
    return saved?.userId === userId ? saved.access : null;
  } catch {
    return null;
  }
}

function remember(userId: string, access: Access) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ userId, access }));
  } catch {
    // Storage blocked: it's just asked again next time.
  }
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getState(): AccessState {
  return state;
}

// Asks once per signed-in person per app open. Safe to call on every render.
export function ensureLoaded() {
  const userId = getSession().userId;
  if (!userId || loading || loadedFor === userId) return;
  void load(userId);
}

// Asks again, e.g. after she comes back from paying.
export function refresh() {
  loadedFor = null;
  ensureLoaded();
}

async function load(userId: string) {
  loading = true;
  const saved = remembered(userId);
  if (saved && state.status === "loading") set({ status: "known", access: saved });

  const access = await fetchAccess();
  loading = false;
  if (getSession().userId !== userId) return;
  loadedFor = userId;
  if (access) {
    remember(userId, access);
    set({ status: "known", access });
  } else if (!saved) {
    set({ status: "unknown" });
  }
}

// Premium screens stay open unless she's known to be on the free plan.
export function isLocked(current: AccessState): boolean {
  return current.status === "known" && !current.access.premium;
}

// Her login can still be settling when a screen first asks; this asks again
// once it has (and for whoever signs in next).
subscribeToSession(() => ensureLoaded());

registerSignOutHandler({
  prepare: async () => null,
  clear: async () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Nothing to clear.
    }
    loadedFor = null;
    state = { status: "loading" };
  },
});
