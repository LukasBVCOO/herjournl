import { useEffect, useState } from "react";
import { Navigate } from "react-router";
import { getAnswers, setChart } from "./answers-store";
import { createChart } from "./chart";
import Constellation from "./constellation";
import { ALL_QUESTIONS, firstUnanswered } from "./steps";
import { useAnswers } from "./use-answers";

// Even if the chart is ready at once, the screen stays long enough to be seen.
// A screen that flashes past would feel like nothing happened.
const MIN_SHOWN_MS = 2600;

// "Mapping your chart": makes her chart, then moves on to the reveal by itself.
export default function MappingScreen() {
  const answers = useAnswers();
  const [failed, setFailed] = useState(false);
  // Goes up by one each "Try again", which is what starts another go.
  const [attempt, setAttempt] = useState(0);

  const missing = firstUnanswered(answers, ALL_QUESTIONS);
  const needsChart = missing === null && answers.chart === null;

  useEffect(() => {
    if (!needsChart) return;

    let current = true;
    const shownLongEnough = new Promise((resolve) =>
      setTimeout(resolve, MIN_SHOWN_MS),
    );
    Promise.all([createChart(getAnswers()), shownLongEnough])
      .then(([chart]) => {
        if (current) setChart(chart);
      })
      .catch(() => {
        if (current) setFailed(true);
      });

    return () => {
      current = false;
    };
  }, [needsChart, attempt]);

  if (missing) return <Navigate to={missing} replace />;
  if (answers.chart) return <Navigate to="/onboarding/reveal" replace />;

  function tryAgain() {
    setFailed(false);
    setAttempt((count) => count + 1);
  }

  return (
    <main className="flex flex-1 animate-fade-in flex-col items-center justify-center px-6 pb-16 text-center">
      {failed ? (
        <>
          <h1 className="max-w-[16ch] font-serif text-[length:clamp(2rem,6.5dvh,2.75rem)] leading-[1.05] font-medium text-balance">
            We couldn&rsquo;t create your chart just yet.
          </h1>
          <p role="alert" className="mt-4 max-w-[30ch] text-[17px] text-ink-soft">
            Your details are still here.
          </p>
          <button
            type="button"
            onClick={tryAgain}
            className="mt-8 h-[52px] w-full max-w-xs rounded-full bg-ink font-medium text-paper transition-opacity duration-200 hover:opacity-90"
          >
            Try again
          </button>
        </>
      ) : (
        <>
          <Constellation />
          <h1 className="mt-8 font-serif text-[length:clamp(2rem,6.5dvh,2.75rem)] leading-[1.05] font-medium text-balance">
            Mapping your chart &#10022;
          </h1>
          <p role="status" className="mt-4 max-w-[30ch] text-[17px] text-ink-soft">
            Finding your Sun, Moon, Rising and the areas of life that are uniquely
            yours.
          </p>
        </>
      )}
    </main>
  );
}
