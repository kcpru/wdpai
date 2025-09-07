export type ResizeOptions = {
  maxSize?: number; // max width or height
  type?: string; // mime type
  quality?: number; // 0..1
};

async function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    await img.decode().catch(() => new Promise((res, rej) => {
      img.onload = () => res(null as any);
      img.onerror = rej;
    }));
    return img;
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}

function drawToCanvas(img: HTMLImageElement, width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas_context");
  ctx.drawImage(img, 0, 0, width, height);
  return canvas;
}

export async function processPostImage(file: File, opts: ResizeOptions = {}): Promise<string> {
  const { maxSize = 1280, type = "image/webp", quality = 0.82 } = opts;
  const img = await loadImageFromFile(file);
  let { width, height } = img;
  const scale = Math.min(1, maxSize / Math.max(width, height));
  const w = Math.max(1, Math.round(width * scale));
  const h = Math.max(1, Math.round(height * scale));
  const canvas = drawToCanvas(img, w, h);
  return canvas.toDataURL(type, quality);
}

export async function processAvatarImage(file: File, opts: ResizeOptions = {}): Promise<string> {
  const { maxSize = 256, type = "image/webp", quality = 0.9 } = opts;
  const img = await loadImageFromFile(file);
  const size = Math.min(img.width, img.height);
  const sx = Math.floor((img.width - size) / 2);
  const sy = Math.floor((img.height - size) / 2);
  // Crop to square on an intermediate canvas
  const crop = document.createElement("canvas");
  crop.width = size;
  crop.height = size;
  const cctx = crop.getContext("2d");
  if (!cctx) throw new Error("canvas_context");
  cctx.drawImage(img, sx, sy, size, size, 0, 0, size, size);
  // Resize to target
  const canvas = document.createElement("canvas");
  canvas.width = maxSize;
  canvas.height = maxSize;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas_context");
  ctx.drawImage(crop, 0, 0, maxSize, maxSize);
  return canvas.toDataURL(type, quality);
}
