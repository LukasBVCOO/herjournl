import { useId, useRef, useState } from "react";
import { SearchIcon } from "../note-icons";

export default function HeaderSearch({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const inputId = useId();

  function close() {
    setOpen(false);
    onChange("");
    trigger.current?.focus();
  }

  return (
    <div className="relative h-11 min-w-0 flex-1">
      <h1
        aria-hidden={open}
        className={`flex h-11 items-center font-serif text-[28px] font-medium transition-opacity duration-200 motion-reduce:transition-none ${open ? "invisible opacity-0" : "opacity-100"}`}
      >
        Becomely
      </h1>
      <div
        className={`absolute inset-y-0 right-0 flex items-center overflow-hidden rounded-full transition-[width,background-color] duration-200 ease-out motion-reduce:transition-none ${open ? "w-full bg-card" : "w-11"}`}
        onKeyDown={(event) => {
          if (open && event.key === "Escape") {
            event.preventDefault();
            close();
          }
        }}
      >
        <button
          ref={trigger}
          type="button"
          aria-label="Search notes"
          aria-expanded={open}
          aria-controls={inputId}
          onClick={() => {
            setOpen(true);
            input.current?.focus();
          }}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink-soft transition-colors duration-200 hover:bg-card hover:text-ink"
        >
          <SearchIcon />
        </button>
        <input
          ref={input}
          id={inputId}
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          tabIndex={open ? 0 : -1}
          aria-hidden={!open}
          aria-label="Search your notes"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          inputMode="search"
          enterKeyHint="search"
          placeholder="Search"
          className="h-11 min-w-0 flex-1 bg-transparent text-[17px] text-ink outline-none placeholder:text-muted"
        />
        {open && (
          <button
            type="button"
            aria-label="Close search"
            onClick={close}
            className="flex h-11 w-11 shrink-0 items-center justify-center text-xl text-ink-soft"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}
