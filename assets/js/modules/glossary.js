import { onEscape } from "../utils/dom.js";

const POPOVER_MAX_WIDTH = 300;
const VIEWPORT_GUTTER = 12;
const POPOVER_OFFSET_Y = 8;

// Keeps the popover inside the viewport, below the term. Page coordinates.
const getPopoverPosition = ({ rect, viewportWidth, scrollX, scrollY }) => {
  const width = Math.min(
    POPOVER_MAX_WIDTH,
    viewportWidth - VIEWPORT_GUTTER * 2,
  );
  const rightLimit = scrollX + viewportWidth - VIEWPORT_GUTTER - width;
  const left = Math.min(scrollX + rect.left, rightLimit);

  return {
    width,
    left: Math.max(scrollX + VIEWPORT_GUTTER, left),
    top: scrollY + rect.bottom + POPOVER_OFFSET_Y,
  };
};

// Formatted markup wraps text across lines; collapse it for display and ARIA.
const getText = (element) =>
  element?.textContent.replace(/\s+/g, " ").trim() ?? "";

const renderPopoverContent = (popover, { term, definition }) => {
  const title = document.createElement("strong");
  title.className = "popover-title";
  title.textContent = term;
  popover.replaceChildren(title, definition);
};

export const initGlossary = () => {
  const popover = document.querySelector("#glossary-popover");
  const terms = document.querySelectorAll("[data-term]");

  if (!popover || terms.length === 0) return;

  let openTerm = null;

  const hide = () => {
    popover.hidden = true;
    openTerm?.removeAttribute("aria-describedby");
    openTerm = null;
  };

  const show = (termButton) => {
    const entry = document.querySelector(`#term-${termButton.dataset.term}`);
    if (!entry) return;

    openTerm?.removeAttribute("aria-describedby");
    renderPopoverContent(popover, {
      term: getText(entry),
      definition: getText(entry.nextElementSibling),
    });
    popover.hidden = false;

    const { width, left, top } = getPopoverPosition({
      rect: termButton.getBoundingClientRect(),
      viewportWidth: window.innerWidth,
      scrollX: window.scrollX,
      scrollY: window.scrollY,
    });
    popover.style.setProperty("--popover-max-width", `${width}px`);
    popover.style.setProperty("--popover-left", `${left}px`);
    popover.style.setProperty("--popover-top", `${top}px`);

    openTerm = termButton;
    termButton.setAttribute("aria-describedby", popover.id);
  };

  terms.forEach((termButton) => {
    termButton.setAttribute(
      "aria-label",
      `${getText(termButton)}: show definition`,
    );
    termButton.addEventListener("mouseenter", () => show(termButton));
    termButton.addEventListener("mouseleave", hide);
    termButton.addEventListener("focus", () => show(termButton));
    termButton.addEventListener("blur", hide);
    termButton.addEventListener("click", (event) => {
      event.stopPropagation();
      show(termButton);
    });
  });

  document.addEventListener("click", (event) => {
    if (openTerm && !popover.contains(event.target)) hide();
  });
  onEscape(hide);
};
