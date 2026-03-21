import numeral from 'numeral';

import { E } from '@/helpers/e';
import { ExtraText, SizeData } from '@/interfaces';
import { translationService } from '@/services/translation.service';

export function powToUnit(
  textureId: string,
  sizeData: SizeData,
  units: string[],
  extra: ExtraText,
) {
  // 10 сантиметров
  if (sizeData.exponent === -1) {
    const val = E(1) * sizeData.coeff;

    return translationService.formatUnit(val, {
      one: extra.centimeter,
      many: extra.centimeters,
    });
  }

  // сантиметры
  if (sizeData.exponent === -2) {
    const val = sizeData.coeff;

    return translationService.formatUnit(val, {
      one: extra.centimeter,
      many: extra.centimeters,
    });
  }

  // километры
  if (sizeData.exponent >= 3 && sizeData.exponent <= 14) {
    const kiloIndex = 9;
    const kilo = units[kiloIndex] ?? '';
    const numKilos = Math.floor(sizeData.coeff * Math.pow(10, sizeData.exponent - 3));
    const formattedVal = numeral(numKilos).format('0,0');

    return `${formattedVal} ${kilo}${extra.meters}`;
  }

  // световые годы
  if (sizeData.exponent >= 16) {
    const numLYS = sizeData.coeff * Math.pow(10, sizeData.exponent - 16);
    const formattedVal = numeral(numLYS).format('0,0');

    return translationService
      .formatUnit(formattedVal, {
        one: extra.lightyear,
        many: extra.lightyears,
      })
      .replace(String(formattedVal), String(formattedVal));
  }

  // йоктометры
  if (sizeData.exponent <= -24) {
    const relExp = sizeData.exponent + 24;
    const numVal = sizeData.coeff * Math.pow(10, relExp);

    let formattedVal = numeral(numVal).format('0,0');

    if (textureId === '214') {
      formattedVal = '0.000000000016';
    } else if (textureId === '213' || textureId === '290') {
      formattedVal = '0.0000000000093';
    }

    return `${formattedVal} ${units[0] ?? ''}${Number(formattedVal) === 1 ? extra.meter : extra.meters}`;
  }

  const groupPow = sizeData.exponent / 3;
  const unitPow = Math.floor(groupPow);
  const unitIndex = unitPow + 8;

  let multiplierPow = 0;
  const positive = sizeData.exponent > 0;
  const groupPowDec = Math.abs(sizeData.exponent) % 3;

  switch (groupPowDec) {
    case 1:
      multiplierPow = positive ? 1 : 2;
      break;
    case 2:
      multiplierPow = positive ? 2 : 1;
      break;
  }

  const val = Number((E(multiplierPow) * sizeData.coeff).toFixed(3));
  const prefix = units[unitIndex] ?? '';

  return `${val} ${prefix}${val === 1 ? extra.meter : extra.meters}`;
}
