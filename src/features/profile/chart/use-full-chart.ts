// Runs the full chart calculation for the screen: loading while the library
// works it out (a few milliseconds, but still async — see full-chart.ts),
// ready with the result, or error if her saved birth details don't parse.
// Only called for a full chart (a known birth time) — a reduced chart is
// shown straight from what's already saved, see full-chart-screen.tsx.

import { useEffect, useMemo, useState } from "react";
import { parseBirthTime, type Place } from "@/features/onboarding";
import { calculateFullChart, type FullBirthChart } from "./full-chart";

export type FullChartState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; chart: FullBirthChart };

export function useFullChart(birth: { dateOfBirth: string; birthTime: string; place: Place }): FullChartState {
  const { dateOfBirth, birthTime, place } = birth;

  // Parsing her saved birth details is pure and synchronous, so it happens
  // during render, not inside the effect below — only the library call is
  // actually asynchronous.
  const parsed = useMemo(() => {
    const [year, month, day] = dateOfBirth.split("-").map(Number);
    const time = parseBirthTime(birthTime);
    if (!time || !year || !month || !day) return null;
    return { year, month, day, hour: time.hour, minute: time.minute };
  }, [dateOfBirth, birthTime]);

  const [state, setState] = useState<FullChartState>(parsed ? { status: "loading" } : { status: "error" });

  useEffect(() => {
    // A birth date/time that doesn't parse is reflected in the initial state
    // above already (this hook is only ever given a saved, previously valid
    // profile, so `parsed` isn't expected to change from valid to invalid
    // while mounted) — nothing more to do here in that case.
    if (!parsed) return;

    let current = true;
    calculateFullChart({ ...parsed, latitude: place.latitude, longitude: place.longitude })
      .then((chart) => {
        if (current) setState({ status: "ready", chart });
      })
      .catch(() => {
        if (current) setState({ status: "error" });
      });

    return () => {
      current = false;
    };
  }, [parsed, place.latitude, place.longitude]);

  return state;
}
