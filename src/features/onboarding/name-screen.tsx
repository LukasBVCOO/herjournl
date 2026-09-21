import { useNavigate } from "react-router";
import { setAnswers } from "./answers-store";
import StepFrame from "./step-frame";
import { useAnswers } from "./use-answers";

const NAME_MAX_LENGTH = 60;

// Extra spaces at the ends or in the middle are tidied away; letters of any
// language, accents included, are left exactly as she typed them.
function tidy(name: string) {
  return name.replace(/\s+/g, " ").trim();
}

export default function NameScreen() {
  const navigate = useNavigate();
  const { name } = useAnswers();
  const canContinue = tidy(name) !== "";

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canContinue) return;
    setAnswers({ name: tidy(name) });
    navigate("/onboarding/birthday");
  }

  return (
    <StepFrame back="/onboarding" progress={{ current: 1, total: 4 }}>
      <form onSubmit={submit} className="flex flex-col">
        <h1 className="font-serif text-[length:clamp(2rem,6.5dvh,2.75rem)] leading-[1.05] font-medium text-balance [&_em]:font-normal">
          What should we call <em>you?</em>
        </h1>
        <p className="mt-3 max-w-[30ch] text-[17px] text-ink-soft">
          We&rsquo;ll use your name to personalise your experience.
        </p>

        <label htmlFor="name" className="sr-only">
          Your name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(event) => setAnswers({ name: event.target.value })}
          maxLength={NAME_MAX_LENGTH}
          autoComplete="given-name"
          autoCapitalize="words"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="next"
          autoFocus
          placeholder="Your name"
          className="mt-10 h-14 w-full border-b border-line bg-transparent font-serif text-[28px] text-ink outline-none transition-colors duration-200 placeholder:text-muted/60 focus:border-ink"
        />

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
