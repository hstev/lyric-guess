export type Artist = {
  id: string;
  name: string;
  slug: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
};

export type Song = {
  id: string;
  slug: string;
  title: string;
  lyrics: string;
  youtubeUrl: string | null;
  youtubeStartSeconds: number;
  youtubeEndSeconds: number | null;
  durationSeconds: number | null;
  demoClip: boolean;
  createdAt: string;
  updatedAt: string;
  artists: Artist[];
  categories: Category[];
};

export type SongSummary = {
  id: string;
  slug: string;
  title: string;
  artists: Artist[];
  categories: Category[];
};

export type NewSong = Omit<Song, 'artists' | 'categories' | 'createdAt' | 'updatedAt'> & {
  artistIds: string[];
  categoryIds: string[];
  createdAt?: string;
  updatedAt?: string;
};
