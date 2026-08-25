import { afterEach, describe, expect, it } from 'vitest';
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

  it('seeds demo songs and reads them by slug', async () => {
    const { songs } = await setup();
    const all = await songs.getSongs();
    expect(all.length).toBeGreaterThan(8);
    const neon = await songs.getSongBySlug('neon-harbor');
    expect(neon?.title).toBe('Neon Harbor');
    expect(neon?.artists[0]?.name).toBe('Marina Vale');
    expect(neon?.categories.some((category) => category.slug === 'electronic')).toBe(true);
  });

  it('searches by title, artist, and category in SQL', async () => {
    const { songs } = await setup();
    const byTitle = await songs.searchSongs('copper');
    expect(byTitle[0]?.slug).toBe('copper-sky');
    const byArtist = await songs.searchSongs('paloma');
    expect(byArtist[0]?.slug).toBe('midnight-arithmetic');
    const byCategory = await songs.searchSongs('jazz');
    expect(byCategory.length).toBeGreaterThan(0);
    expect(await songs.searchSongs('')).toEqual([]);
  });

  it('filters by category and ignores LIKE wildcards in the query', async () => {
    const { songs, categories } = await setup();
    const electronic = await categories.getCategoryBySlug('electronic');
    expect(electronic).not.toBeNull();
    const listed = await songs.getSongsByCategorySlug('electronic');
    expect(
      listed.every((song) => song.categories.some((category) => category.slug === 'electronic')),
    ).toBe(true);
    const wildcard = await songs.searchSongs('%');
    expect(wildcard).toEqual([]);
  });
});
