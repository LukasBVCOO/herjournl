import { useState } from "react";
import BoardSheet, { primaryButtonClass, quietButtonClass, removeButtonClass } from "./board-sheet";

export const WORD_TILE_MAX_LENGTH = 200;

// The sheet for writing or changing one word tile.
export default function WordSheet({
  initialText,
  onSave,
  onRemove,
  onClose,
}: {
  // Empty for a new tile.
  initialText: string;
  onSave: (text: string) => void;
  // Only for a tile that's already on the board.
  onRemove?: () => void;
  onClose: () => void;
}) {
  const [text, setText] = useState(initialText);
  // Removing asks twice, so a stray tap can't take a tile off her board.
  const [confirmRemove, setConfirmRemove] = useState(false);
  const isNew = onRemove === undefined;
  const trimmed = text.trim();

  function save(event: React.FormEvent) {
    event.preventDefault();
    if (trimmed === "") return;
    onSave(trimmed);
  }

  return (
    <BoardSheet labelId="word-sheet-title" onClose={onClose} onSubmit={save}>
      <h2 id="word-sheet-title" className="font-serif text-[28px] leading-tight font-medium">
        {isNew ? "Add words" : "Edit words"}
      </h2>
      <p className="mt-2 text-[15px] leading-snug text-ink-soft">Write it as if it’s already yours.</p>

      <textarea
        autoFocus
        value={text}
        onChange={(event) => setText(event.target.value)}
        maxLength={WORD_TILE_MAX_LENGTH}
        rows={3}
        placeholder="I run my own studio."
        aria-label="Words for your board"
        className="mt-5 w-full resize-none rounded-card bg-card px-4 py-3 font-serif text-[20px] leading-snug text-ink placeholder:text-muted focus:outline-none"
      />

      <button type="submit" disabled={trimmed === ""} className={`mt-5 ${primaryButtonClass}`}>
        {isNew ? "Add to board" : "Save"}
      </button>

      {onRemove ? (
        <button
          type="button"
          onClick={() => (confirmRemove ? onRemove() : setConfirmRemove(true))}
          className={`mt-2 ${removeButtonClass}`}
        >
          {confirmRemove ? "Tap again to remove" : "Remove from board"}
        </button>
      ) : (
        <button type="button" onClick={onClose} className={`mt-2 ${quietButtonClass}`}>
          Cancel
        </button>
      )}
    </BoardSheet>
  );
}
