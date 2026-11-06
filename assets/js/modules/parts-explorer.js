import { PARTS } from "../data/parts.js";
import { onActivate, onEscape } from "../utils/dom.js";

const EMPTY_TEXT = "No part selected.";

const centerScroll = (container) => {
  if (!container || container.scrollWidth <= container.clientWidth) return;

  container.scrollLeft = (container.scrollWidth - container.clientWidth) / 2;
};

export const initPartsExplorer = () => {
  const root = document.querySelector("[data-parts-explorer]");

  if (!root) return;

  const drawing = root.querySelector("[data-parts-drawing]");
  const highlights = [...root.querySelectorAll("[data-part-highlight]")];
  const hotspots = [...root.querySelectorAll("[data-part-hotspot]")];
  const legendButtons = [...root.querySelectorAll("[data-part-button]")];
  const partName = root.querySelector("[data-part-name]");
  const partText = root.querySelector("[data-part-text]");

  if (!drawing || !partName || !partText) return;

  const renderPart = (number) => {
    const part = PARTS[number];

    highlights.forEach((group) => {
      group.classList.toggle("active", group.dataset.partHighlight === number);
    });
    hotspots.forEach((hotspot) => {
      hotspot.classList.toggle(
        "active",
        hotspot.dataset.partHotspot === number,
      );
    });
    legendButtons.forEach((button) => {
      button.classList.toggle("active", button.dataset.partButton === number);
    });

    partName.textContent = part
      ? `${number}. ${part.name} (${part.system.toLowerCase()}).`
      : "";
    partText.textContent = part?.description ?? EMPTY_TEXT;
  };

  const clearPart = () => renderPart(null);

  hotspots.forEach((hotspot) => {
    const number = hotspot.dataset.partHotspot;

    hotspot.addEventListener("mouseenter", () => renderPart(number));
    hotspot.addEventListener("focus", () => renderPart(number));
    onActivate(hotspot, () => renderPart(number));
  });

  legendButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      renderPart(button.dataset.partButton);

      if (root.getBoundingClientRect().top < 0)
        root.scrollIntoView({ block: "start" });
    });
  });

  drawing.addEventListener("click", (event) => {
    if (!event.target.closest("[data-part-hotspot]")) clearPart();
  });
  onEscape(clearPart);

  centerScroll(root.querySelector("[data-scroll-center]"));
};
