import { describe, expect, it } from 'vitest';
import { seedArtists, seedCategories, seedSongs } from '../data/seed-catalog';
import { formatArtistNames } from './text';
import {
  artistPageTitle,
  categoryPageTitle,
  lyricExcerpt,
  songPageDescription,
  songPageTitle,
} from './seo';

describe('song SEO copy', () => {
  const song = seedSongs[0];

  it('builds a title with untranslated song and artist names', () => {
    if (!song) {
      throw new Error('seed required');
    }
    const artists = formatArtistNames(song.artists.map((artist) => artist.name));
    expect(songPageTitle(song, 'es')).toBe(`${song.title} de ${artists} — letra`);
    expect(songPageTitle(song, 'en')).toBe(`${song.title} by ${artists} — lyrics`);
  });

  it('puts a lyric excerpt with title and artist in the description', () => {
    if (!song) {
      throw new Error('seed required');
    }
    const description = songPageDescription(song, 'es');
    const firstWords = song.lyrics.trim().split(/\s+/).slice(0, 4).join(' ');
    expect(description).toContain(firstWords);
    expect(description).toContain(song.title);
    expect(description).toContain(song.artists[0]?.name);
    expect(description.length).toBeLessThanOrEqual(160);
  });

  it('truncates long lyrics on a word boundary', () => {
    const excerpt = lyricExcerpt('alpha beta gamma delta epsilon zeta eta theta', 24);
    expect(excerpt.endsWith('…')).toBe(true);
    expect(excerpt.includes('alpha')).toBe(true);
    expect(excerpt.length).toBeLessThanOrEqual(25);
  });
});

describe('catalog names stay in their original language', () => {
  it('keeps artist names intact in both UI locales', () => {
    const artist = seedArtists[0];
    if (!artist) {
      throw new Error('seed required');
    }
    expect(artistPageTitle(artist, 'es')).toContain(artist.name);
    expect(artistPageTitle(artist, 'en')).toContain(artist.name);
  });

  it('keeps category names intact in both UI locales', () => {
    const category = seedCategories[0];
    if (!category) {
      throw new Error('seed required');
    }
    expect(categoryPageTitle(category, 'es')).toContain(category.name);
    expect(categoryPageTitle(category, 'en')).toContain(category.name);
  });
});
