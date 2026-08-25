import type { Database } from 'sql.js';
import type { Song, SongSummary } from '../../types/catalog';
import { likeContains } from '../../utils/format';
import { all, get } from '../database/sql';
import { assembleSongs, toSummary } from './assemble';
import { mapJoinedRow, SONG_SELECT } from './mappers';
import type { SongRepository } from './types';

export class SqliteSongRepository implements SongRepository {
  constructor(private readonly db: Database) {}

  async getSongs(): Promise<Song[]> {
    return this.query(`${SONG_SELECT} ORDER BY s.title COLLATE NOCASE, sa.position ASC`);
  }

  async getSongSummaries(): Promise<SongSummary[]> {
    const songs = await this.getSongs();
    return songs.map(toSummary);
  }

  async getSongById(id: string): Promise<Song | null> {
    const songs = await this.query(`${SONG_SELECT} WHERE s.id = ? ORDER BY sa.position ASC`, [id]);
    return songs[0] ?? null;
  }

  async getSongBySlug(slug: string): Promise<Song | null> {
    const songs = await this.query(`${SONG_SELECT} WHERE s.slug = ? ORDER BY sa.position ASC`, [
      slug,
    ]);
    return songs[0] ?? null;
  }

  async getSongsByCategory(categoryId: string): Promise<Song[]> {
    return this.query(
      `${SONG_SELECT}
       WHERE s.id IN (SELECT song_id FROM song_categories WHERE category_id = ?)
       ORDER BY s.title COLLATE NOCASE, sa.position ASC`,
      [categoryId],
    );
  }

  async getSongsByCategorySlug(categorySlug: string): Promise<Song[]> {
    return this.query(
      `${SONG_SELECT}
       WHERE s.id IN (
         SELECT sc.song_id
         FROM song_categories sc
         JOIN categories c ON c.id = sc.category_id
         WHERE c.slug = ?
       )
       ORDER BY s.title COLLATE NOCASE, sa.position ASC`,
      [categorySlug],
    );
  }

  async getSongsByArtistSlug(artistSlug: string): Promise<Song[]> {
    return this.query(
      `${SONG_SELECT}
       WHERE s.id IN (
         SELECT sa2.song_id
         FROM song_artists sa2
         JOIN artists a2 ON a2.id = sa2.artist_id
         WHERE a2.slug = ?
       )
       ORDER BY s.title COLLATE NOCASE, sa.position ASC`,
      [artistSlug],
    );
  }

  async searchSongs(query: string): Promise<Song[]> {
    const trimmed = query.trim();
    if (trimmed.length === 0) {
      return [];
    }

    const pattern = likeContains(trimmed);
    return this.query(
      `${SONG_SELECT}
       WHERE s.id IN (
         SELECT DISTINCT s2.id
         FROM songs s2
         LEFT JOIN song_artists sa2 ON sa2.song_id = s2.id
         LEFT JOIN artists a2 ON a2.id = sa2.artist_id
         LEFT JOIN song_categories sc2 ON sc2.song_id = s2.id
         LEFT JOIN categories c2 ON c2.id = sc2.category_id
         WHERE s2.title LIKE ? ESCAPE '\\'
            OR a2.name LIKE ? ESCAPE '\\'
            OR c2.name LIKE ? ESCAPE '\\'
       )
       ORDER BY s.title COLLATE NOCASE, sa.position ASC`,
      [pattern, pattern, pattern],
    );
  }

  async pickRandomSong(
    options: { excludeIds?: string[] | undefined; categorySlug?: string | undefined } = {},
  ): Promise<Song | null> {
    const excludeIds = options.excludeIds ?? [];
    const placeholders = excludeIds.map(() => '?').join(', ');
    const params: Array<string | number | null> = [];

    let sql = 'SELECT id FROM songs WHERE 1 = 1';
    if (options.categorySlug) {
      sql += ` AND id IN (
        SELECT sc.song_id FROM song_categories sc
        JOIN categories c ON c.id = sc.category_id
        WHERE c.slug = ?
      )`;
      params.push(options.categorySlug);
    }
    if (excludeIds.length > 0) {
      sql += ` AND id NOT IN (${placeholders})`;
      params.push(...excludeIds);
    }
    sql += ' ORDER BY RANDOM() LIMIT 1';

    const row = get(this.db, sql, params);
    if (!row) {
      if (excludeIds.length > 0) {
        return this.pickRandomSong({ categorySlug: options.categorySlug });
      }
      return null;
    }

    return this.getSongById(String(row['id']));
  }

  private query(sql: string, params: Array<string | number | null> = []): Promise<Song[]> {
    const rows = all(this.db, sql, params).map(mapJoinedRow);
    return Promise.resolve(assembleSongs(rows));
  }
}
