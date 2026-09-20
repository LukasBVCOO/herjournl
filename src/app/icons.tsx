// Thin line icons, one stroke weight everywhere.
function Icon({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
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

export function PlusIcon() {
  return (
    <Icon>
      <path d="M12 5v14M5 12h14" />
    </Icon>
  );
}

export function BackIcon() {
  return (
    <Icon>
      <path d="M15 5l-7 7 7 7" />
    </Icon>
  );
}

export function SettingsIcon() {
  return (
    <Icon>
      <path d="M4 8h9M17 8h3M4 16h3M11 16h9" />
      <circle cx="15" cy="8" r="2" />
      <circle cx="9" cy="16" r="2" />
    </Icon>
  );
}

export function HeadingIcon() {
  return (
    <Icon>
      <path d="M6 5v14M18 5v14M6 12h12" />
    </Icon>
  );
}

export function BoldIcon() {
  return (
    <Icon>
      <path d="M8 5h5a3.5 3.5 0 0 1 0 7H8zM8 12h6a3.5 3.5 0 0 1 0 7H8z" />
    </Icon>
  );
}

export function BulletListIcon() {
  return (
    <Icon>
      <path d="M10 7h10M10 12h10M10 17h10" />
      <circle cx="5" cy="7" r="0.75" fill="currentColor" />
      <circle cx="5" cy="12" r="0.75" fill="currentColor" />
      <circle cx="5" cy="17" r="0.75" fill="currentColor" />
    </Icon>
  );
}

export function NumberedListIcon() {
  return (
    <Icon>
      <path d="M11 7h9M11 12h9M11 17h9" />
      <path d="M4 6l1.5-1v4M4 12.5c0-1 2.5-1 2.5 0S4 14.5 4 15.5h2.5M4 17.5h2.5l-1 1.25a1 1 0 1 1-1 1.25" />
    </Icon>
  );
}

export function TickBoxIcon() {
  return (
    <Icon>
      <rect x="4" y="4" width="16" height="16" rx="4" />
      <path d="M8.5 12.5l2.5 2.5 4.5-5" />
    </Icon>
  );
}
