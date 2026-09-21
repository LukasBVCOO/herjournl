import { Constellation } from "@/features/onboarding";

// Even if the chart is ready at once, the overlay stays long enough to be seen.
// A screen that flashes past would feel like nothing happened.
export const MIN_LOADING_MS = 2000;

// Covers the whole screen while her chart is being worked out again, with the
// same quiet picture as onboarding's "Mapping your chart". Nothing behind it can
// be tapped until it goes.
export default function ChartLoading({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-50 flex animate-fade-in flex-col items-center justify-center bg-paper px-6 pb-16 text-center"
    >
      <Constellation />
      <h2 className="mt-8 font-serif text-[length:clamp(2rem,6.5dvh,2.75rem)] leading-[1.05] font-medium text-balance">
        {title} &#10022;
      </h2>
      <p className="mt-4 max-w-[30ch] text-[17px] text-ink-soft">{children}</p>
    </div>
  );
}
