import { Navigate, useNavigate } from "react-router";
import { setAnswers } from "../data/answers-store";
import PlaceSearch from "../fields/place-search";
import StepFrame from "../layout/step-frame";
import { firstUnanswered } from "../data/steps";
import { useAnswers } from "../data/use-answers";

export default function BirthplaceScreen() {
  const navigate = useNavigate();
  const answers = useAnswers();
  const { place } = answers;

  const missing = firstUnanswered(answers, 3);
  if (missing) return <Navigate to={missing} replace />;

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

        <div className="mt-10">
          {/* If she already chose a place and came back, it shows in the box.
              Typing again clears the choice, so she has to pick from the list. */}
          <PlaceSearch
            value={place}
            autoFocus
            onChange={(chosen) => setAnswers({ place: chosen })}
          />
        </div>

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
