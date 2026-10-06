import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createPNG(width, height, drawFn) {
  // RGBA buffer (width * height * 4)
  const buffer = Buffer.alloc(width * height * 4);
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = drawFn(x, y, width, height);
      const idx = (y * width + x) * 4;
      buffer[idx] = r;
      buffer[idx + 1] = g;
      buffer[idx + 2] = b;
      buffer[idx + 3] = a;
    }
  }

  // PNG filter type 0 (None) for each scanline
  const scanlines = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    scanlines[y * (1 + width * 4)] = 0; // Filter byte: None
    buffer.copy(scanlines, y * (1 + width * 4) + 1, y * width * 4, (y + 1) * width * 4);
  }

  const compressed = zlib.deflateSync(scanlines, { level: 9 });

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type 6: RGBA
  ihdr[10] = 0; // compression method
  ihdr[11] = 0; // filter method
  ihdr[12] = 0; // interlace method

  function createChunk(type, data) {
    const len = data.length;
    const chunk = Buffer.alloc(4 + 4 + len + 4);
    chunk.writeUInt32BE(len, 0);
    chunk.write(type, 4);
    data.copy(chunk, 8);
    const crc = crc32(Buffer.concat([Buffer.from(type), data]));
    chunk.writeUInt32BE(crc, 8 + len);
    return chunk;
  }

  function crc32(buf) {
    let crc = 0 ^ (-1);
    for (let i = 0; i < buf.length; i++) {
      crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
    }
    return (crc ^ (-1)) >>> 0;
  }

  const table = (() => {
    const t = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let k = 0; k < 8; k++) {
        c = ((c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1));
      }
      t[i] = c >>> 0;
    }
    return t;
  })();

  const ihdrChunk = createChunk('IHDR', ihdr);
  const idatChunk = createChunk('IDAT', compressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Drawing function for finance/cash icon
function drawIcon(x, y, width, height, isMaskable = false) {
  const nx = x / width;
  const ny = y / height;
  const cx = 0.5;
  const cy = 0.5;
  const dx = nx - cx;
  const dy = ny - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Background shape
  // For standard icon: squircle/rounded rect or circle
  let inBg = false;
  if (isMaskable) {
    inBg = true;
  } else {
    // Rounded rect with radius 0.22
    const pad = 0.05;
    const rad = 0.22;
    const qx = Math.max(0, Math.abs(nx - 0.5) - (0.5 - pad - rad));
    const qy = Math.max(0, Math.abs(ny - 0.5) - (0.5 - pad - rad));
    const d = Math.sqrt(qx * qx + qy * qy);
    inBg = (d <= rad);
  }

  if (!inBg) {
    return [0, 0, 0, 0]; // Transparent
  }

  // Base background gradient: Indigo/Blue #1d4ed8 to #2563eb to #0284c7
  const grad = (nx + ny) * 0.5;
  let bgR = Math.round(29 * (1 - grad) + 37 * grad);
  let bgG = Math.round(78 * (1 - grad) + 99 * grad);
  let bgB = Math.round(216 * (1 - grad) + 235 * grad);

  // Wallet / Safe / Cash emblem design
  // 1. Central Wallet Body: rect from x: 0.24 to 0.76, y: 0.32 to 0.72 with corner radius
  const wx1 = 0.24, wx2 = 0.76, wy1 = 0.32, wy2 = 0.70;
  const wrad = 0.06;
  const inWallet = (
    nx >= wx1 && nx <= wx2 && ny >= wy1 && ny <= wy2 &&
    (nx >= wx1 + wrad || nx <= wx2 - wrad || ny >= wy1 + wrad || ny <= wy2 - wrad ||
     Math.hypot(nx - (nx < 0.5 ? wx1 + wrad : wx2 - wrad), ny - (ny < 0.5 ? wy1 + wrad : wy2 - wrad)) <= wrad)
  );

  // 2. Cash Note protruding top: x: 0.32 to 0.68, y: 0.22 to 0.36
  const inCash = (
    nx >= 0.32 && nx <= 0.68 && ny >= 0.22 && ny <= 0.34 &&
    Math.hypot(nx - 0.5, ny - 0.28) > 0.01 // subtle texture
  );

  // 3. Wallet Flap / Band & Golden clasp
  const inFlap = (
    nx >= 0.54 && nx <= 0.78 && ny >= 0.44 && ny <= 0.58 &&
    (nx <= 0.72 || Math.hypot(nx - 0.72, ny - 0.51) <= 0.07)
  );

  const inClasp = (Math.hypot(nx - 0.70, ny - 0.51) <= 0.032);
  const inClaspHole = (Math.hypot(nx - 0.70, ny - 0.51) <= 0.012);

  // 4. Up/Down exchange arrows or currency badge
  const inCoin = (Math.hypot(nx - 0.40, ny - 0.51) <= 0.09);
  const inCoinInner = (Math.hypot(nx - 0.40, ny - 0.51) <= 0.07);

  if (inClasp) {
    if (inClaspHole) return [217, 119, 6, 255]; // Amber dark
    return [251, 191, 36, 255]; // Gold
  }

  if (inFlap) {
    return [30, 58, 138, 255]; // Deep navy flap
  }

  if (inCoin) {
    if (inCoinInner) {
      // Egyptian pound symbol / currency symbol 'EGP' or stylized currency line
      const inSymbol = (Math.abs(nx - 0.40) <= 0.012 && ny >= 0.46 && ny <= 0.56) ||
                       (Math.abs(ny - 0.48) <= 0.012 && nx >= 0.36 && nx <= 0.44) ||
                       (Math.abs(ny - 0.54) <= 0.012 && nx >= 0.36 && nx <= 0.44);
      if (inSymbol) return [255, 255, 255, 255];
      return [16, 185, 129, 255]; // Emerald
    }
    return [255, 255, 255, 240];
  }

  if (inCash) {
    // Green bill
    const isEdge = (nx <= 0.33 || nx >= 0.67 || ny <= 0.23);
    if (isEdge) return [209, 250, 229, 255];
    return [52, 211, 153, 255]; // Emerald-400
  }

  if (inWallet) {
    // Card highlight top edge
    if (ny < wy1 + 0.015) return [255, 255, 255, 230];
    return [255, 255, 255, 255]; // Clean white card
  }

  return [bgR, bgG, bgB, 255];
}

const outDir = path.resolve('public/icons');
fs.mkdirSync(outDir, { recursive: true });

// 192x192
const png192 = createPNG(192, 192, (x, y, w, h) => drawIcon(x, y, w, h, false));
fs.writeFileSync(path.join(outDir, 'icon-192.png'), png192);
fs.writeFileSync(path.resolve('public/icon-192.png'), png192);

// 512x512
const png512 = createPNG(512, 512, (x, y, w, h) => drawIcon(x, y, w, h, false));
fs.writeFileSync(path.join(outDir, 'icon-512.png'), png512);
fs.writeFileSync(path.resolve('public/icon-512.png'), png512);

// 512x512 Maskable
const pngMaskable = createPNG(512, 512, (x, y, w, h) => drawIcon(x, y, w, h, true));
fs.writeFileSync(path.join(outDir, 'icon-512-maskable.png'), pngMaskable);
fs.writeFileSync(path.resolve('public/icon-512-maskable.png'), pngMaskable);

console.log('Successfully generated PWA icons!');
