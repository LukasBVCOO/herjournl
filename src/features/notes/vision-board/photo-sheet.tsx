import { useState } from "react";
import BoardSheet, { quietButtonClass, removeButtonClass } from "./board-sheet";

// Opened by tapping a photo on her board: the photo a little larger, and the
// way to take it off the board.
export default function PhotoSheet({
  url,
  onRemove,
  onClose,
}: {
  // Null while the photo can't be shown (no internet, or it's gone).
  url: string | null;
  onRemove: () => void;
  onClose: () => void;
}) {
  // Removing asks twice, so a stray tap can't take a photo off her board.
  const [confirmRemove, setConfirmRemove] = useState(false);

  return (
    <BoardSheet labelId="photo-sheet-title" onClose={onClose}>
      <h2 id="photo-sheet-title" className="sr-only">
        Photo on your board
      </h2>
      {url ? (
        <img src={url} alt="" className="max-h-[55dvh] w-full rounded-card object-contain" />
      ) : (
        <div className="flex h-48 items-center justify-center rounded-card bg-card px-6 text-center text-sm text-ink-soft">
          This photo can’t be shown right now.
        </div>
      )}

      <button
        type="button"
        onClick={() => (confirmRemove ? onRemove() : setConfirmRemove(true))}
        className={`mt-5 ${removeButtonClass}`}
      >
        {confirmRemove ? "Tap again to remove" : "Remove from board"}
      </button>
      <button type="button" onClick={onClose} className={`mt-2 ${quietButtonClass}`}>
        Done
      </button>
    </BoardSheet>
  );
}
