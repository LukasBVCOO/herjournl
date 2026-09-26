import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { PackIcon } from "@/components/icons";
import { NotificationsSection } from "@/features/notifications";
import { signOut } from "@/lib/session";
import DeleteAccountSection from "./delete-account-section";

// What used to be the separate Settings screen, now the bottom of her
// profile: Recently deleted, notifications, deleting her account, logging
// out, and the app's version. Shown whether or not her profile itself loaded, so she can always
// log out.
export default function SettingsSection() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  async function logOut() {
    setBusy(true);
    setProblem(null);
    // Refuses, with a reason, if some of her writing hasn't reached the
    // internet yet, because logging out clears the copy on this phone.
    const message = await signOut();
    if (message) {
      setProblem(message);
      setBusy(false);
      return;
    }
    navigate("/login", { replace: true });
  }

  return (
    <div className="mt-4 flex flex-col">
      <Link
        to="/recently-deleted"
        className="flex items-center gap-3 rounded-card bg-card px-5 py-4 text-[17px] text-ink shadow-soft transition-opacity duration-200 active:opacity-80"
      >
        <span className="text-ink-soft">
          <PackIcon name="trash" />
        </span>
        <span className="flex-1">Recently deleted</span>
        <span aria-hidden="true" className="text-ink-soft">
          →
        </span>
      </Link>

      <div className="mt-4">
        <NotificationsSection />
      </div>

      <DeleteAccountSection />

      {problem && (
        <p role="alert" className="mt-6 animate-fade-in text-sm text-alert">
          {problem}
        </p>
      )}

      <button
        type="button"
        onClick={logOut}
        disabled={busy}
        className={`${problem ? "mt-3" : "mt-6"} h-[52px] w-full rounded-full border border-line bg-surface font-medium text-ink transition-colors duration-200 hover:bg-paper disabled:opacity-60`}
      >
        Log out
      </button>

      <p className="mt-4 text-center text-xs text-muted">Version {import.meta.env.VITE_APP_VERSION}</p>
    </div>
  );
}
