import { E } from '@/helpers/e';

export const calculateScale = (scaleExp: number, coeff: number, realRatio: number) => {
  const rawScale = E(scaleExp) * coeff * realRatio;

  return rawScale;
};
