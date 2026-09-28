import fs from 'fs';
import zlib from 'zlib';

function createPNG(width, height, drawFn) {
  // RGBA buffer
  const buffer = Buffer.alloc(width * height * 4);
  drawFn(buffer, width, height);

  // PNG structure
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // 8 bits per channel
  ihdr.writeUInt8(6, 9); // RGBA
  ihdr.writeUInt8(0, 10); // deflate
  ihdr.writeUInt8(0, 11); // filter
  ihdr.writeUInt8(0, 12); // interlace

  const ihdrChunk = makeChunk('IHDR', ihdr);

  // Scanlines with filter byte 0
  const scanlines = Buffer.alloc(height * (width * 4 + 1));
  let srcOffset = 0;
  let dstOffset = 0;
  for (let y = 0; y < height; y++) {
    scanlines[dstOffset++] = 0; // Filter None
    buffer.copy(scanlines, dstOffset, srcOffset, srcOffset + width * 4);
    dstOffset += width * 4;
    srcOffset += width * 4;
  }

  const compressed = zlib.deflateSync(scanlines, { level: 9 });
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(len + 12);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);

  const crcVal = crc32(chunk.subarray(4, 8 + len));
  chunk.writeUInt32BE(crcVal >>> 0, 8 + len);
  return chunk;
}

// Simple CRC32 table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) c = 0xedb88320 ^ (c >>> 1);
    else c = c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function drawIcon(buffer, width, height, isMaskable = false) {
  const cx = width / 2;
  const cy = height / 2;
  const maxR = isMaskable ? width * 0.38 : width * 0.44;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.hypot(dx, dy);

      // Background: Deep dark arcade slate/indigo
      let r = 15;
      let g = 23;
      let b = 42;
      let a = 255;

      // Slice blade trail across diagonal
      const trailDist = Math.abs(dx + dy) / 1.414;
      if (trailDist < width * 0.08) {
        const glow = 1 - (trailDist / (width * 0.08));
        r = Math.min(255, r + Math.floor(glow * 80));
        g = Math.min(255, g + Math.floor(glow * 200));
        b = Math.min(255, b + Math.floor(glow * 255));
      }

      // Watermelon half 1 (upper-left)
      const dist1 = Math.hypot(dx + 12 * (width / 256), dy + 16 * (height / 256));
      if (dist1 < maxR && dy < -dx - 8 * (width / 256)) {
        if (dist1 > maxR * 0.88) {
          // Green rind
          r = 34; g = 197; b = 94;
        } else if (dist1 > maxR * 0.80) {
          // Yellow-white rind layer
          r = 254; g = 240; b = 138;
        } else {
          // Juicy red flesh
          r = 244; g = 63; b = 94;
          // Seeds
          if (dist1 > maxR * 0.45 && dist1 < maxR * 0.58 && Math.sin(Math.atan2(dy, dx) * 6) > 0.85) {
            r = 24; g = 24; b = 27;
          }
        }
      }

      // Watermelon half 2 (lower-right)
      const dist2 = Math.hypot(dx - 14 * (width / 256), dy - 18 * (height / 256));
      if (dist2 < maxR && dy > -dx + 8 * (width / 256)) {
        if (dist2 > maxR * 0.88) {
          // Green rind
          r = 34; g = 197; b = 94;
        } else if (dist2 > maxR * 0.80) {
          // Yellow-white rind layer
          r = 254; g = 240; b = 138;
        } else {
          // Juicy red flesh
          r = 244; g = 63; b = 94;
          // Seeds
          if (dist2 > maxR * 0.45 && dist2 < maxR * 0.58 && Math.sin(Math.atan2(dy, dx) * 6) > 0.85) {
            r = 24; g = 24; b = 27;
          }
        }
      }

      // Splashes
      if ((Math.hypot(dx - 60 * (width / 256), dy + 40 * (height / 256)) < width * 0.04) ||
          (Math.hypot(dx + 50 * (width / 256), dy - 50 * (height / 256)) < width * 0.035)) {
        r = 244; g = 63; b = 94;
      }

      buffer[idx] = r;
      buffer[idx + 1] = g;
      buffer[idx + 2] = b;
      buffer[idx + 3] = a;
    }
  }
}

const publicDir = './public';
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(`${publicDir}/pwa-192x192.png`, createPNG(192, 192, (buf, w, h) => drawIcon(buf, w, h, false)));
fs.writeFileSync(`${publicDir}/pwa-512x512.png`, createPNG(512, 512, (buf, w, h) => drawIcon(buf, w, h, false)));
fs.writeFileSync(`${publicDir}/pwa-maskable-512x512.png`, createPNG(512, 512, (buf, w, h) => drawIcon(buf, w, h, true)));
fs.writeFileSync(`${publicDir}/apple-touch-icon.png`, createPNG(180, 180, (buf, w, h) => drawIcon(buf, w, h, false)));
console.log('Successfully generated PWA icon PNGs in ./public!');

