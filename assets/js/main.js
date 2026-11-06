import { initDiagramText } from "./modules/diagram-text.js";
import { initGears } from "./modules/gears.js";
import { initGlossary } from "./modules/glossary.js";
import { initPartsExplorer } from "./modules/parts-explorer.js";
import { initPowerAnimation } from "./modules/power-animation.js";
import { initShiftAnimation } from "./modules/shift-animation.js";

const init = () => {
  initDiagramText();
  initGlossary();
  initPartsExplorer();
  initPowerAnimation();
  initGears();
  initShiftAnimation();
};

document.addEventListener("DOMContentLoaded", init);
