export interface FocusRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface FitInput {
  bounds: FocusRect;
  viewport: FocusRect;
  origin: { x: number; y: number };
  preferredScale: number;
  descriptionFontSize: number;
  cssPixelsPerUnit: number;
}

export function fitItemToViewport({
  bounds,
  viewport,
  origin,
  preferredScale,
  descriptionFontSize,
  cssPixelsPerUnit,
}: FitInput) {
  const fallback = { scale: 1, x: 0, y: 0, useModal: true };
  const values = [
    ...Object.values(bounds),
    ...Object.values(viewport),
    origin.x,
    origin.y,
    preferredScale,
    descriptionFontSize,
    cssPixelsPerUnit,
  ];
  if (
    !values.every(Number.isFinite) ||
    [
      bounds.width,
      bounds.height,
      viewport.width,
      viewport.height,
      preferredScale,
      descriptionFontSize,
      cssPixelsPerUnit,
    ].some((value) => value <= 0)
  ) {
    return fallback;
  }

  const scale = Math.min(
    preferredScale,
    viewport.width / bounds.width,
    viewport.height / bounds.height,
  );
  const minX = viewport.x - bounds.x * scale;
  const maxX = viewport.x + viewport.width - (bounds.x + bounds.width) * scale;
  const minY = viewport.y - bounds.y * scale;
  const maxY = viewport.y + viewport.height - (bounds.y + bounds.height) * scale;

  return {
    scale,
    x: Math.max(minX, Math.min(maxX, origin.x)),
    y: Math.max(minY, Math.min(maxY, origin.y)),
    useModal: descriptionFontSize * scale * cssPixelsPerUnit < 11,
  };
}
