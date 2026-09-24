import { useState } from "react";
import { Navigate, useNavigate } from "react-router";
import { posthog } from "@/lib/posthog";
import { posthogLogger } from "@/lib/posthog-logger";
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

  // A reduced chart (no exact birth time) only shows a placement when it held
  // steady across her whole possible birth day — never a guessed Rising sign,
  // and never a Sun or Moon sign that could just as easily be the other one.
  const showSun = chart.kind === "full" || chart.sun.reliable;
  const showMoon = chart.kind === "full" || chart.moon.reliable;
  const showRising = chart.kind === "full";

  async function seeTodaysFocus() {
    setSaving(true);
    setSaveFailed(false);
    const saved = await saveOnboarding(getAnswers());
    if (saved) {
      posthog?.capture("onboarding_completed");
      posthogLogger.info("Onboarding profile saved.");
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
        Your chart <em>starts here</em> <span className="text-accent">✦</span>
      </h1>

      <div className="mt-8 flex flex-col gap-4">
        {showSun && <PlacementCard kind="sun" sign={chart.sun.sign} delay={0} />}
        {showMoon && <PlacementCard kind="moon" sign={chart.moon.sign} delay={200} />}
        {showRising && chart.kind === "full" && (
          <PlacementCard kind="rising" sign={chart.rising.sign} delay={400} />
        )}
      </div>

      {!showSun && !showMoon && (
        <p className="mt-6 text-[15px] text-ink-soft">
          We&rsquo;ll be able to show your placements with a bit more
          precision — your daily focus still works today.
        </p>
      )}

      {chart.kind === "reduced" && (
        <p className="mt-4 text-[15px] text-ink-soft">
          There&rsquo;s more we can unlock if you find your birth time later.
        </p>
      )}

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
