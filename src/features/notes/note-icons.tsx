import { Icon, PackIcon } from "@/components/icons";

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
  return <PackIcon name="pin" />;
}

export function TrashIcon() {
  return <PackIcon name="trash" />;
}
