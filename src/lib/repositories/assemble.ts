import type { Artist, Category, Song, SongSummary } from '../../types/catalog';

type JoinRow = {
  song: Omit<Song, 'artists' | 'categories'>;
  artist: Artist | null;
  category: Category | null;
};

export function assembleSongs(rows: JoinRow[]): Song[] {
  const songs = new Map<string, Song>();

  for (const row of rows) {
    let song = songs.get(row.song.id);
    if (!song) {
      song = { ...row.song, artists: [], categories: [] };
      songs.set(song.id, song);
    }
    if (row.artist && !song.artists.some((artist) => artist.id === row.artist?.id)) {
      song.artists.push(row.artist);
    }
    if (row.category && !song.categories.some((category) => category.id === row.category?.id)) {
      song.categories.push(row.category);
    }
  }

  return [...songs.values()];
}

export function toSummary(song: Song): SongSummary {
  return {
    id: song.id,
    slug: song.slug,
    title: song.title,
    artists: song.artists,
    categories: song.categories,
  };
}
