import type { Artist, Category, Song } from '../../types/catalog';
import {
  asBoolean,
  asNullableNumber,
  asNullableString,
  asNumber,
  asString,
  type SqlRow,
} from '../database/sql';

export function mapSongRow(row: SqlRow): Omit<Song, 'artists' | 'categories'> {
  return {
    id: asString(row['id']),
    slug: asString(row['slug']),
    title: asString(row['title']),
    lyrics: asString(row['lyrics']),
    youtubeUrl: asNullableString(row['youtube_url']),
    youtubeStartSeconds: asNumber(row['youtube_start_seconds']),
    youtubeEndSeconds: asNullableNumber(row['youtube_end_seconds']),
    durationSeconds: asNullableNumber(row['duration_seconds']),
    demoClip: asBoolean(row['demo_clip']),
    createdAt: asString(row['created_at']),
    updatedAt: asString(row['updated_at']),
  };
}

export function mapArtistRow(row: SqlRow): Artist {
  return {
    id: asString(row['id']),
    name: asString(row['name']),
    slug: asString(row['slug']),
  };
}

export function mapCategoryRow(row: SqlRow): Category {
  return {
    id: asString(row['id']),
    name: asString(row['name']),
    slug: asString(row['slug']),
  };
}

export function mapJoinedRow(row: SqlRow) {
  return {
    song: mapSongRow({
      id: row['song_id'] ?? null,
      slug: row['song_slug'] ?? null,
      title: row['title'] ?? null,
      lyrics: row['lyrics'] ?? null,
      youtube_url: row['youtube_url'] ?? null,
      youtube_start_seconds: row['youtube_start_seconds'] ?? null,
      youtube_end_seconds: row['youtube_end_seconds'] ?? null,
      duration_seconds: row['duration_seconds'] ?? null,
      demo_clip: row['demo_clip'] ?? null,
      created_at: row['created_at'] ?? null,
      updated_at: row['updated_at'] ?? null,
    }),
    artist:
      row['artist_id'] === null || row['artist_id'] === undefined
        ? null
        : mapArtistRow({
            id: row['artist_id'] ?? null,
            name: row['artist_name'] ?? null,
            slug: row['artist_slug'] ?? null,
          }),
    category:
      row['category_id'] === null || row['category_id'] === undefined
        ? null
        : mapCategoryRow({
            id: row['category_id'] ?? null,
            name: row['category_name'] ?? null,
            slug: row['category_slug'] ?? null,
          }),
  };
}

export const SONG_SELECT = `
  SELECT
    s.id AS song_id,
    s.slug AS song_slug,
    s.title,
    s.lyrics,
    s.youtube_url,
    s.youtube_start_seconds,
    s.youtube_end_seconds,
    s.duration_seconds,
    s.demo_clip,
    s.created_at,
    s.updated_at,
    a.id AS artist_id,
    a.name AS artist_name,
    a.slug AS artist_slug,
    c.id AS category_id,
    c.name AS category_name,
    c.slug AS category_slug
  FROM songs s
  LEFT JOIN song_artists sa ON sa.song_id = s.id
  LEFT JOIN artists a ON a.id = sa.artist_id
  LEFT JOIN song_categories sc ON sc.song_id = s.id
  LEFT JOIN categories c ON c.id = sc.category_id
`;
