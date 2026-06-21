// Dev-only image optimizer for the Akaya Serenity static site.
//
// Generates resized, compressed WebP (and a compressed PNG fallback) for the
// large source images used by the live pages. Run manually whenever source
// images change:
//
//   cd tools && npm install && npm run optimize:images
//
// Source PNGs are left untouched; outputs are written alongside them with a
// "-opt" suffix. Photographic images get a WebP + small JPEG fallback; the
// transparent logo gets a WebP + PNG fallback (to preserve alpha).
// akaya-launch.png is intentionally skipped (used only by the Coming Soon page).

import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs/promises';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const imagesDir = path.resolve(__dirname, '..', 'assets', 'images');

// width: target max width in px. quality values tune output size.
// hasAlpha images use a PNG fallback; photos use a smaller JPEG fallback.
const targets = [
  { file: 'hero-stream-lodge.png', width: 1600, webpQuality: 72, jpegQuality: 74 },
  { file: 'arecanut-grove.png', width: 1600, webpQuality: 72, jpegQuality: 74 },
  { file: 'lantern-deck.png', width: 1600, webpQuality: 72, jpegQuality: 74 },
  { file: 'akaya-brand-transparent.png', width: 600, webpQuality: 85, hasAlpha: true },
];

async function fileSize(p) {
  try {
    return (await fs.stat(p)).size;
  } catch {
    return 0;
  }
}

function kb(bytes) {
  return `${(bytes / 1024).toFixed(0)} KB`;
}

async function run() {
  let totalBefore = 0;
  let totalAfter = 0;

  for (const t of targets) {
    const src = path.join(imagesDir, t.file);
    if (!(await fileSize(src))) {
      console.warn(`! skip (missing): ${t.file}`);
      continue;
    }

    const base = t.file.replace(/\.png$/i, '');
    const outWebp = path.join(imagesDir, `${base}-opt.webp`);
    const fallbackExt = t.hasAlpha ? 'png' : 'jpg';
    const outFallback = path.join(imagesDir, `${base}-opt.${fallbackExt}`);

    const pipeline = sharp(src).resize({
      width: t.width,
      withoutEnlargement: true,
    });

    await pipeline
      .clone()
      .webp({ quality: t.webpQuality, effort: 6 })
      .toFile(outWebp);

    if (t.hasAlpha) {
      await pipeline
        .clone()
        .png({ compressionLevel: 9, quality: 80 })
        .toFile(outFallback);
    } else {
      await pipeline
        .clone()
        .flatten({ background: '#07140d' })
        .jpeg({ quality: t.jpegQuality, mozjpeg: true })
        .toFile(outFallback);
    }

    const before = await fileSize(src);
    const afterWebp = await fileSize(outWebp);
    const afterFallback = await fileSize(outFallback);
    totalBefore += before;
    totalAfter += afterWebp;

    console.log(
      `✓ ${t.file}: ${kb(before)} -> webp ${kb(afterWebp)}, ${fallbackExt} ${kb(afterFallback)}`
    );
  }

  console.log(
    `\nLCP/webp total: ${kb(totalBefore)} -> ${kb(totalAfter)} ` +
      `(${(100 - (totalAfter / totalBefore) * 100).toFixed(0)}% smaller)`
  );
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
