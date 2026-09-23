// The circular chart wheel — houses, the zodiac ring, every planet placed at
// its real position, and lines between the ones that are angled. Drawn by
// @astrodraw/astrochart (MIT, zero runtime dependencies, pure SVG — the
// actively-maintained continuation of the library DATA-SOURCES.md already
// flagged as the natural pairing for circular-natal-horoscope-js).
//
// Nothing new is calculated here: every number comes straight out of the
// already-computed FullBirthChart. The only translation needed is degree
// WITHIN a sign (what FullPosition stores, 0-30) into absolute degree
// around the whole 360° circle (what the library wants), which is one line.
//
// Loaded only when this tab is actually open (a dynamic import, the same
// pattern natal-chart.ts already uses for circular-natal-horoscope-js), so
// nobody pays for chart-drawing code until she's looking at this page.

import { useEffect, useId, useRef } from "react";
import { SIGNS, type Sign } from "@/features/onboarding";
import { FULL_PLANETS, FULL_POINTS, type FullBirthChart, type FullPlanetName, type FullPointName } from "./full-chart";

// The library's own point-name keys — confirmed from its shipped settings.d.ts
// (SYMBOL_SUN, SYMBOL_NNODE, etc.) — for each of ours.
const PLANET_KEY: Record<FullPlanetName, string> = {
  sun: "Sun",
  moon: "Moon",
  mercury: "Mercury",
  venus: "Venus",
  mars: "Mars",
  jupiter: "Jupiter",
  saturn: "Saturn",
  uranus: "Uranus",
  neptune: "Neptune",
  pluto: "Pluto",
};

const POINT_KEY: Record<FullPointName, string> = {
  northnode: "NNode",
  southnode: "SNode",
  chiron: "Chiron",
  lilith: "Lilith",
};

// Degree within a sign (0-30, what FullPosition stores) -> absolute degree
// around the full 360° circle (what the library wants).
function longitude(sign: Sign, degreeInSign: number): number {
  return SIGNS.indexOf(sign) * 30 + degreeInSign;
}

// A sensible ceiling for a wide phone/tablet — otherwise it fills whatever
// width is actually available (see the measurement below), so it doesn't
// read small on a real phone the way a fixed guess did.
const MAX_SIZE = 420;

export default function ChartWheel({ chart }: { chart: FullBirthChart }) {
  // A DOM id the library draws into by document.getElementById — useId's
  // colons aren't valid there, so they're stripped.
  const id = `chart-wheel-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    // Measured once the wrapper (a full-width block) is actually laid out,
    // so the wheel is drawn at real available width rather than a guess —
    // an SVG this library draws isn't responsive after the fact, so this is
    // the one chance to size it right.
    const size = Math.min(wrapperRef.current?.clientWidth || MAX_SIZE, MAX_SIZE);

    // Named import, not `default` — the library ships as a UMD bundle, and
    // its default-export interop is unreliable through a dynamic import
    // (comes through as the whole module object, not the class, in this
    // build setup). The named `Chart` export points at the same class and
    // isn't affected by that.
    import("@astrodraw/astrochart").then(({ Chart: AstroChart }) => {
      if (cancelled || !containerRef.current) return;
      // Redraw from scratch each time rather than trying to update in place —
      // the library owns everything under this element once it's drawn.
      containerRef.current.innerHTML = "";

      const planets: Record<string, number[]> = {};
      for (const name of FULL_PLANETS) {
        const p = chart.planets[name];
        planets[PLANET_KEY[name]] = [longitude(p.sign, p.degree)];
      }
      for (const name of FULL_POINTS) {
        const p = chart.points[name];
        planets[POINT_KEY[name]] = [longitude(p.sign, p.degree)];
      }

      const cusps = Array.from({ length: 12 }, (_, i) => {
        const cusp = chart.houseCusps[String(i + 1)];
        return longitude(cusp.sign, cusp.degree);
      });

      const wheel = new AstroChart(id, size, size, {
        // The app's own muted palette (styles.css's --color tokens), not the
        // library's default rainbow zodiac colours — restrained, not
        // mystical-kitsch, per the app's own aesthetic rules.
        COLOR_BACKGROUND: "transparent",
        POINTS_COLOR: "#3a3531", // --color-ink
        SIGNS_COLOR: "#8a8178", // --color-muted
        CIRCLE_COLOR: "#e2d7c8", // --color-line
        LINE_COLOR: "#e2d7c8",
        CUSPS_STROKE: 1,
        CUSPS_FONT_COLOR: "#8a8178",
        SYMBOL_AXIS_FONT_COLOR: "#3a3531",
        COLORS_SIGNS: Array(12).fill("#c4a69b"), // --color-accent, one tone for all 12
        STROKE_ONLY: true,
      });
      wheel.radix({ planets, cusps });
    });

    return () => {
      cancelled = true;
    };
  }, [id, chart]);

  return (
    <div ref={wrapperRef} className="w-full">
      <div className="flex justify-center">
        <div id={id} ref={containerRef} />
      </div>
    </div>
  );
}
