/**
 * INTRO STORYBOARD (Motion)
 *
 *      0ms   lock scroll, schedule sequence
 *     40ms   staggered fade in glyphs (0.97 -> 1)
 *    760ms   fade out "Hi, I'm"
 *    920ms   "Andy." flies to nav + quick loader tint
 *   1320ms   nav visible, pill clip = brand width
 *   1400ms   clip-path expand to full bar
 *   1540ms   Work button .in
 *   1620ms   About .in
 *   1700ms   CTA .in
 *   1840ms   clear pill inline styles
 *   2060ms   fade out loader, hero visible
 */
import { animate, type AnimationPlaybackControls } from 'motion';

const T = {
  fadeIn: 40,
  greetingOut: 760,
  flight: 920,
  pillShow: 1320,
  pillExpand: 1400,
  navWork: 1540,
  navAbout: 1620,
  navCta: 1700,
  navCleanup: 1840,
  end: 2060,
} as const;

const springUi = { type: 'spring' as const, duration: 0.26, bounce: 0.1 };
const springFly = { type: 'spring' as const, duration: 0.4, bounce: 0.1 };

let introGeneration = 0;
let introFinished = true;
const motionStops: Array<() => void> = [];
let pendingTimeouts: number[] = [];

function w(): Window & Record<string, unknown> {
  return window as Window & Record<string, unknown>;
}

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function register(ctrl: AnimationPlaybackControls | void) {
  if (ctrl && typeof ctrl.stop === 'function') motionStops.push(() => ctrl.stop());
}

function clearMotion() {
  for (let i = motionStops.length - 1; i >= 0; i--) motionStops[i]();
  motionStops.length = 0;
}

function clearTimeouts() {
  for (const id of pendingTimeouts) window.clearTimeout(id);
  pendingTimeouts = [];
}

function staggerGlyphIn(rootEl: HTMLElement, startDelay = 0, step = 0.028) {
  const paths = Array.from(rootEl.querySelectorAll('svg path'));
  if (paths.length === 0) {
    register(animate(rootEl, { opacity: [0, 1], scale: [0.97, 1] }, { ...springUi, delay: startDelay }));
    return;
  }
  for (let i = 0; i < paths.length; i++) {
    const p = paths[i] as SVGElement;
    p.style.opacity = '0';
    register(
      animate(p, { opacity: [0, 1], y: [3, 0] }, { ...springUi, delay: startDelay + (i * step) }),
    );
  }
}

export function cancelIntro() {
  if (introFinished) return;
  introFinished = true;
  introGeneration += 1;
  clearTimeouts();
  clearMotion();
  hardFinishIntro();
}

function hardFinishIntro() {
  const loader = document.getElementById('intro-loader');
  const greeting = document.getElementById('intro-greeting');
  const introName = document.getElementById('intro-name');
  const navBrand = document.getElementById('nav-brand');
  const navInner = document.getElementById('nav-inner');
  const nav = document.getElementById('nav');
  const homeHero = document.getElementById('home-hero');

  if (loader) loader.style.display = 'none';
  document.body.style.overflow = '';
  if (homeHero) homeHero.classList.add('visible');
  if (nav) nav.classList.add('visible');
  if (navBrand) navBrand.classList.add('visible');
  ['nav-work-btn', 'nav-about-btn', 'nav-cta-btn'].forEach((id) => {
    document.getElementById(id)?.classList.add('in');
  });
  if (navInner) {
    navInner.style.transition = '';
    navInner.style.borderRadius = '';
    navInner.style.width = '';
    navInner.style.clipPath = '';
    navInner.style.transform = '';
    navInner.style.transformOrigin = '';
    navInner.style.willChange = '';
    navInner.style.overflow = '';
  }
  if (greeting) {
    greeting.style.transition = '';
    greeting.style.opacity = '';
  }
  if (introName) {
    introName.style.transition = '';
    introName.style.opacity = '';
    introName.style.transform = '';
    introName.style.transformOrigin = '';
    introName.style.color = '';
    introName.style.willChange = '';
  }
  if (loader) {
    loader.style.transition = '';
    loader.style.backgroundColor = '';
    loader.style.opacity = '';
  }
  if (navBrand) navBrand.style.transition = '';

  const win = w();
  if (typeof win.updateHeadForRoute === 'function' && typeof win.pageSeo === 'function') {
    win.updateHeadForRoute(win.pageSeo('home'));
  }
  requestAnimationFrame(() => {
    document.fonts.ready.then(() => {
      if (typeof win.setupCarousel === 'function') win.setupCarousel();
      if (typeof win.setupPhilosophy === 'function') win.setupPhilosophy();
      if (typeof win.setupHowIWorkHover === 'function') win.setupHowIWorkHover();
    });
  });
}

function reduceMotionIntro() {
  introFinished = true;
  const loader = document.getElementById('intro-loader');
  const nav = document.getElementById('nav');
  const navBrand = document.getElementById('nav-brand');
  const navInner = document.getElementById('nav-inner');
  const homeHero = document.getElementById('home-hero');
  if (loader) loader.style.display = 'none';
  document.body.style.overflow = '';
  if (homeHero) homeHero.classList.add('visible');
  if (nav) nav.classList.add('visible');
  if (navBrand) navBrand.classList.add('visible');
  ['nav-work-btn', 'nav-about-btn', 'nav-cta-btn'].forEach((id) => {
    document.getElementById(id)?.classList.add('in');
  });
  if (navInner) navInner.style.transition = '';
  const win = w();
  if (typeof win.updateHeadForRoute === 'function' && typeof win.pageSeo === 'function') {
    win.updateHeadForRoute(win.pageSeo('home'));
  }
  document.fonts.ready.then(() => {
    if (typeof win.setupCarousel === 'function') win.setupCarousel();
    if (typeof win.setupPhilosophy === 'function') win.setupPhilosophy();
    if (typeof win.setupHowIWorkHover === 'function') win.setupHowIWorkHover();
  });
}

export function startIntro() {
  if (prefersReducedMotion()) {
    reduceMotionIntro();
    return;
  }

  introFinished = false;

  const loader = document.getElementById('intro-loader');
  const greeting = document.getElementById('intro-greeting');
  const introName = document.getElementById('intro-name');
  const navBrand = document.getElementById('nav-brand');
  const navInner = document.getElementById('nav-inner');
  const nav = document.getElementById('nav');
  if (!loader || !greeting || !introName || !navBrand || !navInner || !nav) return;

  const gen = introGeneration;
  document.body.style.overflow = 'hidden';
  loader.style.opacity = '1';
  greeting.style.opacity = '1';
  introName.style.opacity = '1';

  const startAt = performance.now();
  const at = (targetMs: number, fn: () => void) => {
    const delay = Math.max(0, targetMs - (performance.now() - startAt));
    const id = window.setTimeout(() => {
      pendingTimeouts = pendingTimeouts.filter((x) => x !== id);
      if (gen !== introGeneration) return;
      fn();
    }, delay);
    pendingTimeouts.push(id);
  };

  at(T.fadeIn, () => {
    greeting.style.opacity = '1';
    introName.style.opacity = '1';
    staggerGlyphIn(greeting, 0, 0.025);
    staggerGlyphIn(introName, 0.08, 0.03);
    register(animate(greeting, { scale: [0.97, 1] }, { ...springUi, delay: 0 }));
    register(animate(introName, { scale: [0.97, 1] }, { ...springUi, delay: 0.08 }));
  });

  at(T.greetingOut, () => {
    register(animate(greeting, { opacity: 0 }, { duration: 0.22, ease: 'easeOut' }));
  });

  at(T.flight, () => {
    const from = introName.getBoundingClientRect();
    const to = navBrand.getBoundingClientRect();
    const dx = to.left - from.left;
    const dy = to.top - from.top;
    const sc = to.height / from.height;
    register(
      animate(
        introName,
        { x: dx, y: dy, scale: sc, color: ['#FFFFFF', '#BFD1F9', '#101010'] },
        { ...springFly, transformOrigin: '0% 0%', ease: 'easeInOut' },
      ),
    );
    register(
      animate(loader, { backgroundColor: ['#065FED', '#B8CBFF', '#FFE3EE'] }, { duration: 0.22, ease: 'easeInOut' }),
    );
  });

  at(T.pillShow, () => {
    const brandW = navBrand.offsetWidth + 40;
    const fullW = Math.max(1, navInner.offsetWidth);
    const clipPct = (brandW / fullW) * 100;
    const narrowClip = `polygon(0% 0%, ${clipPct}% 0%, ${clipPct}% 100%, 0% 100%)`;
    const wideClip = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)';

    navInner.style.transition = 'none';
    navInner.style.borderRadius = '100px';
    navInner.style.clipPath = narrowClip;
    navInner.style.willChange = 'clip-path';
    navBrand.style.transition = 'none';
    nav.classList.add('visible');
    navBrand.classList.add('visible');

    at(T.pillExpand, () => {
      if (gen !== introGeneration) return;
      register(
      animate(navInner, { clipPath: [narrowClip, wideClip] }, { duration: 0.32, ease: 'easeOut' }),
      );
    });
  });

  at(T.navWork, () => {
    document.getElementById('nav-work-btn')?.classList.add('in');
  });
  at(T.navAbout, () => {
    document.getElementById('nav-about-btn')?.classList.add('in');
  });
  at(T.navCta, () => {
    document.getElementById('nav-cta-btn')?.classList.add('in');
  });

  at(T.navCleanup, () => {
    navInner.style.transition = '';
    navInner.style.borderRadius = '';
    navInner.style.clipPath = '';
    navInner.style.willChange = '';
    navInner.style.overflow = '';
    navBrand.style.transition = '';
  });

  at(T.end, () => {
    if (gen !== introGeneration) return;
    introFinished = true;
    clearMotion();
    register(
      animate(loader, { opacity: [1, 0] }, { duration: 0.24, ease: 'easeOut' }),
    );
    window.setTimeout(() => {
      if (gen !== introGeneration) return;
      loader.style.display = 'none';
      document.body.style.overflow = '';
      document.getElementById('home-hero')?.classList.add('visible');
      const win = w();
      if (typeof win.updateHeadForRoute === 'function' && typeof win.pageSeo === 'function') {
        win.updateHeadForRoute(win.pageSeo('home'));
      }
      requestAnimationFrame(() => {
        document.fonts.ready.then(() => {
          if (gen !== introGeneration) return;
          if (typeof win.setupCarousel === 'function') win.setupCarousel();
          if (typeof win.setupPhilosophy === 'function') win.setupPhilosophy();
          if (typeof win.setupHowIWorkHover === 'function') win.setupHowIWorkHover();
        });
      });
    }, 240);
  });
}
