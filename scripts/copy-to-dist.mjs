import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');

if (!fs.existsSync(path.join(dist, 'motion-ui.js'))) {
  console.error('copy-to-dist: missing dist/motion-ui.js — run vite build first');
  process.exit(1);
}

fs.copyFileSync(path.join(root, 'index.html'), path.join(dist, 'index.html'));

const dirs = ['BNLP', 'Designing Payments', 'Lighter Thoughts', 'fonts', 'i18n'];
for (const name of dirs) {
  const from = path.join(root, name);
  if (fs.existsSync(from)) {
    fs.cpSync(from, path.join(dist, name), { recursive: true });
  }
}

const files = [
  'ichiban-og.jpg',
  'ichiban-og.webp',
  'BGT.jpg',
  'Ai Icon.svg',
  'Figma-logo.svg',
  'Horizontal Scroll Cursor.svg',
  'Vector.svg',
  'claude-logo.svg',
  'github.svg',
];
for (const f of files) {
  const from = path.join(root, f);
  if (fs.existsSync(from)) {
    fs.copyFileSync(from, path.join(dist, f));
  }
}

const sitemap = path.join(root, 'sitemap.xml');
if (fs.existsSync(sitemap)) fs.copyFileSync(sitemap, path.join(dist, 'sitemap.xml'));
const robots = path.join(root, 'robots.txt');
if (fs.existsSync(robots)) fs.copyFileSync(robots, path.join(dist, 'robots.txt'));
