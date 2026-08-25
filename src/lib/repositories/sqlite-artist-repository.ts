import type { Database } from 'sql.js';
import type { Artist } from '../../types/catalog';
import { all, get } from '../database/sql';
import { mapArtistRow } from './mappers';
import type { ArtistRepository } from './types';

export class SqliteArtistRepository implements ArtistRepository {
  constructor(private readonly db: Database) {}

  async getArtists(): Promise<Artist[]> {
    return all(this.db, 'SELECT id, name, slug FROM artists ORDER BY name COLLATE NOCASE').map(
      mapArtistRow,
    );
  }

  async getArtistBySlug(slug: string): Promise<Artist | null> {
    const row = get(this.db, 'SELECT id, name, slug FROM artists WHERE slug = ?', [slug]);
    return row ? mapArtistRow(row) : null;
  }
}
