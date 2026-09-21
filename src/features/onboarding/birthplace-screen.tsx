import { useEffect, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router";
import { setAnswers } from "./answers-store";
import { formatPlace, type Place, placeDetail, searchPlaces } from "./places";
import StepFrame from "./step-frame";
import { firstUnanswered } from "./steps";
import { useAnswers } from "./use-answers";

type Status = "idle" | "searching" | "done" | "error";

// Waits for her to pause typing before searching, so a service isn't asked
// after every single letter.
const SEARCH_DELAY_MS = 250;
const MIN_QUERY_LENGTH = 2;

export default function BirthplaceScreen() {
  const navigate = useNavigate();
  const answers = useAnswers();
  const { place } = answers;

  // What is in the box. If she already chose a place and came back, it shows.
  const [text, setText] = useState(() => (place ? formatPlace(place) : ""));
  const [results, setResults] = useState<Place[]>([]);
  const [status, setStatus] = useState<Status>("idle");

  // Only the newest search is allowed to show its results.
  const latestSearch = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const field = useRef<HTMLInputElement>(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const missing = firstUnanswered(answers, 3);
  if (missing) return <Navigate to={missing} replace />;

  function search(query: string) {
    clearTimeout(timer.current);
    const id = ++latestSearch.current;

    if (query.length < MIN_QUERY_LENGTH) {
      setResults([]);
      setStatus("idle");
      return;
    }

    setStatus("searching");
    timer.current = setTimeout(async () => {
      try {
        const found = await searchPlaces(query);
        if (id !== latestSearch.current) return;
        setResults(found);
        setStatus("done");
      } catch {
        if (id !== latestSearch.current) return;
        setStatus("error");
      }
    }, SEARCH_DELAY_MS);
  }

  function onType(value: string) {
    setText(value);
    // Typing again means the earlier choice no longer stands: she has to pick
    // from the list, so the chart is always made from a real, found place.
    setAnswers({ place: null });
    search(value.trim());
  }

  function choose(chosen: Place) {
    clearTimeout(timer.current);
    latestSearch.current++;
    setAnswers({ place: chosen });
    setText(formatPlace(chosen));
    setResults([]);
    setStatus("idle");
    // Puts the keyboard away so the button below is easy to reach.
    field.current?.blur();
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!place) return;
    navigate("/onboarding/mapping");
  }

  return (
    <StepFrame back="/onboarding/birth-time" progress={{ current: 4, total: 4 }}>
      <form onSubmit={submit} className="flex flex-col">
        <h1 className="font-serif text-[length:clamp(2rem,6.5dvh,2.75rem)] leading-[1.05] font-medium text-balance [&_em]:font-normal">
          Where were you <em>born?</em>
        </h1>
        <p className="mt-3 max-w-[30ch] text-[17px] text-ink-soft">
          Your birthplace helps us create your personal birth chart.
        </p>

        <label htmlFor="birthplace" className="sr-only">
          Birthplace
        </label>
        <input
          ref={field}
          id="birthplace"
          type="text"
          value={text}
          onChange={(event) => onType(event.target.value)}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="search"
          autoFocus
          placeholder="Search for your city or town"
          className="mt-10 h-14 w-full border-b border-line bg-transparent font-serif text-[28px] text-ink outline-none transition-colors duration-200 placeholder:text-muted/60 focus:border-ink"
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
                    <span className="text-sm text-ink-soft">
                      {placeDetail(result)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}

        <button
          type="submit"
          disabled={!place}
          className="mt-8 h-[52px] w-full rounded-full bg-ink font-medium text-paper transition-opacity duration-200 hover:opacity-90 disabled:opacity-40"
        >
          Create my chart
        </button>
      </form>
    </StepFrame>
  );
}
