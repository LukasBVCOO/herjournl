import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { posthog } from "@/lib/posthog";
import { forgetThisDevice } from "@/lib/session";
import { supabase } from "@/lib/supabase/client";

const CONFIRM_WORD = "DELETE";

// "Delete account", on her profile under Notifications. Deletes her account and
// everything in it for good — notes, vision boards and their photos, daily
// cards, her chart and profile, notifications — through the delete-account
// Edge Function (supabase/functions/delete-account), then clears the phone.
// Nothing can be undone, so it asks her to type DELETE before it will go.
export default function DeleteAccountSection() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-4 flex w-full items-center gap-3 rounded-card bg-alert/85 px-5 py-4 text-left text-[17px] font-medium text-paper shadow-soft transition-opacity duration-200 outline-none hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ink/30 focus-visible:ring-offset-2 focus-visible:ring-offset-paper active:opacity-80"
      >
        <span className="flex-1">Delete account</span>
        <span aria-hidden="true">→</span>
      </button>
      {open && <DeleteSheet onCancel={() => setOpen(false)} />}
    </>
  );
}

function DeleteSheet({ onCancel }: { onCancel: () => void }) {
  const navigate = useNavigate();
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const cancelButton = useRef<HTMLButtonElement>(null);
  const confirmed = typed.trim().toUpperCase() === CONFIRM_WORD;

  // The safe answer, Cancel, has focus when the sheet opens.
  useEffect(() => {
    cancelButton.current?.focus();
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape" && !busy) onCancel();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onCancel, busy]);

  async function deleteAccount() {
    if (!confirmed || busy) return;
    if (!navigator.onLine) {
      setProblem("You need to be online to delete your account.");
      return;
    }
    setBusy(true);
    setProblem(null);
    try {
      const { data, error } = await supabase.functions.invoke("delete-account", { body: {} });
      if (error || !(data as { ok?: boolean } | null)?.ok) throw new Error("not deleted");
    } catch {
      setProblem("We couldn’t delete your account. Nothing was removed — please try again.");
      setBusy(false);
      return;
    }
    posthog?.capture("account_deleted");
    await forgetThisDevice();
    navigate("/login", { replace: true });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        type="button"
        aria-label="Close"
        tabIndex={-1}
        onClick={() => !busy && onCancel()}
        className="absolute inset-0 animate-fade-in bg-ink/30"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-account-title"
        className="relative w-full max-w-md animate-fade-in rounded-t-sheet bg-surface px-6 pt-7 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-sheet"
      >
        <h2 id="delete-account-title" className="font-serif text-[28px] leading-tight font-medium">
          Delete your account?
        </h2>
        <p className="mt-3 text-[17px] leading-snug text-ink-soft">
          This permanently deletes your notes, vision boards and photos, daily cards, your chart and
          profile. It can&rsquo;t be undone.
        </p>

        <label className="mt-5 block text-[15px] text-ink-soft" htmlFor="delete-account-confirm">
          Type <span className="font-medium text-ink">{CONFIRM_WORD}</span> to confirm
        </label>
        <input
          id="delete-account-confirm"
          value={typed}
          onChange={(event) => setTyped(event.target.value)}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          disabled={busy}
          className="mt-2 h-12 w-full rounded-2xl border border-line bg-paper px-4 text-[17px] tracking-wider text-ink uppercase focus:outline-2 focus:outline-offset-2 focus:outline-alert/40"
        />

        {problem && (
          <p role="alert" className="mt-3 text-sm text-alert">
            {problem}
          </p>
        )}

        <button
          type="button"
          onClick={deleteAccount}
          disabled={!confirmed || busy}
          className="mt-6 h-[52px] w-full rounded-full bg-alert font-medium text-paper transition-opacity duration-200 hover:opacity-90 disabled:opacity-40"
        >
          {busy ? "Deleting…" : "Delete my account"}
        </button>
        <button
          ref={cancelButton}
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="mt-2 h-[52px] w-full rounded-full font-medium text-ink transition-opacity duration-200 hover:opacity-70 disabled:opacity-40"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
