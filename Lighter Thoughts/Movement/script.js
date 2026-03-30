const scene = document.getElementById("scene");
const world = document.getElementById("world");
const totems = Array.from(document.querySelectorAll(".totem"));
const avatarAnchor = document.getElementById("avatarAnchor");
const focusMask = document.getElementById("focusMask");
const pointerShell = document.getElementById("pointerShell");
const avatar = document.querySelector(".avatar");
const fullscreenToggle = document.getElementById("fullscreenToggle");
const directionArrow = document.getElementById("directionArrow");
const floorRingGradient = document.getElementById("floorRingGradient");
const touchHint = document.getElementById("touchHint");

const state = {
  holding: false,
  pointerId: null,
  directionX: 0,
  directionY: 0,
  angle: 0,
  worldX: 0,
  worldY: 0,
  speed: 170,
  lastFrame: performance.now(),
};

const ringRadiusX = 46.5;
const ringRadiusY = 17.25;
const totemBaseOffsetX = 0;
const totemBaseOffsetYRatio = 0.33;
const totemBlockRadiusXRatio = 0.28;
const totemBlockRadiusYRatio = 0.17;

function getSceneLocalCenter() {
  const rect = scene.getBoundingClientRect();
  return {
    x: rect.width / 2,
    y: rect.height / 2,
  };
}

function getSceneCenter() {
  const rect = scene.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };
}

function getAvatarGroundPoint() {
  const center = getSceneLocalCenter();
  return {
    x: center.x,
    y: center.y + 14,
  };
}

function updateFocusMask() {
  const rect = scene.getBoundingClientRect();
  const avatarGround = getAvatarGroundPoint();
  const focusXPercent = (avatarGround.x / rect.width) * 100;
  const focusYPercent = (avatarGround.y / rect.height) * 100;

  focusMask.style.setProperty("--focus-x", `${focusXPercent}%`);
  focusMask.style.setProperty("--focus-y", `${focusYPercent}%`);
}

function getTotemMetrics() {
  const center = getSceneLocalCenter();
  return totems.map((totem) => {
    const totemWidth = totem.getBoundingClientRect().width || 92;
    const totemHeight = totemWidth * (115 / 95);
    const worldX = Number(totem.dataset.worldX ?? 0);
    const worldY = Number(totem.dataset.worldY ?? 0);

    return {
      element: totem,
      worldX,
      worldY,
      anchorX: center.x + worldX,
      anchorY: center.y + worldY,
      baseOffsetX: totemBaseOffsetX,
      baseOffsetY: totemHeight * totemBaseOffsetYRatio,
      blockRadiusX: totemWidth * totemBlockRadiusXRatio,
      blockRadiusY: totemHeight * totemBlockRadiusYRatio,
    };
  });
}

function isInsideTotemDiamond(worldX, worldY) {
  const avatarGround = getAvatarGroundPoint();
  const metricsList = getTotemMetrics();

  return metricsList.some((metrics) => {
    const totemBaseX = metrics.anchorX + worldX + metrics.baseOffsetX;
    const totemBaseY = metrics.anchorY + worldY + metrics.baseOffsetY;

    const normalizedDistance =
      ((avatarGround.x - totemBaseX) ** 2) / metrics.blockRadiusX ** 2 +
      ((avatarGround.y - totemBaseY) ** 2) / metrics.blockRadiusY ** 2;

    return normalizedDistance <= 1;
  });
}

function updateDepthSorting() {
  const avatarGround = getAvatarGroundPoint();
  const metricsList = getTotemMetrics();
  const isAvatarBehindTotem = metricsList.some((metrics) => {
    const totemBaseX = metrics.anchorX + state.worldX + metrics.baseOffsetX;
    const totemBaseY = metrics.anchorY + state.worldY + metrics.baseOffsetY;
    const withinDepthInfluenceX = Math.abs(avatarGround.x - totemBaseX) < metrics.blockRadiusX * 1.35;

    return withinDepthInfluenceX && avatarGround.y < totemBaseY - 1;
  });

  avatarAnchor.classList.toggle("is-behind", isAvatarBehindTotem);
  world.classList.toggle("is-in-front", isAvatarBehindTotem);
}

function updateDirection(clientX, clientY) {
  const center = getSceneCenter();
  const dx = clientX - center.x;
  const dy = clientY - center.y;
  const distance = Math.hypot(dx, dy);

  if (distance < 18) {
    state.directionX = 0;
    state.directionY = 0;
    return;
  }

  state.directionX = dx / distance;
  state.directionY = dy / distance;
  state.angle = Math.atan2(dy, dx);
  positionDirectionArrow();
}

function positionDirectionArrow() {
  const x = Math.cos(state.angle) * ringRadiusX;
  const y = Math.sin(state.angle) * ringRadiusY;
  const degrees = (state.angle * 180) / Math.PI + 180;
  const gradientDegrees = (state.angle * 180) / Math.PI;

  directionArrow.style.left = `calc(50% + ${x}px)`;
  directionArrow.style.top = `calc(50% + ${y}px)`;
  directionArrow.style.transform = `translate(-50%, -50%) rotate(${degrees}deg)`;
  floorRingGradient.setAttribute(
    "gradientTransform",
    `rotate(${gradientDegrees} 0.5 0.5)`
  );
}

function positionTouchHint(clientX, clientY) {
  const rect = scene.getBoundingClientRect();
  touchHint.style.left = `${clientX - rect.left}px`;
  touchHint.style.top = `${clientY - rect.top}px`;
}

function beginHold(event) {
  state.holding = true;
  state.pointerId = event.pointerId;
  scene.setPointerCapture(event.pointerId);
  pointerShell.classList.add("is-active");
  avatar.classList.add("is-moving");
  touchHint.classList.add("is-visible");
  updateDirection(event.clientX, event.clientY);
  positionTouchHint(event.clientX, event.clientY);
}

function moveHold(event) {
  if (!state.holding || event.pointerId !== state.pointerId) {
    return;
  }

  updateDirection(event.clientX, event.clientY);
  positionTouchHint(event.clientX, event.clientY);
}

function endHold(event) {
  if (event.pointerId !== state.pointerId) {
    return;
  }

  state.holding = false;
  state.pointerId = null;
  state.directionX = 0;
  state.directionY = 0;
  pointerShell.classList.remove("is-active");
  avatar.classList.remove("is-moving");
  touchHint.classList.remove("is-visible");
  positionDirectionArrow();
}

function animate(now) {
  const delta = (now - state.lastFrame) / 1000;
  state.lastFrame = now;

  if (state.holding) {
    const nextWorldX = state.worldX - state.directionX * state.speed * delta;
    const nextWorldY = state.worldY - state.directionY * state.speed * delta;

    if (!isInsideTotemDiamond(nextWorldX, nextWorldY)) {
      state.worldX = nextWorldX;
      state.worldY = nextWorldY;
    }
  }

  const driftX = state.holding ? state.directionX * -3 : 0;
  const driftY = state.holding ? state.directionY * -3 : 0;
  getTotemMetrics().forEach((metrics) => {
    metrics.element.style.left = `${metrics.anchorX + state.worldX}px`;
    metrics.element.style.top = `${metrics.anchorY + state.worldY}px`;
    metrics.element.style.transform =
      `translate(calc(-50% + ${driftX}px), calc(-50% + ${driftY}px))`;
  });
  updateFocusMask();
  updateDepthSorting();

  requestAnimationFrame(animate);
}

scene.addEventListener("pointerdown", (event) => {
  if (event.button !== 0 && event.pointerType !== "touch") {
    return;
  }

  beginHold(event);
});

scene.addEventListener("pointermove", moveHold);
scene.addEventListener("pointerup", endHold);
scene.addEventListener("pointercancel", endHold);
scene.addEventListener("pointerleave", (event) => {
  if (event.pointerType === "mouse" && state.holding) {
    endHold(event);
  }
});

let isFakeFs = false;

fullscreenToggle.addEventListener("click", async () => {
  // Native fullscreen (desktop / Android Chrome)
  if (document.fullscreenEnabled) {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
      return;
    } catch {}
  }
  // Fallback: ask parent page to expand the iframe (iOS Safari)
  isFakeFs = !isFakeFs;
  window.parent.postMessage({ type: "proto-fullscreen", active: isFakeFs }, "*");
  fullscreenToggle.classList.toggle("is-fullscreen", isFakeFs);
  fullscreenToggle.setAttribute("aria-label", isFakeFs ? "Exit fullscreen" : "Enter fullscreen");
});

document.addEventListener("fullscreenchange", () => {
  const isFullscreen = Boolean(document.fullscreenElement);
  fullscreenToggle.classList.toggle("is-fullscreen", isFullscreen);
  fullscreenToggle.setAttribute(
    "aria-label",
    isFullscreen ? "Exit fullscreen" : "Enter fullscreen"
  );
});

requestAnimationFrame((now) => {
  state.lastFrame = now;
  positionDirectionArrow();
  animate(now);
});
