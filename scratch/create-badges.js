const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Reuse our pure JS PNG encoder
function encodePNG(width, height, rawPixels) {
  const stride = width * 4;
  const filtered = Buffer.alloc(height * (stride + 1));
  let srcPos = 0;
  let dstPos = 0;

  for (let y = 0; y < height; y++) {
    filtered[dstPos++] = 0; // Filter 0
    rawPixels.copy(filtered, dstPos, srcPos, srcPos + stride);
    dstPos += stride;
    srcPos += stride;
  }

  const compressed = zlib.deflateSync(filtered);

  const crcTable = [];
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

  function makeChunk(type, data) {
    const typeBuf = Buffer.from(type, 'ascii');
    const lenBuf = Buffer.alloc(4);
    lenBuf.writeUInt32BE(data.length, 0);

    const toCrc = Buffer.concat([typeBuf, data]);
    const crcVal = crc32(toCrc);
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crcVal, 0);

    return Buffer.concat([lenBuf, toCrc, crcBuf]);
  }

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // 8-bit
  ihdrData.writeUInt8(6, 9); // RGBA
  ihdrData.writeUInt8(0, 10);
  ihdrData.writeUInt8(0, 11);
  ihdrData.writeUInt8(0, 12);

  const ihdr = makeChunk('IHDR', ihdrData);
  const idat = makeChunk('IDAT', compressed);
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

// Decode PNG
function decodePNG(buf) {
  let offset = 8;
  let width, height;
  let idatChunks = [];

  while (offset < buf.length) {
    const length = buf.readUInt32BE(offset);
    const type = buf.toString('ascii', offset + 4, offset + 8);
    const data = buf.slice(offset + 8, offset + 8 + length);
    offset += 12 + length;

    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
    } else if (type === 'IDAT') {
      idatChunks.push(data);
    } else if (type === 'IEND') {
      break;
    }
  }

  const decompressed = zlib.inflateSync(Buffer.concat(idatChunks));
  const stride = width * 4;
  const rawPixels = Buffer.alloc(width * height * 4);
  let srcPos = 0;
  let dstPos = 0;

  const prevRow = Buffer.alloc(stride);
  const currentRow = Buffer.alloc(stride);

  for (let y = 0; y < height; y++) {
    const filterType = decompressed[srcPos++];
    for (let x = 0; x < stride; x++) {
      currentRow[x] = decompressed[srcPos++];
    }
    for (let x = 0; x < stride; x++) {
      const a = x >= 4 ? currentRow[x - 4] : 0;
      const b = prevRow[x];
      const c = x >= 4 ? prevRow[x - 4] : 0;
      let val = currentRow[x];
      if (filterType === 1) val = (val + a) & 0xff;
      else if (filterType === 2) val = (val + b) & 0xff;
      else if (filterType === 3) val = (val + Math.floor((a + b) / 2)) & 0xff;
      else if (filterType === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);
        val = (val + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c)) & 0xff;
      }
      currentRow[x] = val;
      rawPixels[dstPos++] = val;
    }
    currentRow.copy(prevRow);
  }

  return { width, height, pixels: rawPixels };
}

// 1. Create square Negombo card with beautiful pine background and centered gold artwork
const fullLogo = decodePNG(fs.readFileSync('public/images/mosphere-logo-gold.png'));
console.log('Transparent Logo Size:', fullLogo.width, 'x', fullLogo.height);

// Square Negombo Card (e.g. 520x520)
const sqSize = 520;
const negomboSq = Buffer.alloc(sqSize * sqSize * 4);

// Fill with luxurious deep pine green gradient (#062A1D to #02180F) with rounded border
const startX = Math.floor((sqSize - fullLogo.width) / 2);
const startY = Math.floor((sqSize - fullLogo.height) / 2);

for (let y = 0; y < sqSize; y++) {
  for (let x = 0; x < sqSize; x++) {
    const idx = (y * sqSize + x) * 4;
    // Radial gradient from center (#073625) to edge (#031A12)
    const dx = (x - sqSize / 2) / (sqSize / 2);
    const dy = (y - sqSize / 2) / (sqSize / 2);
    const dist = Math.min(1, Math.sqrt(dx * dx + dy * dy));

    const r = Math.round(7 * (1 - dist) + 3 * dist);
    const g = Math.round(50 * (1 - dist) + 24 * dist);
    const b = Math.round(35 * (1 - dist) + 16 * dist);

    negomboSq[idx] = r;
    negomboSq[idx + 1] = g;
    negomboSq[idx + 2] = b;
    negomboSq[idx + 3] = 255;
  }
}

// Blend transparent gold logo into the center
for (let y = 0; y < fullLogo.height; y++) {
  for (let x = 0; x < fullLogo.width; x++) {
    const srcIdx = (y * fullLogo.width + x) * 4;
    const dstIdx = ((startY + y) * sqSize + (startX + x)) * 4;

    const alpha = fullLogo.pixels[srcIdx + 3] / 255;
    if (alpha > 0) {
      const srcR = fullLogo.pixels[srcIdx];
      const srcG = fullLogo.pixels[srcIdx + 1];
      const srcB = fullLogo.pixels[srcIdx + 2];

      const bgR = negomboSq[dstIdx];
      const bgG = negomboSq[dstIdx + 1];
      const bgB = negomboSq[dstIdx + 2];

      negomboSq[dstIdx] = Math.round(srcR * alpha + bgR * (1 - alpha));
      negomboSq[dstIdx + 1] = Math.round(srcG * alpha + bgG * (1 - alpha));
      negomboSq[dstIdx + 2] = Math.round(srcB * alpha + bgB * (1 - alpha));
    }
  }
}

// Save square Negombo badge
fs.writeFileSync('public/images/mosphere-negombo-badge.png', encodePNG(sqSize, sqSize, negomboSq));
fs.writeFileSync('public/images/mosphere-negombo-logo.png', encodePNG(sqSize, sqSize, negomboSq));

console.log('✅ Generated polished square Negombo badge and logo!');
