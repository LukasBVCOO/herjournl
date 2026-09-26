import { SparkleIcon } from "./prompt-icons";

// The second card under today's focus: the thought to reflect on before she
// answers the questions. Its own card rather than a line inside the first, so
// it carries real weight, with the same warm shine that sweeps across the
// daily cards on her notes list (--animate-card-shine in styles.css). A small
// gold sparkle sits beside the heading, and the thought lines up under the
// heading, not under the sparkle. Always the same warm blush, whatever the
// area of life: tinting it with the area's own colour turned the cooler ones
// (like Career's taupe) a flat grey.
export default function ReflectionCard({ text }: { text: string }) {
  return (
    <section
      aria-labelledby="reflection-card-title"
      className="relative grid grid-cols-[auto_1fr] gap-x-3 overflow-hidden rounded-card bg-blush px-5 py-5 shadow-soft"
    >
      <span className="mt-1 text-gold">
        <SparkleIcon size={20} />
      </span>
      <h3 id="reflection-card-title" className="font-serif text-[24px] leading-tight font-medium text-ink">
        A thought to reflect on
      </h3>
      <p className="col-start-2 mt-2 text-[15px] leading-relaxed text-ink-soft">{text}</p>

      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-y-0 left-0 w-2/3 -skew-x-12 animate-card-shine bg-[linear-gradient(115deg,transparent_30%,rgba(255,250,240,0.55)_50%,transparent_70%)] motion-reduce:hidden" />
      </div>
    </section>
  );
}
