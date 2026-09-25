// What a vision board holds: an ordered list of tiles, kept inside the note's
// own content (see board-node.ts), so a board saves, syncs, works offline and
// goes to Recently deleted exactly like any other note's writing.
//
// A photo tile keeps only the path of its photo in the private
// "vision-board" photo folder (supabase/migrations/20260925100000_…), never
// the photo itself, so the note stays small.

export type VisionTile =
  | { id: string; kind: "words"; text: string }
  | { id: string; kind: "photo"; path: string };

// A board's tiles read back from saved content. Anything that isn't a whole
// tile is left out rather than guessed at, so a damaged tile can never stop
// the rest of the board (or the note) from opening.
export function readTiles(value: unknown): VisionTile[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item): VisionTile[] => {
    if (typeof item !== "object" || item === null) return [];
    const tile = item as Record<string, unknown>;
    if (typeof tile.id !== "string" || tile.id === "") return [];
    if (tile.kind === "words" && typeof tile.text === "string") {
      return [{ id: tile.id, kind: "words", text: tile.text }];
    }
    if (tile.kind === "photo" && typeof tile.path === "string" && tile.path !== "") {
      return [{ id: tile.id, kind: "photo", path: tile.path }];
    }
    return [];
  });
}
