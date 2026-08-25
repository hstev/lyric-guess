export const SCHEMA_SQL = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS artists (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS songs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  lyrics TEXT NOT NULL,
  youtube_url TEXT,
  youtube_start_seconds INTEGER NOT NULL DEFAULT 0,
  youtube_end_seconds INTEGER,
  duration_seconds INTEGER,
  demo_clip INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS song_artists (
  song_id TEXT NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  artist_id TEXT NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (song_id, artist_id)
);

CREATE TABLE IF NOT EXISTS song_categories (
  song_id TEXT NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (song_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_songs_title ON songs(title);
CREATE INDEX IF NOT EXISTS idx_songs_slug ON songs(slug);
CREATE INDEX IF NOT EXISTS idx_artists_name ON artists(name);
CREATE INDEX IF NOT EXISTS idx_artists_slug ON artists(slug);
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);
CREATE INDEX IF NOT EXISTS idx_song_artists_artist ON song_artists(artist_id);
CREATE INDEX IF NOT EXISTS idx_song_categories_category ON song_categories(category_id);
`;

export const SCHEMA_VERSION = '1';
