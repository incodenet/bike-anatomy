export const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

const ACTIVATION_KEYS = ["Enter", " "];

export const onActivate = (element, handler) => {
  element.addEventListener("click", (event) => {
    event.stopPropagation();
    handler();
  });
  element.addEventListener("keydown", (event) => {
    if (!ACTIVATION_KEYS.includes(event.key)) return;

    event.preventDefault();
    handler();
  });
};

export const onEscape = (handler) => {
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") handler();
  });
};
