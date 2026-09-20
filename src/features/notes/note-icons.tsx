import { Icon } from "@/components/icons";

// Icons used by the notes list and the editor menu.
export function SearchIcon() {
  return (
    <Icon>
      <circle cx="11" cy="11" r="6" />
      <path d="M20 20l-4.2-4.2" />
    </Icon>
  );
}

export function MoreIcon() {
  return (
    <Icon>
      <circle cx="5.5" cy="12" r="1" fill="currentColor" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
      <circle cx="18.5" cy="12" r="1" fill="currentColor" />
    </Icon>
  );
}

export function PinIcon() {
  return (
    <Icon>
      <path d="M9 4h6l-1 6 3 3H7l3-3-1-6zM12 13v7" />
    </Icon>
  );
}

export function TrashIcon() {
  return (
    <Icon>
      <path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l.75 12.5h9.5L17.5 7M10 11v5M14 11v5" />
    </Icon>
  );
}
