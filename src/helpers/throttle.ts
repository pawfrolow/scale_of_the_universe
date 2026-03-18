export function throttle<T extends (...args: unknown[]) => void>(fn: T, wait = 100) {
  let lastTime = 0;
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;

  return (...args: Parameters<T>) => {
    const now = Date.now();
    const remaining = wait - (now - lastTime);

    lastArgs = args;

    if (remaining <= 0) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }

      lastTime = now;
      fn(...args);
      return;
    }

    if (!timeout) {
      timeout = setTimeout(() => {
        lastTime = Date.now();
        timeout = null;

        if (lastArgs) {
          fn(...lastArgs);
        }
      }, remaining);
    }
  };
}
