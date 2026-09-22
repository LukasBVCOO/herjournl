import { Navigate, useNavigate } from "react-router";
import { setAnswers } from "../data/answers-store";
import { parseBirthTime } from "../validation/birth-time";
import BirthTimeField from "../fields/birth-time-field";
import StepFrame from "../layout/step-frame";
import { firstUnanswered } from "../data/steps";
import { useAnswers } from "../data/use-answers";

export default function BirthTimeScreen() {
  const navigate = useNavigate();
  const answers = useAnswers();
  const { birthTime, birthTimeUnknown } = answers;

  // She got here without the earlier answers (a refresh loses them): go back to
  // the first one that is missing.
  const missing = firstUnanswered(answers, 2);
  if (missing) return <Navigate to={missing} replace />;

  const canContinue = parseBirthTime(birthTime) !== null || birthTimeUnknown;

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canContinue) return;
    navigate("/onboarding/birthplace");
  }

  return (
    <StepFrame back="/onboarding/birthday" progress={{ current: 3, total: 4 }}>
      <form onSubmit={submit} className="flex flex-col">
        <h1 className="font-serif text-[length:clamp(2rem,6.5dvh,2.75rem)] leading-[1.05] font-medium text-balance [&_em]:font-normal">
          What time were you <em>born?</em>
        </h1>
        <p className="mt-3 max-w-[30ch] text-[17px] text-ink-soft">
          Your birth time helps us understand which areas of life your chart
          connects to.
        </p>

        <div className="mt-10">
          <BirthTimeField
            value={birthTime}
            autoFocus
            onChange={(value) => setAnswers({ birthTime: value, birthTimeUnknown: false })}
          />
        </div>

        <button
          type="button"
          onClick={() => navigate("/onboarding/birth-time-unknown")}
          className="mt-4 h-11 self-start text-[15px] font-medium text-ink-soft underline underline-offset-4 transition-colors duration-200 hover:text-ink"
        >
          I don&rsquo;t know my birth time
        </button>

        {birthTimeUnknown && (
          <p role="status" className="mt-3 text-[14px] text-ink-soft">
            Got it — Continue to move on, or enter a time above if you find it.
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
