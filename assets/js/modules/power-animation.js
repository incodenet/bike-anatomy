import { prefersReducedMotion } from "../utils/dom.js";

const VISIBLE_THRESHOLD = 0.2;

// Reduced motion: nothing moves until the reader presses Play.
const bindPlayOnce = (root, button) => {
  button.textContent = "Play";
  button.addEventListener("click", () => {
    root.classList.remove("is-playing-once");
    void root.offsetWidth; // restart the CSS animation
    root.classList.add("is-playing-once");
  });
};

// Runs only while on screen; the button pauses and resumes it.
const bindAutoplay = (root, button) => {
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          root.classList.toggle("is-running", entry.isIntersecting);
        });
      },
      { threshold: VISIBLE_THRESHOLD },
    );
    observer.observe(root);
  } else {
    root.classList.add("is-running");
  }

  button.addEventListener("click", () => {
    const isPaused = root.classList.toggle("is-paused");

    button.textContent = isPaused ? "Play" : "Pause";
  });
};

export const initPowerAnimation = () => {
  const root = document.querySelector("[data-power-animation]");
  const button = root?.querySelector('[data-action="toggle-animation"]');

  if (!root || !button) return;

  if (prefersReducedMotion) {
    bindPlayOnce(root, button);
    return;
  }

  bindAutoplay(root, button);
};
