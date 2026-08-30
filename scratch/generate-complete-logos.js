const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function encodePNG(width, height, rawPixels) {
  const stride = width * 4;
  const filtered = Buffer.alloc(height * (stride + 1));
  let srcPos = 0;
  let dstPos = 0;

  for (let y = 0; y < height; y++) {
    filtered[dstPos++] = 0;
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
  ihdrData.writeUInt8(8, 8);
  ihdrData.writeUInt8(6, 9);
  ihdrData.writeUInt8(0, 10);
  ihdrData.writeUInt8(0, 11);
  ihdrData.writeUInt8(0, 12);

  const ihdr = makeChunk('IHDR', ihdrData);
  const idat = makeChunk('IDAT', compressed);
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

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
    } else if (type === 'IDAT') idatChunks.push(data);
    else if (type === 'IEND') break;
  }
  const decompressed = zlib.inflateSync(Buffer.concat(idatChunks));
  const stride = width * 4;
  const rawPixels = Buffer.alloc(width * height * 4);
  let srcPos = 0, dstPos = 0;
  const prevRow = Buffer.alloc(stride);
  const currentRow = Buffer.alloc(stride);
  for (let y = 0; y < height; y++) {
    const filterType = decompressed[srcPos++];
    for (let x = 0; x < stride; x++) currentRow[x] = decompressed[srcPos++];
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
        const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
        val = (val + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c)) & 0xff;
      }
      currentRow[x] = val;
      rawPixels[dstPos++] = val;
    }
    currentRow.copy(prevRow);
  }
  return { width, height, pixels: rawPixels };
}

const negomboFile = 'C:/Users/User/.gemini/antigravity-ide/brain/a7292eda-0e39-4947-9173-16598fdd356b/.user_uploaded/media_1788073363082.png';
const img = decodePNG(fs.readFileSync(negomboFile));

// 1. FULL LOGO: Crop from y = 300 to 625 (Monogram + MOSPHERE + GRAB LIFE)
const minX = 110, maxX = 560, minY = 305, maxY = 620;
const cropW = (maxX - minX);
const cropH = (maxY - minY);

const fullTransparent = Buffer.alloc(cropW * cropH * 4);

for (let y = 0; y < cropH; y++) {
  for (let x = 0; x < cropW; x++) {
    const srcX = minX + x;
    const srcY = minY + y;
    const srcIdx = (srcY * img.width + srcX) * 4;
    const dstIdx = (y * cropW + x) * 4;

    const r = img.pixels[srcIdx];
    const g = img.pixels[srcIdx + 1];
    const b = img.pixels[srcIdx + 2];
    const a = img.pixels[srcIdx + 3];

    // Background is dark green roughly (5, 42, 28)
    // Gold letters and monogram have strong red and green
    const isGold = (r > 60 && g > 50 && r > b * 1.15) || (r > 120);

    if (isGold) {
      fullTransparent[dstIdx] = r;
      fullTransparent[dstIdx + 1] = g;
      fullTransparent[dstIdx + 2] = b;
      const lum = (r * 0.45 + g * 0.45 + b * 0.1);
      const alpha = Math.min(255, Math.max(0, Math.round((lum - 20) * 1.9)));
      fullTransparent[dstIdx + 3] = alpha;
    } else {
      fullTransparent[dstIdx] = 0;
      fullTransparent[dstIdx + 1] = 0;
      fullTransparent[dstIdx + 2] = 0;
      fullTransparent[dstIdx + 3] = 0;
    }
  }
}

// 2. MONOGRAM ONLY (y = 305 to 505)
const monoMinY = 305, monoMaxY = 505;
const monoH = monoMaxY - monoMinY;
const monoTransparent = Buffer.alloc(cropW * monoH * 4);
for (let y = 0; y < monoH; y++) {
  for (let x = 0; x < cropW; x++) {
    const srcIdx = (y * cropW + x) * 4;
    const dstIdx = (y * cropW + x) * 4;
    monoTransparent[dstIdx] = fullTransparent[srcIdx];
    monoTransparent[dstIdx + 1] = fullTransparent[srcIdx + 1];
    monoTransparent[dstIdx + 2] = fullTransparent[srcIdx + 2];
    monoTransparent[dstIdx + 3] = fullTransparent[srcIdx + 3];
  }
}

const outDir = path.join(process.cwd(), 'public', 'images');

// Save FULL complete logos (Monogram + MOSPHERE + GRAB LIFE)
fs.writeFileSync(path.join(outDir, 'mosphere-full-logo-gold.png'), encodePNG(cropW, cropH, fullTransparent));
fs.writeFileSync(path.join(outDir, 'mosphere-logo.png'), encodePNG(cropW, cropH, fullTransparent));
fs.writeFileSync(path.join(outDir, 'mosphere-logo-gold.png'), encodePNG(cropW, cropH, fullTransparent));

// Save standalone Monogram Emblem with padding
fs.writeFileSync(path.join(outDir, 'mosphere-emblem-gold.png'), encodePNG(cropW, monoH, monoTransparent));

// Save uncropped full card of Negombo
const origBuf = fs.readFileSync(negomboFile);
fs.writeFileSync(path.join(outDir, 'mosphere-negombo-full.png'), origBuf);
fs.writeFileSync(path.join(outDir, 'mosphere-negombo-logo.png'), origBuf);

console.log('✅ Generated 100% complete Full Logos (Monogram + MOSPHERE + GRAB LIFE) and Monogram Emblems!');
