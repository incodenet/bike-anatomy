import { GEARING } from "../data/gearing.js";
import { prefersReducedMotion } from "../utils/dom.js";

// Geometry of the "seven cogs from behind" drawing, in its viewBox units.
const COG_CENTER_X = [70, 88.6, 107.5, 125.5, 142.6, 159.4, 175];
const COG_CENTER_Y = 187.3;
const COG_HEIGHT_PER_TOOTH = 9.4;
const DERAILLEUR_GAP = 8; // space between the cog's lower edge and the cage
const DERAILLEUR_HEIGHT = 44; // matches the cage <rect> height
const DERAILLEUR_LABEL_OFFSET = { x: 12, y: 27 };
const SHIFT_DURATION_MS = 500;

const easeInOutQuad = (progress) =>
  progress < 0.5 ? 2 * progress * progress : 1 - (-2 * progress + 2) ** 2 / 2;

const interpolate = (from, to, progress) => from + (to - from) * progress;

// Where the cage, chain ends and label sit for a cog at x with `teeth` teeth.
const getDerailleurLayout = ({ x, teeth }) => {
  const cogHalfHeight = (teeth * COG_HEIGHT_PER_TOOTH) / 2;
  const cageTop = COG_CENTER_Y + cogHalfHeight + DERAILLEUR_GAP;

  return {
    cageTop,
    chainTopY: COG_CENTER_Y - cogHalfHeight,
    chainBottomY: cageTop + DERAILLEUR_HEIGHT,
    labelX: x + DERAILLEUR_LABEL_OFFSET.x,
    labelY: cageTop + DERAILLEUR_LABEL_OFFSET.y,
  };
};

// Returns `moveToGear(gear)`, or null when the drawing is missing.
export const createCogDrawing = (root) => {
  const derailleur = root.querySelector("[data-derailleur]");
  const label = root.querySelector("[data-derailleur-label]");
  const chainTop = root.querySelector('[data-chain="top"]');
  const chainBottom = root.querySelector('[data-chain="bottom"]');

  if (!derailleur || !label || !chainTop || !chainBottom) return null;

  let position = null;
  let frame = null;

  const render = ({ x, teeth }) => {
    const layout = getDerailleurLayout({ x, teeth });

    derailleur.setAttribute("transform", `translate(${x},${layout.cageTop})`);
    chainTop.setAttribute("x1", x);
    chainTop.setAttribute("y1", layout.chainTopY);
    chainBottom.setAttribute("x1", x);
    chainBottom.setAttribute("y1", layout.chainBottomY);
    label.setAttribute("x", layout.labelX);
    label.setAttribute("y", layout.labelY);
    position = { x, teeth };
  };

  const animate = (from, to) => {
    const start = performance.now();

    const step = (now) => {
      const progress = easeInOutQuad(
        Math.min(1, (now - start) / SHIFT_DURATION_MS),
      );

      render({
        x: interpolate(from.x, to.x, progress),
        teeth: interpolate(from.teeth, to.teeth, progress),
      });
      if (progress < 1) frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
  };

  return (gear) => {
    const target = {
      x: COG_CENTER_X[gear - 1],
      teeth: GEARING.cogTeeth[gear - 1],
    };

    if (frame) cancelAnimationFrame(frame);
    if (!position || prefersReducedMotion) {
      render(target);
      return;
    }

    animate(position, target);
  };
};
