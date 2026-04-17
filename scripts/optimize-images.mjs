/**
 * Image optimization pipeline.
 *
 * Generates:
 *  - WebP companion for every raster source (quality 82).
 *  - AVIF companion for every raster source (quality 55 ≈ webp q82 with ~30% less weight).
 *  - Responsive @640 and @1024 variants for hero + carousel images.
 *  - Resized OG image (1200x630) from ichiban.jpeg.
 *
 * Skips silently if sharp is not available.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

let sharp;
try {
  sharp = (await import('sharp')).default;
} catch {
  console.warn('optimize-images: sharp not available, skipping generation');
  process.exit(0);
}

// [inputPath, baseOutputPath (without extension)]
// baseOutputPath without extension — we derive .webp, .avif from it.
const jobs = [
  // Hero images (responsive sizes useful)
  ['BNLP/Hero card.jpg', 'BNLP/Hero card', { responsive: true }],
  ['Designing Payments/Payments hero.jpg', 'Designing Payments/Payments hero', { responsive: true }],
  ['Designing Payments/Payments hero HomeThumb.jpg', 'Designing Payments/Payments hero HomeThumb', {}],
  ['Lighter Thoughts/Hero-card.png', 'Lighter Thoughts/Hero-card', { responsive: true }],
  ['Lighter Thoughts/Thumbnail.png', 'Lighter Thoughts/Thumbnail', {}],
  ['Lighter Thoughts/Card.png', 'Lighter Thoughts/Card', {}],

  // BNPL carousel (responsive) + detail
  ['BNLP/Carrousel 1.jpg', 'BNLP/Carrousel 1', { responsive: true }],
  ['BNLP/Carrousel 2.jpg', 'BNLP/Carrousel 2', { responsive: true }],
  ['BNLP/Carrousel 3.jpg', 'BNLP/Carrousel 3', { responsive: true }],
  ['BNLP/Final MVP.jpeg', 'BNLP/Final MVP', {}],
  ['BNLP/hero BNPL.jpeg', 'BNLP/hero BNPL', {}],

  // Designing Payments carousel (responsive) + detail
  ['Designing Payments/Payments Carrousel 1.png', 'Designing Payments/Payments Carrousel 1', { responsive: true }],
  ['Designing Payments/Payments Carrousel 2.png', 'Designing Payments/Payments Carrousel 2', { responsive: true }],
  ['Designing Payments/Payments Carrousel 3.png', 'Designing Payments/Payments Carrousel 3', { responsive: true }],
  ['Designing Payments/New regulation.png', 'Designing Payments/New regulation', {}],
  ['Designing Payments/New alias types.png', 'Designing Payments/New alias types', {}],
  ['Designing Payments/Cash-in +1.png', 'Designing Payments/Cash-in +1', {}],
  ['Designing Payments/Cash-in +2.png', 'Designing Payments/Cash-in +2', {}],
  ['Designing Payments/Singel use 1.png', 'Designing Payments/Singel use 1', {}],
  ['Designing Payments/Singel use 2.png', 'Designing Payments/Singel use 2', {}],
  ['Designing Payments/alias diagram.png', 'Designing Payments/alias diagram', {}],

  // Lighter Thoughts carousel (responsive) + detail
  ['Lighter Thoughts/LT carrousel 1.png', 'Lighter Thoughts/LT carrousel 1', { responsive: true }],
  ['Lighter Thoughts/LT carrousel 2.png', 'Lighter Thoughts/LT carrousel 2', { responsive: true }],
  ['Lighter Thoughts/LT carrousel 3.png', 'Lighter Thoughts/LT carrousel 3', { responsive: true }],
  ['Lighter Thoughts/Goals and rewards.png', 'Lighter Thoughts/Goals and rewards', {}],
  ['Lighter Thoughts/Share a thought.png', 'Lighter Thoughts/Share a thought', {}],
  ['Lighter Thoughts/Tap to reach.png', 'Lighter Thoughts/Tap to reach', {}],
  ['Lighter Thoughts/Double tap to open.png', 'Lighter Thoughts/Double tap to open', {}],
];

const RESPONSIVE_WIDTHS = [640, 1024];
const WEBP_Q = 82;
const AVIF_Q = 55;

for (const [relIn, relBase, opts] of jobs) {
  const input = path.join(root, relIn);
  if (!fs.existsSync(input)) continue;

  // Full-size webp + avif
  try {
    await sharp(input).webp({ quality: WEBP_Q }).toFile(path.join(root, relBase + '.webp'));
    console.log('Wrote', relBase + '.webp');
  } catch (err) {
    console.warn('optimize-images: skip webp', relIn, err.message);
  }
  try {
    await sharp(input).avif({ quality: AVIF_Q }).toFile(path.join(root, relBase + '.avif'));
    console.log('Wrote', relBase + '.avif');
  } catch (err) {
    console.warn('optimize-images: skip avif', relIn, err.message);
  }

  // Responsive widths (only if requested)
  if (opts.responsive) {
    for (const w of RESPONSIVE_WIDTHS) {
      try {
        await sharp(input).resize({ width: w, withoutEnlargement: true })
          .webp({ quality: WEBP_Q }).toFile(path.join(root, `${relBase}@${w}.webp`));
        console.log('Wrote', `${relBase}@${w}.webp`);
      } catch (err) {
        console.warn('optimize-images: skip @w webp', relIn, w, err.message);
      }
      try {
        await sharp(input).resize({ width: w, withoutEnlargement: true })
          .avif({ quality: AVIF_Q }).toFile(path.join(root, `${relBase}@${w}.avif`));
        console.log('Wrote', `${relBase}@${w}.avif`);
      } catch (err) {
        console.warn('optimize-images: skip @w avif', relIn, w, err.message);
      }
    }
  }
}

// Special: OG image resized to social-media spec.
const ogJobs = [
  ['ichiban.jpeg', 'ichiban-og.jpg', { width: 1200, height: 630, format: 'jpeg', quality: 78 }],
  ['ichiban.jpeg', 'ichiban-og.webp', { width: 1200, height: 630, format: 'webp', quality: 80 }],
];
for (const [relIn, relOut, o] of ogJobs) {
  const input = path.join(root, relIn);
  const output = path.join(root, relOut);
  if (!fs.existsSync(input)) continue;
  try {
    let pipe = sharp(input).resize(o.width, o.height, { fit: 'cover' });
    if (o.format === 'webp') pipe = pipe.webp({ quality: o.quality });
    else pipe = pipe.jpeg({ quality: o.quality, mozjpeg: true });
    await pipe.toFile(output);
    console.log('Wrote', relOut);
  } catch (err) {
    console.warn('optimize-images: skip OG', relIn, err.message);
  }
}
