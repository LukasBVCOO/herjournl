import { useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router";
import { BackIcon } from "@/components/icons";
import { findNoteIdByTitle, startNoteFromAnswers, useNotes } from "@/features/notes";
import { posthog } from "@/lib/posthog";
import { useGoBack } from "@/lib/use-go-back";
import { WEEK_QUESTIONS, type WeekQuestion, type WeekQuestionId } from "./content/week-questions";
import { clearWeekDraft, readWeekDraft, saveWeekDraft } from "./week-draft";
import { reflectionTitle, resolveWeek, weekLabel } from "./week";

// One question on a white card of its own, the same look as the daily card's
// questions: label (with "Optional" when it is), the question, a hairline,
// then a soft writing box. The one she has to answer is outlined in gold.
function WeekField({
  question,
  value,
  onChange,
}: {
  question: WeekQuestion;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className={`rounded-card bg-surface px-5 pt-5 pb-5 shadow-soft ${question.required ? "border border-gold/60" : ""}`}>
      <p className="text-xs font-medium tracking-[0.14em] text-ink-soft uppercase">
        {question.label}
        {!question.required && <span className="tracking-normal text-muted normal-case"> · Optional</span>}
      </p>
      <p className="mt-2 font-serif text-[21px] leading-snug font-medium text-ink">{question.question}</p>
      <div aria-hidden="true" className="mt-5 border-t border-line" />
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Start writing…"
        aria-label={question.label}
        rows={3}
        className="field-sizing-content mt-5 block min-h-28 w-full resize-none rounded-2xl bg-paper px-5 py-4 text-[17px] leading-relaxed text-ink placeholder:text-muted focus:outline-2 focus:outline-offset-2 focus:outline-gold/50"
      />
    </div>
  );
}

// Reflecting on a week, at /week/reflect (this week) or /week/<monday>/reflect,
// reached from the button at the bottom of the recap. "Done" saves her
// answers as a note titled "My week · …" and opens it. A week that already
// has its reflection note goes straight to that note instead.
export default function WeekReflectScreen() {
  const { start } = useParams();
  const week = resolveWeek(start);
  const notes = useNotes();

  if (!week) return <Navigate to="/week" replace />;
  if (!notes.ready) return null;
  const existing = findNoteIdByTitle(reflectionTitle(week.monday));
  if (existing) return <Navigate to={`/notes/${existing}`} replace />;
  return <Reflect key={week.monday} monday={week.monday} />;
}

function Reflect({ monday }: { monday: string }) {
  const goBack = useGoBack();
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<Record<WeekQuestionId, string>>(() => ({
    lookingBack: readWeekDraft(monday, "lookingBack"),
    belief: readWeekDraft(monday, "belief"),
    nextWeek: readWeekDraft(monday, "nextWeek"),
  }));
  const [finished, setFinished] = useState(false);
  const ready = WEEK_QUESTIONS.every((question) => !question.required || answers[question.id].trim() !== "");

  function change(id: WeekQuestionId, value: string) {
    setAnswers((current) => ({ ...current, [id]: value }));
    saveWeekDraft(monday, id, value);
  }

  function done() {
    if (finished || !ready) return;
    const id = startNoteFromAnswers(
      reflectionTitle(monday),
      WEEK_QUESTIONS.map((question) => ({ question: question.question, answer: answers[question.id] })),
    );
    if (!id) return;
    setFinished(true);
    clearWeekDraft(monday);
    posthog?.capture("weekly_reflection_completed");
    // The week is closed, so "back" from the note goes home: this screen is
    // swapped for the notes list, and the note opens on top of it.
    navigate("/", { replace: true });
    navigate(`/notes/${id}`);
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 animate-fade-in flex-col px-6 pb-12">
      <header className="grid grid-cols-[44px_1fr_44px] items-center pt-[max(1.25rem,env(safe-area-inset-top))] pb-5">
        <button
          type="button"
          onClick={goBack}
          aria-label="Back"
          className="-ml-3 flex h-11 w-11 items-center justify-center text-ink-soft transition-colors duration-200 hover:text-ink"
        >
          <BackIcon />
        </button>
        <p className="text-center text-xs font-medium tracking-wider text-muted uppercase">{weekLabel(monday)}</p>
      </header>

      <div className="mb-6 text-center">
        <h1 className="font-serif text-[30px] leading-tight font-medium">
          Reflect on your week <span className="text-accent">✦</span>
        </h1>
        <p className="mt-2 text-[15px] leading-snug text-ink-soft">
          Look at who showed up this week, and choose who you&rsquo;re becoming next.
        </p>
      </div>

      <section className="space-y-5">
        {WEEK_QUESTIONS.map((question) => (
          <WeekField
            key={question.id}
            question={question}
            value={answers[question.id]}
            onChange={(value) => change(question.id, value)}
          />
        ))}
        <button
          type="button"
          onClick={done}
          disabled={finished || !ready}
          className="flex h-14 w-full items-center justify-center rounded-full bg-accent-ink/80 text-[17px] font-medium text-paper shadow-soft transition-opacity duration-200 hover:opacity-90 active:opacity-80 disabled:opacity-45"
        >
          Done
        </button>
      </section>
    </main>
  );
}
