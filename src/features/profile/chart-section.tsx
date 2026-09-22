import { useState } from "react";
import {
  calculateChart,
  calculateReducedChart,
  parseBirthTime,
  placementDescription,
  placementLabel,
  placementTitle,
  type Chart,
  type Place,
  type ReducedChart,
} from "@/features/onboarding";
import ChartLoading, { MIN_LOADING_MS } from "./chart-loading";
import { updateProfile } from "./profile-api";

const cardClass = "rounded-card bg-card px-5 py-4 shadow-soft";

const FULL_KINDS = ["sun", "moon", "rising"] as const;
const REDUCED_KINDS = ["sun", "moon"] as const;

// Her Sun, Moon and Rising, worded the same way as the onboarding reveal — or,
// without a real birth time, whichever of her Sun and Moon are reliably known
// (see readSavedNatalChart), never a guessed Rising sign. If a profile was
// saved before charts were kept, it offers to make one from the birth details
// already saved.
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

  const showReliable =
    chart?.kind === "reduced" ? REDUCED_KINDS.filter((kind) => chart[kind].reliable) : null;

  return (
    <section className={cardClass}>
      <h2 className="text-xs font-medium tracking-wider text-muted uppercase">
        Your chart
      </h2>

      {chart?.kind === "full" ? (
        <ul className="mt-3 flex flex-col gap-5">
          {FULL_KINDS.map((kind) => {
            const sign = chart[kind].sign;
            const description = placementDescription(kind, sign);
            return (
              <li key={kind}>
                <p className="font-serif text-[24px] leading-tight font-medium">
                  {placementTitle(kind, sign)}
                </p>
                <p className="mt-0.5 text-[15px] font-medium text-ink-soft">
                  {placementLabel[kind]}
                </p>
                {description && (
                  <p className="mt-1 text-[15px] leading-snug text-ink-soft">
                    {description}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      ) : chart?.kind === "reduced" ? (
        <div className="mt-2">
          {showReliable && showReliable.length > 0 && (
            <ul className="flex flex-col gap-5">
              {showReliable.map((kind) => {
                const sign = chart[kind].sign;
                const description = placementDescription(kind, sign);
                return (
                  <li key={kind}>
                    <p className="font-serif text-[24px] leading-tight font-medium">
                      {placementTitle(kind, sign)}
                    </p>
                    <p className="mt-0.5 text-[15px] font-medium text-ink-soft">
                      {placementLabel[kind]}
                    </p>
                    {description && (
                      <p className="mt-1 text-[15px] leading-snug text-ink-soft">
                        {description}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
          <p className="mt-3 text-[15px] text-ink-soft">
            Add your birth time above to include your Rising sign and more
            personalised daily focus.
          </p>
        </div>
      ) : (
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
      )}

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
