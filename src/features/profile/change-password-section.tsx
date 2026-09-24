import { useState } from "react";
import { changePassword, PASSWORD_MIN_LENGTH } from "./account-api";

const cardClass = "rounded-card bg-card px-5 py-4 shadow-soft";
const editButtonClass =
  "-mr-2 flex h-11 items-center px-2 text-sm font-medium text-ink underline underline-offset-4";
const fieldClass =
  "mt-1 h-12 w-full border-b border-line bg-transparent text-[17px] text-ink outline-none transition-colors duration-200 focus:border-ink";

// Her password, with a way to change it. Nothing about it is ever shown —
// only a way in. She has to enter the current one correctly first (see
// account-api.ts's changePassword), so this can't be used to lock her out by
// anyone who's simply picked up an unlocked, signed-in phone.
export default function ChangePasswordSection() {
  const [editing, setEditing] = useState(false);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function startEditing() {
    setCurrent("");
    setNext("");
    setConfirm("");
    setError(null);
    setEditing(true);
  }

  const canSave = current !== "" && next !== "" && confirm !== "";

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSave) return;
    if (next !== confirm) {
      setError("Those two don't match.");
      return;
    }

    setBusy(true);
    setError(null);
    const problem = await changePassword(current, next);
    setBusy(false);
    if (problem) {
      setError(problem);
      return;
    }
    setEditing(false);
    setSaved(true);
  }

  if (!editing) {
    return (
      <section className={cardClass}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-muted">Password</p>
            <p className="mt-1 text-[17px] tracking-widest">••••••••</p>
          </div>
          <button type="button" onClick={startEditing} className={editButtonClass}>
            Change
          </button>
        </div>
        {saved && (
          <p role="status" className="mt-2 animate-fade-in text-sm text-ink-soft">
            Password updated.
          </p>
        )}
      </section>
    );
  }

  return (
    <section className={cardClass}>
      <form onSubmit={save}>
        <label htmlFor="profile-current-password" className="text-xs text-muted">
          Current password
        </label>
        <input
          id="profile-current-password"
          type="password"
          value={current}
          onChange={(event) => setCurrent(event.target.value)}
          autoComplete="current-password"
          autoFocus
          className={fieldClass}
        />

        <label htmlFor="profile-new-password" className="mt-4 block text-xs text-muted">
          New password
        </label>
        <input
          id="profile-new-password"
          type="password"
          value={next}
          onChange={(event) => setNext(event.target.value)}
          autoComplete="new-password"
          minLength={PASSWORD_MIN_LENGTH}
          className={fieldClass}
        />

        <label htmlFor="profile-confirm-password" className="mt-4 block text-xs text-muted">
          Confirm new password
        </label>
        <input
          id="profile-confirm-password"
          type="password"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          autoComplete="new-password"
          className={fieldClass}
        />

        {error && (
          <p role="alert" className="mt-3 animate-fade-in text-sm text-alert">
            {error}
          </p>
        )}

        <div className="mt-4 flex items-center gap-3">
          <button
            type="submit"
            disabled={!canSave || busy}
            className="h-11 rounded-full bg-ink px-6 text-[15px] font-medium text-paper transition-opacity duration-200 hover:opacity-90 disabled:opacity-40"
          >
            {busy ? "Saving…" : "Save"}
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
