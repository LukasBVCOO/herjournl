// A phone screen is anything narrower than Tailwind's "md" breakpoint (768px),
// the same cut-off install-button.tsx uses to decide whether there is a home
// screen to add anything to. The "Get the Becomely App" cards only ever show
// at this size (founder, 2026-09-29: never on a computer).
export function isPhoneWidth() {
  return window.matchMedia("(max-width: 767px)").matches;
}
