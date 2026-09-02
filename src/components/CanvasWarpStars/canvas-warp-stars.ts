const PARTICLE_NUM = 500;
const PARTICLE_BASE_RADIUS = 0.5;
const FOCAL_LENGTH = 500;
const DEFAULT_SPEED = 1;
const FAR_Z = 2000;
const NEAR_Z = 0.01;

type Particle = {
  x: number;
  y: number;
  z: number;
  pastZ: number;
};

type CanvasWarpStarsState = {
  cleanup: () => void;
};

const canvasStates = new WeakMap<HTMLCanvasElement, CanvasWarpStarsState>();

const createParticle = (): Particle => ({
  x: 0,
  y: 0,
  z: 0,
  pastZ: 0,
});

const randomizeParticle = (particle: Particle, canvasWidth: number, canvasHeight: number) => {
  particle.x = Math.random() * canvasWidth;
  particle.y = Math.random() * canvasHeight;
  particle.z = Math.random() * 1500 + 500;
  particle.pastZ = particle.z;

  return particle;
};

const getCanvasViewport = (canvas: HTMLCanvasElement) => {
  const rect = canvas.parentElement?.getBoundingClientRect() ?? canvas.getBoundingClientRect();
  const width = rect.width || window.innerWidth || document.documentElement.clientWidth || 1;
  const height = rect.height || window.innerHeight || document.documentElement.clientHeight || 1;
  const visualViewport = window.visualViewport;

  return {
    width: Math.max(1, Math.round(width)),
    height: Math.max(1, Math.round(height)),
    centerX: visualViewport ? visualViewport.offsetLeft + visualViewport.width * 0.5 : width * 0.5,
    centerY: visualViewport ? visualViewport.offsetTop + visualViewport.height * 0.5 : height * 0.5,
  };
};

export const initCanvasWarpStars = (canvas: HTMLCanvasElement) => {
  canvasStates.get(canvas)?.cleanup();

  const context = canvas.getContext('2d');

  if (!context) {
    return () => undefined;
  }

  let canvasWidth = 0;
  let canvasHeight = 0;
  let centerX = 0;
  let centerY = 0;
  let mouseX = 0;
  let mouseY = 0;
  let animationFrameId = 0;
  let resizeFrameId = 0;
  let isDisposed = false;
  const particles = Array.from({ length: PARTICLE_NUM }, createParticle);

  const resize = () => {
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const viewport = getCanvasViewport(canvas);
    const width = viewport.width;
    const height = viewport.height;

    canvasWidth = width;
    canvasHeight = height;
    centerX = viewport.centerX;
    centerY = viewport.centerY;
    mouseX = centerX;
    mouseY = centerY;

    canvas.width = Math.max(1, Math.floor(width * pixelRatio));
    canvas.height = Math.max(1, Math.floor(height * pixelRatio));
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.fillStyle = '#ffffff';
  };

  const scheduleResize = () => {
    window.cancelAnimationFrame(resizeFrameId);
    resizeFrameId = window.requestAnimationFrame(resize);
  };

  const resetParticles = () => {
    particles.forEach((particle) => {
      randomizeParticle(particle, canvasWidth, canvasHeight);
      particle.z -= 500 * Math.random();
      particle.pastZ = Math.max(particle.z + DEFAULT_SPEED, NEAR_Z);
    });
  };

  const handleMouseMove = (event: MouseEvent) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
  };

  const draw = () => {
    if (isDisposed) {
      return;
    }

    if (!canvas.isConnected) {
      cleanup();
      return;
    }

    context.fillStyle = '#050612';
    context.fillRect(0, 0, canvasWidth, canvasHeight);
    context.fillStyle = '#ffffff';

    const cameraX = centerX - (mouseX - centerX) * 1.25;
    const cameraY = centerY - (mouseY - centerY) * 1.25;
    const halfPi = Math.PI * 0.5;

    context.beginPath();

    particles.forEach((particle) => {
      particle.pastZ = particle.z;
      particle.z -= DEFAULT_SPEED;

      if (particle.z <= 0) {
        randomizeParticle(particle, canvasWidth, canvasHeight);
        particle.pastZ = FAR_Z;
        return;
      }

      const relativeX = particle.x - cameraX;
      const relativeY = particle.y - cameraY;
      const perspective = FOCAL_LENGTH / particle.z;
      const x = cameraX + relativeX * perspective;
      const y = cameraY + relativeY * perspective;
      const radius = PARTICLE_BASE_RADIUS * perspective;
      const previousPerspective = FOCAL_LENGTH / Math.max(particle.pastZ, NEAR_Z);
      const previousX = cameraX + relativeX * previousPerspective;
      const previousY = cameraY + relativeY * previousPerspective;
      const previousRadius = PARTICLE_BASE_RADIUS * previousPerspective;
      const angle = Math.atan2(previousY - y, previousX - x);
      const angleLeft = angle + halfPi;
      const angleRight = angle - halfPi;

      context.moveTo(
        previousX + previousRadius * Math.cos(angleLeft),
        previousY + previousRadius * Math.sin(angleLeft),
      );
      context.arc(previousX, previousY, previousRadius, angleLeft, angleRight, true);
      context.lineTo(x + radius * Math.cos(angleRight), y + radius * Math.sin(angleRight));
      context.arc(x, y, radius, angleRight, angleLeft, true);
      context.closePath();
    });

    context.fill();
    animationFrameId = window.requestAnimationFrame(draw);
  };

  const cleanup = () => {
    isDisposed = true;
    window.cancelAnimationFrame(animationFrameId);
    window.cancelAnimationFrame(resizeFrameId);
    window.removeEventListener('resize', scheduleResize);
    window.removeEventListener('orientationchange', scheduleResize);

    if (window.visualViewport) {
      window.visualViewport.removeEventListener('resize', scheduleResize);
      window.visualViewport.removeEventListener('scroll', scheduleResize);
    }

    document.removeEventListener('mousemove', handleMouseMove);
    canvasStates.delete(canvas);
  };

  resize();
  resetParticles();
  window.addEventListener('resize', scheduleResize);
  window.addEventListener('orientationchange', scheduleResize);

  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', scheduleResize);
    window.visualViewport.addEventListener('scroll', scheduleResize);
  }

  document.addEventListener('mousemove', handleMouseMove);
  animationFrameId = window.requestAnimationFrame(draw);

  canvasStates.set(canvas, { cleanup });

  return cleanup;
};
