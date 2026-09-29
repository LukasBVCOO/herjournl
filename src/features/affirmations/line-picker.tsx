import { useState } from "react";
import type { Affirmation, AffirmationType, Day369 } from "./affirmations-api";
import { chooseLine, keepCurrentLine } from "./daily-369-store";
import { houseLabel } from "./house-label";

const TYPE_LABEL: Record<AffirmationType, string> = {
  theme: "Today's theme",
  goal: "A goal",
  belief: "A belief",
};

// Today's lines for her house — a theme, a goal and a belief, a different
// three each day (daily-lines.ts) — to pick the one she'll repeat all day,
// and a fourth underneath: yesterday's line, so keeping it is her choice
// (nothing carries over by itself). The first new line is picked to start
// with.
//
// `current` is today's line when she's changing it: it takes that fourth
// place and starts picked. If she has already said it, picking a different
// one starts the day's 3·6·9 again — said plainly before she confirms.
export default function LinePicker({
  house,
  options,
  current,
  yesterday,
}: {
  house: number;
  options: Affirmation[];
  current: Day369 | null;
  yesterday: Affirmation | null;
}) {
  const currentId = current?.affirmation.id ?? null;
  const own = current?.affirmation ?? yesterday;
  const lines = own && !options.some((option) => option.id === own.id) ? [...options, own] : options;
  const [selected, setSelected] = useState<number | null>(currentId ?? options[0]?.id ?? null);
  const [busy, setBusy] = useState(false);
  const area = houseLabel(house);
  const started = current
    ? current.counts.morning + current.counts.afternoon + current.counts.evening > 0
    : false;
  const switching = current !== null && selected !== currentId;

  async function use() {
    const line = lines.find((option) => option.id === selected);
    if (!line || busy) return;
    setBusy(true);
    await chooseLine(line);
    setBusy(false);
  }

  return (
    <div>
      <p className="font-serif text-[22px] leading-snug font-medium text-ink">
        {current ? "Change today’s line" : "Choose today’s line"}
      </p>
      <p className="mt-1 text-[14px] text-ink-soft">
        {area ? `For your ${area}. ` : ""}Pick the one that feels most true. You&rsquo;ll repeat it
        all day.
      </p>

      <div role="radiogroup" aria-label="Today's line" className="mt-4 flex flex-col gap-2.5">
        {lines.map((option) => {
          const checked = option.id === selected;
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={checked}
              onClick={() => setSelected(option.id)}
              className={`rounded-2xl border px-4 py-3.5 text-left transition-colors duration-200 ${
                checked ? "border-gold bg-surface" : "border-line bg-transparent"
              }`}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-medium tracking-wider text-muted uppercase">
                  {TYPE_LABEL[option.type]}
                </span>
                {option.id === own?.id && (
                  <span className="text-[11px] text-muted">
                    {currentId !== null ? "Today’s line" : "Yesterday’s line"}
                  </span>
                )}
              </span>
              <span className="mt-1 block font-serif text-[19px] leading-snug text-ink">
                {option.text}
              </span>
            </button>
          );
        })}
      </div>

      {switching && started && (
        <p role="status" className="mt-4 animate-fade-in text-center text-[13px] leading-snug text-ink-soft">
          Your 3·6·9 for today starts again with the new line.
        </p>
      )}

      <button
        type="button"
        onClick={() => void use()}
        disabled={selected === null || busy}
        className="mt-4 flex h-12 w-full items-center justify-center rounded-full bg-ink text-[15px] font-medium text-paper transition-opacity duration-200 hover:opacity-90 disabled:opacity-50"
      >
        {busy
          ? "One moment…"
          : current && !switching
            ? "Keep today’s line"
            : switching && started
              ? "Start again with this line"
              : "Use this line"}
      </button>

      {current && (
        <button
          type="button"
          onClick={keepCurrentLine}
          className="mx-auto mt-2 block py-2 text-[14px] text-ink-soft underline decoration-line underline-offset-4"
        >
          Cancel
        </button>
      )}
    </div>
  );
}
