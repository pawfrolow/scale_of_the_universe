export function getCssPxVar(name: string): number {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  if (!value) {
    return 0;
  }

  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}
