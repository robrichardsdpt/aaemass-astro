// node scripts/make-icons.mjs : writes the site's icons from src/assets/seal.png into public/.
//   favicon.ico          16, 32 and 48px images in one file (PNG inside an ICO). Each size is drawn straight from the source,
//                        not shrunk by the browser from one big image, so the tab icon stays crisp; about 5 KB in all.
//   apple-touch-icon.png 180x180 on white with room around the seal (iOS fills transparent areas with black and rounds the corners).
// Re-run it if the seal changes, and commit the results.
import fs from 'node:fs';
import sharp from 'sharp';

const src = 'src/assets/seal.png';
const clear = { r: 0, g: 0, b: 0, alpha: 0 };
const white = { r: 255, g: 255, b: 255, alpha: 1 };
const square = (size, background) => sharp(src).resize(size, size, { fit: 'contain', background });

// Small sizes get a little sharpening: the thin ring and lettering soften when a picture is reduced this far.
const sizes = [
  { px: 16, sharpen: { sigma: 0.5, m1: 1.2, m2: 2 } },
  { px: 32, sharpen: { sigma: 0.5, m1: 1, m2: 1.5 } },
  { px: 48, sharpen: undefined },
];
const images = [];
for (const { px, sharpen } of sizes) {
  let p = square(px, clear);
  if (sharpen) p = p.sharpen(sharpen);
  images.push({ px, data: await p.png({ compressionLevel: 9 }).toBuffer() });
}

// ICO = 6-byte header + one 16-byte directory entry per image + the image data.
const header = Buffer.alloc(6 + 16 * images.length);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(images.length, 4);
let offset = header.length;
images.forEach(({ px, data }, i) => {
  const at = 6 + 16 * i;
  header.writeUInt8(px, at); // width
  header.writeUInt8(px, at + 1); // height
  header.writeUInt8(0, at + 2); // palette colours
  header.writeUInt8(0, at + 3);
  header.writeUInt16LE(1, at + 4); // colour planes
  header.writeUInt16LE(32, at + 6); // bits per pixel
  header.writeUInt32LE(data.length, at + 8);
  header.writeUInt32LE(offset, at + 12);
  offset += data.length;
});
fs.writeFileSync('public/favicon.ico', Buffer.concat([header, ...images.map((i) => i.data)]));

// The seal fills 82% of the square, so the rounded corners iOS applies never touch its ring.
const inner = await sharp(src).resize(148, 148, { fit: 'contain', background: clear }).png().toBuffer();
const touch = await sharp({ create: { width: 180, height: 180, channels: 4, background: white } })
  .composite([{ input: inner, gravity: 'centre' }])
  .png({ compressionLevel: 9 })
  .toBuffer();
fs.writeFileSync('public/apple-touch-icon.png', touch);
console.log(`favicon.ico ${offset} bytes (${images.map((i) => i.px).join(', ')} px), apple-touch-icon.png ${touch.length} bytes`);
