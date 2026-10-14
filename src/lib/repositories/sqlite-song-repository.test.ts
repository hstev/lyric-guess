import { afterEach, describe, expect, it } from 'vitest';
import { seedCategories, seedSongs } from '../../data/seed-catalog';
import { MemoryByteStore } from '../database/persistence';
import { openSqliteClient } from '../database/sqlite-client';
import { SqliteSongRepository } from './sqlite-song-repository';
import { SqliteCategoryRepository } from './sqlite-category-repository';

describe('SqliteSongRepository', () => {
  let close: (() => void) | null = null;

  afterEach(() => {
    close?.();
    close = null;
  });

  async function setup() {
    const client = await openSqliteClient(new MemoryByteStore());
    close = () => client.close();
    return {
      songs: new SqliteSongRepository(client.db),
      categories: new SqliteCategoryRepository(client.db),
    };
  }

  it('seeds songs and reads them by slug', async () => {
    const sample = seedSongs[0];
    if (!sample) {
      throw new Error('seed required');
    }
    const { songs } = await setup();
    const all = await songs.getSongs();
    expect(all.length).toBe(seedSongs.length);
    const loaded = await songs.getSongBySlug(sample.slug);
    expect(loaded?.title).toBe(sample.title);
    expect(loaded?.artists[0]?.name).toBe(sample.artists[0]?.name);
    expect(loaded?.categories[0]?.slug).toBe(sample.categories[0]?.slug);
  });

  it('searches by title, artist, and category in SQL', async () => {
    const sample = seedSongs[0];
    const artist = sample?.artists[0];
    const category = sample?.categories[0];
    if (!sample || !artist || !category) {
      throw new Error('seed required');
    }
    const { songs } = await setup();
    const titleToken = sample.title.split(/\s+/)[0] ?? sample.title;
    const byTitle = await songs.searchSongs(titleToken);
    expect(byTitle.some((song) => song.id === sample.id)).toBe(true);
    const byArtist = await songs.searchSongs(artist.name);
    expect(byArtist.some((song) => song.id === sample.id)).toBe(true);
    const byCategory = await songs.searchSongs(category.name);
    expect(byCategory.length).toBeGreaterThan(0);
    expect(await songs.searchSongs('')).toEqual([]);
  });

  it('replaces an outdated persisted catalog when the seed version changes', async () => {
    const store = new MemoryByteStore();
    const first = await openSqliteClient(store);
    first.db.run(
      `INSERT INTO songs (
         id, title, slug, lyrics, youtube_url, youtube_start_seconds, youtube_end_seconds,
         duration_seconds, demo_clip, created_at, updated_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'song_stale',
        'Stale',
        'stale',
        'old lyrics',
        null,
        0,
        null,
        null,
        0,
        '2026-01-12T10:00:00.000Z',
        '2026-01-12T10:00:00.000Z',
      ],
    );
    first.db.run(`UPDATE meta SET value = 'outdated' WHERE key = 'seed_version'`);
    await first.persist();
    first.close();

    const second = await openSqliteClient(store);
    close = () => second.close();
    const songs = new SqliteSongRepository(second.db);
    const all = await songs.getSongs();
    expect(all.map((song) => song.slug)).toEqual(seedSongs.map((song) => song.slug));
    expect(await songs.getSongBySlug('stale')).toBeNull();
    expect(await songs.getSongBySlug(seedSongs[0]?.slug ?? '')).not.toBeNull();
  });

  it('filters by category and ignores LIKE wildcards in the query', async () => {
    const category = seedCategories[0] ?? seedSongs[0]?.categories[0];
    if (!category) {
      throw new Error('seed required');
    }
    const { songs, categories } = await setup();
    const found = await categories.getCategoryBySlug(category.slug);
    expect(found).not.toBeNull();
    const listed = await songs.getSongsByCategorySlug(category.slug);
    expect(
      listed.every((song) => song.categories.some((entry) => entry.slug === category.slug)),
    ).toBe(true);
    const wildcard = await songs.searchSongs('%');
    expect(wildcard).toEqual([]);
  });
});
