import { useEffect, useState } from "react";

// Per key, whether its "let it settle" pause has already played this
// session. Module state, not React state, so it survives every remount of
// every card that uses it (leaving "/" and coming back) for as long as the
// app stays open in memory — reopening the app for real (a fresh load)
// clears it, same as any other module-level variable.
const shownThisSession = new Set<string>();

// True once `due` has been true for `delayMs` — the first time. After that,
// for the same `key`, it's true the instant it's due again: a card fades in
// once per key this session, then just appears or disappears in step with
// `due` from then on, rather than replaying its pause every time she
// navigates back to this screen. Give the key a day in it (daily-plan-card.tsx
// does `daily-plan:${cardDay}`) so a genuinely new day still gets its own
// first pause rather than inheriting yesterday's.
//
// Worked out while drawing rather than stored: only the pause itself needs a
// timer, which records the key and redraws once it has played.
export function useSettleDelay(due: boolean, key: string, delayMs: number): boolean {
  // Changing this is only a nudge to redraw once a pause has played.
  const [, setSettledKey] = useState<string | null>(null);

  useEffect(() => {
    if (!due || shownThisSession.has(key)) return;
    const timer = setTimeout(() => {
      shownThisSession.add(key);
      setSettledKey(key);
    }, delayMs);
    return () => clearTimeout(timer);
  }, [due, key, delayMs]);

  return due && shownThisSession.has(key);
}
