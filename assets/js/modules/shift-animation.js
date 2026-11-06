import { GEARING } from "../data/gearing.js";
import { prefersReducedMotion } from "../utils/dom.js";

const AXLE_Y = 118;
const GEAR_1_X = 186;
const COG_SPACING = 30;
const COG_HALF_HEIGHT_PER_TOOTH = 2.5;
const CHAINRING_BOTTOM = { x: 548, y: 228 };

const PULLEY_BELOW_COG = 18;
const TENSION_PULLEY_BELOW_GUIDE = 52;
const CHAIN_BELOW_GUIDE = 64;

const FIXED_PIVOT = { x: 120, top: 240, bottom: 276 };
const KNUCKLE_LEFT_OF_CAGE = 24;
const LINK_SPACING = 36;
const CABLE_ANCHOR_ABOVE_GUIDE = 8;
const SPRING_START = { x: 124, y: 284 };
const SPRING_END_BELOW_GUIDE = 38;
const SPRING_COILS = 8;
const SPRING_WIDTH = 5;
const PARALLELOGRAM_LEADER_AT = 0.35;

const GUIDE_LABEL_OFFSET = { x: 18, y: 5 };
const TENSION_LABEL_BELOW_GUIDE = 86;
const BADGE_ABOVE_COG = 20;
const CHAIN_HOP_LIFT = 8;
const CHAIN_SPEED = 12;
const CABLE_SPEED = 25;
const TRIGGER_TRAVEL = 6;

const TIMELINE = {
  displayFlip: 200,
  click: 300,
  cableStart: 100,
  swingStart: 400,
  swingLength: 1000,
  hopStart: 1400,
  hopLength: 900,
  total: 2500,
};

const SHIFTS = {
  pull: {
    from: 4,
    to: 3,
    cableDirection: 1,
    result: "easier",
    stepForPhase: [1, 2, 3],
    messages: [
      () => "Click: the shifter pulls the cable one step.",
      (teeth) =>
        `The cable swings the parallelogram, carrying the guide pulley under the bigger ${teeth}-tooth cog.`,
      (teeth) =>
        `You keep pedalling, and the chain climbs onto the ${teeth}-tooth cog.`,
    ],
  },
  release: {
    from: 3,
    to: 4,
    cableDirection: -1,
    result: "harder",
    stepForPhase: [1, 3, 3],
    messages: [
      () => "Click: the shifter releases the cable one step.",
      (teeth) =>
        `The spring swings the parallelogram back, under the smaller ${teeth}-tooth cog.`,
      (teeth) =>
        `You keep pedalling, and the chain drops onto the ${teeth}-tooth cog.`,
    ],
  },
};

const clamp = (value) => Math.min(1, Math.max(0, value));

const easeInOutQuad = (progress) =>
  progress < 0.5 ? 2 * progress * progress : 1 - (-2 * progress + 2) ** 2 / 2;

const interpolate = (from, to, progress) => from + (to - from) * progress;

const round = (value) => Math.round(value * 10) / 10;

const getCogX = (gear) => GEAR_1_X + (gear - 1) * COG_SPACING;

const getTeeth = (gear) => {
  const index = Math.min(5, Math.floor(gear - 1));
  const { cogTeeth } = GEARING;

  return interpolate(cogTeeth[index], cogTeeth[index + 1], gear - 1 - index);
};

const getCogHalfHeight = (gear) => getTeeth(gear) * COG_HALF_HEIGHT_PER_TOOTH;

const getGuidePulley = (gear) => ({
  x: getCogX(gear),
  y: AXLE_Y + getCogHalfHeight(gear) + PULLEY_BELOW_COG,
});

const getProgress = (elapsed, start, length) =>
  easeInOutQuad(clamp((elapsed - start) / length));

const getPhase = (elapsed) => {
  if (elapsed >= TIMELINE.total) return 0;
  if (elapsed < TIMELINE.swingStart) return 1;

  return elapsed < TIMELINE.hopStart ? 2 : 3;
};

const getShiftFrame = ({ shift, elapsed }) => {
  const swing = getProgress(elapsed, TIMELINE.swingStart, TIMELINE.swingLength);
  const hop = getProgress(elapsed, TIMELINE.hopStart, TIMELINE.hopLength);
  const isClicking = elapsed < TIMELINE.click;
  const isCableMoving =
    elapsed > TIMELINE.cableStart && elapsed < TIMELINE.hopStart;

  return {
    cageGear: interpolate(shift.from, shift.to, swing),
    chainGear: interpolate(shift.from, shift.to, hop),
    chainLift: Math.sin(Math.PI * hop) * CHAIN_HOP_LIFT,
    ghostOpacity: Math.min(1, swing * 3) * 0.9,
    displayGear: elapsed < TIMELINE.displayFlip ? shift.from : shift.to,
    triggerOffset: isClicking
      ? -Math.sin((Math.PI * elapsed) / TIMELINE.click) * TRIGGER_TRAVEL
      : 0,
    cableOpacity: isCableMoving ? 1 : 0,
    cableOffset: (shift.cableDirection * elapsed) / CABLE_SPEED,
    chainOffset: -elapsed / CHAIN_SPEED,
    phase: getPhase(elapsed),
  };
};

const buildSpringPath = ({ start, end }) => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.hypot(dx, dy) || 1;
  const normal = {
    x: (-dy / length) * SPRING_WIDTH,
    y: (dx / length) * SPRING_WIDTH,
  };
  const bends = Array.from({ length: SPRING_COILS * 2 - 1 }, (_, index) => {
    const along = (index + 1) / (SPRING_COILS * 2);
    const side = index % 2 === 0 ? 1 : -1;

    return `L${round(start.x + dx * along + normal.x * side)} ${round(start.y + dy * along + normal.y * side)}`;
  });

  return `M${start.x} ${start.y} ${bends.join(" ")} L${round(end.x)} ${round(end.y)}`;
};

const setAttributes = (elements, attributes) => {
  elements.forEach((element) => {
    Object.entries(attributes).forEach(([name, value]) => {
      element.setAttribute(
        name,
        typeof value === "number" ? round(value) : value,
      );
    });
  });
};

const translate = ({ x, y }) => `translate(${round(x)} ${round(y)})`;

const renderDerailleur = (parts, gear) => {
  const guide = getGuidePulley(gear);
  const knuckleX = guide.x - KNUCKLE_LEFT_OF_CAGE;
  const springEnd = { x: knuckleX, y: guide.y + SPRING_END_BELOW_GUIDE };
  const springMid = {
    x: (SPRING_START.x + springEnd.x) / 2,
    y: (SPRING_START.y + springEnd.y) / 2,
  };
  const linkPoint = {
    x: interpolate(FIXED_PIVOT.x, knuckleX, PARALLELOGRAM_LEADER_AT),
    y: interpolate(FIXED_PIVOT.top, guide.y, PARALLELOGRAM_LEADER_AT),
  };

  setAttributes(parts.cage, { transform: translate(guide) });
  setAttributes(parts.body, {
    points: `${FIXED_PIVOT.x},${FIXED_PIVOT.top} ${round(knuckleX)},${round(guide.y)} ${round(knuckleX)},${round(guide.y + LINK_SPACING)} ${FIXED_PIVOT.x},${FIXED_PIVOT.bottom}`,
  });
  setAttributes(parts.linkTop, { x2: knuckleX, y2: guide.y });
  setAttributes(parts.linkBottom, { x2: knuckleX, y2: guide.y + LINK_SPACING });
  setAttributes(parts.pivotTop, { cx: knuckleX, cy: guide.y });
  setAttributes(parts.pivotBottom, {
    cx: knuckleX,
    cy: guide.y + LINK_SPACING,
  });
  setAttributes(parts.spring, {
    d: buildSpringPath({ start: SPRING_START, end: springEnd }),
  });
  setAttributes(parts.cable, {
    x2: knuckleX,
    y2: guide.y - CABLE_ANCHOR_ABOVE_GUIDE,
  });
  setAttributes(parts.guideLabel, {
    x: guide.x + GUIDE_LABEL_OFFSET.x,
    y: guide.y + GUIDE_LABEL_OFFSET.y,
  });
  setAttributes(parts.tensionLabel, {
    x: guide.x,
    y: guide.y + TENSION_LABEL_BELOW_GUIDE,
  });
  setAttributes(parts.springLeader, { x2: springMid.x, y2: springMid.y });
  setAttributes(parts.springLeaderEnd, { cx: springMid.x, cy: springMid.y });
  setAttributes(parts.bodyLeader, { x2: linkPoint.x, y2: linkPoint.y });
  setAttributes(parts.bodyLeaderEnd, { cx: linkPoint.x, cy: linkPoint.y });
};

const renderChain = (
  parts,
  { chainGear, cageGear, chainLift, chainOffset },
) => {
  const cogX = getCogX(chainGear);
  const halfHeight = getCogHalfHeight(chainGear);
  const guide = getGuidePulley(cageGear);
  const lowerRun = [
    [cogX, AXLE_Y + halfHeight],
    [guide.x, guide.y],
    [guide.x, guide.y + CHAIN_BELOW_GUIDE],
    [CHAINRING_BOTTOM.x, CHAINRING_BOTTOM.y],
  ];

  setAttributes(parts.chainTop, {
    x1: cogX,
    y1: AXLE_Y - halfHeight - chainLift,
  });
  setAttributes(parts.chainLower, {
    points: lowerRun.map(([x, y]) => `${round(x)},${round(y)}`).join(" "),
  });
  setAttributes([...parts.chainTop, ...parts.chainLower], {
    "stroke-dashoffset": chainOffset,
  });
  parts.cogs.forEach((cog, index) => {
    const opacity = Math.max(0, 1 - Math.abs(index + 1 - chainGear));

    cog.setAttribute("opacity", opacity.toFixed(2));
  });
};

const renderShifter = (parts, shift, frame) => {
  const ghost = getGuidePulley(shift.from);
  const target = getGuidePulley(shift.to);

  parts.display.forEach((display) => {
    display.textContent = frame.displayGear;
  });
  setAttributes(parts.trigger, {
    transform: translate({ x: frame.triggerOffset, y: 0 }),
  });
  setAttributes(parts.cableFlow, {
    opacity: frame.cableOpacity,
    "stroke-dashoffset": frame.cableOffset,
  });
  setAttributes(parts.ghost, {
    transform: translate(ghost),
    opacity: frame.ghostOpacity,
  });
  setAttributes(parts.hopBadge, {
    transform: translate({
      x: target.x,
      y: AXLE_Y - getCogHalfHeight(shift.to) - BADGE_ABOVE_COG,
    }),
  });
};

const PART_NAMES = [
  "cage",
  "body",
  "linkTop",
  "linkBottom",
  "pivotTop",
  "pivotBottom",
  "spring",
  "cable",
  "guideLabel",
  "tensionLabel",
  "springLeader",
  "springLeaderEnd",
  "bodyLeader",
  "bodyLeaderEnd",
  "chainTop",
  "chainLower",
  "display",
  "trigger",
  "cableFlow",
  "ghost",
  "hopBadge",
];

const queryParts = (root) => {
  const parts = Object.fromEntries(
    PART_NAMES.map((name) => [
      name,
      [...root.querySelectorAll(`[data-shift-part="${name}"]`)],
    ]),
  );

  return { ...parts, cogs: [...root.querySelectorAll("[data-shift-cog]")] };
};

export const initShiftAnimation = () => {
  const root = document.querySelector("[data-shift-animation]");
  const replayButton = root?.querySelector('[data-action="replay"]');
  const releaseButton = root?.querySelector('[data-action="release"]');
  const status = root?.querySelector("[data-shift-status]");

  if (!root || !replayButton || !releaseButton || !status) return;

  const parts = queryParts(root);
  const badges = [...root.querySelectorAll("[data-shift-badge]")];
  const steps = [
    ...(root.closest("section")?.querySelectorAll("[data-shift-step]") ?? []),
  ];
  let activePhase = -1;
  let frameRequest = null;

  const renderPhase = (shift, phase) => {
    if (phase === activePhase) return;

    activePhase = phase;
    const step = phase ? shift.stepForPhase[phase - 1] : 0;

    badges.forEach((badge) => {
      badge.classList.toggle(
        "active",
        Number(badge.dataset.shiftBadge) === phase,
      );
    });
    steps.forEach((item) => {
      item.classList.toggle("active", Number(item.dataset.shiftStep) === step);
    });
    if (phase) {
      status.textContent = `${phase}. ${shift.messages[phase - 1](GEARING.cogTeeth[shift.to - 1])}`;
    }
  };

  const renderFrame = (shift, elapsed) => {
    const frame = getShiftFrame({ shift, elapsed });

    renderDerailleur(parts, frame.cageGear);
    renderChain(parts, frame);
    renderShifter(parts, shift, frame);
    renderPhase(shift, frame.phase);
  };

  const renderEnd = (shift) => {
    renderFrame(shift, TIMELINE.total);
    status.textContent = `Now in gear ${shift.to} (${GEARING.cogTeeth[shift.to - 1]}-tooth cog): one step ${shift.result}.`;
  };

  const play = (shift) => {
    const start = performance.now();

    if (frameRequest) cancelAnimationFrame(frameRequest);
    activePhase = -1;

    const step = (now) => {
      const elapsed = now - start;

      if (elapsed >= TIMELINE.total) {
        frameRequest = null;
        renderEnd(shift);
        return;
      }

      renderFrame(shift, Math.max(0, elapsed));
      frameRequest = requestAnimationFrame(step);
    };

    frameRequest = requestAnimationFrame(step);
  };

  const bindAutoplay = () => {
    if (!("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        observer.disconnect();
        play(SHIFTS.pull);
      },
      { threshold: 0.6 },
    );

    observer.observe(root);
  };

  replayButton.addEventListener("click", () => play(SHIFTS.pull));
  releaseButton.addEventListener("click", () => play(SHIFTS.release));

  if (prefersReducedMotion) {
    replayButton.textContent = "Play";
    renderEnd(SHIFTS.pull);
    return;
  }

  renderFrame(SHIFTS.pull, 0);
  renderPhase(SHIFTS.pull, 0);
  status.textContent = "";
  bindAutoplay();
};
