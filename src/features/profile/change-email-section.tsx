import { useState } from "react";
import { changeEmail } from "./account-api";

const cardClass = "rounded-card bg-card px-5 py-4 shadow-soft";
const editButtonClass =
  "-mr-2 flex h-11 items-center px-2 text-sm font-medium text-ink underline underline-offset-4";

// Her email, with a way to change it. Unlike her name, this isn't saved the
// moment she taps save — Supabase sends a confirmation link first, and the
// address on screen only updates once she's clicked it (see account-api.ts
// and lib/session.ts's own listener, which picks that moment up on its own,
// so this component doesn't need to poll for it).
export default function ChangeEmailSection({ email }: { email: string }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(email);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // The address a confirmation was just sent to, so the message stays put
  // even after she closes the form — cleared once the real email actually
  // changes (this component just re-renders with the new `email` prop then).
  const [pendingAddress, setPendingAddress] = useState<string | null>(null);

  function startEditing() {
    setDraft(email);
    setError(null);
    setEditing(true);
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = draft.trim();
    if (value === "" || value === email) return;

    setBusy(true);
    setError(null);
    const problem = await changeEmail(value);
    setBusy(false);
    if (problem) {
      setError(problem);
      return;
    }
    setEditing(false);
    setPendingAddress(value);
  }

  if (!editing) {
    return (
      <section className={cardClass}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-muted">Email</p>
            <p className="mt-1 text-[17px] break-all">{email}</p>
          </div>
          <button type="button" onClick={startEditing} className={editButtonClass}>
            Change
          </button>
        </div>
        {pendingAddress && pendingAddress !== email && (
          <p role="status" className="mt-2 animate-fade-in text-sm text-ink-soft">
            Check {pendingAddress} for a link to confirm the change.
          </p>
        )}
      </section>
    );
  }

  return (
    <section className={cardClass}>
      <form onSubmit={save}>
        <label htmlFor="profile-email" className="text-xs text-muted">
          New email
        </label>
        <input
          id="profile-email"
          type="email"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          autoComplete="email"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          autoFocus
          className="mt-1 h-12 w-full border-b border-line bg-transparent text-[17px] text-ink outline-none transition-colors duration-200 focus:border-ink"
        />
        <p className="mt-2 text-[13px] text-ink-soft">
          We&rsquo;ll send a link to confirm before this takes effect.
        </p>

        {error && (
          <p role="alert" className="mt-3 animate-fade-in text-sm text-alert">
            {error}
          </p>
        )}

        <div className="mt-4 flex items-center gap-3">
          <button
            type="submit"
            disabled={busy || draft.trim() === "" || draft.trim() === email}
            className="h-11 rounded-full bg-ink px-6 text-[15px] font-medium text-paper transition-opacity duration-200 hover:opacity-90 disabled:opacity-40"
          >
            {busy ? "Sending…" : "Send confirmation"}
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            disabled={busy}
            className="h-11 px-3 text-[15px] font-medium text-ink-soft transition-colors duration-200 hover:text-ink disabled:opacity-40"
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}
