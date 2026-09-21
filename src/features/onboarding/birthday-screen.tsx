import { useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router";
import { setAnswers } from "./answers-store";
import { checkBirthDate, MIN_AGE, type BirthDateProblem } from "./birth-date";
import StepFrame from "./step-frame";
import { firstUnanswered } from "./steps";
import { useAnswers } from "./use-answers";

const problemText: Record<BirthDateProblem, string> = {
  invalid: "Please enter a valid date.",
  future: "Your birth date can’t be in the future.",
  "too-young": `You need to be ${MIN_AGE} or older to use Becomely.`,
};

const fieldClass =
  "h-14 border-b border-line bg-transparent text-center font-serif text-[28px] text-ink outline-none transition-colors duration-200 placeholder:text-muted/60 focus:border-ink";

const digitsOnly = (value: string, max: number) =>
  value.replace(/\D/g, "").slice(0, max);

export default function BirthdayScreen() {
  const navigate = useNavigate();
  const answers = useAnswers();
  const { day, month, year } = answers;
  const [problem, setProblem] = useState<BirthDateProblem | null>(null);

  const dayField = useRef<HTMLInputElement>(null);
  const monthField = useRef<HTMLInputElement>(null);
  const yearField = useRef<HTMLInputElement>(null);

  // She got here without the earlier answers (a refresh loses them): go back to
  // the first one that is missing.
  const missing = firstUnanswered(answers, 1);
  if (missing) return <Navigate to={missing} replace />;

  const canContinue = day !== "" && month !== "" && year.length === 4;

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = checkBirthDate(day, month, year);
    if (!result.ok) {
      setProblem(result.problem);
      return;
    }
    navigate("/onboarding/birth-time");
  }

  return (
    <StepFrame back="/onboarding/name" progress={{ current: 2, total: 4 }}>
      <form onSubmit={submit} className="flex flex-col">
        <h1 className="font-serif text-[length:clamp(2rem,6.5dvh,2.75rem)] leading-[1.05] font-medium text-balance [&_em]:font-normal">
          When were you <em>born?</em>
        </h1>
        <p className="mt-3 max-w-[30ch] text-[17px] text-ink-soft">
          Your birth date helps us understand your personal placements.
        </p>

        <fieldset className="mt-10">
          <legend className="sr-only">Date of birth</legend>
          <div className="flex items-end gap-3">
            <div className="flex w-16 flex-col">
              <label htmlFor="day" className="text-xs text-muted">
                Day
              </label>
              <input
                ref={dayField}
                id="day"
                type="text"
                inputMode="numeric"
                autoComplete="bday-day"
                maxLength={2}
                placeholder="DD"
                autoFocus
                value={day}
                aria-invalid={problem !== null}
                onChange={(event) => {
                  const value = digitsOnly(event.target.value, 2);
                  setAnswers({ day: value });
                  setProblem(null);
                  if (value.length === 2) monthField.current?.focus();
                }}
                className={fieldClass}
              />
            </div>
            <span aria-hidden="true" className="pb-3 text-2xl text-line">
              /
            </span>
            <div className="flex w-16 flex-col">
              <label htmlFor="month" className="text-xs text-muted">
                Month
              </label>
              <input
                ref={monthField}
                id="month"
                type="text"
                inputMode="numeric"
                autoComplete="bday-month"
                maxLength={2}
                placeholder="MM"
                value={month}
                aria-invalid={problem !== null}
                onChange={(event) => {
                  const value = digitsOnly(event.target.value, 2);
                  setAnswers({ month: value });
                  setProblem(null);
                  if (value.length === 2) yearField.current?.focus();
                }}
                onKeyDown={(event) => {
                  if (event.key === "Backspace" && month === "") {
                    dayField.current?.focus();
                  }
                }}
                className={fieldClass}
              />
            </div>
            <span aria-hidden="true" className="pb-3 text-2xl text-line">
              /
            </span>
            <div className="flex w-28 flex-col">
              <label htmlFor="year" className="text-xs text-muted">
                Year
              </label>
              <input
                ref={yearField}
                id="year"
                type="text"
                inputMode="numeric"
                autoComplete="bday-year"
                maxLength={4}
                placeholder="YYYY"
                value={year}
                aria-invalid={problem !== null}
                onChange={(event) => {
                  setAnswers({ year: digitsOnly(event.target.value, 4) });
                  setProblem(null);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Backspace" && year === "") {
                    monthField.current?.focus();
                  }
                }}
                className={fieldClass}
              />
            </div>
          </div>
        </fieldset>

        {problem && (
          <p role="alert" className="mt-4 animate-fade-in text-sm text-alert">
            {problemText[problem]}
          </p>
        )}

        <button
          type="submit"
          disabled={!canContinue}
          className="mt-8 h-[52px] w-full rounded-full bg-ink font-medium text-paper transition-opacity duration-200 hover:opacity-90 disabled:opacity-40"
        >
          Continue
        </button>
      </form>
    </StepFrame>
  );
}
