import type { HouseVisual } from "./content/house-visuals";

// A house's icon, tinted with its own colour on its own soft background
// (see content/house-visuals.ts). Same CSS-mask technique the shared icon
// pack already uses (@/components/icons's PackIcon) — it only cares about an
// SVG's shape, not its own colouring, so it works on any plain outline icon —
// just pointed at public/houses-icons/ instead, since this set is scoped to
// the twelve houses rather than shared app-wide.
//
// When there's no per-house icon at all (MOON_FALLBACK_VISUAL), the app's
// own sparkle mark stands in for it instead of an SVG.
export default function HouseIcon({
  visual,
  className,
}: {
  visual: HouseVisual;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`flex items-center justify-center rounded-[12px] ${className ?? ""}`}
      style={{ backgroundColor: visual.background }}
    >
      {visual.icon ? (
        <span
          className="h-[55%] w-[55%]"
          style={{
            backgroundColor: visual.color,
            mask: `url("/houses-icons/${visual.icon}") center / contain no-repeat`,
            WebkitMask: `url("/houses-icons/${visual.icon}") center / contain no-repeat`,
          }}
        />
      ) : (
        <span className="text-[30px] leading-none" style={{ color: visual.color }}>
          ✦
        </span>
      )}
    </div>
  );
}
