import { useState } from "react";
import { deviceTimeZone, localHourIn } from "@/features/daily-focus";
import { repeat, retry } from "./daily-369-store";
import LinePicker from "./line-picker";
import RingCounter from "./ring-counter";
import { isLate, SESSION_LABEL, TARGET, type Session } from "./sessions";
import { useDaily369 } from "./use-daily-369";
import WriteCounter from "./write-counter";

const WRITE_MODE_KEY = "becomely:affirmation-write-mode";

function readWriteMode(): boolean {
  try {
    return localStorage.getItem(WRITE_MODE_KEY) === "on";
  } catch {
    return false;
  }
}

function saveWriteMode(on: boolean) {
  try {
    localStorage.setItem(WRITE_MODE_KEY, on ? "on" : "off");
  } catch {
    // Storage blocked: it just won't be remembered.
  }
}

// One session of the day's 369 (3, 6 or 9 repetitions of the day's line).
// Used on its own screen, as the last part of the morning entry, and before
// the evening journal. If she hasn't picked today's line yet, the picker comes
// first. `onComplete` runs when the last repetition of this session is done
// (the evening one moves her straight on to her recap).
export default function AffirmationSession({
  session,
  onComplete,
  plain = false,
}: {
  session: Session;
  onComplete?: () => void;
  // On today's practice screen: no card, heading or line of its own — that
  // screen shows the line once above all three sessions, and the session
  // tabs already say which one this is.
  plain?: boolean;
}) {
  const state = useDaily369();
  // Write mode is only offered for the morning 3x — 6 and 9 typed
  // repetitions would be too much to keep up.
  const canWrite = session === "morning";
  const [writeMode, setWriteMode] = useState(() => canWrite && readWriteMode());

  if (state.status === "loading") return null;

  if (state.status === "error") {
    return (
      <section className="rounded-card bg-surface px-5 py-4 shadow-soft">
        <p className="text-[15px] text-ink-soft">
          {state.offline
            ? "Your affirmation will be here once you're back online."
            : "We couldn't load your affirmation."}{" "}
          <button
            type="button"
            onClick={retry}
            className="font-medium text-ink underline underline-offset-4"
          >
            Try again
          </button>
        </p>
      </section>
    );
  }

  if (state.status === "choose") {
    return (
      <section className="rounded-card bg-surface px-5 py-5 shadow-soft">
        <LinePicker
          house={state.house}
          options={state.options}
          currentId={state.current?.affirmation.id ?? null}
        />
      </section>
    );
  }

  const { day } = state;
  const target = TARGET[session];
  const count = day.counts[session];
  const doneAt = day.doneAt[session];
  const late = doneAt ? isLate(session, localHourIn(new Date(doneAt), deviceTimeZone())) : false;

  function rep() {
    const finished = repeat(session);
    if (finished) onComplete?.();
  }

  const lateTag = late && (
    <span className="rounded-full bg-card px-2.5 py-0.5 text-[11px] font-medium text-muted">
      Done late
    </span>
  );

  return (
    <section className={plain ? "" : "rounded-card bg-surface px-5 pt-5 pb-6 shadow-soft"}>
      {plain ? (
        lateTag && <div className="mb-3 flex justify-center">{lateTag}</div>
      ) : (
        <>
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-medium tracking-[0.14em] text-ink-soft uppercase">
              {SESSION_LABEL[session]} affirmation · {target}×
            </p>
            {lateTag}
          </div>
          <p className="mt-3 text-center font-serif text-[26px] leading-snug font-medium text-ink">
            {day.affirmation.text}
          </p>
        </>
      )}

      <div className={plain ? "" : "mt-5"}>
        {writeMode ? (
          <WriteCounter line={day.affirmation.text} count={count} target={target} onRep={rep} />
        ) : (
          <RingCounter count={count} target={target} onTap={rep} />
        )}
      </div>

      {canWrite && count < target && (
        <button
          type="button"
          onClick={() => {
            setWriteMode(!writeMode);
            saveWriteMode(!writeMode);
          }}
          className="mx-auto mt-4 block text-[13px] text-ink-soft underline underline-offset-4"
        >
          {writeMode ? "Tap instead" : "Write it out instead"}
        </button>
      )}

      {state.unsaved && (
        <p className="mt-3 text-center text-[12px] text-muted">
          Couldn&rsquo;t save just now — your next tap will try again.
        </p>
      )}
    </section>
  );
}
