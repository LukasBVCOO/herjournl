import { useEffect, useState } from "react";
import { photoLink } from "./photo-store";

export const tileClass = "mb-3 block w-full break-inside-avoid overflow-hidden rounded-2xl";

// One photo on her board, at its own shape. Asks for a private link to the
// photo when it comes on screen; until then (or with no internet) a quiet
// beige tile holds its place.
export function PhotoTile({ path, onOpen }: { path: string; onOpen: (url: string | null) => void }) {
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let current = true;
    void photoLink(path).then((link) => {
      if (!current) return;
      setUrl(link);
      setFailed(link === null);
    });
    return () => {
      current = false;
    };
  }, [path]);

  return (
    <button
      type="button"
      onClick={() => onOpen(url)}
      aria-label="Photo on your board"
      className={`${tileClass} transition-opacity duration-200 active:opacity-80`}
    >
      {url ? (
        <img src={url} alt="" className="block w-full" onError={() => setFailed(true)} />
      ) : (
        <span className="flex aspect-[4/5] items-center justify-center bg-card px-4 text-center text-xs text-muted">
          {failed ? "Photo will show when you’re online" : ""}
        </span>
      )}
    </button>
  );
}

// A photo on its way up: shown straight from her phone, dimmed until it's
// safely in her photo folder. When it couldn't go up, a tap tries again.
export function PendingPhotoTile({
  previewUrl,
  state,
  onRetry,
  onDismiss,
}: {
  previewUrl: string;
  state: "uploading" | "offline" | "failed";
  onRetry: () => void;
  onDismiss: () => void;
}) {
  const message =
    state === "uploading"
      ? "Adding…"
      : state === "offline"
        ? "Connect to the internet to add this photo. Tap to try again."
        : "Couldn’t add this photo. Tap to try again.";

  return (
    <div className={`${tileClass} relative`}>
      <button
        type="button"
        onClick={onRetry}
        disabled={state === "uploading"}
        className="block w-full"
      >
        <img src={previewUrl} alt="" className="block w-full opacity-50" />
        <span className="absolute inset-x-3 bottom-3 rounded-xl bg-surface/90 px-3 py-2 text-left text-xs leading-snug text-ink">
          {message}
        </span>
      </button>
      {state !== "uploading" && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Don’t add this photo"
          className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-surface/90 text-ink"
        >
          ×
        </button>
      )}
    </div>
  );
}
