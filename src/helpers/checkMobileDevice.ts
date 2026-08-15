export const checkMobileDevice = () => {
  return (
    typeof window !== 'undefined' &&
    (window.matchMedia?.('(pointer: coarse)').matches ?? 'ontouchstart' in window)
  );
};
