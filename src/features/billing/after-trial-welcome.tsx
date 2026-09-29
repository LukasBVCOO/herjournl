import type { ReactNode } from "react";
import { useTrialWelcomeDue } from "./trial-welcome";

// Holds back other popups (the install and notifications offers, app.tsx)
// until she has closed the "your 7 days have started" sheet, so it's always
// the first thing she sees on her home screen and never ends up underneath
// one of them. Once it's closed, they appear as they normally would.
export default function AfterTrialWelcome({ children }: { children: ReactNode }) {
  return useTrialWelcomeDue() ? null : children;
}
