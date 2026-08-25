import { seedArtists, seedCategories, seedSongs } from '../../data/seed-catalog';
import type { Artist, Category, Song, SongSummary } from '../../types/catalog';
import { toSummary } from './assemble';
import type { ArtistRepository, CategoryRepository, SongRepository } from './types';

function matchesQuery(song: Song, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (needle.length === 0) {
    return false;
  }
  return (
    song.title.toLowerCase().includes(needle) ||
    song.artists.some((artist) => artist.name.toLowerCase().includes(needle)) ||
    song.categories.some((category) => category.name.toLowerCase().includes(needle))
  );
}

export class MemorySongRepository implements SongRepository {
  constructor(private readonly songs: Song[] = seedSongs) {}

  async getSongs(): Promise<Song[]> {
    return [...this.songs].sort((a, b) => a.title.localeCompare(b.title));
  }

  async getSongSummaries(): Promise<SongSummary[]> {
    const songs = await this.getSongs();
    return songs.map(toSummary);
  }

  async getSongById(id: string): Promise<Song | null> {
    return this.songs.find((song) => song.id === id) ?? null;
  }

  async getSongBySlug(slug: string): Promise<Song | null> {
    return this.songs.find((song) => song.slug === slug) ?? null;
  }

  async getSongsByCategory(categoryId: string): Promise<Song[]> {
    return this.songs
      .filter((song) => song.categories.some((category) => category.id === categoryId))
      .sort((a, b) => a.title.localeCompare(b.title));
  }

  async getSongsByCategorySlug(categorySlug: string): Promise<Song[]> {
    return this.songs
      .filter((song) => song.categories.some((category) => category.slug === categorySlug))
      .sort((a, b) => a.title.localeCompare(b.title));
  }

  async getSongsByArtistSlug(artistSlug: string): Promise<Song[]> {
    return this.songs
      .filter((song) => song.artists.some((artist) => artist.slug === artistSlug))
      .sort((a, b) => a.title.localeCompare(b.title));
  }

  async searchSongs(query: string): Promise<Song[]> {
    return this.songs
      .filter((song) => matchesQuery(song, query))
      .sort((a, b) => a.title.localeCompare(b.title));
  }

  async pickRandomSong(
    options: { excludeIds?: string[] | undefined; categorySlug?: string | undefined } = {},
  ): Promise<Song | null> {
    const exclude = new Set(options.excludeIds ?? []);
    let pool = this.songs.filter((song) => {
      if (
        options.categorySlug &&
        !song.categories.some((category) => category.slug === options.categorySlug)
      ) {
        return false;
      }
      return !exclude.has(song.id);
    });

    if (pool.length === 0) {
      pool = this.songs.filter((song) => {
        if (
          options.categorySlug &&
          !song.categories.some((category) => category.slug === options.categorySlug)
        ) {
          return false;
        }
        return true;
      });
    }

    if (pool.length === 0) {
      return null;
    }

    const index = Math.floor(Math.random() * pool.length);
    return pool[index] ?? null;
  }
}

export class MemoryArtistRepository implements ArtistRepository {
  constructor(private readonly artists: Artist[] = seedArtists) {}

  async getArtists(): Promise<Artist[]> {
    return [...this.artists].sort((a, b) => a.name.localeCompare(b.name));
  }

  async getArtistBySlug(slug: string): Promise<Artist | null> {
    return this.artists.find((artist) => artist.slug === slug) ?? null;
  }
}

export class MemoryCategoryRepository implements CategoryRepository {
  constructor(private readonly categories: Category[] = seedCategories) {}

  async getCategories(): Promise<Category[]> {
    return [...this.categories].sort((a, b) => a.name.localeCompare(b.name));
  }

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    return this.categories.find((category) => category.slug === slug) ?? null;
  }
}

export function createMemoryCatalog() {
  return {
    songs: new MemorySongRepository(),
    artists: new MemoryArtistRepository(),
    categories: new MemoryCategoryRepository(),
  };
}
