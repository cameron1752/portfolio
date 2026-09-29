const SIZE = 28;
const BOX = 20;

export function preprocess(sourceCanvas) {
  const { width, height } = sourceCanvas;
  const src = sourceCanvas.getContext('2d').getImageData(0, 0, width, height).data;

  // 1. bounding box of the drawn pixels
  let minX = width, minY = height, maxX = -1, maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (src[(y * width + x) * 4] > 20) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) return null; // nothing drawn

  // 2. scale the digit to fit a 20x20 box, keeping its proportions
  const boxW = maxX - minX + 1;
  const boxH = maxY - minY + 1;
  const scale = BOX / Math.max(boxW, boxH);
  const w = boxW * scale;
  const h = boxH * scale;

  const small = document.createElement('canvas');
  small.width = SIZE;
  small.height = SIZE;
  const ctx = small.getContext('2d');
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, SIZE, SIZE);
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(sourceCanvas, minX, minY, boxW, boxH, (SIZE - w) / 2, (SIZE - h) / 2, w, h);

  const data = ctx.getImageData(0, 0, SIZE, SIZE).data;
  const pixels = new Array(SIZE * SIZE);
  for (let i = 0; i < pixels.length; i++) pixels[i] = data[i * 4] / 255;

  // 3. shift so the center of mass sits in the middle
  let sum = 0, cx = 0, cy = 0;
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const v = pixels[y * SIZE + x];
      sum += v;
      cx += x * v;
      cy += y * v;
    }
  }
  const dx = Math.round(SIZE / 2 - cx / sum);
  const dy = Math.round(SIZE / 2 - cy / sum);

  const centered = new Array(SIZE * SIZE).fill(0);
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const nx = x + dx, ny = y + dy;
      if (nx >= 0 && nx < SIZE && ny >= 0 && ny < SIZE) {
        centered[ny * SIZE + nx] = pixels[y * SIZE + x];
      }
    }
  }
  return centered; // 784 values, 0 to 1, row-major, white on black
}