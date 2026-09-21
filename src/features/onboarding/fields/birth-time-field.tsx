import { useId } from "react";

// The birth time box. It is the phone's own time picker: it already shows
// 12-hour or 24-hour the way she has her phone set, and hands back one
// consistent value ("16:00"). Used by the onboarding birth time question and by
// the Profile screen.
export default function BirthTimeField({
  value,
  onChange,
  autoFocus = false,
}: {
  value: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
}) {
  const id = useId();

  return (
    <>
      <label htmlFor={id} className="sr-only">
        Time of birth
      </label>
      <input
        id={id}
        type="time"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoFocus={autoFocus}
        className="h-14 w-full border-b border-line bg-transparent font-serif text-[28px] text-ink [color-scheme:light] outline-none transition-colors duration-200 focus:border-ink"
      />
    </>
  );
}
