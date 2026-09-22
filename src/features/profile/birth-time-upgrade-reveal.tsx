import {
  placementDescription,
  placementLabel,
  placementTitle,
  type Chart,
} from "@/features/onboarding";

const KINDS = ["sun", "moon", "rising"] as const;

// Shown once, right after she adds a real birth time to a profile that didn't
// have one before — the second personalisation moment (the first is onboarding's
// own reveal), now that Rising and houses are unlocked. Shows all three
// placements, not just the new one: Sun and Moon may have shown as reduced
// placements before, but this is the first time she sees them as part of a
// complete chart. Same darkened, centered popup style used elsewhere in the
// app (install-offer-prompt.tsx, notification-offer-prompt.tsx).
export default function BirthTimeUpgradeReveal({
  chart,
  onClose,
}: {
  chart: Chart;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
      <button
        type="button"
        aria-label="Close"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 animate-fade-in bg-ink/30"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="birth-time-upgrade-title"
        className="relative w-full max-w-sm animate-fade-in rounded-card bg-surface px-6 py-7 shadow-soft"
      >
        <h2
          id="birth-time-upgrade-title"
          className="font-serif text-[26px] leading-tight font-medium"
        >
          Your chart just got more personal <span className="text-accent">✦</span>
        </h2>

        <ul className="mt-4 flex flex-col gap-4 rounded-card bg-card px-4 py-4">
          {KINDS.map((kind) => {
            const sign = chart[kind].sign;
            const description = placementDescription(kind, sign);
            return (
              <li key={kind}>
                <p className="font-serif text-[22px] leading-tight font-medium">
                  {placementTitle(kind, sign)}
                </p>
                <p className="mt-0.5 text-[14px] font-medium text-ink-soft">
                  {placementLabel[kind]}
                </p>
                {description && (
                  <p className="mt-1 text-[14px] leading-snug text-ink-soft">
                    {description}
                  </p>
                )}
              </li>
            );
          })}
        </ul>

        <p className="mt-5 text-[15px] text-ink-soft">
          Your future Daily Focus Cards can now include the areas of life your
          current astrology is activating.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 h-[52px] w-full rounded-full bg-ink font-medium text-paper transition-opacity duration-200 hover:opacity-90"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
