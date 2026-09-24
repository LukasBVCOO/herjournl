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
export function useSettleDelay(due: boolean, key: string, delayMs: number): boolean {
  const [visible, setVisible] = useState(() => due && shownThisSession.has(key));

  useEffect(() => {
    if (!due) {
      setVisible(false);
      return;
    }
    if (shownThisSession.has(key)) {
      setVisible(true);
      return;
    }
    const timer = setTimeout(() => {
      shownThisSession.add(key);
      setVisible(true);
    }, delayMs);
    return () => clearTimeout(timer);
  }, [due, key, delayMs]);

  return visible;
}
