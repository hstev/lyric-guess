import { describe, expect, it } from 'vitest';
import { likeContains } from './format';

describe('likeContains', () => {
  it('escapes LIKE metacharacters', () => {
    expect(likeContains('100%')).toBe('%100\\%%');
    expect(likeContains('a_b')).toBe('%a\\_b%');
  });
});
