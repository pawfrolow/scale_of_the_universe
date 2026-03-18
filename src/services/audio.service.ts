export const createFrozenStarAudio = () => {
  const audio = new Audio('sound/frozen_star.mp3');
  audio.loop = true;
  audio.volume = 0.5;
  audio.preload = 'auto';

  return audio;
};
