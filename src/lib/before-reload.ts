// Anything that holds her writing registers here, so the app can make sure it
// is safe before it reloads itself for an update. It lives in lib/ because the
// thing that reloads the app and the thing that holds her writing are
// different features, and neither should reach into the other.

type Handler = () => Promise<void>;

const handlers = new Set<Handler>();

export function registerBeforeReload(handler: Handler) {
  handlers.add(handler);
}

export async function runBeforeReload() {
  await Promise.all([...handlers].map((handler) => handler().catch(() => {})));
}
