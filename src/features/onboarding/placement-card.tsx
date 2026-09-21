import {
  type Placement,
  placementDescription,
  placementLabel,
  placementTitle,
} from "./placement-content";
import type { Sign } from "./sun-sign";

// One of the three big cards on the reveal. There is room above the title for an
// icon; the word "Sun", "Moon" or "Rising" stands in for it until those exist.
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
      className="animate-fade-in rounded-card bg-card px-5 py-5 shadow-soft [animation-fill-mode:backwards] motion-reduce:animate-none"
      style={{ animationDelay: `${delay}ms` }}
    >
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
