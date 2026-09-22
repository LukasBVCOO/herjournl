import { Navigate, useNavigate } from "react-router";
import { setAnswers } from "../data/answers-store";
import StepFrame from "../layout/step-frame";
import { firstUnanswered } from "../data/steps";
import { useAnswers } from "../data/use-answers";

// Reached from the birth time screen's "I don't know my birth time" link.
// Explains what changes, then marks the birth time question answered without
// ever writing a guessed time in its place.
export default function BirthTimeUnknownScreen() {
  const navigate = useNavigate();
  const answers = useAnswers();

  const missing = firstUnanswered(answers, 2);
  if (missing) return <Navigate to={missing} replace />;

  function submit() {
    setAnswers({ birthTime: "", birthTimeUnknown: true });
    navigate("/onboarding/birthplace");
  }

  return (
    <StepFrame back="/onboarding/birth-time" progress={{ current: 3, total: 4 }}>
      <h1 className="font-serif text-[length:clamp(2rem,6.5dvh,2.75rem)] leading-[1.05] font-medium text-balance">
        No worries.
      </h1>
      <p className="mt-3 max-w-[34ch] text-[17px] text-ink-soft">
        We can still personalise your daily guidance using your birth date and
        place. Your Rising sign and house-based insights need an exact birth
        time, so we&rsquo;ll leave those out for now — you can always add it
        later.
      </p>

      <button
        type="button"
        onClick={submit}
        className="mt-8 h-[52px] w-full rounded-full bg-ink font-medium text-paper transition-opacity duration-200 hover:opacity-90"
      >
        Continue
      </button>
    </StepFrame>
  );
}
