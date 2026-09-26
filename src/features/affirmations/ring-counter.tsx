const SIZE = 184;
const STROKE = 4;
const RADIUS = (SIZE - STROKE) / 2 - 6;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
// The space between two segments, along the ring.
const GAP = 12;

// Tap mode (the default): she says the line, then taps the ring. The ring is
// split into one segment per repetition (3, 6 or 9), each turning gold as it's
// said, so she can see where she is without counting; typing it 18 times a
// day would be too much to keep up.
export default function RingCounter({
  count,
  target,
  onTap,
}: {
  count: number;
  target: number;
  onTap: () => void;
}) {
  const done = count >= target;
  const step = CIRCUMFERENCE / target;
  const segment = step - GAP;

  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        onClick={onTap}
        disabled={done}
        aria-label={done ? "Done" : `Said it — ${count} of ${target}`}
        className="relative flex items-center justify-center rounded-full transition-transform duration-150 active:scale-[0.97] disabled:active:scale-100"
        style={{ width: SIZE, height: SIZE }}
      >
        {/* The face: a soft white disc, lifted a little off the page. */}
        <span
          aria-hidden="true"
          className="absolute rounded-full bg-surface shadow-[0_6px_24px_rgb(58_53_49/0.07)]"
          style={{ inset: STROKE + 14 }}
        />
        <svg width={SIZE} height={SIZE} className="absolute inset-0 -rotate-90" aria-hidden="true">
          {Array.from({ length: target }, (_, index) => (
            <circle
              key={index}
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke={index < count ? "var(--color-gold)" : "var(--color-line)"}
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={`${segment} ${CIRCUMFERENCE - segment}`}
              strokeDashoffset={-(index * step + GAP / 2)}
              className="transition-[stroke] duration-300 motion-reduce:transition-none"
            />
          ))}
        </svg>
        <span className="relative flex flex-col items-center">
          {done ? (
            <span className="font-serif text-[44px] leading-none text-gold">✦</span>
          ) : (
            <>
              <span className="font-serif text-[52px] leading-none font-medium text-ink tabular-nums">
                {count}
              </span>
              <span className="mt-1 text-[12px] tracking-wide text-muted">of {target}</span>
            </>
          )}
        </span>
      </button>
      <p className="mt-4 text-[13px] text-muted" aria-live="polite">
        {done ? "Done for now" : "Say it aloud, then tap"}
      </p>
    </div>
  );
}
