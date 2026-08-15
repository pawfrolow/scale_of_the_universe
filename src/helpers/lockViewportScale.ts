const LOCK_VERSION = 1;

type ViewportScaleLockWindow = Window & {
  __sotuViewportScaleLockVersion?: number;
};

export const lockViewportScale = () => {
  const scaleLockWindow = window as ViewportScaleLockWindow;

  if (scaleLockWindow.__sotuViewportScaleLockVersion === LOCK_VERSION) {
    return;
  }

  scaleLockWindow.__sotuViewportScaleLockVersion = LOCK_VERSION;

  let lastTouchEndAt = 0;

  const preventDefault = (event: Event) => {
    event.preventDefault();
  };

  const preventMultiTouchMove = (event: TouchEvent) => {
    if (event.touches.length > 1) {
      event.preventDefault();
    }
  };

  const preventDoubleTapZoom = (event: TouchEvent) => {
    const now = Date.now();

    if (now - lastTouchEndAt <= 300) {
      event.preventDefault();
    }

    lastTouchEndAt = now;
  };

  document.addEventListener('gesturestart', preventDefault, { passive: false });
  document.addEventListener('gesturechange', preventDefault, { passive: false });
  document.addEventListener('gestureend', preventDefault, { passive: false });
  document.addEventListener('touchmove', preventMultiTouchMove, { passive: false });
  document.addEventListener('touchend', preventDoubleTapZoom, { passive: false });
};
