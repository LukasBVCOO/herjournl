// Anything that holds her writing registers here, so the app can make sure it
// is safe before it reloads itself for an update. It lives in lib/ because the
// thing that reloads the app and the thing that holds her writing are
// different features, and neither should reach into the other.

type Handler = () => Promise<void>;

const handlers = new Set<Handler>();

export function registerBeforeReload(handler: Handler) {
  handlers.add(handler);
}

// How long a handler gets before the reload goes ahead without waiting for it
// any longer. A handler like the notes queue's flush (notes-store.ts) copies
// her writing onto the phone well before it ever reaches the network, so
// giving up here never risks losing anything — only a slow upload gets left
// to finish in the background, which the queue already retries on its own.
// Without this, a single stalled network request (the phone's connection
// waking from sleep, say) left "Refresh" stuck on "One moment..." forever,
// since nothing ever told it to stop waiting.
const HANDLER_TIMEOUT_MS = 6000;

function withTimeout(handler: Handler): Promise<void> {
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, HANDLER_TIMEOUT_MS);
    handler()
      .catch(() => {})
      .finally(() => {
        clearTimeout(timer);
        resolve();
      });
  });
}

export async function runBeforeReload() {
  await Promise.all([...handlers].map(withTimeout));
}
