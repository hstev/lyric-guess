import type { Artist, Category, Song, SongSummary } from '../../types/catalog';

export type SongRepository = {
  getSongs(): Promise<Song[]>;
  getSongSummaries(): Promise<SongSummary[]>;
  getSongById(id: string): Promise<Song | null>;
  getSongBySlug(slug: string): Promise<Song | null>;
  getSongsByCategory(categoryId: string): Promise<Song[]>;
  getSongsByCategorySlug(categorySlug: string): Promise<Song[]>;
  getSongsByArtistSlug(artistSlug: string): Promise<Song[]>;
  searchSongs(query: string): Promise<Song[]>;
  pickRandomSong(options?: {
    excludeIds?: string[] | undefined;
    categorySlug?: string | undefined;
  }): Promise<Song | null>;
};

export type ArtistRepository = {
  getArtists(): Promise<Artist[]>;
  getArtistBySlug(slug: string): Promise<Artist | null>;
};

export type CategoryRepository = {
  getCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | null>;
};

export type Catalog = {
  songs: SongRepository;
  artists: ArtistRepository;
  categories: CategoryRepository;
};
