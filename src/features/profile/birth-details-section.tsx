import { useState } from "react";
import {
  BirthDateFields,
  BirthTimeField,
  calculateChart,
  checkBirthDate,
  MIN_AGE,
  parseBirthTime,
  PlaceSearch,
  type BirthDateProblem,
  type Place,
} from "@/features/onboarding";
import ChartLoading, { MIN_LOADING_MS } from "./chart-loading";
import ConfirmSheet from "./confirm-sheet";
import { formatBirthDate, formatBirthTime } from "./format";
import { updateProfile } from "./profile-api";

const cardClass = "rounded-card bg-card px-5 py-4 shadow-soft";
const editButtonClass =
  "-mr-2 flex h-11 items-center px-2 text-sm font-medium text-ink underline underline-offset-4";

const problemText: Record<BirthDateProblem, string> = {
  invalid: "Please enter a valid date.",
  future: "Your birth date can’t be in the future.",
  "too-young": `You need to be ${MIN_AGE} or older to use Becomely.`,
};

// "2000-07-18" -> the three boxes' worth of text.
function splitDate(iso: string) {
  const [year, month, day] = iso.split("-");
  return { day, month, year };
}

// Her birth date, time and birthplace. Changing any of them recalculates her
// chart, so it asks first, then works the chart out again with the same code
// onboarding uses and replaces the old one. Her journal entries are never
// touched.
export default function BirthDetailsSection({
  dateOfBirth,
  birthTime,
  birthPlace,
  place: savedPlace,
  onSaved,
}: {
  dateOfBirth: string;
  birthTime: string;
  // The birthplace as she chose it, for showing.
  birthPlace: string;
  // The same place rebuilt from what was saved, for working the chart out again.
  place: Place;
  onSaved: () => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [time, setTime] = useState("");
  const [place, setPlace] = useState<Place | null>(null);
  const [problem, setProblem] = useState<BirthDateProblem | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updated, setUpdated] = useState(false);

  function startEditing() {
    const saved = splitDate(dateOfBirth);
    setDay(saved.day);
    setMonth(saved.month);
    setYear(saved.year);
    setTime(birthTime);
    setPlace(savedPlace);
    setProblem(null);
    setError(null);
    setUpdated(false);
    setEditing(true);
  }

  // What has actually changed. Typing a date that means the same day as before
  // (07 instead of 7) doesn't count, and choosing the same place again doesn't.
  const saved = splitDate(dateOfBirth);
  const dateChanged =
    Number(day) !== Number(saved.day) ||
    Number(month) !== Number(saved.month) ||
    year !== saved.year;
  const timeChanged = time !== birthTime;
  const placeChanged =
    place !== null &&
    (place.latitude !== savedPlace.latitude || place.longitude !== savedPlace.longitude);
  const changed = dateChanged || timeChanged || placeChanged;

  const parsedTime = parseBirthTime(time);
  const canSave = day !== "" && month !== "" && year.length === 4 && parsedTime !== null && place !== null;

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSave) return;

    const result = checkBirthDate(day, month, year);
    if (!result.ok) {
      setProblem(result.problem);
      return;
    }
    // Nothing was changed, so there is nothing to recalculate.
    if (!changed) {
      setEditing(false);
      return;
    }
    setConfirming(true);
  }

  async function recalculate() {
    if (!place || !parsedTime) return;
    // The loading screen takes over from the question, and stays long enough
    // to be seen even when the chart is ready straight away.
    setConfirming(false);
    setBusy(true);
    setError(null);

    const shownLongEnough = new Promise((resolve) =>
      setTimeout(resolve, MIN_LOADING_MS),
    );
    let chart;
    try {
      [chart] = await Promise.all([
        calculateChart({
          year: Number(year),
          month: Number(month),
          day: Number(day),
          hour: parsedTime.hour,
          minute: parsedTime.minute,
          latitude: place.latitude,
          longitude: place.longitude,
        }),
        shownLongEnough,
      ]);
    } catch {
      setBusy(false);
      setError("We couldn’t update your chart right now. Nothing has been changed.");
      return;
    }

    // One save for all of it, so the new details and the new chart replace the
    // old ones together or not at all.
    const ok = await updateProfile({
      dateOfBirth: `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`,
      birthTime: time,
      place: placeChanged ? place : undefined,
      chart,
    });
    if (!ok) {
      setBusy(false);
      setError("We couldn’t save your changes. Please try again.");
      return;
    }

    await onSaved();
    setBusy(false);
    setEditing(false);
    setUpdated(true);
  }

  if (!editing) {
    return (
      <section className={cardClass}>
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-medium tracking-wider text-muted uppercase">
            Birth details
          </h2>
          <button type="button" onClick={startEditing} className={editButtonClass}>
            Edit
          </button>
        </div>

        <dl className="mt-1 flex flex-col gap-3">
          <Row label="Date of birth" value={formatBirthDate(dateOfBirth)} />
          <Row label="Time of birth" value={formatBirthTime(birthTime)} />
          <Row label="Birthplace" value={birthPlace} />
        </dl>

        {updated && (
          <p role="status" className="mt-3 animate-fade-in text-sm text-ink-soft">
            Your chart has been updated.
          </p>
        )}
      </section>
    );
  }

  return (
    <section className={cardClass}>
      <h2 className="text-xs font-medium tracking-wider text-muted uppercase">
        Birth details
      </h2>

      <form onSubmit={submit} className="mt-4 flex flex-col gap-8">
        <BirthDateFields
          day={day}
          month={month}
          year={year}
          invalid={problem !== null}
          onChange={(patch) => {
            if (patch.day !== undefined) setDay(patch.day);
            if (patch.month !== undefined) setMonth(patch.month);
            if (patch.year !== undefined) setYear(patch.year);
            setProblem(null);
          }}
        />

        {problem && (
          <p role="alert" className="-mt-4 animate-fade-in text-sm text-alert">
            {problemText[problem]}
          </p>
        )}

        <div>
          <BirthTimeField value={time} onChange={setTime} />
        </div>

        <div>
          {/* Typing again clears the choice, so she has to pick from the list. */}
          <PlaceSearch value={place} initialText={birthPlace} onChange={setPlace} />
        </div>

        {error && (
          <p role="alert" className="animate-fade-in text-sm text-alert">
            {error}
          </p>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={!canSave}
            className="h-11 rounded-full bg-ink px-6 text-[15px] font-medium text-paper transition-opacity duration-200 hover:opacity-90 disabled:opacity-40"
          >
            Save changes
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="h-11 px-3 text-[15px] font-medium text-ink-soft transition-colors duration-200 hover:text-ink"
          >
            Cancel
          </button>
        </div>
      </form>

      {busy && (
        <ChartLoading title="Updating your chart">
          Recalculating your Sun, Moon and Rising from your new birth details.
        </ChartLoading>
      )}

      {confirming && (
        <ConfirmSheet
          title="Update your birth details?"
          confirmLabel="Update my chart"
          onConfirm={recalculate}
          onCancel={() => setConfirming(false)}
        >
          <p>
            We&rsquo;ll recalculate your chart from these details. Your Sun, Moon
            and Rising may change, and your daily focus will follow the new chart.
          </p>
          <p className="mt-3">Your journal entries stay exactly as they are.</p>
        </ConfirmSheet>
      )}
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-0.5 text-[17px] break-words">{value}</dd>
    </div>
  );
}
