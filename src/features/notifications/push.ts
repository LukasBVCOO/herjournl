// Talking to the browser's own push machinery. No database, no screens.
//
// A push notification needs her browser to hold a "subscription": an address
// (endpoint) plus two small keys that only her browser knows the other half of.
// Getting one needs three things to be true: the browser supports push at all,
// she has said yes to "Allow notifications", and (on iPhone specifically) the
// app has been added to her home screen first — Safari refuses push from an
// ordinary browser tab.

const VAPID_PUBLIC_KEY: string | undefined =
  import.meta.env.VITE_VAPID_PUBLIC_KEY ?? import.meta.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

export function pushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window &&
    Boolean(VAPID_PUBLIC_KEY)
  );
}

export function notificationPermission(): NotificationPermission | "unsupported" {
  if (typeof Notification === "undefined") return "unsupported";
  return Notification.permission;
}

// The key our server signs with has to be handed to the browser as raw bytes,
// but it is written down (and stored in .env) as URL-safe base64 text.
function keyAsBytes(key: string): Uint8Array {
  const base64 = key.replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  return Uint8Array.from(raw, (char) => char.charCodeAt(0));
}

export type SubscriptionKeys = {
  endpoint: string;
  p256dh: string;
  auth: string;
  // Which IANA zone ("Europe/Vilnius") her phone was in just now. This is how
  // the server works out when her morning and evening are.
  timezone: string;
};

function toKeys(subscription: PushSubscription): SubscriptionKeys | null {
  const json = subscription.toJSON();
  const { p256dh, auth } = json.keys ?? {};
  if (!json.endpoint || !p256dh || !auth) return null;
  return {
    endpoint: json.endpoint,
    p256dh,
    auth,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
}

// This app's background helper (the service worker), which is what holds a
// push subscription. Never waits forever: the browser's own "wait until it's
// ready" never finishes when there isn't one at all (localhost, where it is
// only built into the real app, or if installing it ever failed), and that
// used to freeze logging out.
//   - To read or remove what's already there, the one already registered is
//     enough: if there isn't one, there's no subscription either.
//   - To subscribe, it may still be starting up, so wait for it, but only a
//     few seconds.
const READY_WAIT_MS = 8000;

async function existingRegistration(): Promise<ServiceWorkerRegistration | null> {
  return (await navigator.serviceWorker.getRegistration()) ?? null;
}

async function readyRegistration(): Promise<ServiceWorkerRegistration | null> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const gaveUp = new Promise<null>((resolve) => {
    timer = setTimeout(() => resolve(null), READY_WAIT_MS);
  });
  try {
    return await Promise.race([navigator.serviceWorker.ready, gaveUp]);
  } finally {
    clearTimeout(timer);
  }
}

// Asks her, then subscribes this browser. null means it didn't happen (not
// supported, she said no, or something else went wrong) — never guessed at.
export async function requestPushSubscription(): Promise<SubscriptionKeys | null> {
  if (!pushSupported() || !VAPID_PUBLIC_KEY) return null;

  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return null;

    const registration = await readyRegistration();
    if (!registration) return null;
    const existing = await registration.pushManager.getSubscription();
    const subscription =
      existing ??
      (await registration.pushManager.subscribe({
        userVisibleOnly: true,
        // TypeScript's DOM types want an ArrayBuffer specifically; a Uint8Array
        // is always backed by one at runtime, so this is safe.
        applicationServerKey: keyAsBytes(VAPID_PUBLIC_KEY) as BufferSource,
      }));
    return toKeys(subscription);
  } catch {
    return null;
  }
}

// The subscription this browser already has, if any, without asking her
// anything. Used to notice she is already subscribed (another visit, or she
// said yes before this screen existed).
export async function currentPushSubscription(): Promise<SubscriptionKeys | null> {
  if (!pushSupported()) return null;
  try {
    const registration = await existingRegistration();
    if (!registration) return null;
    const subscription = await registration.pushManager.getSubscription();
    return subscription ? toKeys(subscription) : null;
  } catch {
    return null;
  }
}

// Turns notifications off on this browser. True once the browser confirms it.
export async function cancelPushSubscription(): Promise<boolean> {
  if (!pushSupported()) return false;
  try {
    const registration = await existingRegistration();
    if (!registration) return true;
    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) return true;
    return await subscription.unsubscribe();
  } catch {
    return false;
  }
}
