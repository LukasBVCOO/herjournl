import { PhotoIcon, StickerIcon } from "@/components/icons";
import BoardSheet, { quietButtonClass } from "./board-sheet";

// "Add to your board": a photo from her phone, or words.
export default function AddSheet({
  onPhoto,
  onWords,
  onClose,
}: {
  // Must open the phone's photo picker straight from this tap: phones only
  // allow the picker to open as the direct result of a tap.
  onPhoto: () => void;
  onWords: () => void;
  onClose: () => void;
}) {
  const optionClass =
    "flex flex-1 flex-col items-center justify-center gap-2 rounded-card bg-card py-7 text-ink transition-opacity duration-200 active:opacity-80";

  return (
    <BoardSheet labelId="add-sheet-title" onClose={onClose}>
      <h2 id="add-sheet-title" className="font-serif text-[28px] leading-tight font-medium">
        Add to your board
      </h2>

      <div className="mt-5 flex gap-3">
        <button type="button" onClick={onPhoto} className={optionClass}>
          <span className="text-accent-ink">
            <PhotoIcon size={28} />
          </span>
          <span className="font-medium">Photo</span>
        </button>
        <button type="button" onClick={onWords} className={optionClass}>
          <span className="text-accent-ink">
            <StickerIcon />
          </span>
          <span className="font-medium">Words</span>
        </button>
      </div>

      <button type="button" onClick={onClose} className={`mt-3 ${quietButtonClass}`}>
        Cancel
      </button>
    </BoardSheet>
  );
}
