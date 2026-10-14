import type { Artist, Category, Song } from '../types/catalog';
import type { Locale } from '../i18n';
import { t } from '../i18n';
import { formatArtistNames } from './text';

const DESCRIPTION_LIMIT = 160;

export type LyricLanguage = Locale;

export function lyricLanguage(lyrics: string): LyricLanguage {
  const text = lyrics.toLowerCase();
  if (/[áéíóúñü¿¡]/.test(text)) {
    return 'es';
  }
  const spanishHits = (
    text.match(/\b(el|la|los|las|de|y|que|me|mi|mis|eso|una|un|por|con|se)\b/g) ?? []
  ).length;
  const englishHits = (text.match(/\b(the|and|you|that|this|with|for|are|is)\b/g) ?? []).length;
  return spanishHits > englishHits ? 'es' : 'en';
}

export function lyricExcerpt(lyrics: string, maxChars = 110): string {
  const flattened = lyrics.replace(/\s+/g, ' ').trim();
  if (flattened.length <= maxChars) {
    return flattened;
  }

  const cut = flattened.slice(0, maxChars);
  const lastSpace = cut.lastIndexOf(' ');
  const safe = lastSpace > 48 ? cut.slice(0, lastSpace) : cut;
  return `${safe}…`;
}

export function songPageTitle(song: Song, locale: Locale): string {
  return t(locale, 'song.seoTitle', {
    title: song.title,
    artists: formatArtistNames(song.artists.map((artist) => artist.name)),
  });
}

export function songPageDescription(song: Song, locale: Locale): string {
  return clampDescription(
    t(locale, 'song.seoDescription', {
      excerpt: lyricExcerpt(song.lyrics),
      title: song.title,
      artists: formatArtistNames(song.artists.map((artist) => artist.name)),
    }),
  );
}

export function artistPageTitle(artist: Artist, locale: Locale): string {
  return t(locale, 'artist.seoTitle', { name: artist.name });
}

export function artistPageDescription(artist: Artist, songs: Song[], locale: Locale): string {
  const titles = songs
    .slice(0, 3)
    .map((song) => song.title)
    .join(', ');
  if (titles.length === 0) {
    return t(locale, 'artist.seoDescription', { name: artist.name });
  }
  return clampDescription(
    t(locale, 'artist.seoDescriptionWithTitles', { name: artist.name, titles }),
  );
}

export function categoryPageTitle(category: Category, locale: Locale): string {
  return t(locale, 'categories.seoTitle', { name: category.name });
}

export function categoryPageDescription(category: Category, songs: Song[], locale: Locale): string {
  const titles = songs
    .slice(0, 3)
    .map((song) => song.title)
    .join(', ');
  if (titles.length === 0) {
    return t(locale, 'categories.seoDescription', { name: category.name });
  }
  return clampDescription(
    t(locale, 'categories.seoDescriptionWithTitles', { name: category.name, titles }),
  );
}

export function clampDescription(value: string, max = DESCRIPTION_LIMIT): string {
  if (value.length <= max) {
    return value;
  }
  const cut = value.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return `${cut.slice(0, lastSpace > 80 ? lastSpace : max - 1)}…`;
}
