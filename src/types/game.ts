export type GamePhase = 'loading' | 'error' | 'empty' | 'guessing' | 'revealed';

export type GameFilter = {
  categorySlug?: string | undefined;
  songSlug?: string | undefined;
};

export type GameSnapshot = {
  phase: GamePhase;
  song: import('./catalog').Song | null;
  remainingMs: number;
  durationMs: number;
  errorMessage: string | null;
  playedCount: number;
};

export type TimerSnapshot = {
  remainingMs: number;
  durationMs: number;
  running: boolean;
  completed: boolean;
};

export type Atmosphere = {
  hueA: number;
  hueB: number;
  hueC: number;
  saturation: number;
  lightness: number;
  seed: string;
};
