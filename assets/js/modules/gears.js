import { DEFAULT_GEAR, GEARING } from "../data/gearing.js";
import { onActivate } from "../utils/dom.js";
import { calculateGear, formatSpeed } from "../utils/gearing.js";
import { createCogDrawing } from "./cog-drawing.js";

const GEAR_COUNT = GEARING.cogTeeth.length;

const clampGear = (gear) => Math.max(1, Math.min(GEAR_COUNT, gear));

export const initGears = () => {
  const root = document.querySelector("[data-gear-explorer]");

  if (!root) return;

  const gearInput = root.querySelector("#gear");
  const cadenceInput = root.querySelector("#cadence");
  const wheelSelect = root.querySelector("#wheel-size");

  if (!gearInput || !cadenceInput || !wheelSelect) return;

  const result = (name) => root.querySelector(`[data-result="${name}"]`);
  const outputs = {
    gear: result("gear"),
    cadence: result("cadence"),
    cadenceValue: result("cadence-value"),
    cog: result("cog"),
    ratio: result("ratio"),
    speed: result("speed"),
    best: result("best"),
  };
  const cogs = [...root.querySelectorAll("[data-cog]")];
  const cogLabels = [...root.querySelectorAll("[data-cog-gear]")];
  const bars = [...root.querySelectorAll("[data-gear-bar]")];
  const rows = [...root.querySelectorAll("[data-gear-row]")];
  const moveDerailleur = createCogDrawing(root);

  let activeGear = null;

  const getSettings = () => {
    const wheel = wheelSelect.selectedOptions[0];

    return {
      chainringTeeth: GEARING.chainringTeeth,
      wheelCircumference: Number(wheel.value),
      wheelDiameter: Number(wheel.dataset.diameter),
      cadence: Number(cadenceInput.value),
    };
  };

  const calculateFor = (gear) =>
    calculateGear({ ...getSettings(), cogTeeth: GEARING.cogTeeth[gear - 1] });

  const renderReadout = (gear) => {
    const teeth = GEARING.cogTeeth[gear - 1];
    const { ratio, speedKmh } = calculateFor(gear);

    gearInput.value = gear;
    gearInput.setAttribute(
      "aria-valuetext",
      `Gear ${gear}, ${teeth}-tooth cog, ratio ${ratio.toFixed(2)}`,
    );
    outputs.gear.textContent = gear;
    outputs.cog.textContent = `${teeth} teeth`;
    outputs.ratio.textContent = ratio.toFixed(2);
    outputs.speed.textContent = formatSpeed(speedKmh);
    outputs.best.textContent = GEARING.bestFor[gear - 1];
  };

  const renderActive = (gear) => {
    const isGear = (value) => Number(value) === gear;

    cogs.forEach((cog) =>
      cog.classList.toggle("active", isGear(cog.dataset.cog)),
    );
    cogLabels.forEach((label) => {
      label.classList.toggle("active", isGear(label.dataset.cogGear));
    });
    bars.forEach((bar) => {
      bar.setAttribute("aria-pressed", String(isGear(bar.dataset.gearBar)));
    });
    rows.forEach((row) =>
      row.classList.toggle("active", isGear(row.dataset.gearRow)),
    );
  };

  const renderTable = () => {
    rows.forEach((row) => {
      const { gearInches, distance, speedKmh } = calculateFor(
        Number(row.dataset.gearRow),
      );

      row.querySelector('[data-cell="gear-inches"]').textContent =
        gearInches.toFixed(1);
      row.querySelector('[data-cell="distance"]').textContent =
        `${distance.toFixed(2)} m`;
      row.querySelector('[data-cell="speed"]').textContent =
        formatSpeed(speedKmh);
    });
    outputs.cadence.textContent = `${cadenceInput.value} rpm`;
    outputs.cadenceValue.textContent = cadenceInput.value;
  };

  const setGear = (gear) => {
    const nextGear = clampGear(gear);

    renderReadout(nextGear);
    renderActive(nextGear);
    if (nextGear !== activeGear) moveDerailleur?.(nextGear);
    activeGear = nextGear;
  };

  const onSettingsChange = () => {
    renderTable();
    setGear(activeGear);
  };

  gearInput.addEventListener("input", () => setGear(Number(gearInput.value)));
  cadenceInput.addEventListener("input", onSettingsChange);
  wheelSelect.addEventListener("change", onSettingsChange);
  bars.forEach((bar) =>
    onActivate(bar, () => setGear(Number(bar.dataset.gearBar))),
  );

  setGear(DEFAULT_GEAR);
};
