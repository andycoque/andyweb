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
  ['BNLP/Hero card.jpg', 'BNLP/Hero card.webp'],
  ['Designing Payments/Payments hero.jpg', 'Designing Payments/Payments hero.webp'],
  ['Lighter Thoughts/Hero-card.png', 'Lighter Thoughts/Hero-card.webp'],
  ['BNLP/Carrousel 1.jpg', 'BNLP/Carrousel 1.webp'],
  ['BNLP/Carrousel 2.jpg', 'BNLP/Carrousel 2.webp'],
  ['BNLP/Carrousel 3.jpg', 'BNLP/Carrousel 3.webp'],
  ['Designing Payments/Payments Carrousel 1.png', 'Designing Payments/Payments Carrousel 1.webp'],
  ['Designing Payments/Payments Carrousel 2.png', 'Designing Payments/Payments Carrousel 2.webp'],
  ['Designing Payments/Payments Carrousel 3.png', 'Designing Payments/Payments Carrousel 3.webp'],
  ['Lighter Thoughts/LT carrousel 1.png', 'Lighter Thoughts/LT carrousel 1.webp'],
  ['Lighter Thoughts/LT carrousel 2.png', 'Lighter Thoughts/LT carrousel 2.webp'],
  ['Lighter Thoughts/LT carrousel 3.png', 'Lighter Thoughts/LT carrousel 3.webp'],
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
