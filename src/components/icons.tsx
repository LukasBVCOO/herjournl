// Local icon-pack assets use a mask so they inherit the button's text color.
// `size` is a pixel side length; a plain h-6/w-6 class isn't used for it so
// that a caller overriding the size (the bottom nav's bigger icons) doesn't
// depend on which of two conflicting Tailwind classes happens to win.
export function PackIcon({ name, size = 24 }: {
  name:
    | "plus"
    | "arrow-left"
    | "arrow-right"
    | "user-profile"
    | "menu-2"
    | "settings"
    | "trash"
    | "pin"
    | "list"
    | "list-check"
    | "sticker-2"
    | "home"
    | "moon-stars"
    | "photo"
    | "layout-dashboard"
    | "crown";
  size?: number;
}) {
  return (
    <span
      aria-hidden="true"
      className="inline-block shrink-0 bg-current"
      style={{
        width: size,
        height: size,
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

export function PlusIcon({ size }: { size?: number } = {}) {
  return <PackIcon name="plus" size={size} />;
}

export function BackIcon() {
  return <PackIcon name="arrow-left" />;
}

export function ProfileIcon({ size }: { size?: number } = {}) {
  return <PackIcon name="user-profile" size={size} />;
}

export function MenuIcon() {
  return <PackIcon name="menu-2" />;
}

export function SettingsIcon({ size }: { size?: number } = {}) {
  return <PackIcon name="settings" size={size} />;
}

export function ListIcon() {
  return <PackIcon name="list" />;
}

export function ListCheckIcon() {
  return <PackIcon name="list-check" />;
}

export function StickerIcon() {
  return <PackIcon name="sticker-2" />;
}

export function HomeIcon({ size }: { size?: number } = {}) {
  return <PackIcon name="home" size={size} />;
}

export function MoonStarsIcon({ size }: { size?: number } = {}) {
  return <PackIcon name="moon-stars" size={size} />;
}

export function PhotoIcon({ size }: { size?: number } = {}) {
  return <PackIcon name="photo" size={size} />;
}

export function LayoutDashboardIcon({ size }: { size?: number } = {}) {
  return <PackIcon name="layout-dashboard" size={size} />;
}

export function CrownIcon({ size }: { size?: number } = {}) {
  return <PackIcon name="crown" size={size} />;
}
