/* eslint-disable no-console */
export function enterFullscreen(element: HTMLElement = document.documentElement) {
  const target = element as HTMLElement & {
    webkitRequestFullscreen?: () => Promise<void> | void;
    mozRequestFullScreen?: () => Promise<void> | void;
    msRequestFullscreen?: () => Promise<void> | void;
  };

  if (document.fullscreenElement) {
    return;
  }

  if (target.requestFullscreen) {
    void target.requestFullscreen().catch(console.error);
    return;
  }

  if (target.webkitRequestFullscreen) {
    void Promise.resolve(target.webkitRequestFullscreen()).catch(console.error);
    return;
  }

  if (target.mozRequestFullScreen) {
    void Promise.resolve(target.mozRequestFullScreen()).catch(console.error);
    return;
  }

  if (target.msRequestFullscreen) {
    void Promise.resolve(target.msRequestFullscreen()).catch(console.error);
  }
}

export function exitFullscreen() {
  const doc = document as Document & {
    webkitExitFullscreen?: () => Promise<void> | void;
    mozCancelFullScreen?: () => Promise<void> | void;
    msExitFullscreen?: () => Promise<void> | void;
  };

  if (doc.exitFullscreen) {
    void doc.exitFullscreen().catch(console.error);
    return;
  }

  if (doc.webkitExitFullscreen) {
    void Promise.resolve(doc.webkitExitFullscreen()).catch(console.error);
    return;
  }

  if (doc.mozCancelFullScreen) {
    void Promise.resolve(doc.mozCancelFullScreen()).catch(console.error);
    return;
  }

  if (doc.msExitFullscreen) {
    void Promise.resolve(doc.msExitFullscreen()).catch(console.error);
  }
}

export function toggleFullscreen(element: HTMLElement = document.documentElement) {
  if (document.fullscreenElement) {
    exitFullscreen();
  } else {
    enterFullscreen(element);
  }
}
