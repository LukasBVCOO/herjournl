// Makes a photo small enough to upload, on her phone, before it goes anywhere.
//
// A phone photo is often 3-10 MB; the board shows it at most a few hundred
// pixels wide, so the longest side is brought down to 1600 px and it is saved
// as a JPEG (about 200-400 KB). Redrawing the picture also leaves behind
// everything hidden inside the original file, including where it was taken.
//
// A PNG with see-through areas (a logo, a cut-out) stays a PNG, since JPEG
// would fill those areas in. Any other PNG becomes a JPEG like a photo.

const LONGEST_SIDE = 1600;
const SMALLER_SIDE = 1000;
const JPEG_QUALITY = 0.82;
// The photo folder refuses anything over 2 MB; stay safely under it.
const MAX_BYTES = 1.9 * 1024 * 1024;

export type ShrunkPhoto = { blob: Blob; type: "image/jpeg" | "image/png"; extension: "jpg" | "png" };

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("unreadable"));
    };
    image.src = url;
  });
}

function draw(image: HTMLImageElement, longestSide: number) {
  const scale = Math.min(1, longestSide / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("no canvas");
  // Browsers already turn the photo the right way up (the phone's rotation
  // setting) when drawing it, so no separate rotation step is needed.
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return { canvas, context };
}

function hasSeeThrough(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
  const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] < 255) return true;
  }
  return false;
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("encode failed"))), type, quality);
  });
}

// Throws when the file isn't a picture the phone can open.
export async function shrinkPhoto(file: File): Promise<ShrunkPhoto> {
  const image = await loadImage(file);
  const mayBeSeeThrough = file.type === "image/png" || file.type === "image/webp";

  for (const side of [LONGEST_SIDE, SMALLER_SIDE]) {
    const { canvas, context } = draw(image, side);
    if (mayBeSeeThrough && hasSeeThrough(canvas, context)) {
      const blob = await toBlob(canvas, "image/png");
      if (blob.size <= MAX_BYTES) return { blob, type: "image/png", extension: "png" };
      continue;
    }
    const blob = await toBlob(canvas, "image/jpeg", JPEG_QUALITY);
    if (blob.size <= MAX_BYTES) return { blob, type: "image/jpeg", extension: "jpg" };
  }
  throw new Error("too big");
}
