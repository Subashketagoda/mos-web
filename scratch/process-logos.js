const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Minimal pure JS PNG Decoder & Encoder for RGBA 8-bit
function decodePNG(buf) {
  let offset = 8; // skip signature
  let width, height, bitDepth, colorType;
  let idatChunks = [];

  while (offset < buf.length) {
    const length = buf.readUInt32BE(offset);
    const type = buf.toString('ascii', offset + 4, offset + 8);
    const data = buf.slice(offset + 8, offset + 8 + length);
    offset += 12 + length;

    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data.readUInt8(8);
      colorType = data.readUInt8(9);
    } else if (type === 'IDAT') {
      idatChunks.push(data);
    } else if (type === 'IEND') {
      break;
    }
  }

  const compressed = Buffer.concat(idatChunks);
  const decompressed = zlib.inflateSync(compressed);

  const stride = width * 4;
  const rawPixels = Buffer.alloc(width * height * 4);
  let srcPos = 0;
  let dstPos = 0;

  const prevRow = Buffer.alloc(stride);
  const currentRow = Buffer.alloc(stride);

  for (let y = 0; y < height; y++) {
    const filterType = decompressed[srcPos++];
    
    // Copy scanline
    for (let x = 0; x < stride; x++) {
      currentRow[x] = decompressed[srcPos++];
    }

    // Apply unfilter
    for (let x = 0; x < stride; x++) {
      const a = x >= 4 ? currentRow[x - 4] : 0;
      const b = prevRow[x];
      const c = x >= 4 ? prevRow[x - 4] : 0;

      let val = currentRow[x];
      if (filterType === 1) { // Sub
        val = (val + a) & 0xff;
      } else if (filterType === 2) { // Up
        val = (val + b) & 0xff;
      } else if (filterType === 3) { // Average
        val = (val + Math.floor((a + b) / 2)) & 0xff;
      } else if (filterType === 4) { // Paeth
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);
        let pr;
        if (pa <= pb && pa <= pc) pr = a;
        else if (pb <= pc) pr = b;
        else pr = c;
        val = (val + pr) & 0xff;
      }
      currentRow[x] = val;
      rawPixels[dstPos++] = val;
    }

    currentRow.copy(prevRow);
  }

  return { width, height, pixels: rawPixels };
}

function encodePNG(width, height, rawPixels) {
  // Unfiltered (filter type 0)
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

  // CRC32 calculation
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

// 1. Process 682x1024 Negombo image
const negomboFile = 'C:/Users/User/.gemini/antigravity-ide/brain/a7292eda-0e39-4947-9173-16598fdd356b/.user_uploaded/media_1788073363082.png';
const img = decodePNG(fs.readFileSync(negomboFile));
console.log('Decoded Negombo Image:', img.width, 'x', img.height);

// Extract transparent gold artwork
// Background is deep green roughly RGB (3, 40, 26) to (8, 48, 33)
// Gold artwork has high Red and Green (e.g. R > 120, G > 90, R > B + 30)
const transparentPixels = Buffer.alloc(img.width * img.height * 4);

let minX = img.width, maxX = 0, minY = img.height, maxY = 0;
// Monogram bounding box
let monoMinX = img.width, monoMaxX = 0, monoMinY = img.height, monoMaxY = 0;

for (let y = 0; y < img.height; y++) {
  for (let x = 0; x < img.width; x++) {
    const idx = (y * img.width + x) * 4;
    const r = img.pixels[idx];
    const g = img.pixels[idx + 1];
    const b = img.pixels[idx + 2];
    const a = img.pixels[idx + 3];

    // Background is dark green, gold has strong red component (R > 60 and R > B * 1.3)
    const isGold = (r > 70 && g > 55 && r > b * 1.25) || (r > 130);

    if (isGold && a > 20) {
      transparentPixels[idx] = r;
      transparentPixels[idx + 1] = g;
      transparentPixels[idx + 2] = b;
      
      // Calculate alpha based on luminance above background
      const lum = (r * 0.4 + g * 0.5 + b * 0.1);
      const alpha = Math.min(255, Math.max(0, Math.round((lum - 25) * 1.8)));
      transparentPixels[idx + 3] = alpha;

      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;

      // Monogram is top half of image (y < 520)
      if (y < 520) {
        if (x < monoMinX) monoMinX = x;
        if (x > monoMaxX) monoMaxX = x;
        if (y < monoMinY) monoMinY = y;
        if (y > monoMaxY) monoMaxY = y;
      }
    } else {
      transparentPixels[idx] = 0;
      transparentPixels[idx + 1] = 0;
      transparentPixels[idx + 2] = 0;
      transparentPixels[idx + 3] = 0;
    }
  }
}

console.log('Artwork Bounding Box:', { minX, maxX, minY, maxY });
console.log('Monogram Bounding Box:', { monoMinX, monoMaxX, monoMinY, monoMaxY });

// Crop transparent full logo
const pad = 24;
const cropX = Math.max(0, minX - pad);
const cropY = Math.max(0, minY - pad);
const cropW = Math.min(img.width - cropX, (maxX - minX) + pad * 2);
const cropH = Math.min(img.height - cropY, (maxY - minY) + pad * 2);

const croppedLogoPixels = Buffer.alloc(cropW * cropH * 4);
for (let y = 0; y < cropH; y++) {
  for (let x = 0; x < cropW; x++) {
    const srcIdx = ((cropY + y) * img.width + (cropX + x)) * 4;
    const dstIdx = (y * cropW + x) * 4;
    croppedLogoPixels[dstIdx] = transparentPixels[srcIdx];
    croppedLogoPixels[dstIdx + 1] = transparentPixels[srcIdx + 1];
    croppedLogoPixels[dstIdx + 2] = transparentPixels[srcIdx + 2];
    croppedLogoPixels[dstIdx + 3] = transparentPixels[srcIdx + 3];
  }
}

// Crop transparent monogram emblem
const mPad = 24;
const mCropX = Math.max(0, monoMinX - mPad);
const mCropY = Math.max(0, monoMinY - mPad);
const mCropW = Math.min(img.width - mCropX, (monoMaxX - monoMinX) + mPad * 2);
const mCropH = Math.min(img.height - mCropY, (monoMaxY - monoMinY) + mPad * 2);

const croppedMonoPixels = Buffer.alloc(mCropW * mCropH * 4);
for (let y = 0; y < mCropH; y++) {
  for (let x = 0; x < mCropW; x++) {
    const srcIdx = ((mCropY + y) * img.width + (mCropX + x)) * 4;
    const dstIdx = (y * mCropW + x) * 4;
    croppedMonoPixels[dstIdx] = transparentPixels[srcIdx];
    croppedMonoPixels[dstIdx + 1] = transparentPixels[srcIdx + 1];
    croppedMonoPixels[dstIdx + 2] = transparentPixels[srcIdx + 2];
    croppedMonoPixels[dstIdx + 3] = transparentPixels[srcIdx + 3];
  }
}

// Write cropped transparent PNGs
const outDir = path.join(process.cwd(), 'public', 'images');
fs.writeFileSync(path.join(outDir, 'mosphere-logo-gold.png'), encodePNG(cropW, cropH, croppedLogoPixels));
fs.writeFileSync(path.join(outDir, 'mosphere-emblem-gold.png'), encodePNG(mCropW, mCropH, croppedMonoPixels));
fs.writeFileSync(path.join(outDir, 'mosphere-logo.png'), encodePNG(cropW, cropH, croppedLogoPixels));
fs.writeFileSync(path.join(outDir, 'mosphere-negombo-emblem.png'), encodePNG(mCropW, mCropH, croppedMonoPixels));

console.log('✅ Generated crisp transparent gold logos & emblems in /public/images/');
