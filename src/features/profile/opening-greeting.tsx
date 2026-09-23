import { useEffect, useState } from "react";
import { getSession } from "@/lib/session";
import { fetchProfile } from "./profile-api";

// Kept for this app opening, across route changes. Backgrounding the app does
// not reset it. Each fresh page load, including a browser refresh or reopening
// the app, starts a new welcome.
let shownThisOpening = false;
const DISPLAY_MS = 10_000;
const FADE_MS = 200;
const LETTER_MS = 20;

export default function OpeningGreeting() {
  const [greeting, setGreeting] = useState<{
    text: string;
    startedAt: number;
    reduceMotion: boolean;
  } | null>(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (shownThisOpening) return;

    let current = true;
    const userId = getSession().userId;
    void fetchProfile().then((profile) => {
      if (!current || shownThisOpening || getSession().userId !== userId) return;
      const name = profile?.name?.trim();
      if (!name) return;

      shownThisOpening = true;
      setGreeting({
        text: `Hey ${name},\nWhat's on your mind today?`,
        startedAt: Date.now(),
        reduceMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      });
    }).catch(() => {
      // The welcome is optional; opening her notes never depends on it.
    });

    return () => {
      current = false;
    };
  }, []);

  useEffect(() => {
    if (!greeting) return;
    const letters = Array.from(greeting.text);
    const typing = window.setInterval(() => {
      const next = Date.now() - greeting.startedAt;
      setElapsed(next);
      if (next >= letters.length * LETTER_MS) window.clearInterval(typing);
    }, LETTER_MS);
    const fade = window.setTimeout(() => setElapsed(DISPLAY_MS), DISPLAY_MS);
    const finish = window.setTimeout(() => setElapsed(DISPLAY_MS + FADE_MS), DISPLAY_MS + FADE_MS);
    return () => {
      window.clearInterval(typing);
      window.clearTimeout(fade);
      window.clearTimeout(finish);
    };
  }, [greeting]);

  if (!greeting || elapsed >= DISPLAY_MS + FADE_MS) return null;
  const visibleText = greeting.reduceMotion
    ? greeting.text
    : Array.from(greeting.text).slice(0, Math.floor(elapsed / LETTER_MS)).join("");

  return (
    <div
      className={`grid transition-[grid-template-rows,opacity] duration-200 motion-reduce:transition-none ${elapsed >= DISPLAY_MS ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100"}`}
    >
      <div className="min-h-0 overflow-hidden">
        <div className="relative pb-6 font-serif text-[34px] leading-tight font-medium">
          <p className="sr-only">{greeting.text}</p>
          {/* Reserve both lines so the cards stay still while the text types. */}
          <p aria-hidden="true" className="invisible whitespace-pre-line break-words">
            {greeting.text}
          </p>
          <p aria-hidden="true" className="absolute inset-x-0 top-0 whitespace-pre-line break-words">
            {visibleText}
          </p>
        </div>
      </div>
    </div>
  );
}
