import type { Song } from './catalog';

export type MusicPlayer = {
  play(song: Song): Promise<void>;
  stop(): Promise<void>;
};

export type YouTubeRef = {
  videoId: string;
  startSeconds: number;
  endSeconds: number | null;
};
