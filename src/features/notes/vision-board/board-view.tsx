import { useEffect, useRef, useState } from "react";
import { NodeViewWrapper, type ReactNodeViewProps } from "@tiptap/react";
import { PlusIcon } from "@/components/icons";
import { posthog } from "@/lib/posthog";
import AddSheet from "./add-sheet";
import PhotoSheet from "./photo-sheet";
import { deletePhoto, uploadPhoto } from "./photo-store";
import { PendingPhotoTile, PhotoTile, tileClass } from "./photo-tile";
import { shrinkPhoto, type ShrunkPhoto } from "./shrink-photo";
import { readTiles, type VisionTile } from "./tiles";
import WordSheet from "./word-sheet";

// Which sheet is open.
type Sheet =
  | null
  | { kind: "add" }
  | { kind: "new-words" }
  | { kind: "edit-words"; id: string }
  | { kind: "photo"; id: string; url: string | null };

// Only ever what kind of tile it was — never her words or anything about a
// photo.
function track(event: "vision_board_tile_added" | "vision_board_tile_removed", kind: VisionTile["kind"]) {
  posthog?.capture(event, { kind });
}

// A photo she picked that isn't on the board yet. It only joins the board
// (and the note) once it's safely in her photo folder, so a note never points
// at a photo that isn't there.
type Pending = {
  id: string;
  photo: ShrunkPhoto;
  previewUrl: string;
  state: "uploading" | "offline" | "failed";
};

// How a vision board looks inside its note: a neat two-column grid of tiles,
// each keeping its own height, so photos and words fit together.
// Not typeable (contentEditable false), so her cursor and keyboard never land
// inside it; the note's own lines above it stay ordinary writing.
//
// Every change goes through updateAttributes, which is an ordinary edit of
// the note: it saves, syncs and works offline like her typing does.
export default function BoardView({ node, updateAttributes, editor, getPos }: ReactNodeViewProps) {
  const tiles = readTiles(node.attrs.tiles);
  const [sheet, setSheet] = useState<Sheet>(null);
  const [pending, setPending] = useState<Pending[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  // The phone copies of photos still waiting to go up. Let go of them when the
  // board goes away; each finished upload tidies up its own.
  const previewUrls = useRef(new Set<string>());
  useEffect(() => {
    const urls = previewUrls.current;
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  function releasePreview(url: string) {
    URL.revokeObjectURL(url);
    previewUrls.current.delete(url);
  }

  // The board as it is right now. An upload finishes a moment later, by which
  // time she may have changed the board; add to what's there then.
  function currentTiles() {
    const pos = getPos();
    const current = typeof pos === "number" ? editor.state.doc.nodeAt(pos) : null;
    return readTiles(current?.attrs.tiles);
  }

  function setTiles(next: VisionTile[]) {
    updateAttributes({ tiles: next });
  }

  function addWords(text: string) {
    setTiles([...tiles, { id: crypto.randomUUID(), kind: "words", text }]);
    setSheet(null);
    track("vision_board_tile_added", "words");
  }

  function changeWords(id: string, text: string) {
    setTiles(tiles.map((tile) => (tile.id === id && tile.kind === "words" ? { ...tile, text } : tile)));
    setSheet(null);
  }

  function remove(id: string) {
    const tile = tiles.find((item) => item.id === id);
    setTiles(tiles.filter((item) => item.id !== id));
    setSheet(null);
    if (tile?.kind === "photo") void deletePhoto(tile.path);
    if (tile) track("vision_board_tile_removed", tile.kind);
  }

  function choosePhoto() {
    setSheet(null);
    fileInput.current?.click();
  }

  async function onPicked(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // Lets her pick the same photo again later.
    event.target.value = "";
    if (!file) return;

    setNotice(null);
    let photo: ShrunkPhoto;
    try {
      photo = await shrinkPhoto(file);
    } catch {
      setNotice("That photo couldn’t be opened. Try a different one.");
      posthog?.capture("vision_board_photo_failed", { reason: "unreadable" });
      return;
    }
    const item: Pending = {
      id: crypto.randomUUID(),
      photo,
      previewUrl: URL.createObjectURL(photo.blob),
      state: "uploading",
    };
    previewUrls.current.add(item.previewUrl);
    setPending((list) => [...list, item]);
    void send(item);
  }

  async function send(item: Pending) {
    setPending((list) => list.map((p) => (p.id === item.id ? { ...p, state: "uploading" } : p)));
    const result = await uploadPhoto(item.id, item.photo);

    if (!result.ok) {
      setPending((list) => list.map((p) => (p.id === item.id ? { ...p, state: result.reason } : p)));
      posthog?.capture("vision_board_photo_failed", { reason: result.reason });
      return;
    }
    // She left the note while it was going up: the board can't be changed
    // any more, so don't leave the photo sitting in her folder unused.
    if (editor.isDestroyed) {
      void deletePhoto(result.path);
      return;
    }
    updateAttributes({ tiles: [...currentTiles(), { id: item.id, kind: "photo", path: result.path }] });
    releasePreview(item.previewUrl);
    setPending((list) => list.filter((p) => p.id !== item.id));
    track("vision_board_tile_added", "photo");
  }

  function dismiss(item: Pending) {
    releasePreview(item.previewUrl);
    setPending((list) => list.filter((p) => p.id !== item.id));
  }

  const editing = sheet?.kind === "edit-words" ? tiles.find((tile) => tile.id === sheet.id) : undefined;
  const isEmpty = tiles.length === 0 && pending.length === 0;

  return (
    // ph-no-capture: the analytics tool (PostHog) never records taps, text
    // or screen recordings of anything inside her board.
    <NodeViewWrapper className="vision-board ph-no-capture" contentEditable={false}>
      {isEmpty ? (
        <button
          type="button"
          onClick={() => setSheet({ kind: "add" })}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl bg-card px-6 py-10 text-center transition-opacity duration-200 active:opacity-80"
        >
          {/* An 800px copy of the founder's artwork (the original is kept in
              design/vision-board/, too big to ship), small enough to keep
              offline. */}
          <img
            src="/vision-board/empty-board.png"
            alt=""
            width={800}
            height={479}
            className="h-auto w-full max-w-72"
          />
          <span className="mt-2 font-serif text-[1.25rem] leading-tight text-ink">Your vision starts here ✦</span>
          <span className="text-sm text-ink-soft">The photos and words you’re calling in.</span>
          {/* Looks like a button so it's obvious where to tap; the whole
              panel is the actual button, so tapping anywhere on it works. */}
          <span className="mt-3 inline-flex h-11 items-center gap-1.5 rounded-full bg-ink px-5 text-[15px] font-medium text-paper">
            <PlusIcon size={18} />
            Add your first card
          </span>
        </button>
      ) : (
        <div className="columns-2 gap-3">
          {tiles.map((tile) =>
            tile.kind === "words" ? (
              <button
                key={tile.id}
                type="button"
                onClick={() => setSheet({ kind: "edit-words", id: tile.id })}
                className={`${tileClass} flex min-h-32 items-center justify-center bg-card px-4 py-6 text-center transition-opacity duration-200 active:opacity-80`}
              >
                <span className="font-serif text-[1.125rem] leading-snug break-words whitespace-pre-line text-ink">
                  {tile.text}
                </span>
              </button>
            ) : (
              <PhotoTile
                key={tile.id}
                path={tile.path}
                onOpen={(url) => setSheet({ kind: "photo", id: tile.id, url })}
              />
            ),
          )}
          {pending.map((item) => (
            <PendingPhotoTile
              key={item.id}
              previewUrl={item.previewUrl}
              state={item.state}
              onRetry={() => void send(item)}
              onDismiss={() => dismiss(item)}
            />
          ))}
          <button
            type="button"
            onClick={() => setSheet({ kind: "add" })}
            aria-label="Add a tile"
            className={`${tileClass} flex min-h-32 flex-col items-center justify-center gap-1 border border-dashed border-line text-ink-soft transition-colors duration-200 hover:text-ink active:opacity-80`}
          >
            <PlusIcon />
            <span className="text-sm">Add a tile</span>
          </button>
        </div>
      )}

      {notice && (
        <p role="status" className="mt-1 text-sm text-alert">
          {notice}
        </p>
      )}

      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        onChange={onPicked}
        className="hidden"
        tabIndex={-1}
        aria-hidden="true"
      />

      {sheet?.kind === "add" && (
        <AddSheet
          onPhoto={choosePhoto}
          onWords={() => setSheet({ kind: "new-words" })}
          onClose={() => setSheet(null)}
        />
      )}
      {sheet?.kind === "new-words" && (
        <WordSheet initialText="" onSave={addWords} onClose={() => setSheet(null)} />
      )}
      {editing?.kind === "words" && (
        <WordSheet
          initialText={editing.text}
          onSave={(text) => changeWords(editing.id, text)}
          onRemove={() => remove(editing.id)}
          onClose={() => setSheet(null)}
        />
      )}
      {sheet?.kind === "photo" && (
        <PhotoSheet url={sheet.url} onRemove={() => remove(sheet.id)} onClose={() => setSheet(null)} />
      )}
    </NodeViewWrapper>
  );
}
