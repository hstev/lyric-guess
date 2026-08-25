import type { Atmosphere } from '../../types/game';
import { hashToUnit } from '../../utils/hash';

export function atmosphereFromSeed(seed: string): Atmosphere {
  const hueA = Math.floor(hashToUnit(seed, 'a') * 360);
  const hueB = (hueA + 48 + Math.floor(hashToUnit(seed, 'b') * 80)) % 360;
  const hueC = (hueA + 200 + Math.floor(hashToUnit(seed, 'c') * 40)) % 360;

  return {
    hueA,
    hueB,
    hueC,
    saturation: 58 + Math.floor(hashToUnit(seed, 's') * 18),
    lightness: 42 + Math.floor(hashToUnit(seed, 'l') * 10),
    seed,
  };
}

export function atmosphereStyle(atmosphere: Atmosphere): string {
  return [
    `--hue-a: ${atmosphere.hueA}`,
    `--hue-b: ${atmosphere.hueB}`,
    `--hue-c: ${atmosphere.hueC}`,
    `--sat: ${atmosphere.saturation}%`,
    `--light: ${atmosphere.lightness}%`,
  ].join(';');
}
