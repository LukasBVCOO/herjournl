import { useState, type FormEvent } from "react";
import Dots from "./dots";
import { sameLine } from "./sessions";

// Write mode (optional, offered for the morning 3x): she types the line out
// each time, like the handwritten version. A repetition only counts once
// what she typed is the line — capitals and punctuation don't matter.
export default function WriteCounter({
  line,
  count,
  target,
  onRep,
}: {
  line: string;
  count: number;
  target: number;
  onRep: () => void;
}) {
  const [typed, setTyped] = useState("");
  const done = count >= target;
  const matches = sameLine(typed, line);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!matches || done) return;
    onRep();
    setTyped("");
  }

  return (
    <form onSubmit={submit} className="flex flex-col items-center">
      {done ? (
        <p className="font-serif text-[40px] leading-none text-gold" aria-hidden="true">
          ✦
        </p>
      ) : (
        <>
          <input
            type="text"
            value={typed}
            onChange={(event) => setTyped(event.target.value)}
            placeholder="Write your line…"
            aria-label={`Write your line, ${count + 1} of ${target}`}
            autoComplete="off"
            autoCapitalize="sentences"
            enterKeyHint="done"
            className="h-12 w-full rounded-2xl bg-paper px-4 text-[17px] text-ink placeholder:text-muted focus:outline-2 focus:outline-offset-2 focus:outline-gold/50"
          />
          <button
            type="submit"
            disabled={!matches}
            className="mt-3 h-11 rounded-full bg-ink px-6 text-[15px] font-medium text-paper transition-opacity duration-200 hover:opacity-90 disabled:opacity-40"
          >
            Written ({count + 1} of {target})
          </button>
        </>
      )}
      <div className="mt-4">
        <Dots count={count} target={target} />
      </div>
      <p className="mt-3 text-[13px] text-muted" aria-live="polite">
        {done ? "Done for now" : "Type it exactly as it reads"}
      </p>
    </form>
  );
}
