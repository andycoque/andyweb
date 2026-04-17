# andyweb

Personal portfolio at [andyweb-three.vercel.app](https://andyweb-three.vercel.app). Single-page Vite app with TypeScript intro animation (Motion v11), vanilla JS interactions, and a custom sharp-based image pipeline.

## Stack

- **Build**: Vite 6
- **Animation**: [motion](https://motion.dev) v11 (intro letter-by-letter + Andy→logo morph)
- **Image pipeline**: sharp → webp + avif, plus responsive @640/@1024 variants
- **Deploy**: Vercel

## Commands

```bash
npm run optimize:images   # regenerate webp/avif from raster sources
npm run build             # optimize images + vite build + copy-to-dist
npm run dev               # build + preview on port 5173
```

No lint, no tests. Vite catches TS errors at build time.

## Project structure

```
index.html                  # Main app (HTML + inline CSS + inline JS)
src/
  intro.ts                  # Intro sequence storyboard (Motion)
  motion-ui.ts              # Motion initialization
scripts/
  optimize-images.mjs       # sharp pipeline: webp/avif + responsive sizes
  copy-to-dist.mjs          # Copy static assets to dist/
BNLP/                       # BNPL Marketplace case study assets
Designing Payments/         # RTP Payments case study assets
Lighter Thoughts/           # Lighter Thoughts case study assets
```

---

# Pending recommendations

The following items were flagged during a design engineering review (Emil Kowalski / Jakub Krehel principles). They are **non-blocking** but worth addressing in a future pass. All share one root cause: **CSS transitions on layout-triggering properties (`width`, `max-height`) instead of `transform`/`opacity`**. This forces the browser to recompute layout on every frame of the animation, stealing frames from scroll and other interactions.

The Emil rule: **only animate `transform` and `opacity`**. These two properties skip the Layout and Paint stages of the rendering pipeline — they run entirely on the GPU compositor.

## 🟡 1. `.proj-tab-pill` animates `width`

**File**: `index.html:2242`

**Current**:
```css
.proj-tab-pill {
  transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1),
              width     300ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

The pill that slides under active tabs animates both `transform` (good) AND `width` (bad). The width change forces a layout pass every frame.

**Impact**: Low. The pill is `position: absolute`, so the reflow is contained to the pill itself. Animation runs only on tab click (infrequent). But it still drops frames on lower-end devices.

**Recommended fix** — animate `transform: scaleX()` instead. Requires JS tweak in `movePill()` (`index.html:5005-5012`):

```js
function movePill(tabsEl, activeBtn) {
  const pill = tabsEl.querySelector('.proj-tab-pill');
  if (!pill) return;
  const tabsRect  = tabsEl.getBoundingClientRect();
  const btnRect   = activeBtn.getBoundingClientRect();
  // Pick a reference width (e.g. the widest tab at mount) stored once
  const refWidth  = pill._refWidth || (pill._refWidth = btnRect.width);
  pill.style.width = refWidth + 'px';
  pill.style.transform = `translateX(${btnRect.left - tabsRect.left - 4}px) scaleX(${btnRect.width / refWidth})`;
}
```

Then CSS becomes:
```css
.proj-tab-pill {
  transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: left center;
}
```

## 🟡 2. `.commit-bar` hover animates `width`

**File**: `index.html:1649`

**Current**:
```css
.commit-bar {
  width: 4px;
  transition: width 200ms cubic-bezier(0.34,1.56,0.64,1), background 200ms ease;
}
.commit-cell.hov-0 .commit-bar { width: 10px; }
.commit-cell.hov-1 .commit-bar { width: 7px;  }
.commit-cell.hov-2 .commit-bar { width: 5px;  }
```

The commit visualization bars grow on hover from 4px to 5-10px. Each hover triggers a layout pass on that bar, and since there are many cells in a row, hovering across them fires repeated reflows.

**Impact**: Medium. Hover on this component causes perceptible jank on older devices.

**Recommended fix** — animate `transform: scaleX()`. Set a fixed base width equal to the max state (10px), scale down to the resting state:

```css
.commit-bar {
  width: 10px;
  transform: scaleX(0.4);
  transform-origin: center;
  transition: transform 200ms cubic-bezier(0.34,1.56,0.64,1), background 200ms ease;
}
.commit-cell.hov-0 .commit-bar { transform: scaleX(1);   }
.commit-cell.hov-1 .commit-bar { transform: scaleX(0.7); }
.commit-cell.hov-2 .commit-bar { transform: scaleX(0.5); }
```

Side effect to watch: `transform: scale` preserves the bounding box at the original width, so the center-origin keeps the visual effect identical.

## 🟡 3. `.dot` carousel indicator animates `width`

**File**: `index.html:1012-1019`

**Current**:
```css
.dot {
  width: 5px;
  transition: width 300ms var(--ease-enter), background 300ms var(--ease-std);
}
.dot.active { width: 20px; background: var(--blue); }
```

Carousel position indicator: 5px dot → 20px pill on active.

**Impact**: Very low. Only 3 dots, transition runs on slide change (infrequent). But still violates the rule.

**Recommended fix** — same pattern as commit-bar. Set base width to 20px, scale to 0.25 at rest:

```css
.dot {
  width: 20px;
  transform: scaleX(0.25);
  transform-origin: center;
  transition: transform 300ms var(--ease-enter), background 300ms var(--ease-std);
}
.dot.active { transform: scaleX(1); background: var(--blue); }
```

## 🟢 4. `.how-ai-body` animates `max-height`

**File**: `index.html:1377`

**Current**:
```css
.how-ai-body {
  max-height: 0;
  transition: max-height 500ms var(--ease-enter), padding-top 500ms var(--ease-enter);
}
.how-step.ai-open .how-ai-body {
  max-height: 240px;
  padding-top: 10px;
}
```

Accordion expand/collapse. `max-height` triggers layout on every frame.

**Impact**: Low. This is the classic "expand/collapse" problem in CSS. There is no clean CSS-only solution without:
- **Option A**: Measuring content height in JS and animating that specific pixel value (invasive).
- **Option B**: Using `grid-template-rows: 0fr → 1fr` trick (only works on modern browsers, ~Safari 16+).
- **Option C**: Accepting the trade-off.

**Recommended fix** — only if the accordion starts feeling janky. Option B (grid trick) is the cleanest:

```css
.how-ai-body-wrapper {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 500ms var(--ease-enter);
}
.how-ai-body-wrapper > .how-ai-body {
  overflow: hidden;
}
.how-step.ai-open .how-ai-body-wrapper {
  grid-template-rows: 1fr;
}
```

Requires wrapping the `.how-ai-body` in an extra div. Current implementation is fine for now.

## Priority order if you decide to tackle this

1. **`.commit-bar`** — most visible jank (hover across many cells fires many reflows).
2. **`.proj-tab-pill`** — more invasive (needs JS change) but a clean win.
3. **`.dot`** — trivial CSS-only change, tiny impact.
4. **`.how-ai-body`** — only if the accordion feels janky. Otherwise skip.

## Reference

- Emil Kowalski — [Animations on the Web](https://animations.dev)
- Jakub Krehel — [make-interfaces-feel-better](https://github.com/jakubkrehel/make-interfaces-feel-better)
- MDN — [CSS triggers: which properties trigger layout/paint/composite](https://web.dev/articles/animations-guide)
