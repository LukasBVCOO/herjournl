// The small four-pointed sparkle Becomely+ uses to mark each thing it brings
// (the paywall's list). Drawn rather than typed as ✦, so it has the same
// shape and weight on every phone and font.
export default function SparkleMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className={className} fill="currentColor">
      <path d="M8 0c.6 4.6 3.4 7.4 8 8-4.6.6-7.4 3.4-8 8-.6-4.6-3.4-7.4-8-8 4.6-.6 7.4-3.4 8-8Z" />
    </svg>
  );
}
