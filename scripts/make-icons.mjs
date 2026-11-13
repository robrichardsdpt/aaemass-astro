// node scripts/make-icons.mjs : writes the site's icons from src/assets/seal.png into public/.
//   favicon.ico          48x48 PNG inside an ICO (what browsers and crawlers ask for; about 3 KB)
//   apple-touch-icon.png 180x180 on white (iOS fills transparent areas with black; only fetched by "Add to Home Screen")
// Re-run it if the seal changes, and commit the results.
import fs from 'node:fs';
import sharp from 'sharp';

const src = 'src/assets/seal.png';
const square = (size, background) => sharp(src).resize(size, size, { fit: 'contain', background });

const png48 = await square(48, { r: 0, g: 0, b: 0, alpha: 0 }).png({ compressionLevel: 9, palette: true }).toBuffer();
// ICO = 6-byte header + one 16-byte directory entry + the PNG image data.
const ico = Buffer.alloc(22);
ico.writeUInt16LE(0, 0); // reserved
ico.writeUInt16LE(1, 2); // type: icon
ico.writeUInt16LE(1, 4); // one image
ico.writeUInt8(48, 6); // width
ico.writeUInt8(48, 7); // height
ico.writeUInt8(0, 8); // palette colours
ico.writeUInt8(0, 9);
ico.writeUInt16LE(1, 10); // colour planes
ico.writeUInt16LE(32, 12); // bits per pixel
ico.writeUInt32LE(png48.length, 14); // image size
ico.writeUInt32LE(22, 18); // image offset
fs.writeFileSync('public/favicon.ico', Buffer.concat([ico, png48]));

const touch = await square(180, { r: 255, g: 255, b: 255, alpha: 1 }).png({ compressionLevel: 9 }).toBuffer();
fs.writeFileSync('public/apple-touch-icon.png', touch);
console.log(`favicon.ico ${ico.length + png48.length} bytes, apple-touch-icon.png ${touch.length} bytes`);
