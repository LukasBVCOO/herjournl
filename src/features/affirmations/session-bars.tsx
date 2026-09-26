import { SESSION_LABEL, SESSIONS, TARGET, type Counts } from "./sessions";

// The day's 369 at a glance: three short rows of 3, 6 and 9 hairline
// segments, one per repetition, filling in gold as she goes.
export default function SessionBars({ counts }: { counts: Counts }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {SESSIONS.map((session) => {
        const target = TARGET[session];
        const count = Math.min(counts[session], target);
        const done = count >= target;
        return (
          <div key={session}>
            <div className="flex gap-[3px]" aria-hidden="true">
              {Array.from({ length: target }, (_, index) => (
                <span
                  key={index}
                  className={`h-[3px] flex-1 rounded-full transition-colors duration-300 ${
                    index < count ? "bg-gold" : "bg-ink/10"
                  }`}
                />
              ))}
            </div>
            <p className="mt-2 flex items-baseline justify-between text-[12px]">
              <span className={done ? "font-medium text-ink" : "text-ink-soft"}>
                {SESSION_LABEL[session]}
              </span>
              <span className={done ? "text-gold" : "text-muted"}>
                {done ? "✦" : `${count}/${target}`}
              </span>
            </p>
          </div>
        );
      })}
    </div>
  );
}
