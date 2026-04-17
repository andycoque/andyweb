/**
 * Generates WebP companions for large raster heroes (optional — skips if sharp fails).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

let sharp;
try {
  sharp = (await import('sharp')).default;
} catch {
  console.warn('optimize-images: sharp not available, skipping WebP generation');
  process.exit(0);
}

const jobs = [
  // Hero images
  ['BNLP/Hero card.jpg', 'BNLP/Hero card.webp'],
  ['Designing Payments/Payments hero.jpg', 'Designing Payments/Payments hero.webp'],
  ['Designing Payments/Payments hero HomeThumb.jpg', 'Designing Payments/Payments hero HomeThumb.webp'],
  ['Lighter Thoughts/Hero-card.png', 'Lighter Thoughts/Hero-card.webp'],
  ['Lighter Thoughts/Thumbnail.png', 'Lighter Thoughts/Thumbnail.webp'],
  ['Lighter Thoughts/Card.png', 'Lighter Thoughts/Card.webp'],

  // BNPL carousel + detail
  ['BNLP/Carrousel 1.jpg', 'BNLP/Carrousel 1.webp'],
  ['BNLP/Carrousel 2.jpg', 'BNLP/Carrousel 2.webp'],
  ['BNLP/Carrousel 3.jpg', 'BNLP/Carrousel 3.webp'],
  ['BNLP/Final MVP.jpeg', 'BNLP/Final MVP.webp'],
  ['BNLP/hero BNPL.jpeg', 'BNLP/hero BNPL.webp'],

  // Designing Payments carousel + detail
  ['Designing Payments/Payments Carrousel 1.png', 'Designing Payments/Payments Carrousel 1.webp'],
  ['Designing Payments/Payments Carrousel 2.png', 'Designing Payments/Payments Carrousel 2.webp'],
  ['Designing Payments/Payments Carrousel 3.png', 'Designing Payments/Payments Carrousel 3.webp'],
  ['Designing Payments/New regulation.png', 'Designing Payments/New regulation.webp'],
  ['Designing Payments/New alias types.png', 'Designing Payments/New alias types.webp'],
  ['Designing Payments/Cash-in +1.png', 'Designing Payments/Cash-in +1.webp'],
  ['Designing Payments/Cash-in +2.png', 'Designing Payments/Cash-in +2.webp'],
  ['Designing Payments/Singel use 1.png', 'Designing Payments/Singel use 1.webp'],
  ['Designing Payments/Singel use 2.png', 'Designing Payments/Singel use 2.webp'],
  ['Designing Payments/alias diagram.png', 'Designing Payments/alias diagram.webp'],

  // Lighter Thoughts carousel + detail
  ['Lighter Thoughts/LT carrousel 1.png', 'Lighter Thoughts/LT carrousel 1.webp'],
  ['Lighter Thoughts/LT carrousel 2.png', 'Lighter Thoughts/LT carrousel 2.webp'],
  ['Lighter Thoughts/LT carrousel 3.png', 'Lighter Thoughts/LT carrousel 3.webp'],
  ['Lighter Thoughts/Goals and rewards.png', 'Lighter Thoughts/Goals and rewards.webp'],
  ['Lighter Thoughts/Share a thought.png', 'Lighter Thoughts/Share a thought.webp'],
  ['Lighter Thoughts/Tap to reach.png', 'Lighter Thoughts/Tap to reach.webp'],
  ['Lighter Thoughts/Double tap to open.png', 'Lighter Thoughts/Double tap to open.webp'],
];

// Special jobs: OG image resized to social-media spec (1200x630) for smaller byte weight.
const ogJobs = [
  ['ichiban.jpeg', 'ichiban-og.jpg', { width: 1200, height: 630, format: 'jpeg', quality: 78 }],
  ['ichiban.jpeg', 'ichiban-og.webp', { width: 1200, height: 630, format: 'webp', quality: 80 }],
];

for (const [relIn, relOut] of jobs) {
  const input = path.join(root, relIn);
  const output = path.join(root, relOut);
  if (!fs.existsSync(input)) continue;
  try {
    await sharp(input).webp({ quality: 82 }).toFile(output);
    console.log('Wrote', relOut);
  } catch (err) {
    console.warn('optimize-images: skip', relIn, err.message);
  }
}

for (const [relIn, relOut, opts] of ogJobs) {
  const input = path.join(root, relIn);
  const output = path.join(root, relOut);
  if (!fs.existsSync(input)) continue;
  try {
    let pipe = sharp(input).resize(opts.width, opts.height, { fit: 'cover' });
    if (opts.format === 'webp') pipe = pipe.webp({ quality: opts.quality });
    else pipe = pipe.jpeg({ quality: opts.quality, mozjpeg: true });
    await pipe.toFile(output);
    console.log('Wrote', relOut);
  } catch (err) {
    console.warn('optimize-images: skip', relIn, err.message);
  }
}
