/**
 * INTRO STORYBOARD (Motion) — elegant pass
 *
 *      0ms   lock scroll, schedule sequence
 *     20ms   letter-by-letter spring (softer bounce, more stagger)
 *    580ms   fade out "Hi, I'm" + precompute flight rects
 *    680ms   "Andy." position flight (ease-in-out-quart, 600ms)
 *    900ms   "Andy." opacity fades to 0 (crossfade handoff begins)
 *    960ms   nav pill appears (overlaps with flight tail)
 *   1020ms   clip-path expands (subtler, 400ms ease-in-out-cubic)
 *   1140ms   real nav-brand fades in (500ms CSS transition)
 *   1280ms   hero crossfade begins
 *   1340ms   Work .in
 *   1440ms   About .in
 *   1540ms   CTA .in
 *   1640ms   clear pill inline styles
 *   1780ms   loader display:none, cleanup
 */
import { animate, stagger, type AnimationPlaybackControls } from 'motion';

const T = {
  fadeIn: 20,
  greetingOut: 580,
  flight: 680,
  pillShow: 960,
  pillExpand: 1020,
  brandShow: 1140,
  crossfade: 1280,
  navWork: 1340,
  navAbout: 1440,
  navCta: 1540,
  navCleanup: 1640,
  end: 1780,
} as const;

const springIntro = { type: 'spring' as const, duration: 0.42, bounce: 0.15 };
const springUi = { type: 'spring' as const, duration: 0.22, bounce: 0.1 };
// Flight uses a deliberate ease-in-out (not spring) for elegance — on-screen movement per Emil.
const easeFlight = [0.76, 0, 0.24, 1] as const;

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

// Treat each SVG path as a "char" (motion-plus splitText style).
// The Andy. wordmark has one path per letter; Hi, I'm has one path per glyph cluster.
function staggerGlyphIn(rootEl: HTMLElement, startDelay = 0, step = 0.05) {
  const paths = Array.from(rootEl.querySelectorAll('svg path')) as SVGElement[];
  if (paths.length === 0) {
    register(
      animate(rootEl, { opacity: [0, 1], y: [12, 0], scale: [0.85, 1] }, { ...springIntro, delay: startDelay }),
    );
    return;
  }
  for (const p of paths) {
    p.style.opacity = '0';
    p.style.transformBox = 'fill-box';
    p.style.transformOrigin = '50% 100%';
    p.style.willChange = 'transform, opacity';
  }
  const ctrl = animate(
    paths,
    { opacity: [0, 1], y: [14, 0], scale: [0.82, 1] },
    { ...springIntro, delay: stagger(step, { start: startDelay }) },
  );
  ctrl.finished
    .then(() => {
      for (const p of paths) p.style.willChange = '';
    })
    .catch(() => {});
  register(ctrl);
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

  let flightRects: { dx: number; dy: number; sc: number } | null = null;

  at(T.fadeIn, () => {
    greeting.style.opacity = '1';
    introName.style.opacity = '1';
    staggerGlyphIn(greeting, 0, 0.06);
    staggerGlyphIn(introName, 0.1, 0.07);
  });

  at(T.greetingOut, () => {
    // Nav is always in layout (only opacity:0), so rects are valid without toggling .visible.
    const from = introName.getBoundingClientRect();
    const to = navBrand.getBoundingClientRect();
    flightRects = {
      dx: to.left - from.left,
      dy: to.top - from.top,
      sc: to.height / from.height,
    };
    introName.style.willChange = 'transform, color';
    register(animate(greeting, { opacity: 0 }, { duration: 0.22, ease: 'easeOut' }));
  });

  at(T.flight, () => {
    if (!flightRects) return;
    const { dx, dy, sc } = flightRects;
    introName.style.transformOrigin = '0% 0%';
    // Position: ease-in-out-quart for elegant on-screen movement (no spring bounce).
    const positionCtrl = animate(
      introName,
      { x: dx, y: dy, scale: sc },
      { duration: 0.6, ease: easeFlight as unknown as [number, number, number, number] },
    );
    positionCtrl.finished
      .then(() => {
        introName.style.willChange = '';
      })
      .catch(() => {});
    register(positionCtrl);
    // Opacity: white "Andy" fades out during flight tail. Real black logo fades in separately (see T.brandShow).
    register(
      animate(introName, { opacity: 0 }, { duration: 0.32, delay: 0.22, ease: 'easeOut' }),
    );
    // Loader background: paired with position (same duration + easing).
    register(
      animate(
        loader,
        { backgroundColor: ['#065FED', '#FFE3EE'] },
        { duration: 0.6, ease: easeFlight as unknown as [number, number, number, number] },
      ),
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
    nav.classList.add('visible');
    // navBrand visibility is deferred to T.brandShow so the CSS fade-in handoff with andie is clean.

    at(T.pillExpand, () => {
      if (gen !== introGeneration) return;
      // Subtler expansion: longer duration + ease-in-out-cubic for on-screen boundary movement.
      register(
        animate(
          navInner,
          { clipPath: [narrowClip, wideClip] },
          { duration: 0.4, ease: [0.645, 0.045, 0.355, 1] },
        ),
      );
    });
  });

  at(T.brandShow, () => {
    // Real logo fades in via CSS transition on #nav-brand (500ms).
    navBrand.classList.add('visible');
  });

  at(T.crossfade, () => {
    // Paired crossfade — loader fade-out matches hero fade-in duration + easing.
    document.getElementById('home-hero')?.classList.add('visible');
    register(animate(loader, { opacity: [1, 0] }, { duration: 0.32, ease: [0.22, 1, 0.36, 1] }));
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
    loader.style.display = 'none';
    document.body.style.overflow = '';
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
  });
}
