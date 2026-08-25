import type { GameFilter, GameSnapshot } from '../../types/game';
import type { Song } from '../../types/catalog';
import type { SongRepository } from '../../lib/repositories/types';
import { CountdownTimer } from './timer';

export type GameEngineOptions = {
  songs: SongRepository;
  timer?: CountdownTimer;
  durationMs?: number;
};

type Listener = (snapshot: GameSnapshot) => void;

export class GameEngine {
  private readonly songs: SongRepository;
  private readonly timer: CountdownTimer;
  private readonly durationMs: number;
  private readonly listeners = new Set<Listener>();
  private readonly playedIds: string[] = [];
  private filter: GameFilter = {};
  private phase: GameSnapshot['phase'] = 'loading';
  private song: Song | null = null;
  private remainingMs: number;
  private errorMessage: string | null = null;
  private unsubscribeTimer: (() => void) | null = null;

  constructor(options: GameEngineOptions) {
    this.songs = options.songs;
    this.timer = options.timer ?? new CountdownTimer();
    this.durationMs = options.durationMs ?? 15_000;
    this.remainingMs = this.durationMs;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.getSnapshot());
    return () => {
      this.listeners.delete(listener);
    };
  }

  async start(filter: GameFilter = {}): Promise<void> {
    this.filter = filter;
    this.playedIds.length = 0;
    this.phase = 'loading';
    this.song = null;
    this.errorMessage = null;
    this.emit();

    try {
      const song = await this.selectSong(true);
      if (!song) {
        this.phase = 'empty';
        this.emit();
        return;
      }
      this.beginRound(song);
    } catch {
      this.phase = 'error';
      this.errorMessage = 'The catalog could not be opened. Try refreshing the page.';
      this.emit();
    }
  }

  reveal(): void {
    if (this.phase !== 'guessing' || !this.song) {
      return;
    }
    this.timer.finish();
    this.phase = 'revealed';
    this.remainingMs = 0;
    this.emit();
  }

  async next(): Promise<void> {
    this.timer.stop();
    this.phase = 'loading';
    this.song = null;
    this.errorMessage = null;
    this.filter = { categorySlug: this.filter.categorySlug };
    this.emit();

    try {
      const song = await this.selectSong(false);
      if (!song) {
        this.phase = 'empty';
        this.emit();
        return;
      }
      this.beginRound(song);
    } catch {
      this.phase = 'error';
      this.errorMessage = 'The next song could not be loaded.';
      this.emit();
    }
  }

  dispose(): void {
    this.unsubscribeTimer?.();
    this.timer.dispose();
    this.listeners.clear();
  }

  getSnapshot(): GameSnapshot {
    return {
      phase: this.phase,
      song: this.song,
      remainingMs: this.remainingMs,
      durationMs: this.durationMs,
      errorMessage: this.errorMessage,
      playedCount: this.playedIds.length,
    };
  }

  private async selectSong(initial: boolean): Promise<Song | null> {
    if (initial && this.filter.songSlug) {
      return this.songs.getSongBySlug(this.filter.songSlug);
    }

    return this.songs.pickRandomSong({
      categorySlug: this.filter.categorySlug,
      excludeIds: this.playedIds,
    });
  }

  private beginRound(song: Song): void {
    this.unsubscribeTimer?.();
    this.song = song;
    this.playedIds.push(song.id);
    this.phase = 'guessing';
    this.remainingMs = this.durationMs;
    this.timer.start(this.durationMs);
    this.unsubscribeTimer = this.timer.subscribe((snapshot) => {
      this.remainingMs = snapshot.remainingMs;
      if (snapshot.completed && this.phase === 'guessing') {
        this.phase = 'revealed';
      }
      this.emit();
    });
  }

  private emit(): void {
    const snapshot = this.getSnapshot();
    for (const listener of this.listeners) {
      listener(snapshot);
    }
  }
}
