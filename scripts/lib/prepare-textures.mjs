import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { validateImage } from './polyhaven.mjs';

// Data maps remain numerical (no gamma/colour transforms); PNG keeps channels lossless.
// Normal vectors are renormalized by the material shader after interpolation.
export async function prepareMaterial(entry, target) {
  for (const [kind, file] of Object.entries(entry.maps)) {
    if (kind === 'displacement') continue;
    const input = await fs.readFile(path.join(target, file.file));
    file.variants = {};
    for (const [quality, max] of Object.entries({ baixo: 512, medio: 1024, alto: kind === 'color' ? 2048 : 1024 })) {
      const pixels = Math.min(max, Math.max(file.width, file.height));
      const relative = `${entry.id}/${kind}_browser_${pixels}.png`;
      const destination = path.join(target, relative);
      const converted = await sharp(input, { failOn: 'error' }).resize({ width: pixels, height: pixels, fit: 'inside', withoutEnlargement: true }).png({ compressionLevel: 9, palette: false }).toBuffer();
      const checks = validateImage(converted);
      await fs.writeFile(destination + '.part', converted); await fs.rename(destination + '.part', destination);
      file.variants[quality] = { file: relative, url: `/assets/polyhaven/${relative}`, ...checks };
    }
  }
  return entry;
}
