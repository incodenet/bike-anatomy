export const initShiftDemo = () => {
  const root = document.querySelector("[data-shift-demo]");
  const button = root?.querySelector('[data-action="shift"]');

  if (!root || !button) return;

  button.addEventListener("click", () => {
    const isShifted = root.classList.toggle("is-shifted");

    button.textContent = isShifted ? "Shift back" : "Play a shift";
  });
};
