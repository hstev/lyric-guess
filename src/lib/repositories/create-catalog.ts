import { openSqliteClient, type SqliteClient } from '../database/sqlite-client';
import { SqliteArtistRepository } from './sqlite-artist-repository';
import { SqliteCategoryRepository } from './sqlite-category-repository';
import { SqliteSongRepository } from './sqlite-song-repository';
import type { Catalog } from './types';

export type BrowserCatalog = Catalog & {
  client: SqliteClient;
};

let catalogPromise: Promise<BrowserCatalog> | null = null;

export function getBrowserCatalog(): Promise<BrowserCatalog> {
  catalogPromise ??= createBrowserCatalog();
  return catalogPromise;
}

export async function createBrowserCatalog(client?: SqliteClient): Promise<BrowserCatalog> {
  const sqlite = client ?? (await openSqliteClient());
  return {
    songs: new SqliteSongRepository(sqlite.db),
    artists: new SqliteArtistRepository(sqlite.db),
    categories: new SqliteCategoryRepository(sqlite.db),
    client: sqlite,
  };
}

export { createMemoryCatalog } from './memory-catalog';
