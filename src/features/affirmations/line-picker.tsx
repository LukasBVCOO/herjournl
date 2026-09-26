import { useState } from "react";
import type { Affirmation, AffirmationType } from "./affirmations-api";
import { chooseLine } from "./daily-369-store";
import { houseLabel } from "./house-label";

const TYPE_LABEL: Record<AffirmationType, string> = {
  theme: "Today's theme",
  goal: "A goal",
  belief: "A belief",
};

// The day's three lines for her house — theme, goal, belief — to pick the one
// she'll repeat all day. The theme is picked to start with, so accepting the
// default is one tap.
export default function LinePicker({
  house,
  options,
  currentId,
}: {
  house: number;
  options: Affirmation[];
  currentId: number | null;
}) {
  const [selected, setSelected] = useState<number | null>(currentId ?? options[0]?.id ?? null);
  const [busy, setBusy] = useState(false);
  const area = houseLabel(house);

  async function use() {
    const line = options.find((option) => option.id === selected);
    if (!line || busy) return;
    setBusy(true);
    await chooseLine(line);
    setBusy(false);
  }

  return (
    <div>
      <p className="font-serif text-[22px] leading-snug font-medium text-ink">
        Choose today&rsquo;s line
      </p>
      <p className="mt-1 text-[14px] text-ink-soft">
        {area ? `For your ${area}. ` : ""}Pick the one that feels most true. You&rsquo;ll repeat it
        all day.
      </p>

      <div role="radiogroup" aria-label="Today's line" className="mt-4 flex flex-col gap-2.5">
        {options.map((option) => {
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
              <span className="block text-[11px] font-medium tracking-wider text-muted uppercase">
                {TYPE_LABEL[option.type]}
              </span>
              <span className="mt-1 block font-serif text-[19px] leading-snug text-ink">
                {option.text}
              </span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => void use()}
        disabled={selected === null || busy}
        className="mt-4 flex h-12 w-full items-center justify-center rounded-full bg-ink text-[15px] font-medium text-paper transition-opacity duration-200 hover:opacity-90 disabled:opacity-50"
      >
        {busy ? "One moment…" : "Use this line"}
      </button>
    </div>
  );
}
