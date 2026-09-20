// Whether the app can be added to the home screen, and whether it already is.
//
// Lives OUTSIDE React like the other stores. That matters here: Chrome offers
// the "install" moment once, early, possibly before any screen has appeared,
// and it has to be caught and kept for when she taps the button.

type InstallPrompt = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export type InstallState = {
  // Already opened from the home screen, so there is nothing left to offer.
  installed: boolean;
  // The browser will show its own install dialog when asked (Chrome, Edge,
  // Samsung Internet). Where it won't (iPhone), we show instructions instead.
  canPrompt: boolean;
};

function isInstalled() {
  if (typeof window === "undefined") return false;
  // iPhone reports it one way, everything else another.
  const iosStandalone = (navigator as { standalone?: boolean }).standalone === true;
  return iosStandalone || window.matchMedia("(display-mode: standalone)").matches;
}

let deferred: InstallPrompt | null = null;
let state: InstallState = { installed: isInstalled(), canPrompt: false };
const listeners = new Set<() => void>();

function update(next: Partial<InstallState>) {
  const merged = { ...state, ...next };
  // Same object back when nothing changed, or React would redraw for nothing.
  if (merged.installed === state.installed && merged.canPrompt === state.canPrompt) return;
  state = merged;
  listeners.forEach((listener) => listener());
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (event) => {
    // Keep the browser's own banner quiet; we show it from our button instead.
    event.preventDefault();
    deferred = event as InstallPrompt;
    update({ canPrompt: true });
  });

  window.addEventListener("appinstalled", () => {
    deferred = null;
    update({ installed: true, canPrompt: false });
  });

  window
    .matchMedia("(display-mode: standalone)")
    .addEventListener("change", () => update({ installed: isInstalled() }));
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getInstallState() {
  return state;
}

// Shows the browser's install dialog. Only works once per offer, so afterwards
// the button falls back to instructions.
export async function promptInstall() {
  const offer = deferred;
  if (!offer) return;
  deferred = null;
  update({ canPrompt: false });
  await offer.prompt();
  const { outcome } = await offer.userChoice;
  if (outcome === "accepted") update({ installed: true });
}

// iPhone and iPad (newer iPads call themselves a Mac, so check for touch).
export function isIphone() {
  const ua = navigator.userAgent;
  return (
    /iPhone|iPad|iPod/i.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}
