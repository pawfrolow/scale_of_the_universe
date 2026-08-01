import { useEffect, useState } from 'react';

export const useFullScreen = () => {
  const [isFullscreen, setIsFullscreen] = useState(() =>
    typeof document === 'undefined' ? false : Boolean(document.fullscreenElement),
  );

  useEffect(() => {
    if (typeof document === 'undefined') {
      return undefined;
    }

    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange as EventListener);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange as EventListener);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange as EventListener);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener(
        'webkitfullscreenchange',
        handleFullscreenChange as EventListener,
      );
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange as EventListener);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange as EventListener);
    };
  }, []);

  return {
    isFullscreen,
  };
};
