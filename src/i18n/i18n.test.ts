import { describe, expect, it } from 'vitest';
import { getLangFromUrl, localePath, switchLocalePath, t } from './index';

describe('i18n', () => {
  it('returns Spanish and English UI copy from the same key', () => {
    expect(t('es', 'nav.play')).toBe('Jugar');
    expect(t('en', 'nav.play')).toBe('Play');
  });

  it('interpolates values without translating them', () => {
    expect(t('es', 'song.seoTitle', { title: 'La FIERITA', artists: 'Realidad Mental' })).toBe(
      'La FIERITA de Realidad Mental — letra',
    );
    expect(t('en', 'song.seoTitle', { title: 'La FIERITA', artists: 'Realidad Mental' })).toBe(
      'La FIERITA by Realidad Mental — lyrics',
    );
  });

  it('reads the locale from a prefixed URL, including the site base path', () => {
    expect(getLangFromUrl(new URL('https://hstev.github.io/lyric-guess/en/play'))).toBe('en');
    expect(getLangFromUrl(new URL('https://hstev.github.io/lyric-guess/es/songs/la-fierita'))).toBe(
      'es',
    );
    expect(getLangFromUrl(new URL('https://hstev.github.io/lyric-guess/'))).toBe('es');
  });

  it('builds locale-prefixed paths and switches the locale segment', () => {
    expect(localePath('en', '/songs/la-fierita')).toBe('/en/songs/la-fierita');
    expect(localePath('es', '/')).toBe('/es');
    expect(
      switchLocalePath(
        new URL('https://hstev.github.io/lyric-guess/es/play?song=la-fierita'),
        'en',
      ),
    ).toMatch(/\/en\/play\?song=la-fierita$/);
  });
});
