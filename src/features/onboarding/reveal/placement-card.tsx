import {
  type Placement,
  placementDescription,
  placementLabel,
  placementTitle,
} from "./placement-content";
import type { Sign } from "../chart/natal-chart";

// Each reveal card has its own illustration, faded behind the writing.
export default function PlacementCard({
  kind,
  sign,
  delay,
}: {
  kind: Placement;
  sign: Sign;
  // Milliseconds to wait before fading in, so the three arrive one after another.
  delay: number;
}) {
  const description = placementDescription(kind, sign);

  return (
    <section
      className="relative isolate overflow-hidden animate-fade-in rounded-card bg-card px-5 py-5 shadow-soft [animation-fill-mode:backwards] motion-reduce:animate-none"
      style={{ animationDelay: `${delay}ms` }}
    >
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <img
            src={`/onboarding-images/${encodeURIComponent(`[ONBOARDING] [REVEAL] ${kind.toUpperCase()}.png`)}`}
            alt=""
            className={`absolute top-0 left-1/4 h-full w-full max-w-none object-cover ${kind === "moon" ? "opacity-90" : "opacity-60"}`}
          />
          <div className={`absolute inset-0 ${kind === "moon" ? "bg-[linear-gradient(to_right,var(--color-card)_10%,rgba(239,230,218,0.8)_30%,rgba(239,230,218,0.15)_60%,rgba(239,230,218,0)_85%)]" : "bg-[linear-gradient(to_right,var(--color-card)_15%,rgba(239,230,218,0.9)_40%,rgba(239,230,218,0.35)_70%,rgba(239,230,218,0)_100%)]"}`} />
        </div>
      <p className="text-xs font-medium tracking-wider text-muted uppercase">{kind}</p>
      <h2 className="mt-2 font-serif text-[30px] leading-tight font-medium">
        {placementTitle(kind, sign)}
      </h2>
      <p className="mt-1 text-[15px] font-medium text-ink-soft">
        {placementLabel[kind]}
      </p>
      {description && (
        <p className="mt-3 text-[15px] leading-snug text-ink-soft">{description}</p>
      )}
    </section>
  );
}
