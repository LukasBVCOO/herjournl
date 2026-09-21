import { Link } from "react-router";
import { BackIcon } from "@/components/icons";
import ProgressBar from "./progress-bar";

// The shared frame for the questions: back arrow and progress bar along the
// top, the question below. The content sits near the top rather than the bottom
// so the button stays above the keyboard on a phone.
export default function StepFrame({
  back,
  progress,
  children,
}: {
  // Where the back arrow goes.
  back: string;
  progress?: { current: number; total: number };
  children: React.ReactNode;
}) {
  return (
    <main className="flex flex-1 animate-fade-in flex-col">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-6">
        <header className="flex items-center gap-3 pt-[max(1.25rem,env(safe-area-inset-top))]">
          <Link
            to={back}
            replace
            aria-label="Back"
            className="-ml-3 flex h-11 w-11 items-center justify-center text-ink-soft transition-colors duration-200 hover:text-ink"
          >
            <BackIcon />
          </Link>
          {progress ? (
            <ProgressBar current={progress.current} total={progress.total} />
          ) : null}
        </header>

        <div className="flex flex-1 flex-col pt-8 pb-8">{children}</div>
      </div>
    </main>
  );
}
