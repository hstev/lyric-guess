import { describe, expect, it } from 'vitest';
import { seedSongs } from '../../data/seed-catalog';
import { musicRecordingJsonLd } from './json-ld';

describe('musicRecordingJsonLd', () => {
  it('includes title, artist, and full lyrics', () => {
    const song = seedSongs[0];
    if (!song) {
      throw new Error('seed required');
    }

    const data = musicRecordingJsonLd(song, 'en', 'https://hstev.github.io');
    expect(data['@type']).toBe('MusicRecording');
    expect(data['name']).toBe(song.title);
    expect(data['inLanguage']).toBe('es');
    expect(data['url']).toContain(`/en/songs/${song.slug}`);
    const lyrics = data['lyrics'] as { text: string; inLanguage: string };
    expect(lyrics.text).toBe(song.lyrics);
    expect(lyrics.inLanguage).toBe('es');
    const artists = data['byArtist'] as Array<{ name: string }>;
    expect(artists[0]?.name).toBe(song.artists[0]?.name);
  });
});
