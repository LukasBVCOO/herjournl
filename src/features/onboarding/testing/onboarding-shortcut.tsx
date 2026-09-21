import { Link } from "react-router";
import { Icon } from "@/components/icons";
import { clearAnswers } from "../data/answers-store";

// FOR TESTING ONLY. A way into onboarding from the notes list, so it can be
// tried again and again without making a new account. It clears any answers
// left from the last try, so every tap starts from the very beginning.
// Remove it (and its line in the notes list header) before real users arrive.
export default function OnboardingShortcut() {
  return (
    <Link
      to="/onboarding"
      onClick={clearAnswers}
      aria-label="Try onboarding (testing)"
      className="flex h-11 w-11 items-center justify-center text-ink-soft transition-colors duration-200 hover:text-ink"
    >
      <Icon>
        <path d="M12 4c.6 4.2 1.8 5.4 6 6-4.2.6-5.4 1.8-6 6-.6-4.2-1.8-5.4-6-6 4.2-.6 5.4-1.8 6-6Z" />
      </Icon>
    </Link>
  );
}
