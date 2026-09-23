// Local icon-pack assets use a mask so they inherit the button's text color.
export function PackIcon({ name }: {
  name: "plus" | "arrow-left" | "arrow-right" | "user-profile" | "menu-2" | "settings" | "trash" | "pin";
}) {
  return (
    <span
      aria-hidden="true"
      className="inline-block h-6 w-6 shrink-0 bg-current"
      style={{
        mask: `url("/Iconspack/${name}.svg") center / contain no-repeat`,
        WebkitMask: `url("/Iconspack/${name}.svg") center / contain no-repeat`,
      }}
    />
  );
}

// Icons without a matching asset in the pack still use the shared SVG frame.
export function Icon({ children }: { children: React.ReactNode }) {
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
  return <PackIcon name="plus" />;
}

export function BackIcon() {
  return <PackIcon name="arrow-left" />;
}

export function ProfileIcon() {
  return <PackIcon name="user-profile" />;
}

export function MenuIcon() {
  return <PackIcon name="menu-2" />;
}

export function SettingsIcon() {
  return <PackIcon name="settings" />;
}
