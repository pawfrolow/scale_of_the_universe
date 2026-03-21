import { isProduction } from '@/config';

export const ymClick = (goalName: string, params = {}) => {
  if (isProduction) {
    window.ym(108142388, 'reachGoal', goalName, {
      ...params,
    });
  }
};
