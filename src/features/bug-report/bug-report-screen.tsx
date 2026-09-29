import { useState } from "react";
import { Link } from "react-router";
import { BackIcon } from "@/components/icons";
import { useGoBack } from "@/lib/use-go-back";
import { REPORT_MAX_LENGTH, sendBugReport } from "./bug-report-api";

const fieldClass =
  "field-sizing-content mt-5 block min-h-28 w-full resize-none rounded-2xl bg-paper px-5 py-4 text-[17px] leading-relaxed text-ink placeholder:text-muted focus:outline-2 focus:outline-offset-2 focus:outline-gold/50";

function Field({
  label,
  question,
  required,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  question: string;
  required: boolean;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className={`rounded-card bg-surface px-5 pt-5 pb-5 shadow-soft ${required ? "border border-gold/60" : ""}`}>
      <p className="text-xs font-medium tracking-[0.14em] text-ink-soft uppercase">
        {label}
        {!required && <span className="tracking-normal text-muted normal-case"> · Optional</span>}
      </p>
      <p className="mt-2 font-serif text-[21px] leading-snug font-medium text-ink">{question}</p>
      <div aria-hidden="true" className="mt-5 border-t border-line" />
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={question}
        maxLength={REPORT_MAX_LENGTH}
        rows={3}
        className={`ph-no-capture ${fieldClass}`}
      />
    </div>
  );
}

// Reporting a bug, at /report-bug, reached from the bottom of her profile.
// Sends one row to the bug_reports table; the founder reads them in Supabase.
export default function BugReportScreen() {
  const goBack = useGoBack();
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const ready = description.trim() !== "" && !sending;

  async function send() {
    if (!ready) return;
    setSending(true);
    setProblem(null);
    const result = await sendBugReport({ description, steps });
    setSending(false);
    if (result.ok) {
      setSent(true);
      return;
    }
    setProblem(
      result.offline
        ? "You're offline. Your report is still here, so send it once you're back online."
        : "We couldn't send your report. Please try again in a moment.",
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 animate-fade-in flex-col px-6 pb-12">
      <header className="flex items-center gap-1 pt-[max(1.25rem,env(safe-area-inset-top))] pb-2">
        <button
          type="button"
          onClick={goBack}
          aria-label="Back"
          className="-ml-3 flex h-11 w-11 items-center justify-center text-ink-soft transition-colors duration-200 hover:text-ink"
        >
          <BackIcon />
        </button>
      </header>

      {sent ? (
        <div className="flex flex-1 animate-fade-in flex-col items-center justify-center pb-16 text-center">
          <h1 className="font-serif text-[30px] leading-tight font-medium">
            Thank you <span className="text-accent">✦</span>
          </h1>
          <p className="mt-3 max-w-xs text-[15px] leading-snug text-ink-soft">
            Your report is with us. It helps make Becomely better for you and everyone using it.
          </p>
          <Link
            to="/profile"
            replace
            className="mt-8 flex h-14 w-full items-center justify-center rounded-full bg-accent-ink/80 text-[17px] font-medium text-paper shadow-soft transition-opacity duration-200 hover:opacity-90 active:opacity-80"
          >
            Back to profile
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-6 text-center">
            <h1 className="font-serif text-[30px] leading-tight font-medium">Report a bug</h1>
            <p className="mt-2 text-[15px] leading-snug text-ink-soft">
              Something not working as it should? Tell us what happened and we&rsquo;ll look into it.
            </p>
          </div>

          <section className="space-y-5">
            <Field
              label="The problem"
              question="What went wrong?"
              required
              value={description}
              onChange={setDescription}
              placeholder="Describe what happened…"
            />
            <Field
              label="Before it happened"
              question="What were you doing just before?"
              required={false}
              value={steps}
              onChange={setSteps}
              placeholder="e.g. I tapped Done on today's card…"
            />

            <p className="px-1 text-xs leading-relaxed text-muted">
              Your report is sent with your account, the app version and the type of device you&rsquo;re using, so we
              can find the problem. Please don&rsquo;t include anything private from your journal.
            </p>

            {problem && (
              <p role="alert" className="animate-fade-in px-1 text-sm text-alert">
                {problem}
              </p>
            )}

            <button
              type="button"
              onClick={send}
              disabled={!ready}
              className="flex h-14 w-full items-center justify-center rounded-full bg-accent-ink/80 text-[17px] font-medium text-paper shadow-soft transition-opacity duration-200 hover:opacity-90 active:opacity-80 disabled:opacity-45"
            >
              {sending ? "Sending…" : "Send report"}
            </button>
          </section>
        </>
      )}
    </main>
  );
}
