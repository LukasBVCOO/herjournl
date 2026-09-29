// Sending a bug report to the database (the bug_reports table). She can only
// send one, never read one back — see the bug_reports migration. Nothing here
// logs what she wrote.

import { supabase } from "@/lib/supabase/client";

export type BugReport = {
  description: string;
  steps: string;
};

export type SendResult = { ok: true } | { ok: false; offline: boolean };

export const REPORT_MAX_LENGTH = 4000;

export async function sendBugReport(report: BugReport): Promise<SendResult> {
  const offline = typeof navigator !== "undefined" && navigator.onLine === false;
  if (offline) return { ok: false, offline: true };
  try {
    const steps = report.steps.trim();
    // Filled in for her, so a report can be matched to a version and device.
    // No insert-returning select: she isn't allowed to read reports back.
    const { error } = await supabase.from("bug_reports").insert({
      description: report.description.trim().slice(0, REPORT_MAX_LENGTH),
      steps: steps === "" ? null : steps.slice(0, REPORT_MAX_LENGTH),
      app_version: String(import.meta.env.VITE_APP_VERSION ?? "").slice(0, 50) || null,
      user_agent: navigator.userAgent.slice(0, 500),
      screen: `${window.innerWidth}x${window.innerHeight}`,
    });
    if (error) return { ok: false, offline: false };
    return { ok: true };
  } catch {
    return { ok: false, offline: typeof navigator !== "undefined" && navigator.onLine === false };
  }
}
