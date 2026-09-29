import { useState } from "react";
import { useNavigate } from "react-router";
import { PackIcon } from "@/components/icons";
import { CONTACT_EMAIL, DataCredit, LegalLinks } from "@/features/legal";
import { NotificationsSection } from "@/features/notifications";
import { signOut } from "@/lib/session";
import DeleteAccountSection from "./delete-account-section";
import { ExternalRow, Group, LinkRow } from "./settings-ui";

// What used to be the separate Settings screen, now the bottom of her
// profile: the "App" group (notifications, Recently deleted, reporting a bug,
// emailing us),
// then logging out, deleting her account and the app's version. Shown whether
// or not her profile itself loaded, so she can always log out.
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
    <>
      <Group title="App">
        <NotificationsSection />
        <LinkRow to="/recently-deleted" icon={<PackIcon name="trash" size={22} />} label="Recently deleted" />
        <LinkRow to="/report-bug" icon={<PackIcon name="bug" size={22} />} label="Report a bug" />
        <ExternalRow
          href={`mailto:${CONTACT_EMAIL}`}
          icon={<PackIcon name="mail" size={22} />}
          label="Contact us"
          detail={CONTACT_EMAIL}
        />
      </Group>

      <div className="mt-4 flex flex-col">
        {problem && (
          <p role="alert" className="mb-3 animate-fade-in text-sm text-alert">
            {problem}
          </p>
        )}

        <button
          type="button"
          onClick={logOut}
          disabled={busy}
          className="h-[52px] w-full rounded-full border border-line bg-surface font-medium text-ink transition-colors duration-200 hover:bg-paper disabled:opacity-60"
        >
          {busy ? "Logging out…" : "Log out"}
        </button>

        <div className="mt-3">
          <DeleteAccountSection />
        </div>

        <div className="mt-6 flex flex-col items-center gap-2 border-t border-line pt-4">
          <LegalLinks />
          <DataCredit />
          <p className="text-center text-xs text-ink-soft">Version {import.meta.env.VITE_APP_VERSION}</p>
        </div>
      </div>
    </>
  );
}
