import { useState } from "react";
import {
  calculateChart,
  calculateReducedChart,
  parseBirthTime,
  type Chart,
  type Place,
  type ReducedChart,
} from "@/features/onboarding";
import ChartLoading, { MIN_LOADING_MS } from "./chart-loading";
import { updateProfile } from "./profile-api";

const cardClass = "rounded-card bg-card px-5 py-4 shadow-soft";

// Creates her chart (a real birth time) or works out what a reduced one can
// tell her (see readSavedNatalChart) when it doesn't exist yet — this is a
// save-to-database action daily-focus depends on, so it stays here. Once a
// chart exists there's nothing left for this card to do: the actual reveal
// (chart/full-chart-screen.tsx) is reached from "Your birth chart" in the ☰
// menu, so this section simply isn't shown any more once she has one.
export default function ChartSection({
  chart,
  birthTimeKnown,
  dateOfBirth,
  birthTime,
  place,
  onSaved,
}: {
  chart: Chart | ReducedChart | null;
  birthTimeKnown: boolean;
  dateOfBirth: string;
  // "" when birthTimeKnown is false.
  birthTime: string;
  place: Place;
  onSaved: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Nothing to do here once she has a chart — see this file's own top comment.
  if (chart) return null;

  async function createChart() {
    const [year, month, day] = dateOfBirth.split("-").map(Number);
    setBusy(true);
    setError(null);
    // The loading screen stays long enough to be seen, even when the chart is
    // ready straight away.
    const shownLongEnough = new Promise((resolve) =>
      setTimeout(resolve, MIN_LOADING_MS),
    );
    try {
      let made: Chart | ReducedChart;
      if (birthTimeKnown) {
        const time = parseBirthTime(birthTime);
        if (!time) throw new Error("Missing birth time");
        [made] = await Promise.all([
          calculateChart({
            year,
            month,
            day,
            hour: time.hour,
            minute: time.minute,
            latitude: place.latitude,
            longitude: place.longitude,
          }),
          shownLongEnough,
        ]);
      } else {
        [made] = await Promise.all([
          calculateReducedChart({ year, month, day, latitude: place.latitude, longitude: place.longitude }),
          shownLongEnough,
        ]);
      }
      // Only the chart is saved: her details stay exactly as they were.
      const ok = await updateProfile({ chart: made });
      if (!ok) throw new Error("Not saved");
      await onSaved();
    } catch {
      setError("We couldn’t create your chart right now. Please try again.");
    }
    setBusy(false);
  }

  return (
    <section className={cardClass}>
      <h2 className="text-xs font-medium tracking-wider text-muted uppercase">
        Your chart
      </h2>

      <div className="mt-2">
        <p className="text-[15px] text-ink-soft">
          Your chart hasn&rsquo;t been created yet.
        </p>
        {error && (
          <p role="alert" className="mt-3 animate-fade-in text-sm text-alert">
            {error}
          </p>
        )}
        <button
          type="button"
          onClick={createChart}
          disabled={busy}
          className="mt-4 h-11 rounded-full bg-ink px-6 text-[15px] font-medium text-paper transition-opacity duration-200 hover:opacity-90"
        >
          Create my chart
        </button>
      </div>

      {busy && (
        <ChartLoading title="Creating your chart">
          {birthTimeKnown
            ? "Working out your Sun, Moon and Rising from your birth details."
            : "Working out what we can from your birth date and place."}
        </ChartLoading>
      )}
    </section>
  );
}
