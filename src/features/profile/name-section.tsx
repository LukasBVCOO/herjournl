import { useState } from "react";
import { NAME_MAX_LENGTH, tidyName, updateProfile } from "./profile-api";

const cardClass = "rounded-card bg-card px-5 py-4 shadow-soft";
const editButtonClass =
  "-mr-2 flex h-11 items-center px-2 text-sm font-medium text-ink underline underline-offset-4";

// Her name, with a way to change it. It doesn't affect her chart, so there is
// nothing to confirm.
export default function NameSection({
  name,
  onSaved,
}: {
  name: string;
  onSaved: () => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const canSave = tidyName(draft) !== "";

  function startEditing() {
    setDraft(name);
    setError(null);
    setSaved(false);
    setEditing(true);
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSave) return;

    setBusy(true);
    setError(null);
    const ok = await updateProfile({ name: draft });
    if (!ok) {
      setBusy(false);
      setError("We couldn’t save your name. Please try again.");
      return;
    }
    await onSaved();
    setBusy(false);
    setEditing(false);
    setSaved(true);
  }

  if (!editing) {
    return (
      <section className={cardClass}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-muted">Name</p>
            <p className="mt-1 text-[17px] break-words">{name}</p>
          </div>
          <button type="button" onClick={startEditing} className={editButtonClass}>
            Edit
          </button>
        </div>
        {saved && (
          <p role="status" className="mt-2 animate-fade-in text-sm text-ink-soft">
            Name updated.
          </p>
        )}
      </section>
    );
  }

  return (
    <section className={cardClass}>
      <form onSubmit={save}>
        <label htmlFor="profile-name" className="text-xs text-muted">
          Name
        </label>
        <input
          id="profile-name"
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          maxLength={NAME_MAX_LENGTH}
          autoComplete="given-name"
          autoCapitalize="words"
          autoCorrect="off"
          spellCheck={false}
          autoFocus
          className="mt-1 h-12 w-full border-b border-line bg-transparent font-serif text-[24px] text-ink outline-none transition-colors duration-200 focus:border-ink"
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
