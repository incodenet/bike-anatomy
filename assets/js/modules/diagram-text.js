const getDiagramUnit = (svg) => {
  const viewBoxWidth = svg.viewBox.baseVal?.width;
  const renderedWidth = svg.getBoundingClientRect().width;

  if (!viewBoxWidth || !renderedWidth) return null;

  return viewBoxWidth / renderedWidth;
};

const renderDiagramUnit = (svg) => {
  const unit = getDiagramUnit(svg);

  if (unit) svg.style.setProperty("--diagram-unit", unit.toFixed(3));
};

export const initDiagramText = () => {
  const diagrams = document.querySelectorAll("[data-diagram-text]");

  if (!diagrams.length) return;

  if (!("ResizeObserver" in window)) {
    diagrams.forEach(renderDiagramUnit);
    return;
  }

  const observer = new ResizeObserver((entries) => {
    entries.forEach((entry) => renderDiagramUnit(entry.target));
  });

  diagrams.forEach((svg) => observer.observe(svg));
};
