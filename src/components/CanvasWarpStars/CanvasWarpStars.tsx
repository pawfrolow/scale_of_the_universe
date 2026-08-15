import React, { useEffect, useRef } from 'react';

import { initCanvasWarpStars } from './canvas-warp-stars';
import styles from './styles.module.scss';

export const CanvasWarpStars = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return undefined;
    }

    return initCanvasWarpStars(canvas);
  }, []);

  return (
    <div className={styles.canvasWarpStars} aria-hidden="true">
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
};
