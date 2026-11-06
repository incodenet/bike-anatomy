import { initGears } from "./modules/gears.js";
import { initGlossary } from "./modules/glossary.js";
import { initPartsExplorer } from "./modules/parts-explorer.js";
import { initPowerAnimation } from "./modules/power-animation.js";
import { initShiftDemo } from "./modules/shift-demo.js";

const init = () => {
  initGlossary();
  initPartsExplorer();
  initPowerAnimation();
  initGears();
  initShiftDemo();
};

document.addEventListener("DOMContentLoaded", init);
