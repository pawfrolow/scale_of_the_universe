import { E } from "./e";

const ROUND_NUMBER = 1000

export const calculateScale = (scaleExp: number, coeff: number, realRatio: number) => {
  const rawScale = E(scaleExp) * coeff * realRatio;
  // const scale = Math.round(rawScale * ROUND_NUMBER) / ROUND_NUMBER;

  return rawScale
}