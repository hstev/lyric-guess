import { describe, expect, it } from 'vitest';
import { atmosphereFromSeed } from './atmosphere';

describe('atmosphereFromSeed', () => {
  it('is stable for the same song id', () => {
    expect(atmosphereFromSeed('song_neon_harbor')).toEqual(atmosphereFromSeed('song_neon_harbor'));
    expect(atmosphereFromSeed('song_neon_harbor').hueA).not.toBe(
      atmosphereFromSeed('song_copper_sky').hueA,
    );
  });
});
