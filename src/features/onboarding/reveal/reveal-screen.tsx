import { useState } from "react";
import { Navigate, useNavigate } from "react-router";
import { getAnswers } from "../data/answers-store";
import PlacementCard from "./placement-card";
import { saveOnboarding } from "../data/save-profile";
import StepFrame from "../layout/step-frame";
import { ALL_QUESTIONS, firstUnanswered } from "../data/steps";
import { useAnswers } from "../data/use-answers";

// The first personal moment: her Sun, Moon and Rising. Tapping the button
// finishes onboarding, which is when her answers are saved.
export default function RevealScreen() {
  const navigate = useNavigate();
  const answers = useAnswers();
  const [saving, setSaving] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);

  const missing = firstUnanswered(answers, ALL_QUESTIONS);
  if (missing) return <Navigate to={missing} replace />;
  if (!answers.chart) return <Navigate to="/onboarding/mapping" replace />;
  const { chart } = answers;

  async function seeTodaysFocus() {
    setSaving(true);
    setSaveFailed(false);
    const saved = await saveOnboarding(getAnswers());
    if (saved) {
      // Onboarding is complete. It ends on her first real daily focus card (the
      // daily focus feature makes it, now that her chart is saved).
      navigate("/focus", { replace: true });
      return;
    }
    // Her answers are still here, so she can simply try again.
    setSaving(false);
    setSaveFailed(true);
  }

  return (
    // Back goes to the last question, so a detail can be corrected. Changing one
    // makes a fresh chart.
    <StepFrame back="/onboarding/birthplace">
      <h1 className="font-serif text-[length:clamp(2rem,6.5dvh,2.75rem)] leading-[1.05] font-medium text-balance [&_em]:font-normal">
        Your chart <em>starts here</em>
      </h1>

      <div className="mt-8 flex flex-col gap-4">
        <PlacementCard kind="sun" sign={chart.sun.sign} delay={0} />
        <PlacementCard kind="moon" sign={chart.moon.sign} delay={200} />
        <PlacementCard kind="rising" sign={chart.rising.sign} delay={400} />
      </div>

      <p className="mt-6 text-[15px] text-ink-soft">
        These placements help shape how your daily focus is personalised to you.
      </p>

      {saveFailed && (
        <p role="alert" className="mt-4 animate-fade-in text-sm text-alert">
          We couldn&rsquo;t save your details. Please try again.
        </p>
      )}

      <button
        type="button"
        onClick={seeTodaysFocus}
        disabled={saving}
        className="mt-6 h-[52px] w-full rounded-full bg-ink font-medium text-paper transition-opacity duration-200 hover:opacity-90 disabled:opacity-60"
      >
        {saving ? "One moment…" : "See today’s focus"}
      </button>
    </StepFrame>
  );
}
