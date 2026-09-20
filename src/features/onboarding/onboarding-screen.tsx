import { useNavigate } from "react-router";

// A stand-in. Step 2.1 replaces this with the real onboarding (name, date of
// birth, birth time, birth place). It exists now so a new account has somewhere
// right to land after signing up.
export default function OnboardingScreen() {
  const navigate = useNavigate();

  return (
    <main className="flex flex-1 animate-fade-in flex-col">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
        <p className="px-6 pt-[max(1.25rem,env(safe-area-inset-top))] font-serif text-2xl font-medium">
          Becomely
        </p>

        <div className="flex flex-1 flex-col justify-center px-6 pb-16">
          <h1 className="font-serif text-[length:clamp(2.5rem,7.5dvh,3.5rem)] leading-[1.02] font-medium text-balance [&_em]:font-normal">
            Welcome to <em>Becomely.</em>
          </h1>
          <p className="mt-4 max-w-[30ch] text-[17px] text-ink-soft">
            Your account is ready. Let&rsquo;s get you to your notes.
          </p>
        </div>

        <div className="px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={() => navigate("/", { replace: true })}
            className="h-[52px] w-full rounded-full bg-ink font-medium text-paper transition-opacity duration-200 hover:opacity-90"
          >
            Start writing
          </button>
        </div>
      </div>
    </main>
  );
}
