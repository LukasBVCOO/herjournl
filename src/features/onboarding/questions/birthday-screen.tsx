import { useState } from "react";
import { Navigate, useNavigate } from "react-router";
import { setAnswers } from "../data/answers-store";
import { checkBirthDate, MIN_AGE, type BirthDateProblem } from "../validation/birth-date";
import BirthDateFields from "../fields/birth-date-fields";
import StepFrame from "../layout/step-frame";
import { firstUnanswered } from "../data/steps";
import { useAnswers } from "../data/use-answers";

const problemText: Record<BirthDateProblem, string> = {
  invalid: "Please enter a valid date.",
  future: "Your birth date can’t be in the future.",
  "too-young": `You need to be ${MIN_AGE} or older to use Becomely.`,
};

export default function BirthdayScreen() {
  const navigate = useNavigate();
  const answers = useAnswers();
  const { day, month, year } = answers;
  const [problem, setProblem] = useState<BirthDateProblem | null>(null);

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

        <div className="mt-10">
          <BirthDateFields
            day={day}
            month={month}
            year={year}
            invalid={problem !== null}
            autoFocus
            onChange={(patch) => {
              setAnswers(patch);
              setProblem(null);
            }}
          />
        </div>

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
