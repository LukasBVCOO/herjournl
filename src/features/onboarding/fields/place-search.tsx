import { useEffect, useId, useRef, useState } from "react";
import { formatPlace, type Place, placeDetail, searchPlaces } from "../places/places";

type Status = "idle" | "searching" | "done" | "error";

// Waits for her to pause typing before searching, so the database isn't asked
// after every single letter.
const SEARCH_DELAY_MS = 250;
const MIN_QUERY_LENGTH = 2;

// The birthplace search box with its suggestions. She types, matching places
// appear, and she has to pick one, so a chart is always made from a real place.
// Used by the onboarding birthplace question and by the Profile screen.
export default function PlaceSearch({
  value,
  initialText,
  onChange,
  autoFocus = false,
}: {
  // The place she has chosen, or null while she hasn't chosen one.
  value: Place | null;
  // What the box shows to begin with. Defaults to the chosen place's name.
  initialText?: string;
  // Called with the place she picks, and with null as soon as she types again,
  // because a changed search no longer stands for the earlier choice.
  onChange: (place: Place | null) => void;
  autoFocus?: boolean;
}) {
  const id = useId();
  const [text, setText] = useState(
    () => initialText ?? (value ? formatPlace(value) : ""),
  );
  const [results, setResults] = useState<Place[]>([]);
  const [status, setStatus] = useState<Status>("idle");

  // Only the newest search is allowed to show its results.
  const latestSearch = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const field = useRef<HTMLInputElement>(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  function search(query: string) {
    clearTimeout(timer.current);
    const searchId = ++latestSearch.current;

    if (query.length < MIN_QUERY_LENGTH) {
      setResults([]);
      setStatus("idle");
      return;
    }

    setStatus("searching");
    timer.current = setTimeout(async () => {
      try {
        const found = await searchPlaces(query);
        if (searchId !== latestSearch.current) return;
        setResults(found);
        setStatus("done");
      } catch {
        if (searchId !== latestSearch.current) return;
        setStatus("error");
      }
    }, SEARCH_DELAY_MS);
  }

  function onType(next: string) {
    setText(next);
    onChange(null);
    search(next.trim());
  }

  function choose(chosen: Place) {
    clearTimeout(timer.current);
    latestSearch.current++;
    onChange(chosen);
    setText(formatPlace(chosen));
    setResults([]);
    setStatus("idle");
    // Puts the keyboard away so whatever is below is easy to reach.
    field.current?.blur();
  }

  return (
    <>
      <label htmlFor={id} className="sr-only">
        Birthplace
      </label>
      <input
        ref={field}
        id={id}
        type="text"
        value={text}
        onChange={(event) => onType(event.target.value)}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        enterKeyHint="search"
        autoFocus={autoFocus}
        placeholder="Search for your city or town"
        className="h-14 w-full border-b border-line bg-transparent font-serif text-[28px] text-ink outline-none transition-colors duration-200 placeholder:text-muted/60 focus:border-ink"
      />

      {status === "searching" && (
        <p role="status" className="mt-4 animate-fade-in text-sm text-muted">
          Searching&hellip;
        </p>
      )}

      {status === "done" && results.length === 0 && (
        <p role="status" className="mt-4 animate-fade-in text-sm text-ink-soft">
          We couldn&rsquo;t find that place. Try searching for the nearest city
          or town.
        </p>
      )}

      {status === "error" && (
        <p role="alert" className="mt-4 animate-fade-in text-sm text-alert">
          We couldn&rsquo;t find your birthplace right now.{" "}
          <button
            type="button"
            onClick={() => search(text.trim())}
            className="font-medium underline underline-offset-4"
          >
            Try again
          </button>
        </p>
      )}

      {status === "done" && results.length > 0 && (
        <>
          <p role="status" className="sr-only">
            {results.length} {results.length === 1 ? "place" : "places"} found
          </p>
          <ul className="mt-2 flex animate-fade-in flex-col divide-y divide-line">
            {results.map((result) => (
              <li key={result.id}>
                <button
                  type="button"
                  onClick={() => choose(result)}
                  className="flex w-full flex-col items-start py-3 text-left transition-opacity duration-200 active:opacity-70"
                >
                  <span className="font-serif text-[22px] leading-tight font-medium">
                    {result.city}
                  </span>
                  <span className="text-sm text-ink-soft">{placeDetail(result)}</span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}
