"use client";

import { SearchIcon } from "../note-icons";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

// The search bar at the top of the notes list.
export default function SearchBox({ value, onChange }: Props) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted">
        <SearchIcon />
      </span>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        inputMode="search"
        enterKeyHint="search"
        aria-label="Search your notes"
        placeholder="Search"
        className="h-11 w-full rounded-full bg-card pr-11 pl-11 text-[17px] text-ink outline-none placeholder:text-muted"
      />
      {value !== "" && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => onChange("")}
          className="absolute top-1/2 right-1 flex h-9 w-9 -translate-y-1/2 items-center justify-center text-lg text-ink-soft"
        >
          ×
        </button>
      )}
    </div>
  );
}
