import { useNavigate } from "react-router";

// The first thing a new account sees: what the app is for, in one breath.
export default function WelcomeScreen() {
  const navigate = useNavigate();

  return (
    <main className="flex flex-1 animate-fade-in flex-col">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-6">
        <p className="pt-[max(1.25rem,env(safe-area-inset-top))] font-serif text-2xl font-medium">
          Becomely
        </p>

        <div className="flex flex-1 flex-col justify-center pb-10">
          <h1 className="font-serif text-[length:clamp(2.5rem,7.5dvh,3.5rem)] leading-[1.02] font-medium text-balance [&_em]:font-normal">
            Your day, <em>aligned to you.</em>
          </h1>
          <p className="mt-4 max-w-[30ch] text-[17px] text-ink-soft">
            Get a daily focus based on your birth chart, with prompts that turn
            intention into action.
          </p>
        </div>

        <div className="pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={() => navigate("/onboarding/name")}
            className="h-[52px] w-full rounded-full bg-ink font-medium text-paper transition-opacity duration-200 hover:opacity-90"
          >
            Get started
          </button>
        </div>
      </div>
    </main>
  );
}
