import { animate } from 'motion';
import { cancelIntro, startIntro } from './intro';

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function pulseNavRow() {
  if (prefersReducedMotion()) return;
  const row = document.querySelector('#nav .nav-row');
  if (!row) return;
  animate(row, { opacity: [1, 0.94, 1] }, { duration: 0.22, ease: 'easeOut' });
}

Object.assign(window, {
  runIntro: startIntro,
  cancelIntroIfRunning: cancelIntro,
});
window.dispatchEvent(new Event('andy:intro-ready'));

window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('nav-work-btn')?.addEventListener('click', pulseNavRow);
  document.getElementById('nav-cta-btn')?.addEventListener('click', pulseNavRow);
  window.addEventListener('andy:pagechange', () => {
    requestAnimationFrame(pulseNavRow);
  });
});
