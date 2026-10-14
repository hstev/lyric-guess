import type { Database } from 'sql.js';
import { SEED_VERSION, seedArtists, seedCategories, seedSongs } from '../../data/seed-catalog';
import { loadSqlModule } from './load-sql';
import { type ByteStore, createByteStore, MemoryByteStore } from './persistence';
import { SCHEMA_SQL, SCHEMA_VERSION } from './schema';
import { get, run } from './sql';

export type SqliteClient = {
  db: Database;
  persistence: ByteStore;
  persist(): Promise<void>;
  close(): void;
};

let clientPromise: Promise<SqliteClient> | null = null;

export function getSqliteClient(): Promise<SqliteClient> {
  clientPromise ??= openSqliteClient();
  return clientPromise;
}

export async function openSqliteClient(store?: ByteStore): Promise<SqliteClient> {
  const persistence =
    store ?? (typeof window === 'undefined' ? new MemoryByteStore() : await createByteStore());
  const SQL = await loadSqlModule();
  const existing = await persistence.load();
  const db = existing && existing.byteLength > 0 ? new SQL.Database(existing) : new SQL.Database();

  db.run('PRAGMA foreign_keys = ON');
  db.run(SCHEMA_SQL);
  seedIfNeeded(db);
  const client: SqliteClient = {
    db,
    persistence,
    persist: async () => {
      await persistence.save(db.export());
    },
    close: () => {
      db.close();
      if (clientPromise) {
        clientPromise = null;
      }
    },
  };
  await client.persist();
  return client;
}

function seedIfNeeded(db: Database): void {
  const schema = get(db, 'SELECT value FROM meta WHERE key = ?', ['schema_version']);
  const seed = get(db, 'SELECT value FROM meta WHERE key = ?', ['seed_version']);
  const needsSeed = seed?.['value'] !== SEED_VERSION || schema?.['value'] !== SCHEMA_VERSION;

  if (!needsSeed) {
    return;
  }

  db.exec('BEGIN');
  try {
    run(db, 'DELETE FROM song_artists');
    run(db, 'DELETE FROM song_categories');
    run(db, 'DELETE FROM songs');
    run(db, 'DELETE FROM artists');
    run(db, 'DELETE FROM categories');

    for (const artist of seedArtists) {
      run(
        db,
        `INSERT INTO artists (id, name, slug, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET name = excluded.name, slug = excluded.slug, updated_at = excluded.updated_at`,
        [artist.id, artist.name, artist.slug, now(), now()],
      );
    }

    for (const category of seedCategories) {
      run(
        db,
        `INSERT INTO categories (id, name, slug, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET name = excluded.name, slug = excluded.slug, updated_at = excluded.updated_at`,
        [category.id, category.name, category.slug, now(), now()],
      );
    }

    for (const song of seedSongs) {
      run(
        db,
        `INSERT INTO songs (
           id, title, slug, lyrics, youtube_url, youtube_start_seconds, youtube_end_seconds,
           duration_seconds, demo_clip, created_at, updated_at
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           title = excluded.title,
           slug = excluded.slug,
           lyrics = excluded.lyrics,
           youtube_url = excluded.youtube_url,
           youtube_start_seconds = excluded.youtube_start_seconds,
           youtube_end_seconds = excluded.youtube_end_seconds,
           duration_seconds = excluded.duration_seconds,
           demo_clip = excluded.demo_clip,
           updated_at = excluded.updated_at`,
        [
          song.id,
          song.title,
          song.slug,
          song.lyrics,
          song.youtubeUrl,
          song.youtubeStartSeconds,
          song.youtubeEndSeconds,
          song.durationSeconds,
          song.demoClip ? 1 : 0,
          song.createdAt,
          song.updatedAt,
        ],
      );

      run(db, 'DELETE FROM song_artists WHERE song_id = ?', [song.id]);
      run(db, 'DELETE FROM song_categories WHERE song_id = ?', [song.id]);

      song.artists.forEach((artist, index) => {
        run(db, 'INSERT INTO song_artists (song_id, artist_id, position) VALUES (?, ?, ?)', [
          song.id,
          artist.id,
          index,
        ]);
      });

      song.categories.forEach((category) => {
        run(db, 'INSERT INTO song_categories (song_id, category_id) VALUES (?, ?)', [
          song.id,
          category.id,
        ]);
      });
    }

    run(
      db,
      `INSERT INTO meta (key, value) VALUES (?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
      ['schema_version', SCHEMA_VERSION],
    );
    run(
      db,
      `INSERT INTO meta (key, value) VALUES (?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
      ['seed_version', SEED_VERSION],
    );
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

function now(): string {
  return new Date().toISOString();
}
