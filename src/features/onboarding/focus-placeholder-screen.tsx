import { Navigate, useNavigate } from "react-router";
import { ALL_QUESTIONS, firstUnanswered } from "./steps";
import { useAnswers } from "./use-answers";

// A stand-in for the first Daily Focus card, with example words rather than
// anything worked out from her chart. It is where onboarding ends: reaching it
// means onboarding is complete. The real card, built from her chart and the
// day's sky, replaces this later.
export default function FocusPlaceholderScreen() {
  const navigate = useNavigate();
  const answers = useAnswers();

  const missing = firstUnanswered(answers, ALL_QUESTIONS);
  if (missing) return <Navigate to={missing} replace />;
  if (!answers.chart) return <Navigate to="/onboarding/mapping" replace />;

  return (
    <main className="flex flex-1 animate-fade-in flex-col">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-6">
        <p className="pt-[max(1.25rem,env(safe-area-inset-top))] font-serif text-2xl font-medium">
          Becomely
        </p>

        <div className="flex flex-1 flex-col justify-center pb-16">
          <section className="rounded-card bg-card px-6 py-6 shadow-soft">
            <p className="text-xs font-medium tracking-wider text-muted uppercase">
              Today&rsquo;s focus
            </p>
            <h1 className="mt-2 font-serif text-[34px] leading-tight font-medium">
              Your direction
            </h1>
            <p className="mt-3 text-[17px] leading-snug text-ink-soft">
              Today brings more attention to where you&rsquo;re going and what you
              want to build next.
            </p>

            <p className="mt-6 font-serif text-[22px] leading-snug">
              What would make today feel like real progress?
            </p>
            {/* Opens a new note, so the first thing she does is write. */}
            <button
              type="button"
              onClick={() => navigate("/notes/new", { replace: true })}
              className="mt-4 flex h-14 w-full items-center rounded-full bg-surface px-5 text-left text-[17px] text-muted transition-opacity duration-200 active:opacity-80"
            >
              Start writing&hellip;
            </button>
          </section>

          {/* Temporary: remove when the real card replaces this. */}
          <p className="mt-4 text-center text-xs text-muted">
            Example focus: the real card comes from your chart later.
          </p>
        </div>
      </div>
    </main>
  );
}
