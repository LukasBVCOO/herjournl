// The small drawn marks beside the daily card's reflection and its three
// questions: a sparkle for the thought to reflect on, a sprout for her
// intention (something she's growing), an open book for a belief to explore,
// a rising sun for her next step. Same thin, rounded outline as the app's
// icon pack (Tabler), drawn in whatever colour the text around them is.

function Outline({ size, children }: { size: number; children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function SproutIcon({ size = 28 }: { size?: number }) {
  return (
    <Outline size={size}>
      <path d="M12 10a6 6 0 0 0 -6 -6h-3v2a6 6 0 0 0 6 6h3" />
      <path d="M12 14a6 6 0 0 1 6 -6h3v1a6 6 0 0 1 -6 6h-3" />
      <path d="M12 20v-10" />
    </Outline>
  );
}

export function OpenBookIcon({ size = 28 }: { size?: number }) {
  return (
    <Outline size={size}>
      <path d="M3 19a9 9 0 0 1 9 0a9 9 0 0 1 9 0" />
      <path d="M3 6a9 9 0 0 1 9 0a9 9 0 0 1 9 0" />
      <path d="M3 6v13" />
      <path d="M12 6v13" />
      <path d="M21 6v13" />
    </Outline>
  );
}

export function RisingSunIcon({ size = 28 }: { size?: number }) {
  return (
    <Outline size={size}>
      <path d="M8 16a4 4 0 0 1 8 0" />
      <path d="M3 16h18" />
      <path d="M12 5v2" />
      <path d="M5.6 8.6l1.4 1.4" />
      <path d="M18.4 8.6l-1.4 1.4" />
      <path d="M3 13h1.5" />
      <path d="M19.5 13h1.5" />
    </Outline>
  );
}

// Filled rather than outlined: a small four-point star, the same shape as the
// "✦" the app's copy already uses, drawn so it matches the icons beside it.
export function SparkleIcon({ size = 22 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
      <path d="M12 2c.7 5.6 3.4 8.3 10 10c-6.6 1.7 -9.3 4.4 -10 10c-.7 -5.6 -3.4 -8.3 -10 -10c6.6 -1.7 9.3 -4.4 10 -10z" />
    </svg>
  );
}
